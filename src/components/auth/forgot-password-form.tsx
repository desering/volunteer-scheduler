"use client";

import { useFormStatus } from "react-dom";
import { css, cx } from "styled-system/css";
import { button } from "styled-system/recipes";
import { Field } from "../ui/field";
import { vstack } from "styled-system/patterns";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button"


const initialState = {
  message: "",
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="solid">
      Send reset link
    </Button>
  );
}

export function ForgotPasswordForm() {
  return (
    <form
      className={vstack({ alignItems: "stretch", gap: "4" })}
    >
      <Field.Root>
        <Field.Label>Email address</Field.Label>
        <Field.Input name="email" type="email" required />
      </Field.Root>

      {SubmitButton()}
    </form>
  );
}
