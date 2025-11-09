import { Container, Heading, Html, Text } from "@react-email/components";

export const ShiftSignupConfirmationEmail = ({ name }: { name: string }) => {
  return (
    <Html lang="en">
      <Container>
        <Heading as="h2">Shift Signup Confirmation</Heading>

        <Text>Hi {name}!</Text>
        <Text>You signed up for a volunteering shift at De Sering:</Text>

        <Text>(Some facts here)</Text>

        {/*<Button href="https://desering.org">Click me</Button>*/}

        <Text>We are excited to see you there!</Text>
      </Container>
    </Html>
  );
};
