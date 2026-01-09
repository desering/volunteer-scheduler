import { Box, Container, Grid, panda } from "styled-system/jsx";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type Args = {
  params: Promise<{
    token: string;
  }>;
};

export default async function Page({ params }: Args) {
  const { token } = await params;

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
              Reset Password
            </panda.h1>
            <Box textAlign="center" color="fg.muted">
              Please enter your new password.
            </Box>
          </div>

          <ResetPasswordForm token={token} />
        </Grid>
      </Container>
    </Box>
  );
}
