"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { User } from "@/payload-types";
import { updateUser } from "../actions/auth/update-user-data";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Field } from "./ui/field";
import { Input } from "./ui/styled/field";
import { toaster } from "./ui/toast";

type Props = {
  user: User;
};

export function EditUserInfoButton({ user }: Props) {
  const [open, setOpen] = useState(false);

  const { mutate, data, isPending, reset } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateUser(formData);
      return result;
    },
    onSuccess: (data) => {
      if (!data.success) return;

      setOpen(false);

      toaster.create({
        type: "success",
        title: "Updated successfully",
      });
    },
  });

  const errors = data?.success === false ? data.errors.fieldErrors : undefined;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutate(formData);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      onExitComplete={() => {
        reset();
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="outline">Edit</Button>
      </Dialog.Trigger>

      <Dialog.Backdrop />

      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />

          <Dialog.Header>
            <Dialog.Title>Edit Account Details</Dialog.Title>
          </Dialog.Header>

          <form onSubmit={onSubmit}>
            <Dialog.Body gap="3" alignItems="stretch">
              {data?.success === false && (
                <Alert.Root status="error" marginBottom="3">
                  <Alert.Title>{data.errors.formErrors.join(", ")}</Alert.Title>
                </Alert.Root>
              )}

              <Field.Root invalid={!!errors?.preferredName}>
                <Field.Label>Name</Field.Label>
                <Input
                  defaultValue={user?.preferredName}
                  name="preferred-name"
                  type="text"
                />
                <Field.ErrorText>{errors?.preferredName}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors?.email}>
                <Field.Label>Email</Field.Label>
                <Input defaultValue={user?.email} name="email" />
                <Field.ErrorText>{errors?.email}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors?.phoneNumber}>
                <Field.Label>Phone-number</Field.Label>
                <Input
                  defaultValue={user?.phoneNumber ?? undefined}
                  name="phone-number"
                  type="tel"
                />
                <Field.ErrorText>{errors?.phoneNumber}</Field.ErrorText>
              </Field.Root>

              <Field.Root>
                <label>
                  <input
                    type="checkbox"
                    defaultChecked={user?.unsubscribeFromEmails || false}
                    name="unsubscribe-from-emails"
                  />
                  <span>Unsubscribe from emails</span>
                </label>
              </Field.Root>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>

              <Button variant="solid" type="submit" loading={isPending}>
                Save
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
