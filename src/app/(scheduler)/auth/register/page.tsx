import {RegisterForm} from "@/components/auth/register-form";
import config from "@payload-config";
import { headers as getHeaders } from "next/dist/server/request/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Container, panda } from "styled-system/jsx";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (user) {
    redirect("/");
  }

  return (
    <panda.div
      display="flex"
      minHeight="screen"
      width="screen"
      justifyContent="center"
      alignItems="center"
    >
      <Container>
        <h1>Register</h1>
        <RegisterForm />
      </Container>
    </panda.div>
  );
}
