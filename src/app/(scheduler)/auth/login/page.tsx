import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";

import { getUser } from "@/lib/services/get-user";
import { Box, Container, Grid, panda } from "styled-system/jsx";

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
              Welcome back :)
            </panda.h1>
            <Box textAlign="center" color="fg.muted">
              Please enter your details to log in
            </Box>
          </div>

          <LoginForm />
        </Grid>
      </Container>
    </Box>
  );
}
