"use client";

import { createContext, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

const ItemVariants = createContext(null);

function useItemVariants() {
  const reduce = useReducedMotion();
  return reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      };
}

/**
 * The auth surface: bare header, one narrow column, staggered reveal.
 * `alt` is the quiet top-right link to the opposite flow.
 */
export function AuthShell({ title, subtitle, alt, children }) {
  const item = useItemVariants();
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };

  return (
    <ItemVariants.Provider value={item}>
      <main className="min-h-screen bg-white text-black">
        <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" />
            <span className="text-sm font-semibold">GrupChat</span>
          </Link>
          {alt && (
            <Link
              href={alt.href}
              className="py-2 text-sm text-gray-500 transition-colors duration-300 hover:text-black"
            >
              {alt.label}
            </Link>
          )}
        </header>

        <motion.section
          className="mx-auto w-full max-w-[400px] px-6 pb-24 pt-12 sm:pt-20"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {title && (
            <motion.div variants={item} className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              {subtitle && (
                <p className="mt-3 text-[15px] leading-relaxed text-gray-500">{subtitle}</p>
              )}
            </motion.div>
          )}
          {children}
        </motion.section>
      </main>
    </ItemVariants.Provider>
  );
}

/** A block that takes part in the shell's staggered reveal. */
export function AuthItem({ className = "", children }) {
  const item = useContext(ItemVariants);
  return (
    <motion.div variants={item ?? undefined} className={className}>
      {children}
    </motion.div>
  );
}

export {
  FieldGroup,
  Field,
  PasswordField,
  PrimaryButton,
  OutlineButton,
  ButtonLink,
  GoogleButton,
  Divider,
  FormError,
  SuccessMark,
} from "@/components/ui/Form";

const LEGAL_LINK =
  "text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors duration-300 hover:text-black";

export function LegalLine({ action = "continuing" }) {
  return (
    <p className="text-xs leading-relaxed text-gray-400">
      By {action}, you agree to our{" "}
      <Link href="/terms-of-service" className={LEGAL_LINK}>
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href="/privacy-policy" className={LEGAL_LINK}>
        Privacy Policy
      </Link>
      .
    </p>
  );
}
