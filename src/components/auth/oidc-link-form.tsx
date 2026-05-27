"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { css } from "styled-system/css";
import { vstack } from "styled-system/patterns";
import {
  type ConfirmOidcLinkFailure,
  type ConfirmOidcLinkSuccess,
  confirmOidcLink,
} from "@/actions/auth/confirm-oidc-link";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Link } from "../ui/link";

export const OidcLinkForm = ({ email }: { email: string }) => {
  const router = useRouter();

  const { error, isPending, mutate } = useMutation<
    ConfirmOidcLinkSuccess,
    ConfirmOidcLinkFailure,
    FormData
  >({
    mutationFn: async (formData) => {
      const result = await confirmOidcLink(formData);

      if (!result.success) {
        throw result;
      }

      return result;
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  return (
    <form
      className={vstack({ alignItems: "stretch", gap: "4" })}
      onSubmit={(event) => {
        event.preventDefault();
        mutate(new FormData(event.currentTarget));
      }}
    >
      <Alert.Root>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Confirm your existing account</Alert.Title>
          <Alert.Description>
            Enter the password for <strong>{email}</strong> to link this OIDC
            login.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      {error && (
        <Alert.Root borderColor="red.500">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Linking failed</Alert.Title>
            <Alert.Description>
              {error.errors.formErrors.join(", ")}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Field.Root required invalid={!!error?.errors.fieldErrors.password}>
        <Field.Label>Password</Field.Label>
        <Field.Input name="password" type="password" required />
        <Field.ErrorText>
          {error?.errors.fieldErrors.password?.join(", ")}
        </Field.ErrorText>
      </Field.Root>

      <Button loading={isPending} type="submit">
        Link account
      </Button>

      <Link
        href="/auth/oidc/link/cancel"
        className={css({
          color: "fg.muted",
          fontSize: "sm",
          textAlign: "center",
          textDecoration: "underline",
        })}
      >
        Cancel
      </Link>
    </form>
  );
};
