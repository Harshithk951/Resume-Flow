"use client";

import Script from "next/script";

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
              "https://resume-flow-bay.vercel.app/legal/privacy",
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
