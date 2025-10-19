import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, Container, Grid, panda } from "styled-system/jsx";
import { link } from "styled-system/recipes";
import { RegisterForm } from "@/components/auth/register-form";
import { getUser } from "@/lib/services/get-user";

export default async function Page() {
  const { user } = await getUser();

  if (user) {
    redirect("/");
  }

  return (
    <Box
      display="flex"
      width="screen"
      flexGrow="1"
      justifyContent="center"
      alignItems="center"
    >
      <Container>
        <Grid
          background="bg.default"
          padding="8"
          borderRadius="3xl"
          boxShadow="lg"
          gap="8"
        >
          <div>
            <panda.h1 fontSize="2xl" textAlign="center">
              Register
            </panda.h1>
            <Box textAlign="center" color="fg.muted">
              Please enter your details to register
            </Box>
          </div>

          <RegisterForm />

          <panda.div textAlign="center" marginY="10px">
            Already have an account?{" "}
            <Link href="/auth/login" className={link()}>
              Login
            </Link>
          </panda.div>
        </Grid>
      </Container>
    </Box>
  );
}
