import { Component, type ErrorInfo, type ReactNode } from "react";

interface DiagnosticErrorBoundaryProps {
  children: ReactNode;
}

interface DiagnosticErrorBoundaryState {
  hasError: boolean;
}

export default class DiagnosticErrorBoundary extends Component<
  DiagnosticErrorBoundaryProps,
  DiagnosticErrorBoundaryState
> {
  state: DiagnosticErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): DiagnosticErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if ((window as any).__POS_DIAGNOSTICS__) {
      console.error("[POS-DIAG][REACT] render failed", {
        name: error.name,
        message: error.message.slice(0, 200),
        componentStack: info.componentStack?.split("\n").slice(0, 6).join("\n"),
      });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (!(window as any).__POS_DIAGNOSTICS__) return null;

    return (
      <main
        role="alert"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeContent: "center",
          gap: 12,
          padding: 24,
          background: "#f8fafc",
          color: "#172033",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>The app could not render</h1>
        <p style={{ margin: 0 }}>
          Check the browser logs for <code>[POS-DIAG][REACT]</code> details.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ justifySelf: "center", padding: "8px 16px", cursor: "pointer" }}
        >
          Reload app
        </button>
      </main>
    );
  }
}