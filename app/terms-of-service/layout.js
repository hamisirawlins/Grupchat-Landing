import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms of service",
  description: "The terms you agree to when you use GrupChat.",
  path: "/terms-of-service",
});

export default function Layout({ children }) {
  return children;
}
