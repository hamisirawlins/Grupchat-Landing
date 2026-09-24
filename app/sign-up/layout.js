import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Create an account",
  description: "Start a plan, invite the group, and pool what it costs in one place.",
  path: "/sign-up",
});

export default function Layout({ children }) {
  return children;
}
