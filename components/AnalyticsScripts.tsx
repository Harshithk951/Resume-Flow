'use client';

import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';

/**
 * AnalyticsScripts — Central GA4 + GTM loader with Consent Mode v2.
 *
 * Renders nothing when env vars are not set (safe for dev/staging).
 * Consent Mode defaults all storage types to 'denied' until the user
 * accepts via the TermsFeed CMP.
 */
export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;   // G-XXXXXXXXXX
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID; // GTM-XXXXXXX

  if (!gaId && !gtmId) return null;

  return (
    <>
      {/* ─── Consent Mode v2 — default all storage types to denied ──────── */}
      <script
        dangerouslySetInnerHTML={{
          __html: [
            'window.dataLayer = window.dataLayer || [];',
            'function gtag(){dataLayer.push(arguments);}',
            "gtag('consent', 'default', {",
            "  'ad_storage': 'denied',",
            "  'analytics_storage': 'denied',",
            "  'ad_user_data': 'denied',",
            "  'ad_personalization': 'denied'",
            '});',
          ].join('\n'),
        }}
      />

      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </>
  );
}
