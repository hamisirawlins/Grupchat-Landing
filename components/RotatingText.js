"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function RotatingText({ words, baseText, className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span>{baseText}</span>
      <div className="relative bg-purple-600 rounded-full px-3 py-1 min-w-[120px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block text-white text-sm sm:text-base font-medium whitespace-nowrap"
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
