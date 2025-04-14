"use client";

import { useFormStatus } from "react-dom";
import { button } from "styled-system/recipes";
import { css, cx } from "styled-system/css";

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
      Reset Password
    </button>
  );
}

export function ResetPasswordForm() {
  return "";
}
