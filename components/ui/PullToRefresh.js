"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { EASE } from "@/lib/motion";
import { Spinner } from "@/components/ui/Form";

const THRESHOLD = 72; // px of eased pull that arms a refresh
const MAX_PULL = 110;
const HOLD = 56; // where the content rests while refreshing

/**
 * Pull-to-refresh for touch devices. Desktop and keyboard users see nothing.
 * Wrap the page body; pass the page's async `onRefresh`. Only starts a pull
 * when the page is scrolled to the top, so it never hijacks normal scrolling.
 */
export function PullToRefresh({ onRefresh, children }) {
  const [enabled, setEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const reduce = useReducedMotion();
  const y = useMotionValue(0);
  const startY = useRef(null);
  const pulling = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const progress = useTransform(y, [0, THRESHOLD], [0, 1]);
  const rotate = useTransform(progress, [0, 1], [0, 180]);
  const opacity = useTransform(y, [0, 20, THRESHOLD], [0, 0.5, 1]);
  const scale = useTransform(progress, [0, 1], [0.7, 1]);
  const indicatorY = useTransform(y, (v) => v - 44);

  const settle = (to) => (reduce ? y.set(to) : animate(y, to, { duration: 0.35, ease: EASE }));

  const onTouchStart = (e) => {
    if (!enabled || refreshing || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };
  const onTouchMove = (e) => {
    if (!pulling.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0 || window.scrollY > 0) {
      y.set(0);
      return;
    }
    y.set(Math.min(MAX_PULL, delta * 0.55)); // resistance
  };
  const onTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (y.get() >= THRESHOLD && onRefresh) {
      setRefreshing(true);
      settle(HOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        settle(0);
      }
      return;
    }
    settle(0);
  };

  if (!enabled) return children;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd} className="relative">
      <motion.div style={{ opacity, y: indicatorY }} className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center" aria-hidden="true">
        <motion.span
          style={{ rotate: refreshing ? 0 : rotate, scale }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-purple-600 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
        >
          {refreshing ? <Spinner /> : <ArrowDown className="h-4 w-4" strokeWidth={2.5} />}
        </motion.span>
      </motion.div>
      <span className="sr-only" role="status">{refreshing ? "Refreshing" : ""}</span>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
