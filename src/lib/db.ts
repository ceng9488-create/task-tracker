import { supabase } from "./supabase";
import { demoClient } from "./demoDb";

const DEMO_KEY = "demo-mode";

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_KEY) === "true";
}

export function setDemoMode(on: boolean) {
  if (on) localStorage.setItem(DEMO_KEY, "true");
  else localStorage.removeItem(DEMO_KEY);
}

/**
 * The data client for the current mode: real Supabase, or the local demo
 * store when the login step was bypassed. Call it per query — the mode can
 * change while the app is running.
 */
export function db(): typeof supabase {
  // The demo client implements only the query subset this app uses; the cast
  // keeps call sites typed against the real client.
  return isDemoMode() ? (demoClient as unknown as typeof supabase) : supabase;
}
