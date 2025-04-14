import config from "@payload-config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import {LoginForm} from "@/components/auth/login-form";

import { panda } from "styled-system/jsx";
import { Container } from "styled-system/jsx";

// https://payloadcms.com/docs/local-api/overview#login
// https://github.com/payloadcms/payload/blob/main/packages/next/src/routes/rest/auth/login.ts

export default async function Page() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });

  if (user) {
    redirect("/");
  }

  return (<>
    <panda.div
      display="flex"
      minHeight="screen"
      width="screen"
      justifyContent="center"
      alignItems="center"
    >
      <Container>
        <h1>Login</h1>
        <LoginForm />
      </Container>
    </panda.div>
  </>);
}
