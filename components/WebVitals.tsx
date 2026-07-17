'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * WebVitals — Reports Core Web Vitals (LCP, INP, CLS, FCP, TTFB) to GA4
 * via the gtag dataLayer when analytics consent has been granted.
 *
 * Place this once in the root layout — it does not render any visible UI.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Optional chaining handles the case where gtag isn't loaded yet
    window.gtag?.('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  });

  return null;
}
