import { redirect } from "next/navigation";
import { EditUserInfoButton } from "src/components/edit-user-info-button";
import { Container, HStack, panda, VStack } from "styled-system/jsx";
import { EditUserNotificationPreferences } from "@/components/edit-user-notifications-preference-button";
import { getUser } from "@/lib/services/get-user";

export default async function Page() {
  const { user } = await getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <Container marginTop={{ base: 4, xl: 20 }} marginBottom="4">
      <HStack
        alignItems="baseline"
        justifyContent="space-between"
        marginBottom="8"
      >
        <panda.h1 fontSize="xl" fontWeight="medium" marginBottom="8">
          My account details
        </panda.h1>
        <EditUserInfoButton user={user} />
      </HStack>

      <VStack marginBottom="8" gap="1" alignItems="start">
        <p>Name: {user.preferredName}</p>
        <p>Email: {user.email}</p>
        <p>Phone Number: {user.phoneNumber}</p>
      </VStack>

      <EditUserNotificationPreferences user={user} />
    </Container>
  );
}
