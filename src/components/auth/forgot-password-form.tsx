"use client";

import { useFormStatus } from "react-dom";
import { css, cx } from "styled-system/css";
import { button } from "styled-system/recipes";
import { Field } from "../ui/field";
import { Button } from "../ui/button";
import { vstack } from "styled-system/patterns";

const initialState = {
  message: "",
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className={cx(
        button({ size: "lg", variant: "solid" }),
        css({ flexGrow: 1 }),
      )}
    >
      Send reset link
    </button>
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
