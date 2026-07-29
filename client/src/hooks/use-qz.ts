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
    // Attempt auto-connect on mount (silent — won't throw to UI)
    connectQZ().catch(() => {});
    return unsub;
  }, []);

  return { status, connectQZ, disconnectQZ, isQZConnected };
}
