import { privateMeta } from "@/lib/seo";

/** Behind a sign-in: titled for the tab, kept out of every index. */
export const metadata = privateMeta("Quick Pool");

export default function Layout({ children }) {
  return children;
}
