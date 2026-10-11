import { privateMeta } from "@/lib/seo";
import AdminConsole from "@/components/providers/AdminConsole";

/** Behind a sign-in: titled for the tab, kept out of every index, inside the console's shell. */
export const metadata = privateMeta("Admin");

export default function Layout({ children }) {
  return <AdminConsole>{children}</AdminConsole>;
}
