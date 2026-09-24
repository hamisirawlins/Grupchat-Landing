import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Report a bug",
  description: "Tell us what went wrong so it can be fixed.",
  path: "/report-bug",
});

export default function Layout({ children }) {
  return children;
}
