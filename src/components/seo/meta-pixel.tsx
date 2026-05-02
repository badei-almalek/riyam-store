'use client';

import { useEffect, useState } from 'react';

// Meta Pixel tracking helper functions
interface FbqFunction {
  (...args: unknown[]): void;
  callMethod?: FbqFunction;
  queue?: unknown[][];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbq: FbqFunction;
    _fbq: boolean;
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

// Module-level mutable IDs — populated from settings API or env fallback
let pixelId: string | null = process.env.NEXT_PUBLIC_META_PIXEL_ID || null;
let gaId: string | null = null;

/** Set the active pixel ID (used by the component after fetching settings) */
function setPixelId(id: string | null) {
  pixelId = id;
}

/** Set the active Google Analytics ID (used by the component after fetching settings) */
function setGaId(id: string | null) {
  gaId = id;
}

/**
 * Track a standard Meta Pixel event
 */
function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !pixelId || !window.fbq) return;
  window.fbq('track', event, params);
}

/**
 * Track a custom Meta Pixel event (custom event type)
 */
function trackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !pixelId || !window.fbq) return;
  window.fbq('trackCustom', event, params);
}

// Standard e-commerce tracking functions

export function trackAddToCart(params: {
  contentIds?: string[];
  contentName?: string;
  contentType?: string;
  value?: number;
  currency?: string;
}) {
  track('AddToCart', {
    content_ids: params.contentIds,
    content_name: params.contentName,
    content_type: params.contentType || 'product',
    value: params.value,
    currency: params.currency || 'YER',
  });
}

export function trackPurchase(params: {
  contentIds?: string[];
  value: number;
  currency: string;
  numItems?: number;
}) {
  track('Purchase', {
    content_ids: params.contentIds,
    value: params.value,
    currency: params.currency,
    num_items: params.numItems,
    content_type: 'product',
  });
}

export function trackSearch(params: { searchString: string }) {
  track('Search', {
    search_string: params.searchString,
  });
}

export function trackViewContent(params: {
  contentType?: string;
  contentIds?: string[];
  contentName?: string;
  value?: number;
  currency?: string;
}) {
  track('ViewContent', {
    content_type: params.contentType || 'product',
    content_ids: params.contentIds,
    content_name: params.contentName,
    value: params.value,
    currency: params.currency || 'YER',
  });
}

export function trackAddToWishlist(params: {
  contentIds?: string[];
  contentName?: string;
  value?: number;
  currency?: string;
}) {
  track('AddToWishlist', {
    content_ids: params.contentIds,
    content_name: params.contentName,
    value: params.value,
    currency: params.currency || 'YER',
  });
}

export function trackInitiateCheckout(params: {
  contentIds?: string[];
  value?: number;
  currency?: string;
  numItems?: number;
}) {
  track('InitiateCheckout', {
    content_ids: params.contentIds,
    value: params.value,
    currency: params.currency || 'YER',
    num_items: params.numItems,
    content_type: 'product',
  });
}

export { trackCustom };

/**
 * Fetch settings from the API and return the meta_pixel_id and google_analytics_id.
 * Falls back to env variables when the API doesn't provide a value.
 */
async function fetchTrackingIds(): Promise<{
  resolvedPixelId: string | null;
  resolvedGaId: string | null;
}> {
  const envPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || null;

  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Settings fetch failed');
    const data = await res.json();
    const settings: Record<string, string> = data.settings ?? {};

    return {
      resolvedPixelId: settings.meta_pixel_id || envPixelId,
      resolvedGaId: settings.google_analytics_id || null,
    };
  } catch {
    // Network or parse error — fall back to env var
    return {
      resolvedPixelId: envPixelId,
      resolvedGaId: null,
    };
  }
}

export default function MetaPixel() {
  const [resolvedPixelId, setResolvedPixelId] = useState<string | null>(null);
  const [resolvedGaId, setResolvedGaId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Fetch tracking IDs from the settings API on mount
  useEffect(() => {
    let cancelled = false;

    fetchTrackingIds().then(({ resolvedPixelId: pid, resolvedGaId: gid }) => {
      if (cancelled) return;

      // Update module-level variables so tracking functions use the dynamic IDs
      setPixelId(pid);
      setGaId(gid);

      setResolvedPixelId(pid);
      setResolvedGaId(gid);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Inject Meta Pixel script once we have a pixel ID
  useEffect(() => {
    if (!loaded || !resolvedPixelId || typeof window === 'undefined') return;

    // Avoid duplicate injection
    if (document.getElementById('meta-pixel-script')) {
      // Already injected — just track PageView for SPA navigation
      if (window.fbq) {
        window.fbq('track', 'PageView');
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'meta-pixel-script';
    script.innerHTML = `
!(function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod
      ? n.callMethod.apply(n, arguments)
      : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = '2.0';
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(
  window,
  document,
  'script',
  'https://connect.facebook.net/en_US/fbevents.js'
);
fbq('init', '${resolvedPixelId}');
fbq('track', 'PageView');
`;
    document.head.appendChild(script);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${resolvedPixelId}&ev=PageView&noscript=1`;
    img.alt = '';
    noscript.appendChild(img);
    document.body.appendChild(noscript);
  }, [loaded, resolvedPixelId]);

  // Inject Google Analytics script once we have a GA ID
  useEffect(() => {
    if (!loaded || !resolvedGaId || typeof window === 'undefined') return;

    // Avoid duplicate injection
    if (document.getElementById('ga-script-src')) return;

    // gtag.js loader
    const scriptSrc = document.createElement('script');
    scriptSrc.id = 'ga-script-src';
    scriptSrc.async = true;
    scriptSrc.src = `https://www.googletagmanager.com/gtag/js?id=${resolvedGaId}`;
    document.head.appendChild(scriptSrc);

    // gtag init snippet
    const scriptInit = document.createElement('script');
    scriptInit.id = 'ga-script-init';
    scriptInit.innerHTML = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${resolvedGaId}');
`;
    document.head.appendChild(scriptInit);
  }, [loaded, resolvedGaId]);

  // SPA page-view tracking for Meta Pixel
  useEffect(() => {
    if (!loaded || !resolvedPixelId || typeof window === 'undefined') return;
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [loaded, resolvedPixelId]);

  // Nothing rendered to the React tree — scripts are injected imperatively
  return null;
}
