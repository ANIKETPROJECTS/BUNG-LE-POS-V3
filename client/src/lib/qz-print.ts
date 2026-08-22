type QzPrinterResult = {
  success: boolean;
  error?: string;
  printer?: string;
};

type QzApi = {
  security: {
    setCertificatePromise(fn: (resolve: (value: string) => void, reject: (reason?: unknown) => void) => void): void;
    setSignatureAlgorithm(name: string): void;
    setSignaturePromise(fn: (toSign: string) => (resolve: (value: string) => void, reject: (reason?: unknown) => void) => void): void;
  };
  websocket: {
    isActive?: () => boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
  };
  printers: { find(name?: string): Promise<string | string[]> };
  configs: { create(printer: string, options?: Record<string, unknown>): unknown };
  print(config: unknown, data: unknown[]): Promise<unknown>;
};

declare global {
  interface Window { qz?: QzApi; }
}

let scriptPromise: Promise<QzApi> | null = null;
let securityConfigured = false;

function loadQz(): Promise<QzApi> {
  if (window.qz) return Promise.resolve(window.qz);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray@2.2.6/qz-tray.js";
    script.onload = () => window.qz ? resolve(window.qz) : reject(new Error("QZ Tray library did not load"));
    script.onerror = () => reject(new Error("Could not load QZ Tray library"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

async function getQz(): Promise<QzApi> {
  const qz = await loadQz();
  if (!securityConfigured) {
    qz.security.setCertificatePromise((resolve, reject) => {
      fetch("/api/qz-certificate", { credentials: "include" })
        .then((response) => response.ok ? response.text() : Promise.reject(new Error("QZ certificate unavailable")))
        .then(resolve).catch(reject);
    });
    qz.security.setSignatureAlgorithm("SHA512");
    qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
      fetch("/api/sign-message", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        credentials: "include",
        body: toSign,
      })
        .then((response) => response.ok ? response.text() : Promise.reject(new Error("QZ signing unavailable")))
        .then(resolve).catch(reject);
    });
    securityConfigured = true;
  }
  if (!qz.websocket.isActive?.()) await qz.websocket.connect();
  return qz;
}

export async function qzPrintEndpoint(endpoint: string): Promise<QzPrinterResult> {
  try {
    console.info("[QZ] Preparing print job", { endpoint });
    const response = await fetch(endpoint, { credentials: "include" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not prepare print");
    const qz = await getQz();
    const preferred = Array.isArray(payload.printers) ? payload.printers : [];
    let found: string | string[] = "";
    for (const name of preferred) {
      try {
        found = await qz.printers.find(name);
        if (found) break;
      } catch { /* try the next configured printer */ }
    }
    if (!found) found = await qz.printers.find();
    const printer = Array.isArray(found) ? found[0] : found;
    if (!printer) throw new Error("No local printer found in QZ Tray");
    const config = qz.configs.create(printer, {
      units: "mm",
      size: { width: 80, height: null },
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      scaleContent: true,
    });
    await qz.print(config, [{ type: "raw", format: "base64", data: payload.data }]);
    console.info("[QZ] Print job sent successfully", { endpoint, printer });
    return { success: true, printer };
  } catch (error) {
    const message = error instanceof Error ? error.message : "QZ Tray print failed";
    console.error("[QZ] Print job failed", { endpoint, error: message });
    return { success: false, error: message };
  }
}

export async function tryQzPrint(endpoint: string): Promise<boolean> {
  return (await qzPrintEndpoint(endpoint)).success;
}

export async function checkQzTray(): Promise<{ connected: boolean; error?: string }> {
  try {
    const certificate = await fetch("/api/qz-certificate", { credentials: "include" });
    if (!certificate.ok) {
      const message = await certificate.text();
      return { connected: false, error: message || "QZ certificate is not configured" };
    }
    await getQz();
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "QZ Tray is unavailable",
    };
  }
}