import { redirect } from "next/navigation";
import { EditUserInfoButton } from "src/components/edit-user-info-button";
import { Container, panda, VStack } from "styled-system/jsx";
import { getUser } from "@/lib/services/get-user";

export default async function Page() {
  const { user } = await getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <Container marginTop={{ base: 4, xl: 20 }} marginBottom="4">
      <panda.h1 fontSize="xl" fontWeight="medium" marginBottom="8">
        My account details
      </panda.h1>

      <VStack marginBottom="8" gap="1" alignItems="start">
        <p>Name: {user.preferredName}</p>
        <p>Email: {user.email}</p>
        <p>Phone Number: {user.phoneNumber}</p>
      </VStack>

      <EditUserInfoButton user={user} />
    </Container>
  );
}
