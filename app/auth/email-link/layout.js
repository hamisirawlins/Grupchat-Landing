import { privateMeta } from "@/lib/seo";

/** Completes a passwordless sign-in link (D-053). Kept out of every index. */
export const metadata = privateMeta("Signing you in");

export default function Layout({ children }) {
  return children;
}
