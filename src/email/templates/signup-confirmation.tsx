import { Container, Heading, Html, Text } from "@react-email/components";

export type SignupConfirmationProps = {
  name: string;
};

export const SignupConfirmation = ({ name }: SignupConfirmationProps) => {
  return (
    <Html lang="en">
      <Container>
        <Heading as="h2">Signup Confirmation</Heading>

        <Text>Hi {name}!</Text>
        <Text>
          You signed up to volunteer at De Sering, please see the attached
          calendar event for details.
        </Text>
        <Text>We are excited to see you there!</Text>
      </Container>
    </Html>
  );
};
