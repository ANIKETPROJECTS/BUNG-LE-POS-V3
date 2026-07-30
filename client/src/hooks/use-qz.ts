/**
 * React hook — tracks QZ Tray connection status and exposes connect/disconnect.
 */
import { useState, useEffect } from "react";
import {
  getQZStatus,
  onQZStatusChange,
  connectQZ,
  disconnectQZ,
  isQZConnected,
} from "@/lib/qz-print";

export type QZStatus = "disconnected" | "connecting" | "connected" | "error";

export function useQZ() {
  const [status, setStatus] = useState<QZStatus>(getQZStatus() as QZStatus);

  useEffect(() => {
    const unsub = onQZStatusChange((s) => setStatus(s as QZStatus));
    // Attempt auto-connect on mount — log failures so they're visible in console
    connectQZ().catch((err) => {
      console.warn("[QZ Tray] Auto-connect failed:", err?.message ?? err);
    });
    return unsub;
  }, []);

  return { status, connectQZ, disconnectQZ, isQZConnected };
}
