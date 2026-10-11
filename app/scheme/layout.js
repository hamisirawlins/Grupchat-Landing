import { privateMeta } from "@/lib/seo";

/** The live style sheet: titled for the tab, kept out of every index. */
export const metadata = privateMeta("Design scheme");

export default function Layout({ children }) {
  return children;
}
