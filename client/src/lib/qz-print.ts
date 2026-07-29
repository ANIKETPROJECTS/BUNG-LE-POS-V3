/**
 * QZ Tray print service — browser-side bridge to local thermal printers.
 * QZ Tray must be running on the billing counter PC (wss://localhost:8182).
 */

// @ts-ignore — qz-tray ships a UMD bundle; types are loose
import qz from "qz-tray";

type QZStatus = "disconnected" | "connecting" | "connected" | "error";

let _status: QZStatus = "disconnected";
const _listeners = new Set<(s: QZStatus) => void>();

function setStatus(s: QZStatus) {
  _status = s;
  _listeners.forEach((fn) => fn(s));
}

export function getQZStatus(): QZStatus {
  return _status;
}

export function onQZStatusChange(fn: (s: QZStatus) => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

/** Connect to QZ Tray. Safe to call multiple times — no-ops if already connected. */
export async function connectQZ(): Promise<void> {
  if (qz.websocket.isActive()) {
    setStatus("connected");
    return;
  }

  setStatus("connecting");

  // Disable signature requirement for development / unsigned installs.
  // In production you'd sign with a certificate — for now we allow unsigned.
  qz.security.setCertificatePromise((_resolve: (v: string) => void, reject: (e: Error) => void) => {
    // Return empty string to use QZ Tray's built-in demo cert
    _resolve("-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----");
  });
  qz.security.setSignatureAlgorithm("SHA512");
  qz.security.setSignaturePromise((toSign: string) =>
    new Promise((resolve) => resolve(null))
  );

  try {
    await qz.websocket.connect({
      host: "localhost",
      port: { secure: 8182, insecure: 8181 },
      usingSecure: window.location.protocol === "https:",
      keepAlive: 30,
      retries: 1,
    });
    setStatus("connected");

    qz.websocket.setClosedCallbacks(() => setStatus("disconnected"));
    qz.websocket.setErrorCallbacks(() => setStatus("error"));
  } catch (err) {
    setStatus("error");
    throw err;
  }
}

export async function disconnectQZ(): Promise<void> {
  if (qz.websocket.isActive()) {
    await qz.websocket.disconnect();
  }
  setStatus("disconnected");
}

export function isQZConnected(): boolean {
  return qz.websocket.isActive();
}

/**
 * Send raw ESC/POS bytes directly to a printer IP:port via QZ Tray socket.
 * This bypasses the Windows print spooler — pure raw TCP like your server does.
 */
export async function printRawToIP(
  ip: string,
  port: number,
  bytes: Uint8Array
): Promise<void> {
  if (!isQZConnected()) await connectQZ();

  // Use qz.socket for raw TCP streaming to the printer
  await qz.socket.open(ip, { port, encoding: "plain" });
  await qz.socket.sendData(ip, { port }, Array.from(bytes));
  // Small delay so the printer processes the job before we close
  await new Promise((r) => setTimeout(r, 500));
  await qz.socket.close(ip, { port });
}

/**
 * Check if a printer is reachable via QZ Tray TCP socket.
 * Returns true if a connection can be opened, false otherwise.
 */
export async function checkPrinterOnlineViaQZ(
  ip: string,
  port: number
): Promise<boolean> {
  try {
    if (!isQZConnected()) await connectQZ();
    await qz.socket.open(ip, { port, encoding: "plain" });
    await qz.socket.close(ip, { port });
    return true;
  } catch {
    return false;
  }
}
