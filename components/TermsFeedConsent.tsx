"use client";

import Script from "next/script";

/**
 * TermsFeedConsent — Cookie consent management via TermsFeed CMP.
 *
 * On accept, fires a custom DOM event that the AnalyticsScripts component
 * listens to, plus directly calls gtag('consent', 'update', ...) for
 * Google Consent Mode v2 compliance.
 */
export default function TermsFeedConsent() {
  return (
    <>
      {/* TermsFeed Cookie Consent — loaded only after the library finishes */}
      <Script
        src="https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js"
        strategy="afterInteractive"
        type="text/javascript"
        charSet="UTF-8"
        onLoad={() => {
          (window as any).cookieconsent?.run({
            notice_banner_type: "simple",
            consent_type: "express",
            palette: "light",
            language: "en",
            page_load_consent_levels: ["strictly-necessary"],
            notice_banner_reject_button_hide: false,
            preferences_center_close_button_hide: false,
            page_refresh_confirmation_buttons: false,
            website_name: "Resume Flow",
            website_privacy_policy_url:
              "https://resumeflow.harshithkumar.in/legal/privacy",
            onAccept: (categories: Record<string, boolean> | undefined) => {
              const analyticsGranted = categories?.analytics === true;

              // Update Google Consent Mode v2
              if (typeof window !== "undefined" && (window as any).gtag) {
                (window as any).gtag("consent", "update", {
                  analytics_storage: analyticsGranted ? "granted" : "denied",
                  ad_storage: "denied",
                  ad_user_data: "denied",
                  ad_personalization: "denied",
                });
              }

              // Fire custom event for useConsent hook
              window.dispatchEvent(
                new CustomEvent("consent-update", {
                  detail: {
                    strictlyNecessary: true,
                    analytics: analyticsGranted,
                    marketing: false,
                  },
                }),
              );
            },
          });
        }}
      />

      {/* Fallback for users with JavaScript disabled */}
      <noscript>
        Free cookie consent management tool by{" "}
        <a href="https://www.termsfeed.com/">TermsFeed Generator</a>
      </noscript>
    </>
  );
}
