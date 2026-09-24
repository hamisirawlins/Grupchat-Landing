import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Browse plans",
  description: "Find a plan worth joining, or take an idea and turn it into one.",
  path: "/discover",
});

export default function Layout({ children }) {
  return children;
}
