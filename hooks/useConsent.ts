'use client';

import { useEffect, useState } from 'react';

export type ConsentState = {
  strictlyNecessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

/**
 * useConsent — React hook that reads consent state from the TermsFeed CMP
 * via a custom DOM event. Returns current consent, whether analytics is
 * granted, and an update function.
 *
 * Usage:
 *   const { consent, analyticsGranted } = useConsent();
 *   if (analyticsGranted) { /* fire analytics events *\/ }
 */
export function useConsent(): {
  consent: ConsentState;
  analyticsGranted: boolean;
  updateConsent: (categories: Partial<ConsentState>) => void;
} {
  const [consent, setConsent] = useState<ConsentState>({
    strictlyNecessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const handleConsent = (e: CustomEvent<Partial<ConsentState>>) => {
      setConsent((prev) => ({ ...prev, ...e.detail }));
    };

    window.addEventListener('consent-update' as never, handleConsent as never);
    return () =>
      window.removeEventListener(
        'consent-update' as never,
        handleConsent as never,
      );
  }, []);

  return {
    consent,
    analyticsGranted: consent.analytics,
    updateConsent: (categories) =>
      setConsent((prev) => ({ ...prev, ...categories })),
  };
}
