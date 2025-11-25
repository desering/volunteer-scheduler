import { Container } from "styled-system/jsx";

type Args = {
  params: Promise<{
    token: string;
  }>;
};

export default async function Page({ params }: Args) {
  let { token } = await params;

  // https://payloadcms.com/docs/local-api/overview#reset-password
  return (
    <Container>
      <h1>Reset Password</h1>
      <p>Form that asks for new password here!</p>
      <p>
        form calls an action that does the actual reset, i.e.
        resetPassword("password", "token")
      </p>
      <p>token: {token}</p>
    </Container>
  );
}
