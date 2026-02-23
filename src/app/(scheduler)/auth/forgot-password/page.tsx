import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, Container, Grid, panda, VStack } from "styled-system/jsx";
import { link } from "styled-system/recipes";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
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
              Forgot your password?
            </panda.h1>
            <Box textAlign="center" color="fg.muted">
              Enter your email and you'll receive a link to reset your password.
            </Box>
          </div>
          <ForgotPasswordForm />
          <panda.div textAlign="center" marginY="10px">
            <Link href="/auth/sign-in" className={link()}>
              Back to sign in
            </Link>
          </panda.div>
          <panda.div textAlign="center" marginY="10px">
            <VStack gap={0}>
              Don't have an account yet?{" "}
              <Link href="/auth/register" className={link()}>
                Become a volunteer
              </Link>
            </VStack>
          </panda.div>
        </Grid>
      </Container>
    </Box>
  );
}
