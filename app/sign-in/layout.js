import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Sign in",
  description: "Pick up a plan where the group left it.",
  path: "/sign-in",
});

export default function Layout({ children }) {
  return children;
}
