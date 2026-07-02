// Google Analytics 4 (GA4) — Phase 1: page view tracking only.
// Do not add custom events, conversions, or ecommerce tracking here.

export const GA_MEASUREMENT_ID = "G-L3YV2QM0VE";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initGA(): void {
  if (initialized) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", { page_path: path });
}

// Generic custom-event helper. Fails silently if gtag is unavailable
// (SSR, ad blockers, network issues) so callers never break.
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", eventName, params ?? {});
  } catch {
    // no-op
  }
}
