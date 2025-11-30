import { redirect } from "next/navigation";
import { Container, panda } from "styled-system/jsx";
import { getUser } from "@/lib/services/get-user";
import { EditUserInfoButton } from "src/components/edit-user-info-button";

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

      <panda.div marginBottom = "8 ">
        <panda.p marginBottom={3}>Name: {user.preferredName}</panda.p>
        <panda.p marginBottom={3}>Email: {user.email}</panda.p>
        <panda.p marginBottom={3}>Phone Number: {user.phoneNumber}</panda.p>
      </panda.div>
      <panda.div display="flex" gap="4">
        <EditUserInfoButton {...user}/>
      </panda.div>
    </Container>
  );
}
