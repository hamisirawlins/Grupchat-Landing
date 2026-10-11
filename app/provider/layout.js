import { privateMeta } from "@/lib/seo";
import ProviderPortal from "@/components/providers/ProviderPortal";

export const metadata = privateMeta("Provider portal");

export default function Layout({ children }) {
  return <ProviderPortal>{children}</ProviderPortal>;
}
