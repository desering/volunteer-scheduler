import { redirect } from "next/navigation";
import { Container, Flex, panda } from "styled-system/jsx";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getUser } from "@/lib/services/get-user";

export default async function Page() {
  const { user } = await getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <Container marginTop={{ base: 4, xl: 20 }} marginBottom="4">
      <panda.h1 fontSize="xl" fontWeight="medium" marginBottom={3}>
        My account details
      </panda.h1>

      <panda.p marginBottom={3}>Name: {user.preferredName}</panda.p>
      <panda.p marginBottom={3}>Email: {user.email}</panda.p>
      <panda.p marginBottom={3}>Phone Number: {user.phoneNumber}</panda.p>

      <panda.p marginBottom={3}>
        To change your data, please talk to a shift coordinator or someone from
        the admin team of De Sering.
      </panda.p>

      <Flex flexDir="column" gap="10">
        <SignOutButton />
      </Flex>
    </Container>
  );
}
