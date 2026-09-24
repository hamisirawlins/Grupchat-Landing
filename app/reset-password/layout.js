import { privateMeta } from "@/lib/seo";

/** Behind a sign-in: titled for the tab, kept out of every index. */
export const metadata = privateMeta("Reset your password");

export default function Layout({ children }) {
  return children;
}
