import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, Container, Grid, panda } from "styled-system/jsx";
import { link } from "styled-system/recipes";
import { LoginForm } from "@/components/auth/login-form";
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
      <Container width={{ base: "full", sm: "450px" }}>
        <Grid
          background={{ base: "bg.default", _dark: "bg.subtle" }}
          padding="8"
          borderRadius="3xl"
          boxShadow={{ base: "lg", _dark: "unset" }}
          gap="8"
        >
          <div>
            <panda.h1 fontSize="2xl" textAlign="center">
              Welcome back :)
            </panda.h1>
            <Box textAlign="center" color="fg.muted">
              Please enter your details to sign in
            </Box>
          </div>

          <LoginForm />

          <panda.div textAlign="center" marginY="10px">
            Don't have an account yet?{" "}
            <Link href="/auth/register" className={link()}>
              Create account
            </Link>
          </panda.div>
        </Grid>
      </Container>
    </Box>
  );
}
