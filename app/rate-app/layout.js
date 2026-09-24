import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Rate GrupChat",
  description: "Tell us how GrupChat is working for your group.",
  path: "/rate-app",
});

export default function Layout({ children }) {
  return children;
}
