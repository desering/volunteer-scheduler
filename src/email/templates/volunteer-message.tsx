import {
  Column,
  Heading,
  Html,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { EmailFooter } from "./footer";
import { EmailHeader } from "./header";

export const VolunteerMessageEmail = (props: {
  heading: string;
  paragraphs: string[];
  progressUrl: string;
  accountUrl: string;
}) => (
  <Html lang="en">
    <EmailHeader />
    <Tailwind>
      <Section className="px-[32px]">
        <Row>
          <Column className="w-[100%]">
            <Heading as="h1">{props.heading}</Heading>
            {props.paragraphs.map((p) => (
              <Text key={p} className="whitespace-pre-line">
                {p}
              </Text>
            ))}
            <Text className="mt-[32px] text-[12px] text-gray-500">
              You get this because you volunteer with {process.env.ORG_NAME}.{" "}
              <Link href={props.progressUrl}>Your volunteering</Link> · Switch
              off invitations under{" "}
              <Link href={props.accountUrl}>
                Account → Notification settings
              </Link>
              .
            </Text>
          </Column>
        </Row>
      </Section>
    </Tailwind>
    <EmailFooter />
  </Html>
);
