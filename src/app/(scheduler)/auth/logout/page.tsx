import config from "@payload-config";
import { cookies, headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect("/auth/login");
  }

  (await cookies()).delete("payload-token");

  redirect("/");
}
