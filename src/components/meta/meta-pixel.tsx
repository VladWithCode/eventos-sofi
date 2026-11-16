"use client";

import Script from "next/script";
import { useEffect } from "react";
import { getAttribution } from "@/lib/meta/client";

const rawPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
// The id is interpolated into an inline script, so accept digits only.
const pixelId = /^\d+$/.test(rawPixelId) ? rawPixelId : "";

/** Meta Pixel base code + PageView. Also records first-touch attribution on mount. */
export function MetaPixel() {
  useEffect(() => {
    getAttribution();
  }, []);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- 1x1 tracking beacon, not content */}
        <img
          height={1}
          width={1}
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
