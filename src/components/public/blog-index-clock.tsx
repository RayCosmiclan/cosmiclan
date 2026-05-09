"use client";

import { useEffect, useState } from "react";
import styles from "./cosmiclan-blog.module.css";

export function BlogIndexClock({
  locale,
  dataBoot,
}: {
  locale: "default" | "id";
  dataBoot?: boolean;
}) {
  const isID = locale === "id";
  const [label, setLabel] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(isID ? "id-ID" : "en-IN", {
      timeZone: isID ? "Asia/Jakarta" : "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const prefix = isID ? "WIB" : "IST";
    const tick = () => setLabel(`${prefix} ${formatter.format(new Date())}`);
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [isID]);

  return (
    <span
      className={styles.navCenter}
      data-boot={dataBoot ? "" : undefined}
      suppressHydrationWarning
    >
      {label}
    </span>
  );
}
