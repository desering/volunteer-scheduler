import { logout } from "@/actions/auth/logout";

export const dynamic = "force-dynamic";

export default async function Page() {
  logout();
}
