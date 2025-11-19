import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, Container, Grid, panda, VStack } from "styled-system/jsx";
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
      <Container width={{ base: "full", sm: "450px" }}>
        <Grid
          background={{ base: "bg.default", _dark: "bg.subtle" }}
          padding="8"
          borderRadius="3xl"
          boxShadow={{ base: "lg", _dark: "unset" }}
          gap="4"
        >
          <div>
            <panda.h1 fontSize="2xl" textAlign="center">
              Register
            </panda.h1>
            <Box textAlign="center" color="fg.muted">
              Become a volunteer by filling in the information below.
            </Box>
          </div>

          <RegisterForm />

          <panda.div textAlign="center" marginY="10px">
            <VStack gap={0}>
              Already have an account?
              <Link href="/auth/sign-in" className={link()}>
                Sign in
              </Link>
            </VStack>
          </panda.div>
        </Grid>
      </Container>
    </Box>
  );
}
