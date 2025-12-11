import { Column, Link, Row, Section, Tailwind } from "@react-email/components";

export const EmailHeader = () => {
  return (
    <Tailwind>
      <Section className="my-[40px] px-[32px]">
        <Row>
          <Column className="w-[50%]">
            <Link
              className="text-gray-600 [text-decoration:none]"
              href="https://desering.org/"
            >
              {process.env.ORG_NAME}
            </Link>
          </Column>
          <Column align="right">
            <Link
              className="text-gray-600 [text-decoration:none]"
              href="https://schedule.desering.org/"
            >
              Scheduler
            </Link>
          </Column>
        </Row>
      </Section>
    </Tailwind>
  );
};
