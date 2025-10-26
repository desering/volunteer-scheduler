"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { css } from "styled-system/css";
import { Grid } from "styled-system/jsx";
import { vstack } from "styled-system/patterns";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Link } from "../ui/link";

export const LoginForm = () => {
  const router = useRouter();

  const { isPending, error, mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/payload-api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      console.log(res);

      if (!res.ok) {
        const data = await res.json();
        console.log(data);
        throw new Error(data.errors?.[0]?.message ?? data.message);
      }

      router.push("/");
      router.refresh();
    },
  });

  return (
    <form
      className={vstack({ alignItems: "stretch", gap: "4" })}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        mutate(formData);
      }}
    >
      {error && (
        <Alert.Root borderColor="red.500">
          <Alert.Icon asChild>
            <AlertCircleIcon />
          </Alert.Icon>
          <Alert.Content>
            <Alert.Title>We couldn't sign you in :/</Alert.Title>
            <Alert.Description>{(error as Error).message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Field.Root>
        <Field.Label>Email address</Field.Label>
        <Field.Input name="email" type="email" required />
      </Field.Root>

      <Grid>
        <Field.Root>
          <Field.Label>Password</Field.Label>
          <Field.Input name="password" type="password" required />
        </Field.Root>

        <Link
          href="/auth/forgot-password"
          className={css({
            fontSize: "sm",
            justifySelf: "end",
            textDecoration: "underline",
          })}
        >
          Forgot password?
        </Link>
      </Grid>

      <Button variant="solid" loading={isPending} type="submit">
        Log in
      </Button>
    </form>
  );
};
