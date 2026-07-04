import { redirect } from "next/navigation";

/**
 * Root entry — hand off to the dashboard. The middleware redirects
 * unauthenticated visitors to /login.
 */
export default function Home() {
  redirect("/dashboard");
}
