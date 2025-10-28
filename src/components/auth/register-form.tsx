"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Divider } from "styled-system/jsx";
import { vstack } from "styled-system/patterns";
import {
  type RegisterFailure,
  type RegisterSuccess,
  register,
} from "@/actions/auth/register";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Field } from "../ui/field";

export function RegisterForm() {
  const router = useRouter();

  const { mutate, isPending, error, data } = useMutation<
    RegisterSuccess,
    RegisterFailure,
    FormData
  >({
    mutationFn: async (formData) => {
      const result = await register(formData);
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
      {(error?.errors?.formErrors.length ?? 0) > 0 && (
        <Alert.Root>
          <Alert.Icon asChild>
            <AlertCircleIcon />
          </Alert.Icon>
          <Alert.Content>
            <Alert.Title>Oh.. something went wrong :/</Alert.Title>
            <Alert.Description>
              {error?.errors?.formErrors.join(" ")}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {data && (
        <Alert.Root>
          <Alert.Content>
            <Alert.Title>Success!</Alert.Title>
            <Alert.Description>{data.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Field.Root
        required
        width="full"
        invalid={!!error?.errors.fieldErrors.preferredName}
      >
        <Field.Label>Preferred Name:</Field.Label>
        <Field.Input name="preferred-name" />
        <Field.HelperText>
          This is the name that will be displayed on your profile and to others.
        </Field.HelperText>
        <Field.ErrorText>
          {error?.errors.fieldErrors.preferredName?.join(", ")}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root
        required
        width="full"
        invalid={!!error?.errors.fieldErrors.email}
      >
        <Field.Label>Email:</Field.Label>
        <Field.Input type="email" name="email" />
        <Field.ErrorText>
          {error?.errors.fieldErrors.email?.join(", ")}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root
        required
        width="full"
        invalid={!!error?.errors.fieldErrors.phoneNumber}
      >
        <Field.Label>Phone Number:</Field.Label>
        <Field.Input type="tel" name="phone-number" />
        <Field.HelperText>
          Enter your phone number with country code (e.g., +31612345678). This
          helps us contact you if needed.
        </Field.HelperText>
        <Field.ErrorText>
          {error?.errors.fieldErrors.phoneNumber?.join(", ")}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root
        required
        width="full"
        invalid={!!error?.errors.fieldErrors.password}
      >
        <Field.Label>Password:</Field.Label>
        <Field.Input type="password" name="password" />
        <Field.ErrorText>
          {error?.errors.fieldErrors.password?.join(", ")}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root
        required
        width="full"
        invalid={!!error?.errors.fieldErrors.passwordAgain}
      >
        <Field.Label>Confirm Password:</Field.Label>
        <Field.Input type="password" name="password-again" />
        <Field.ErrorText>
          {error?.errors.fieldErrors.passwordAgain?.join(", ")}
        </Field.ErrorText>
      </Field.Root>

      <Divider borderColor="border.muted" />

      <Button type="submit" variant="solid" loading={isPending}>
        {isPending ? "Creating your account..." : "Become a Volunteer"}
      </Button>
    </form>
  );
}
