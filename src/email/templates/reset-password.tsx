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

export const ResetPasswordEmail = ({
  username,
  token,
}: {
  username: string;
  token: string;
}) => {
  const resetLink: string = `${process.env.SERVER_URL}/auth/reset-password/${token}`;

  return (
    <Html lang="en">
      <EmailHeader />
      <Tailwind>
        <Section className="px-[32px]">
          <Row>
            <Column className="w-[100%]">
              <Heading as="h1">Password Reset</Heading>

              <Text>Hi {username}!</Text>
              <Text>
                We received a request to reset the password for your volunteer
                scheduler account.
              </Text>

              <Text>To reset your password, please click the link below:</Text>

              <Link href={resetLink}>Reset Your Password</Link>

              <Text>Or copy and paste this URL into your browser:</Text>

              <Link href={resetLink}>{resetLink}</Link>

              <Text>
                If you didn't request a password reset, you can safely ignore
                this email. Your password will remain unchanged.
              </Text>

              <Text>
                Best regards, <br />
                {process.env.ORG_NAME} team
              </Text>
            </Column>
          </Row>
        </Section>
      </Tailwind>
      <EmailFooter />
    </Html>
  );
};
