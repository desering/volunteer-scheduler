import {
  Button,
  Column,
  Heading,
  Hr,
  Html,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { EmailFooter } from "./footer";
import { EmailHeader } from "./header";

export const EventCancellation = ({
  name,
  eventSummary,
  date,
}: {
  name: string;
  eventSummary: string;
  date: string;
}) => {
  return (
    <Html lang="en">
      <EmailHeader />
      <Tailwind>
        <Section className="px-[32px]">
          <Row>
            <Column className="w-[100%]">
              <Heading as="h1">{eventSummary} - Event Cancelled</Heading>

              <Text>Hi {name}!</Text>
              <Text>
                Unfortunately, the event you signed up for has been cancelled.
              </Text>

              <Hr />

              <Text>Event: {eventSummary}</Text>
              <Text>When: {date}</Text>

              <Hr />

              <Text>
                You can have a look at the other upcoming shifts and sign up for
                another one:
              </Text>
              <Button
                href={process.env.SERVER_URL}
                className="rounded-[4px] bg-black px-[20px] py-[12px] text-white"
              >
                See upcoming shifts
              </Button>
              <Text>Sorry for the inconvenience!</Text>
              <Text>{process.env.ORG_NAME} team</Text>
            </Column>
          </Row>
        </Section>
      </Tailwind>
      <EmailFooter />
    </Html>
  );
};
