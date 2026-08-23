import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { checkQzTray, getAvailableQzPrinters, printQzPayload } from "@/lib/qz-print";
import type { PrintJob, PrinterDevice } from "@shared/schema";

const WORKER_ID_KEY = "bungle_qz_print_worker_id";
const POLL_MS = 2500;
const QZ_RETRY_MS = 15000;

function getWorkerId() {
  const existing = localStorage.getItem(WORKER_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(WORKER_ID_KEY, id);
  return id;
}

export default function PrintWorker() {
  const { isAuthenticated, isLoading } = useAuth();
  const runningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const workerIdRef = useRef<string>();
  const nextPollDelayRef = useRef(POLL_MS);

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
          console.debug("[Print worker] No configured printer is installed on this PC; waiting", {
            configured: printerNames,
            available: availablePrinters,
          });
          return;
        }

        const claimResponse = await fetch("/api/print-jobs/claim", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId: workerIdRef.current, printerNames: localPrinterNames }),
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
          `/api/print-jobs/${job.id}/active?workerId=${encodeURIComponent(workerIdRef.current ?? "")}`,
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
            body: JSON.stringify({ workerId: workerIdRef.current }),
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
            body: JSON.stringify({ workerId: workerIdRef.current, error: result.error }),
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