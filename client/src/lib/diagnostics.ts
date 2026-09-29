const DIAGNOSTIC_PREFIX = "[POS-DIAG]";
const SLOW_REQUEST_MS = 1500;

type DiagnosticWindow = Window & {
  __POS_DIAGNOSTICS__?: boolean;
  __POS_DIAG_MAIN_STARTED__?: boolean;
  __POS_DIAG_NETWORK_INSTALLED__?: boolean;
};

export function installNetworkDiagnostics() {
  const diagnosticWindow = window as DiagnosticWindow;
  if (!diagnosticWindow.__POS_DIAGNOSTICS__ || diagnosticWindow.__POS_DIAG_NETWORK_INSTALLED__) {
    return;
  }

  diagnosticWindow.__POS_DIAG_NETWORK_INSTALLED__ = true;
  diagnosticWindow.__POS_DIAG_MAIN_STARTED__ = true;
  console.info(`${DIAGNOSTIC_PREFIX}[BOOT] main entry loaded`, {
    path: window.location.pathname,
    online: navigator.onLine,
  });

  const originalFetch = window.fetch.bind(window);
  let nextRequestId = 0;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl = input instanceof Request
      ? input.url
      : input instanceof URL
        ? input.href
        : String(input);

    let url: URL;
    try {
      url = new URL(rawUrl, window.location.href);
    } catch {
      return originalFetch(input, init);
    }

    const path = url.pathname;
    const isApiRequest = url.origin === window.location.origin &&
      (path === "/api" || path.startsWith("/api/"));
    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    const requestId = ++nextRequestId;
    const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    const startedAt = performance.now();
    console.info(`${DIAGNOSTIC_PREFIX}[NET] request started`, {
      requestId,
      method,
      path,
    });

    try {
      const response = await originalFetch(input, init);
      const durationMs = Math.round(performance.now() - startedAt);
      const details = {
        requestId,
        method,
        path,
        status: response.status,
        durationMs,
      };

      if (response.status >= 500) {
        console.error(`${DIAGNOSTIC_PREFIX}[NET] server error`, details);
      } else if (!response.ok || durationMs >= SLOW_REQUEST_MS) {
        console.warn(`${DIAGNOSTIC_PREFIX}[NET] slow or unsuccessful response`, details);
      } else {
        console.info(`${DIAGNOSTIC_PREFIX}[NET] response`, details);
      }
      return response;
    } catch (error) {
      console.error(`${DIAGNOSTIC_PREFIX}[NET] request failed`, {
        requestId,
        method,
        path,
        durationMs: Math.round(performance.now() - startedAt),
        errorName: error instanceof Error ? error.name : typeof error,
      });
      throw error;
    }
  };

  if (typeof PerformanceObserver !== "undefined") {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          if (resource.duration < SLOW_REQUEST_MS) continue;

          try {
            const resourceUrl = new URL(resource.name);
            if (resourceUrl.origin !== window.location.origin ||
                resourceUrl.pathname === "/api" ||
                resourceUrl.pathname.startsWith("/api/")) {
              continue;
            }
            console.warn(`${DIAGNOSTIC_PREFIX}[RESOURCE] slow asset`, {
              path: resourceUrl.pathname,
              type: resource.initiatorType,
              durationMs: Math.round(resource.duration),
            });
          } catch {
            // Ignore malformed resource timing entries.
          }
        }
      });
      observer.observe({ entryTypes: ["resource"] });
    } catch {
      console.warn(`${DIAGNOSTIC_PREFIX}[RESOURCE] timing observer unavailable`);
    }
  }
}