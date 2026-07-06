import Script from "next/script";

// Google Analytics 4 via the built-in `next/script` component.
//
// `@next/third-parties` is not installed, so we use `next/script` directly.
// `afterInteractive` is the recommended strategy for analytics/tag scripts in
// the App Router (loads early, but never blocks hydration).
//
// Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so it safely
// no-ops in local dev / preview environments without the var.

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
