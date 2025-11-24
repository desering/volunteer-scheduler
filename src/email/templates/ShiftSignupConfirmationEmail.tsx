import {
  Section,
  Heading,
  Html,
  Text,
  Row,
  Column,
  Tailwind,
  Markdown,
  Hr,
} from "@react-email/components";
import { EmailHeader } from "./EmailHeader";
import { EmailFooter } from "./EmailFooter";

export const ShiftSignupConfirmationEmail = ({
  name,
  eventSummary,
  role,
  description,
  date,
}: {
  name: string;
  eventSummary: string;
  role: string;
  description: string;
  date: string;
}) => {
  return (
    <Html lang="en">
      <EmailHeader />
      <Tailwind>
        <Section className="px-[32px]">
          <Row>
            <Column className="w-[100%]">
              <Heading as="h1">{eventSummary} - Signup Confirmation</Heading>

              <Text>Hi {name}!</Text>
              <Text>
                Thanks for signing up as a volunteer role at{" "}
                {process.env.ORG_NAME}!
              </Text>

              <Hr />

              <Heading as="h2">Your Signup Details</Heading>
              <Text>Your role: {role}</Text>
              <Text>When: {date}</Text>
              <Text>About:</Text>
              <Markdown>{description}</Markdown>

              <Hr />

              <Text>Find attached the event invite.</Text>
              <Text>We are excited to see you there!</Text>
              <Text>{process.env.ORG_NAME} team</Text>
            </Column>
          </Row>
        </Section>
      </Tailwind>
      <EmailFooter />
    </Html>
  );
};
