import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { checkQzTray, getAvailableQzPrinters, printQzPayload } from "@/lib/qz-print";
import type { PrintJob, PrinterDevice } from "@shared/schema";

const WORKER_ID_KEY = "bungle_qz_print_worker_id";
const PRINTER_LOCK_KEY = "bungle_qz_print_lock";
const PRINTER_LOCK_MS = 90_000;
const POLL_MS = 2500;
const QZ_RETRY_MS = 15000;

function getWorkerId() {
  const existing = localStorage.getItem(WORKER_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(WORKER_ID_KEY, id);
  return id;
}

function acquirePrinterLock(workerId: string): boolean {
  const now = Date.now();
  try {
    const current = localStorage.getItem(PRINTER_LOCK_KEY);
    if (current) {
      const lock = JSON.parse(current) as { workerId?: string; expiresAt?: number };
      if (lock.workerId !== workerId && typeof lock.expiresAt === "number" && lock.expiresAt > now) {
        return false;
      }
    }
    localStorage.setItem(PRINTER_LOCK_KEY, JSON.stringify({
      workerId,
      expiresAt: now + PRINTER_LOCK_MS,
    }));
    const written = JSON.parse(localStorage.getItem(PRINTER_LOCK_KEY) || "{}") as { workerId?: string };
    return written.workerId === workerId;
  } catch {
    // Printing should remain available if localStorage is blocked. The
    // server-side claim still prevents the same job being claimed twice.
    return true;
  }
}

function releasePrinterLock(workerId: string) {
  try {
    const current = JSON.parse(localStorage.getItem(PRINTER_LOCK_KEY) || "{}") as { workerId?: string };
    if (current.workerId === workerId) localStorage.removeItem(PRINTER_LOCK_KEY);
  } catch {
    // Nothing to release when localStorage is unavailable.
  }
}

export default function PrintWorker() {
  const { isAuthenticated, isLoading } = useAuth();
  const runningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const workerIdRef = useRef<string>();
  const nextPollDelayRef = useRef(POLL_MS);
  const readyPrinterNamesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    workerIdRef.current = getWorkerId();
    let stopped = false;

    const poll = async () => {
      if (stopped || runningRef.current) return;
      runningRef.current = true;
      try {
        const printersResponse = await fetch("/api/printers", { credentials: "include" });
        if (!printersResponse.ok) throw new Error("Could not load printer configuration");
        const printers = (await printersResponse.json()) as PrinterDevice[];
        const printerNames = printers
          .filter((printer) => printer.autoPrint && (printer.type === "KOT" || printer.type === "Bill"))
          .map((printer) => printer.name);
        if (printerNames.length === 0) return;

        const qzStatus = await checkQzTray();
        if (!qzStatus.connected) {
          readyPrinterNamesRef.current.clear();
          console.debug("[Print worker] QZ Tray unavailable; waiting", { error: qzStatus.error });
          nextPollDelayRef.current = QZ_RETRY_MS;
          return;
        }
        nextPollDelayRef.current = POLL_MS;
        const availablePrinters = await getAvailableQzPrinters();
        const localPrinterNames = printerNames.filter((configuredName) =>
          availablePrinters.some((availableName) =>
            availableName.toLowerCase() === configuredName.trim().toLowerCase(),
          ),
        );
        if (localPrinterNames.length === 0) {
          readyPrinterNamesRef.current.clear();
          console.debug("[Print worker] No configured printer is installed on this PC; waiting", {
            configured: printerNames,
            available: availablePrinters,
          });
          return;
        }

        const normalisePrinterName = (name: string) => name.trim().toLowerCase();
        const availableNameKeys = new Set(localPrinterNames.map(normalisePrinterName));
        // A printer that disappeared is no longer considered ready. If it
        // returns later, it will get its own recovery boundary.
        for (const readyName of readyPrinterNamesRef.current) {
          if (!availableNameKeys.has(readyName)) {
            readyPrinterNamesRef.current.delete(readyName);
          }
        }
        const recoveredPrinters = localPrinterNames.filter(
          (name) => !readyPrinterNamesRef.current.has(normalisePrinterName(name)),
        );

        // Do not drain jobs accumulated while QZ Tray/the printer was
        // unavailable. The first ready poll is a recovery boundary; newly
        // created jobs will be handled on the next poll.
        if (recoveredPrinters.length > 0) {
          const recoveryAt = new Date().toISOString();
          const reconnectResponse = await fetch("/api/print-jobs/discard-on-reconnect", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ printerNames: recoveredPrinters, recoveryAt }),
          });
          if (!reconnectResponse.ok) throw new Error("Could not discard stale print jobs");
          const reconnectResult = await reconnectResponse.json() as { discarded?: number };
          console.info("[Print worker] Printer recovered; discarded pending jobs", {
            printers: recoveredPrinters,
            discarded: reconnectResult.discarded ?? 0,
          });
          for (const printerName of recoveredPrinters) {
            readyPrinterNamesRef.current.add(normalisePrinterName(printerName));
          }
          return;
        }

        // QZ Tray is local to this browser computer. Serialize printing
        // across multiple POS tabs/accounts so two raw ESC/POS payloads are
        // never sent to the same printer at once.
        const workerId = workerIdRef.current;
        if (!workerId || !acquirePrinterLock(workerId)) return;

        const claimResponse = await fetch("/api/print-jobs/claim", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId, printerNames: localPrinterNames }),
        });
        if (!claimResponse.ok) throw new Error("Could not claim print job");
        const job = (await claimResponse.json()) as PrintJob | null;
        if (!job) return;

        console.info("[Print worker] Claimed print job", {
          jobId: job.id,
          orderId: job.orderId,
          document: job.kotNumber,
          printer: job.printerName,
          attempt: job.attempts,
        });

        const activeResponse = await fetch(
          `/api/print-jobs/${job.id}/active?workerId=${encodeURIComponent(workerId)}`,
          { credentials: "include" },
        );
        if (!activeResponse.ok || !(await activeResponse.json()).active) {
          console.info("[Print worker] Job was cancelled before printing", { jobId: job.id });
          return;
        }

        const result = await printQzPayload({
          data: job.escposData,
          printers: job.printerName ? [job.printerName] : [],
        });
        if (result.success) {
          await fetch(`/api/print-jobs/${job.id}/done`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerId }),
          });
          console.info("[Print worker] Print job completed", {
            jobId: job.id,
            printer: result.printer,
          });
        } else {
          await fetch(`/api/print-jobs/${job.id}/failed`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerId, error: result.error }),
          });
          console.error("[Print worker] Print job failed; it was stopped to prevent duplicate output", {
            jobId: job.id,
            error: result.error,
          });
        }
      } catch (error) {
        console.debug("[Print worker] Poll failed; will retry", {
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        if (workerIdRef.current) releasePrinterLock(workerIdRef.current);
        runningRef.current = false;
        if (!stopped) timerRef.current = setTimeout(poll, nextPollDelayRef.current);
      }
    };

    void poll();
    return () => {
      stopped = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, isLoading]);

  return null;
}