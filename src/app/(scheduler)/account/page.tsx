import { BellDot } from "lucide-react";
import { redirect } from "next/navigation";
import { EditUserInfoButton } from "src/components/edit-user-info-button";
import { Button } from "src/components/ui/button";
import { Container, HStack, panda, VStack } from "styled-system/jsx";
import { CalendarLinkSection } from "@/components/calendar-link-section";
import { EditUserNotificationPreferences } from "@/components/edit-user-notifications-preference-button";
import { registerPushNotification } from "@/components/push-notification";
import { getUser } from "@/lib/services/get-user";
import { getWebcalToken } from "@/lib/services/get-webcal-token";

export default async function Page() {
  const { user } = await getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const webcalToken = await getWebcalToken(user.id);

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

      <VStack marginBottom="8" alignItems="start">
        <EditUserNotificationPreferences user={user} />
      </VStack>

      <CalendarLinkSection token={webcalToken?.token ?? null} />

      <VStack marginTop="8" alignItems="start">
        <Button variant="outline" onClick={registerPushNotification}>
          <BellDot /> Register push notifications{" "}
        </Button>
      </VStack>
    </Container>
  );
}
