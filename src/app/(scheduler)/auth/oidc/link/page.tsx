import config from "@payload-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Box, Container, Grid, panda } from "styled-system/jsx";
import { OidcLinkForm } from "@/components/auth/oidc-link-form";
import { getPendingOidcLink, oidcCookieNames } from "@/lib/auth/oidc";

export default async function Page() {
  const cookieStore = await cookies();
  const payload = await getPayload({ config });
  const pendingLink = await getPendingOidcLink(
    payload,
    cookieStore.get(oidcCookieNames.pendingLink)?.value,
  );

  if (!pendingLink) {
    redirect("/auth/sign-in?error=oidc-link-session-expired");
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
              Link your account
            </panda.h1>
          </div>

          <OidcLinkForm email={pendingLink.email} />
        </Grid>
      </Container>
    </Box>
  );
}
