import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Provider terms",
  description: "What experience providers on GrupChat agree to: accurate listings, honoured tickets, safety, and how payment works.",
  path: "/providers/terms",
});

export default function Layout({ children }) {
  return children;
}
