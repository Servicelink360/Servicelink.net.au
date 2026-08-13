"use client";

import { useEffect } from "react";

const COOKIE = "sl_no_stats";
const MAX_AGE = 60 * 60 * 24 * 365;

export function ExcludeFromStats() {
  useEffect(() => {
    const parts = [`${COOKIE}=1`, "path=/", `max-age=${MAX_AGE}`, "samesite=lax"];
    document.cookie = parts.join("; ");

    const host = window.location.hostname;
    if (host === "servicelink.net.au" || host.endsWith(".servicelink.net.au")) {
      document.cookie = [...parts, "domain=.servicelink.net.au", "secure"].join("; ");
    }

    try {
      localStorage.setItem(COOKIE, "1");
    } catch {
      // Ignore blocked storage.
    }
  }, []);

  return null;
}
