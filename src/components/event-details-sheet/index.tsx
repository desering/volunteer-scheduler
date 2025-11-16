"use client";

import { Portal } from "@ark-ui/react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { InfoIcon, XIcon, SquarePenIcon } from "lucide-react";
import Link from "next/link";
import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Flex, HStack, panda } from "styled-system/jsx";
import { createSignup as createSignupAction } from "@/actions/create-signup";
import { deleteSignup as deleteSignupAction } from "@/actions/delete-signup";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { RadioButtonGroup } from "@/components/ui/radio-button-group";
import { Sheet } from "@/components/ui/sheet";
import type { getEventDetails } from "@/lib/services/get-event-details";
import { useAuth } from "@/providers/auth";
import { format } from "@/utils/tz-format";
import { RoleRadioItems } from "./role-radio-items";
import { css } from "styled-system/css";

type Props = {
  eventId?: number;

  open: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
};

export const EventDetailsDrawer = (props: Props) => {
  const { user } = useAuth();

  const { data: details, refetch } = useQuery({
    queryKey: ["events", props.eventId],
    queryFn: async (): ReturnType<typeof getEventDetails> => {
      const res = await fetch(`/api/events/${props.eventId}`);
      return await res.json();
    },
    enabled: !!props.eventId,
  });

  const [selectedRoleId, setSelectedRoleId] = useState<string>();

  // TODO: replace to useMutation
  const [isDeleting, deleteSignup] = useAsyncFunc(async (id: number) => {
    await deleteSignupAction({ id });
    await refetch();
    setSelectedRoleId(undefined);
  });

  // TODO: replace to useMutation
  const [isCreating, createSignup] = useAsyncFunc(
    async (eventId: number, roleId: number) => {
      const response = await createSignupAction({ eventId, roleId });
      await refetch();

      if (!response.success) {
        return;
      }

      selectCurrentRole();
      animateFireworks(Date.now() + 1500);
    },
  );

  const selectedRole = useMemo(() => {
    const roleId = Number(selectedRoleId);
    return (
      details?.roles?.docs.find(({ id }) => id === roleId) ??
      details?.sections.docs
        .flatMap((s) => s.roles?.docs ?? [])
        .find(({ id }) => id === roleId)
    );
  }, [selectedRoleId, details]);

  const userSignups = useMemo(
    () =>
      details?.signups?.docs.filter(
        ({ user: signupUser }) => signupUser === user?.id,
      ),
    [details, user],
  );

  const hasUserSignedUp = useMemo(
    () => (userSignups?.length ?? 0) > 0,
    [userSignups],
  );

  const newEventLoading = details?.id !== props.eventId;
  const timeRange = useMemo(() => {
    const start = details?.start_date;
    const end = details?.end_date;

    if (!start || !end) return;

    return `${format(start, "iiii dd MMMM")}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  }, [details]);

  const selectCurrentRole = useCallback(() => {
    setSelectedRoleId(
      details?.signups?.docs
        .filter((signup) => signup.user === user?.id)
        .map((signup) => signup.role?.toString())
        .shift() ?? undefined,
    );
  }, [details, user]);

  useEffect(() => {
    // Reset selected role on exit
    if (!props.eventId) {
      setSelectedRoleId(undefined);
    }

    // On loading a new event, select the role the user has signed up for
    const shouldSelectRole = !selectedRoleId && !newEventLoading;
    if (shouldSelectRole) {
      selectCurrentRole();
    }
  }, [props.eventId, selectedRoleId, newEventLoading, selectCurrentRole]);

  const onSigningButtonClicked = () => {
    const id = details?.id;
    if (!id) throw new Error("Unexpected, missing event id");

    const _selectedRoleId = selectedRoleId;
    const _selectedRole = _selectedRoleId
      ? Number.parseInt(_selectedRoleId, 10)
      : undefined;
    if (!_selectedRole) throw new Error("Unexpected, missing role id");

    if (hasUserSignedUp) {
      const signup = userSignups?.find((su) => su.role === _selectedRole);
      if (!signup) return;

      deleteSignup(signup.id);
      return;
    }

    createSignup(id, _selectedRole);
  };

  return (
    <Sheet.Root
      open={props.open}
      onOpenChange={({ open }) => {
        !open && props.onClose();
      }}
      onExitComplete={props.onExitComplete}
      variant={{
        base: "bottom",
        md: "right",
      }}
      unmountOnExit
    >
      <Portal>
        <Sheet.Backdrop />
        <Sheet.Positioner>
          <Sheet.Content
            maxHeight={{ base: "80vh", md: "100vh" }}
            overflowY="auto"
            // avoid flash of old content on open, delay open animation
            style={{
              display: newEventLoading ? "none" : undefined,
            }}
          >
            <Suspense>
              <Sheet.Header>
                <Flex gap="2" alignItems={"flex-end"}>
                  <Sheet.Title fontSize="2xl">{details?.title}</Sheet.Title>
                  {user?.roles?.includes("admin") && (
                    <Link
                      href={"/admin/collections/events/" + details?.id}
                      target={"_blank"}
                      className={css({
                        textDecoration: "underline",
                        fontSize: "xl",
                      })}
                    >
                      <HStack gap={1}>
                        edit
                        <SquarePenIcon size={16} />
                      </HStack>
                    </Link>
                  )}
                </Flex>
                <Sheet.Description>
                  <Badge>{timeRange}</Badge>
                </Sheet.Description>
                <Sheet.Description>
                  {details?.tags && Array.isArray(details.tags) && details.tags.length > 0 && (
                    <HStack gap="2" marginY="2">
                      {details.tags.map((tag) =>
                        typeof tag === "object" && tag !== null ? (
                          <Badge key={tag.id}>{tag.text}</Badge>
                        ) : null
                      )}
                    </HStack>
                  )}
                </Sheet.Description>
                <Sheet.Description>
                  {details?.description && (
                    <RichText data={details.description} />
                  )}
                </Sheet.Description>
                <Sheet.CloseTrigger
                  position="absolute"
                  top={{
                    base: "3",
                    md: "4",
                  }}
                  right={{ base: "2", md: "4" }}
                  asChild
                >
                  <IconButton variant="ghost" size="lg">
                    <XIcon />
                  </IconButton>
                </Sheet.CloseTrigger>
              </Sheet.Header>
              <Sheet.Body justifyContent="end">
                <panda.h2 fontSize="xl" fontWeight="semibold" marginBottom="2">
                  Select a role
                </panda.h2>
                <RadioButtonGroup.Root
                  direction="vertical"
                  value={selectedRoleId ?? null}
                  onValueChange={(event) =>
                    setSelectedRoleId(event.value ?? undefined)
                  }
                  disabled={details === undefined}
                >
                  <RoleRadioItems
                    details={details}
                    roles={
                      details?.roles?.docs.filter((role) => !role.section) ?? []
                    }
                  />
                  {details?.sections?.docs.map((section) => (
                    <Fragment key={section.id}>
                      <panda.h3 fontSize="lg" fontWeight="medium" marginTop="4">
                        {section.title}
                      </panda.h3>

                      <RoleRadioItems
                        details={details}
                        roles={section.roles?.docs ?? []}
                      />
                    </Fragment>
                  ))}
                </RadioButtonGroup.Root>
                {user && (
                  <Alert.Root
                    marginBottom="-4"
                    marginTop="8"
                    borderColor="border.default"
                  >
                    <Alert.Icon asChild>
                      <InfoIcon />
                    </Alert.Icon>
                    <Alert.Content>
                      <Alert.Title>We are counting on your help</Alert.Title>
                      <Alert.Description>
                        Only apply for roles you are sure you can attend. If you
                        are no longer able to attend, please remove your signup.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}
              </Sheet.Body>
              <Sheet.Footer justifyContent="center">
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
                    colorPalette={hasUserSignedUp ? "tomato" : "olive"}
                    disabled={!hasUserSignedUp && !selectedRoleId}
                    loading={details === undefined || isCreating || isDeleting}
                    onClick={() => onSigningButtonClicked()}
                  >
                    {selectedRoleId ? (
                      <>
                        {hasUserSignedUp ? "Sign out of" : "Sign up for"}
                        <panda.span fontWeight="black">
                          {selectedRole?.title}
                        </panda.span>
                        role
                      </>
                    ) : (
                      "Select a role"
                    )}
                  </Button>
                )}
              </Sheet.Footer>
            </Suspense>
          </Sheet.Content>
        </Sheet.Positioner>
      </Portal>
    </Sheet.Root>
  );
};

const colors = ["#bb0000", "#ffffff"];
const animateFireworks = (end: number) => {
  confetti({
    particleCount: 4,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: colors,
    zIndex: 5000,
  });
  confetti({
    particleCount: 4,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: colors,
    zIndex: 5000,
  });

  if (Date.now() < end) {
    setTimeout(() => animateFireworks(end), 100);
  }
};

const useAsyncFunc = <T, P extends unknown[]>(
  fn: (...args: P) => Promise<T>,
) => {
  const [isRunning, setIsRunning] = useState(false);

  const run = async (...args: P) => {
    setIsRunning(true);
    await fn(...args);
    setIsRunning(false);
  };

  return [isRunning, run] as const;
};
