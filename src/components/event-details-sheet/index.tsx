import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { RadioButtonGroup } from "@/components/ui/radio-button-group";
import { Sheet } from "@/components/ui/sheet";
import { format } from "@/utils/tz-format";
import type { User } from "@payload-types";
import { useQuery } from "@tanstack/react-query";
import { HStack, panda } from "styled-system/jsx";
import { button } from "styled-system/recipes/button";
import { RoleRadioItems } from "./role-radio-items";

import { createSignup as createSignupAction } from "@/actions/create-signup";
import { deleteSignup as deleteSignupAction } from "@/actions/delete-signup";

import confetti from "canvas-confetti";

import type { getEventDetails } from "@/lib/services/get-event-details";
import { Portal } from "@ark-ui/react";
import { InfoIcon } from "lucide-react";
import { XIcon } from "lucide-react";
import { Fragment, Suspense, useEffect, useMemo, useState } from "react";

type Props = {
  user?: User;

  eventId?: string | number;

  open: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
};

export const EventDetailsDrawer = (props: Props) => {
  const { data: details, refetch, isFetching } = useQuery({
    queryKey: ["eventDetails", props.eventId],
    queryFn: async (): ReturnType<typeof getEventDetails> => {
      const params = new URLSearchParams({
        id: props.eventId?.toString() ?? "",
      });
      return fetch(`/api/event-details?${params}`).then((res) => res.json());
    },
    enabled: !!props.eventId,
  });

  const [selectedRoleId, setSelectedRoleId] = useState<string>();

  const [isDeleting, deleteSignup] = useAsyncFunc(async (id: number) => {
    await deleteSignupAction(id);
    await refetch();
    setSelectedRoleId(undefined);
  });
  const [isCreating, createSignup] = useAsyncFunc(
    async (event: number, role: number) => {
      await createSignupAction(event, role);
      await refetch();
      selectCurrentRole();
      animateFireworks(Date.now() + 1500);
    },
  );

  const selectedRole = () => {
    const roleId = Number(selectedRoleId);
    return (
      details?.roles?.docs.find(({ id }) => id === roleId) ??
      details?.sections.docs
        .flatMap((s) => s.roles?.docs ?? [])
        .find(({ id }) => id === roleId)
    );
  };
  const userSignups = () =>
    details?.signups?.docs.filter(({ user }) => user === props.user?.id);
  const hasUserSignedUp = () => (userSignups()?.length ?? 0) > 0;
  const timeRange = useMemo(() => {
    const start = details?.start_date;
    const end = details?.end_date;

    if (!start || !end) return;

    return `${format(start, "iiii dd MMMM")}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  }, [details]);

  useEffect(() => {
    // Reset selected role on exit
    if (!props.eventId) {
      setSelectedRoleId(undefined);
    }

    // On loading a new event, select the role the user has signed up for
    const shouldSelectRole = !selectedRoleId && !isFetching;
    if (shouldSelectRole) {
      selectCurrentRole();
    }
  }, [props.eventId, isFetching, selectedRoleId]);

  const selectCurrentRole = () =>
    setSelectedRoleId(
      details?.signups?.docs
        .filter((signup) => signup.user === props.user?.id)
        .map((signup) => signup.role?.toString())
        .shift() ?? undefined,
    );

  const onSigningButtonClicked = () => {
    const id = details?.id;
    if (!id) throw new Error("Unexpected, missing event id");

    const _selectedRoleId = selectedRoleId;
    const _selectedRole = _selectedRoleId
      ? Number.parseInt(_selectedRoleId)
      : undefined;
    if (!_selectedRole) throw new Error("Unexpected, missing role id");

    if (hasUserSignedUp()) {
      const signup = userSignups()?.find((su) => su.role === _selectedRole);
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
            display={isFetching ? "none" : undefined}
          >
            <Suspense>
              <Sheet.Header>
                <Sheet.Title fontSize="2xl">{details?.title}</Sheet.Title>
                {details?.descriptionHtml && (
                  <Sheet.Description
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                    dangerouslySetInnerHTML={{
                      __html: details.descriptionHtml,
                    }}
                  />
                )}
                <Sheet.Description>
                  <Badge>{timeRange}</Badge>
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
                  value={selectedRoleId}
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
                    user={props.user}
                  />
                  {details?.sections?.docs.map((section) => (
                    <Fragment key={section.id}>
                      <panda.h3
                        fontSize="lg"
                        fontWeight="medium"
                        marginTop="4"
                      >
                        {section.title}
                      </panda.h3>

                      <RoleRadioItems
                        details={details}
                        roles={section.roles?.docs ?? []}
                        user={props.user}
                      />
                    </Fragment>
                  ))}
                </RadioButtonGroup.Root>
                {props.user && (
                  <Alert.Root marginBottom="-4" marginTop="8">
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
                {!props.user && (
                  <HStack>
                    Want to help out?{" "}
                    <a className={button({})} href="/auth/login">
                      Sign in
                    </a>{" "}
                    or{" "}
                    <a className={button({})} href="/auth/register">
                      Register
                    </a>
                  </HStack>
                )}
                {props.user && (
                  <Button
                    width="full"
                    variant="solid"
                    colorPalette={hasUserSignedUp() ? "tomato" : "olive"}
                    disabled={!hasUserSignedUp() && !selectedRoleId}
                    loading={details === undefined || isCreating || isDeleting}
                    onClick={() => onSigningButtonClicked()}
                  >
                    {selectedRoleId ? (
                      <>
                        {hasUserSignedUp() ? "Sign out of" : "Sign up for"}
                        <panda.span fontWeight="black">
                          {selectedRole()?.title}
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
