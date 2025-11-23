import { Container, Heading, Html, Text } from "@react-email/components";

export const ShiftSignupConfirmationEmail = ({
  name,
  eventSummary,
  role,
}: {
  name: string;
  eventSummary: string;
  role: string;
}) => {
  return (
    <Html lang="en">
      <Container>
        <Heading as="h3">Shift Signup Confirmation</Heading>

        <Text>Hi {name}!</Text>
        <Text>
          You signed up for {eventSummary} as a {role}.
        </Text>

        <Text>Find attached the event invite</Text>

        <Text>We are excited to see you there!</Text>
        <Text>{process.env.ORG_NAME} team</Text>
      </Container>
    </Html>
  );
};
