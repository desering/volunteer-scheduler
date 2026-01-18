"use client";

import { HStack, panda } from "styled-system/jsx";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { useAuth } from "@/providers/auth";
import { useEventDetails } from "..";

export const Actions = () => {
  const { user } = useAuth();
  const {
    userSignup,
    selectedRoleId,
    isBusy: isMutating,
    toggleSignup,
    roles,
  } = useEventDetails();

  return (
    <>
      {!user && (
        <HStack>
          Want to help out?{" "}
          <Button asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>{" "}
          or{" "}
          <Button asChild>
            <Link href="/auth/register">Register</Link>
          </Button>
        </HStack>
      )}
      {user && (
        <Button
          width="full"
          variant="solid"
          colorPalette={userSignup ? "tomato" : "olive"}
          disabled={!userSignup && !selectedRoleId}
          loading={isMutating}
          onClick={() => toggleSignup()}
        >
          {selectedRoleId ? (
            <>
              {userSignup ? "Sign out of" : "Sign up for"}
              <panda.span fontWeight="black">
                {roles.find((role) => role.id === selectedRoleId)?.title}
              </panda.span>
              role
            </>
          ) : (
            "Select a role"
          )}
        </Button>
      )}
    </>
  );
};
