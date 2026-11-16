import { useCallback, useSyncExternalStore } from "react";

export type Settings = {
  darkMode: boolean;
  askRoute: boolean; // auto-open Smart Scoring when starting a new trip
};

const STORAGE_KEY = "tripbored:settings";
const DEFAULTS: Settings = { darkMode: false, askRoute: true };

function readStore(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) as Partial<Settings> };
  } catch {}
  return { ...DEFAULTS };
}

const listeners = new Set<() => void>();
let snapshot = readStore();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSnapshot() { return snapshot; }

function patchSettings(updates: Partial<Settings>) {
  snapshot = { ...snapshot, ...updates };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch {}
  for (const cb of listeners) cb();
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const set = useCallback((updates: Partial<Settings>) => patchSettings(updates), []);
  return { settings, set };
}

export function applyTheme(dark: boolean) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}
