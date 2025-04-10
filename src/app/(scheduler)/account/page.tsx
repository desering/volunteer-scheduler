import { Container, Flex, panda } from "styled-system/jsx";
import { button } from "styled-system/recipes/button";
import {headers as getHeaders} from "next/headers";
import {getPayload} from "payload";
import config from "@payload-config";
import { redirect } from "next/navigation";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({config});
  const { user } = await payload.auth({headers});

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <Container marginTop={{ base: 4, xl: 20 }} marginBottom="4">
      <panda.h1 fontSize="xl" fontWeight="medium" marginBottom={3}>My account details</panda.h1>

      <panda.p marginBottom={3}>Name: {user.preferredName}</panda.p>
      <panda.p marginBottom={3}>Email: {user.email}</panda.p>
      <panda.p marginBottom={3}>Phone Number: {user.phoneNumber}</panda.p>

      <panda.p marginBottom={3}>
        To change your data, please talk to a shift coordinator or someone from the admin team of De Sering.
      </panda.p>

      <Flex flexDir="column" gap="10">
        <a href="/auth/logout" className={button({ size: "lg", variant: "outline" })}>
          Logout
        </a>
      </Flex>
    </Container>
  );
}
