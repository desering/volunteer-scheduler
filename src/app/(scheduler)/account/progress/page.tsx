import { redirect } from "next/navigation";
import { Container } from "styled-system/jsx";
import { VolunteerProgressView } from "@/components/volunteer-progress";
import { getVolunteerProgress } from "@/lib/engagement/volunteer-progress";
import { getUser } from "@/lib/services/get-user";

export default async function Page() {
  const { user } = await getUser();
  if (!user) redirect("/auth/sign-in");

  const progress = await getVolunteerProgress(user.id);

  return (
    <Container
      marginTop={{ base: 4, md: 10, xl: 20 }}
      marginBottom="8"
      width="full"
    >
      <VolunteerProgressView p={progress} />
    </Container>
  );
}
