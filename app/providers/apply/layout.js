import { privateMeta } from "@/lib/seo";
import { ApplicationShell } from "@/components/providers/Application";

export const metadata = privateMeta("Apply as a provider");

export default function Layout({ children }) {
  return <ApplicationShell>{children}</ApplicationShell>;
}
