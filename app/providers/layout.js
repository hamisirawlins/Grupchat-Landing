import { pageMeta } from "@/lib/seo";

/** The provider welcome is public; the steps and the status page set their own private titles. */
export const metadata = pageMeta({
  title: "List your experiences",
  description: "Groups plan trips on GrupChat and book what they find in Discover. List what you run and get paid for every ticket.",
  path: "/providers",
});

export default function Layout({ children }) {
  return children;
}
