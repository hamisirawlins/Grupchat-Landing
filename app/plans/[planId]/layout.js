import { privateMeta } from "@/lib/seo";

/** A plan belongs to its group; it is never indexed. */
export const metadata = privateMeta("Plan");

export default function Layout({ children }) {
  return children;
}
