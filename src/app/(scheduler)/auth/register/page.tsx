import { RegisterForm } from "@/components/auth/register-form";
import { getUser } from "@/lib/services/get-user";
import { redirect } from "next/navigation";
import { Container, panda } from "styled-system/jsx";

export default async function Page() {
  const { user } = await getUser();

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
