import { privateMeta } from "@/lib/seo";

// Discover is a signed-in screen; strangers are sent to sign in, so it stays out of the index.
// The public way into listings is /experiences (D-047).
export const metadata = privateMeta("Discover");

export default function Layout({ children }) {
  return children;
}
