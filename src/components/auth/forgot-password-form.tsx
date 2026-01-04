"use client";

import { useMutation } from "@tanstack/react-query";
import { vstack } from "styled-system/patterns";
import type {
  ForgotPasswordFailure,
  ForgotPasswordSuccess,
} from "../../actions/auth/forgot-password";
import { forgotPassword } from "../../actions/auth/forgot-password";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Field } from "../ui/field";

export function ForgotPasswordForm() {
  const { mutate, isPending, error, data } = useMutation<
    ForgotPasswordSuccess,
    ForgotPasswordFailure,
    FormData
  >({
    mutationFn: async (formData) => {
      const result = await forgotPassword(formData);
      if (!result.success) {
        throw result;
      }
      return result;
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
      {/* Error alert */}
      {error && (
        <Alert.Root>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Oh.. something went wrong :/</Alert.Title>
            <Alert.Description>
              {error.errors.formErrors?.length > 0
                ? error.errors.formErrors.join(" ")
                : "An error occurred"}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Success alert */}
      {data && (
        <Alert.Root>
          <Alert.Content>
            <Alert.Title>Success!</Alert.Title>
            <Alert.Description>{data.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Field.Root>
        <Field.Label>Email address</Field.Label>
        <Field.Input name="email" type="email" required />
      </Field.Root>

      <Button type="submit" variant="solid" loading={isPending}>
        {isPending ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
