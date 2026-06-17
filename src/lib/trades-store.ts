import { useSyncExternalStore } from "react";

export type Trade = Record<string, unknown>;

export type TradesData = {
  filename: string;
  columns: string[];
  rows: Trade[];
  uploadedAt: string;
};

const STORAGE_KEY = "optix.trades.v1";

let current: TradesData | null = load();
const listeners = new Set<() => void>();

function load(): TradesData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TradesData) : null;
  } catch {
    return null;
  }
}

function emit() {
  for (const l of listeners) l();
}

export function setTrades(data: TradesData | null) {
  current = data;
  if (typeof window !== "undefined") {
    try {
      if (data) {
        const json = JSON.stringify(data);
        sessionStorage.setItem(STORAGE_KEY, json);
        localStorage.setItem(STORAGE_KEY, json);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore quota errors
    }
  }
  emit();
}

export function getTrades(): TradesData | null {
  current = load();
  return current;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTrades(): TradesData | null {
  return useSyncExternalStore(subscribe, getTrades, () => null);
}
