"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import {
  type ResetPasswordFailure,
  type ResetPasswordSuccess,
  resetPassword,
} from "@/actions/auth/reset-password";
import { Button } from "@/components/ui/button";
import { Divider, panda } from "../../../styled-system/jsx";
import { vstack } from "../../../styled-system/patterns";
import { link } from "../../../styled-system/recipes";
import { Alert } from "../ui/alert";
import { Field } from "../ui/field";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { mutate, isPending, error, data } = useMutation<
    ResetPasswordSuccess,
    ResetPasswordFailure,
    FormData
  >({
    mutationFn: async (formData) => {
      const result = await resetPassword(formData);
      if (!result.success) {
        throw result;
      }
      return result;
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    mutate(formData);
  };

  if (!token) {
    return (
      <Alert.Root>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Invalid Reset Link</Alert.Title>
          <Alert.Description>
            This reset password link is invalid or has expired. Please request a
            new password reset.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return (
    <form
      className={vstack({ alignItems: "stretch", gap: "4" })}
      onSubmit={handleSubmit}
    >
      {/* Error alert */}
      {error && (
        <Alert.Root>
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
        <>
          <Alert.Root>
            <Alert.Content>
              <Alert.Title>Success!</Alert.Title>
              <Alert.Description>{data.message}</Alert.Description>
            </Alert.Content>
          </Alert.Root>

          <panda.div textAlign="center" marginY="10px">
            <Link href="/auth/sign-in" className={link()}>
              Back to sign in
            </Link>
          </panda.div>
        </>
      )}

      {!data && (
        <>
          <Field.Root
            required
            width="full"
            invalid={!!error?.errors.fieldErrors.password}
          >
            <Field.Label>New Password:</Field.Label>
            <Field.Input type="password" name="password" />
            <Field.ErrorText>
              {error?.errors.fieldErrors.password?.join(", ")}
            </Field.ErrorText>
          </Field.Root>

          <Field.Root
            required
            width="full"
            invalid={!!error?.errors.fieldErrors.confirmPassword}
          >
            <Field.Label>Confirm New Password:</Field.Label>
            <Field.Input type="password" name="confirmPassword" />
            <Field.ErrorText>
              {error?.errors.fieldErrors.confirmPassword?.join(", ")}
            </Field.ErrorText>
          </Field.Root>

          <Divider borderColor="border.muted" />

          <Button type="submit" variant="solid" loading={isPending}>
            {isPending ? "Resetting password..." : "Reset password"}
          </Button>
        </>
      )}
    </form>
  );
}
