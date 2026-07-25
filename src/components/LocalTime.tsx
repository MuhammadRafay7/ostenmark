"use client";

import { useEffect, useState } from "react";

/**
 * Shows the studio's current local time.
 *
 * A genuine signal for international prospects deciding whether they'll get
 * overlap with their own working day — which is why the timezone comes from the
 * CMS rather than being hardcoded to Europe/London as it previously was.
 *
 * Renders nothing until mounted: the server and the visitor's browser are in
 * different timezones, so any server-rendered value would hydrate mismatched.
 */
export default function LocalTime({
  timezone,
  className,
}: {
  timezone: string;
  className?: string;
}) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function render() {
      try {
        setTime(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date()),
        );
      } catch {
        // An invalid IANA zone from the CMS shouldn't break the footer.
        setTime(null);
      }
    }

    render();
    const interval = setInterval(render, 30_000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (!time) return null;

  return (
    <span className={className}>
      <time dateTime={time}>{time}</time> local
    </span>
  );
}
