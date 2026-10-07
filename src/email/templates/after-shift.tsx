import {
  Button,
  Column,
  Heading,
  Hr,
  Html,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { EmailFooter } from "./footer";
import { EmailHeader } from "./header";

export type AfterShiftEmailProps = {
  heading: string;
  paragraphs: string[];
  shiftNumber: number;
  newBadges: { badge: string; label: string }[];
  /** Set when this shift made them a regular volunteer. */
  becameRegular: { perks: string[] } | null;
  trainings: { badge: string; title: string; when: string; url: string }[];
  progressUrl: string;
  scheduleUrl: string;
  accountUrl: string;
};

export const AfterShiftEmail = (props: AfterShiftEmailProps) => (
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

            <Hr />

            <Heading as="h2">Your progress</Heading>
            <Text>That was shift number {props.shiftNumber}. Thank you!</Text>

            {props.newBadges.length > 0 && (
              <>
                <Text>You earned new badges:</Text>
                {props.newBadges.map((b) => (
                  <Text key={b.label} className="text-[18px] my-[4px]">
                    {b.badge} {b.label}
                  </Text>
                ))}
              </>
            )}

            {props.becameRegular && (
              <Text>
                You are now a <strong>regular volunteer</strong>
                {props.becameRegular.perks.length > 0
                  ? `: ${props.becameRegular.perks.join(" and ").toLowerCase()}. Open your regular card in the app to use it.`
                  : "."}
              </Text>
            )}

            {props.trainings.length > 0 && (
              <>
                <Hr />
                <Heading as="h2">Ready for something new?</Heading>
                <Text>You can now join these trainings:</Text>
                {props.trainings.map((t) => (
                  <Text key={t.url}>
                    {t.badge} <Link href={t.url}>{t.title}</Link> — {t.when}
                  </Text>
                ))}
              </>
            )}

            <Section className="my-[24px]">
              <Button
                href={props.progressUrl}
                className="rounded-[6px] bg-[#6b4f9e] px-[16px] py-[10px] text-white"
              >
                See all your badges
              </Button>
            </Section>

            <Text className="text-[12px] text-gray-500">
              <Link href={props.scheduleUrl}>Find your next shift</Link>. Don't
              want these emails? Switch them off under{" "}
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
