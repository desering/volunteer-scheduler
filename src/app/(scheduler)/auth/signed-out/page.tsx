import { redirect } from "next/navigation";
import { Flex, panda } from "styled-system/jsx";
import { getUser } from "@/lib/services/get-user";

export default async function SignedOutPage() {
  const { user } = await getUser();

  if (user) {
    redirect("/auth/sign-in");
  }

  return (
    <Flex
      direction="column"
      height="screen"
      alignItems="center"
      justifyContent="center"
    >
      <panda.h1 textStyle="3xl">You have successfully signed out.</panda.h1>
      <panda.p mt="4" textStyle="md" color="fg.muted">
        See you next time!
      </panda.p>
    </Flex>
  );
}
