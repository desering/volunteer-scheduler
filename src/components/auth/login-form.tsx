"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { css, cx } from "styled-system/css";
import { Divider, Grid, panda } from "styled-system/jsx";
import { vstack } from "styled-system/patterns";
import { button, formLabel, input, link } from "styled-system/recipes";
import { Button } from "../ui/button";
import Link from "next/link";
import { Field } from "@ark-ui/react";

const initialState = {
  message: "",
  success: false,
};

export const LoginForm = () => {
  const router = useRouter();

  const { isPending, error, mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      router.push("/");
    },
  });

  return (
    <form
      action={mutate}
      className={vstack({ alignItems: "stretch", gap: "4" })}
    >
      <Field.Root>
        <Field.Label>Email address</Field.Label>
        <Field.Input type="email" required className={input()} />
      </Field.Root>

      <Grid>
        <Field.Root>
          <Field.Label>Password</Field.Label>
          <Field.Input type="password" required className={input()} />
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

      <Button
        type="submit"
        loading={isPending}
        className={button({ size: "lg", variant: "solid" })}
      >
        Log in
      </Button>

      <Divider borderColor="border.muted" />

      <panda.div textAlign="center" marginY="10px">
        Don't have an account yet?{" "}
        <Link href="/auth/register" className={link()}>
          Create account
        </Link>
      </panda.div>
    </form>
  );
};
