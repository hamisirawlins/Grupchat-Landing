import { pageMeta } from "@/lib/seo";

/**
 * Catalogue items are read through an authenticated endpoint, so the title cannot name the
 * item here without putting credentials on the server. Static wording that is true of every
 * item is better than a card that says "undefined".
 */
export const metadata = pageMeta({
  title: "A plan to join",
  description: "See what the plan is, who is going, and take your place in it.",
  path: "/discover",
});

export default function Layout({ children }) {
  return children;
}
