import { Html } from "@react-email/html";

export const ShiftSignupConfirmationEmail = ({ name }: { name: string }) => {
  return (
    <Html lang="en">
      <h1>Shift Signup Confirmation</h1>

      <p>Hi {name}!</p>
      <p>You signed up for a volunteering shift at De Sering:</p>

      <p>(Some facts here)</p>

      {/*<Button href="https://desering.org">Click me</Button>*/}

      <p>We are excited to see you there!</p>
    </Html>
  );
};
