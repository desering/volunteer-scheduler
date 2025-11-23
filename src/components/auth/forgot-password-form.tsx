"use client";

import { Field } from "../ui/field";
import { vstack } from "styled-system/patterns";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button"
import { forgotPassword } from "../../actions/auth/forgot-password";
import { useMutation } from "@tanstack/react-query"
import type { ForgotPasswordSuccess, ForgotPasswordFailure } from "../../actions/auth/forgot-password";

export function ForgotPasswordForm() {
  const { mutate, isPending, error, data } = useMutation<
    ForgotPasswordSuccess,
    ForgotPasswordFailure,
    FormData
  >({
    mutationFn: async (formData) => {
      const result = await forgotPassword(formData);
      if (!result.success) {
        console.log("result failure", result)
        throw result;
      }
      console.log("result success:", result)
      return result;
    },
    onSuccess: () => {
      console.log("result success!!!")
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutate(formData);
  };

  return (
    <form
      className={vstack({ alignItems: "stretch", gap: "4" })}
      onSubmit={handleSubmit}
    >
      <Field.Root>
        <Field.Label>Email address</Field.Label>
        <Field.Input name="email" type="email" required />
      </Field.Root>

      <Button type="submit" variant="solid">
        Send reset link
      </Button>
    </form>
  );
}
