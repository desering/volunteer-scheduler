"use client";

import { Button } from "./ui/button";
import { Modal } from "../app/(scheduler)/account/modal-form";
import { panda } from "styled-system/jsx";
import { useState } from "react";
import type { User } from "@/payload-types";
import { updateUser } from "../actions/auth/update-user-data";
import { useMutation } from "@tanstack/react-query";

export function EditUserInfoButton(user: User) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.preferredName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phoneNumber ?? "");

  const { mutate, isPending, error, data } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateUser(formData);
      if (!result.success) {
        throw result; 
      }
      return result;
    },
    onSuccess: () => {
      setOpen(false);
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(user.id));
    formData.set("preferred-name", name);
    formData.set("email", email);
    formData.set("phone-number", phone);
    mutate(formData);
  };

  return (
    <>
      <Button
        cursor="pointer"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Edit
      </Button>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <panda.h2 fontSize="lg" fontWeight="semibold" marginBottom="4">
          Edit Account Details
        </panda.h2>

        {(error as any)?.errors?.formErrors?.length > 0 && (
          <panda.div color="red.600" marginBottom="3">
            {((error as any).errors.formErrors as string[]).join(" ")}
          </panda.div>
        )}
        {data && (
          <panda.div color="green.600" marginBottom="3">
            {data.message}
          </panda.div>
        )}

        <form onSubmit={onSubmit}>
          <panda.div marginBottom="4">
            <panda.label display="block">
              Name
              <panda.input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                width="full"
                padding="2"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                marginTop="2"
              />
            </panda.label>
          </panda.div>

          <panda.div marginBottom="4">
            <panda.label display="block">
              Email
              <panda.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                width="full"
                padding="2"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                marginTop="2"
              />
            </panda.label>
          </panda.div>

          <panda.div marginBottom="4">
            <panda.label display="block">
              Phone Number
              <panda.input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                width="full"
                padding="2"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                marginTop="2"
              />
            </panda.label>
          </panda.div>

          <panda.div display="flex" gap="3">
            <panda.button
              type="button"
              padding="2"
              borderRadius="md"
              backgroundColor="gray.100"
              cursor = "pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </panda.button>
            <panda.button
              type="submit"
              padding="2"
              borderRadius="md"
              backgroundColor="blue.500"
              color="black"
              cursor = "pointer"
            >
              Save
            </panda.button>
          </panda.div>
        </form>
      </Modal>
    </>
  );
}