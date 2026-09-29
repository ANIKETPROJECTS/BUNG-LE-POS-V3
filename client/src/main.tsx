import { createRoot } from "react-dom/client";
import App from "./App";
import DiagnosticErrorBoundary from "./components/diagnostic-error-boundary";
import { installNetworkDiagnostics } from "./lib/diagnostics";
import "./index.css";

installNetworkDiagnostics();

const diagnosticsEnabled = Boolean((window as any).__POS_DIAGNOSTICS__);
const rootElement = document.getElementById("root");
if (!rootElement) {
  if (diagnosticsEnabled) {
    console.error("[POS-DIAG][BOOT] #root element is missing");
  }
  throw new Error("App root element is missing");
}

if (diagnosticsEnabled) {
  console.info("[POS-DIAG][BOOT] mounting React", { path: window.location.pathname });
}
createRoot(rootElement).render(
  <DiagnosticErrorBoundary>
    <App />
  </DiagnosticErrorBoundary>,
);

window.setTimeout(() => {
  if (!diagnosticsEnabled) return;
  const hasContent = rootElement.childElementCount > 0;
  if (hasContent) {
    console.info("[POS-DIAG][BOOT] React content mounted");
  } else {
    console.error("[POS-DIAG][BOOT] root is still empty after 1.5s");
  }
}, 1500);
