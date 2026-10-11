"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SPRING } from "@/lib/motion";

/** A QR code drawn as SVG. The library loads only when a ticket is on screen. */
export function TicketQR({ value, size = 168, label }) {
  const [svg, setSvg] = useState("");
  const reduce = useReducedMotion();
  useEffect(() => {
    let live = true;
    import("qrcode")
      .then((m) => (m.default || m).toString(value, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#14111aff", light: "#ffffffff" } }))
      .then((s) => live && setSvg(s))
      .catch(() => live && setSvg(""));
    return () => { live = false; };
  }, [value]);

  return (
    <div role="img" aria-label={label} className="relative" style={{ width: size, height: size }}>
      {!svg && <div aria-hidden="true" className="absolute inset-0 animate-pulse rounded-xl bg-soft" />}
      {svg && (
        <motion.div
          aria-hidden="true"
          className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING.soft}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}
