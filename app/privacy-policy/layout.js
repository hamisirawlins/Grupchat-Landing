import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy policy",
  description: "What GrupChat collects, why it is kept, and what you can ask to have removed.",
  path: "/privacy-policy",
});

export default function Layout({ children }) {
  return children;
}
