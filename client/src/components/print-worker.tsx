import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { checkQzTray, getAvailableQzPrinters, printQzPayload } from "@/lib/qz-print";
import type { PrintJob, PrinterDevice } from "@shared/schema";

const WORKER_ID_KEY = "bungle_qz_print_worker_id";
// Tracks job IDs that have already been physically sent to the printer on this
// device. If a job lease expires and gets reclaimed (e.g. because the server
// was temporarily unreachable when we tried to mark it done), we must not
// print it again — instead mark it done immediately.
const PRINTED_JOBS_KEY = "bungle_qz_printed_jobs";
// Discard locally-recorded IDs after 24 h to keep localStorage tidy.
const PRINTED_JOB_TTL_MS = 24 * 60 * 60 * 1000;
const POLL_MS = 2500;
const QZ_RETRY_MS = 15000;

function getAlreadyPrintedSet(): Record<string, number> {
  try {
    const raw = localStorage.getItem(PRINTED_JOBS_KEY);
    const parsed: Record<string, number> = raw ? JSON.parse(raw) : {};
    // Evict old entries so the object stays small.
    const cutoff = Date.now() - PRINTED_JOB_TTL_MS;
    for (const id of Object.keys(parsed)) {
      if (parsed[id] < cutoff) delete parsed[id];
    }
    return parsed;
  } catch {
    return {};
  }
}

function recordPrinted(jobId: string) {
  try {
    const set = getAlreadyPrintedSet();
    set[jobId] = Date.now();
    localStorage.setItem(PRINTED_JOBS_KEY, JSON.stringify(set));
  } catch {
    // localStorage may be unavailable in certain contexts; fail silently.
  }
}

function wasAlreadyPrinted(jobId: string): boolean {
  return jobId in getAlreadyPrintedSet();
}

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

        // Guard against reprints after a server hiccup. If this device already
        // physically sent this job to the printer in a previous poll cycle (and
        // the /done call failed because the server was temporarily down), mark
        // it done immediately without printing again.
        if (wasAlreadyPrinted(job.id)) {
          console.warn("[Print worker] Job was already printed on this device; marking done without reprinting", {
            jobId: job.id,
            orderId: job.orderId,
            document: job.kotNumber,
          });
          await fetch(`/api/print-jobs/${job.id}/done`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerId: workerIdRef.current }),
          });
          return;
        }

        const result = await printQzPayload({
          data: job.escposData,
          printers: job.printerName ? [job.printerName] : [],
        });
        if (result.success) {
          // Record that this job was physically sent to the printer BEFORE
          // telling the server. This way, if the /done network call fails
          // (server 502, brief outage), a future reclaim of the same job will
          // be caught by the guard above instead of printing again.
          recordPrinted(job.id);
          const doneRes = await fetch(`/api/print-jobs/${job.id}/done`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerId: workerIdRef.current }),
          });
          if (!doneRes.ok) {
            console.warn("[Print worker] Server did not acknowledge done (will be caught by local guard on retry)", {
              jobId: job.id,
              status: doneRes.status,
            });
          } else {
            console.info("[Print worker] Print job completed", {
              jobId: job.id,
              printer: result.printer,
            });
          }
        } else {
          const failRes = await fetch(`/api/print-jobs/${job.id}/failed`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerId: workerIdRef.current, error: result.error }),
          });
          if (!failRes.ok) {
            console.warn("[Print worker] Server did not acknowledge failed status; lease will expire naturally", {
              jobId: job.id,
              status: failRes.status,
            });
          }
          console.error("[Print worker] Print job failed; stopped to prevent duplicate output", {
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