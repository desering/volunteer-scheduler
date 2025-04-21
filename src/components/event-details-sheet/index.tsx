import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { RadioButtonGroup } from "@/components/ui/radio-button-group";
import { Sheet } from "@/components/ui/sheet";
import type { DisplayableEvent, EventsByDay } from "@/lib/mappers/map-events";
import { format } from "@/utils/tz-format";
import type { User } from "@payload-types";
import { useQuery } from "@tanstack/react-query";
import { HStack, panda } from "styled-system/jsx";
import { button } from "styled-system/recipes/button";
import { RoleRadioItems } from "./role-radio-items";

import { createSignup as createSignupAction } from "@/actions/create-signup";
import { deleteSignup as deleteSignupAction } from "@/actions/delete-signup";

import confetti from "canvas-confetti";

import { InfoIcon } from "lucide-react";
import { XIcon } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Portal } from "@ark-ui/react";

type Props = {
  user?: User;

  event?: DisplayableEvent;

  open: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
};

export const EventDetailsDrawer = (props: Props) => {
  // const [details, { refetch }] = createResource(
  //   // todo: replace with react code
  //   // createResource with a fetch in it will have to use react query
  //   () => props.event?.doc.id,
  //   async (id) => await actions.getEventDetails(id),
  // );

  const { data: details, refetch } = useQuery<DisplayableEvent>({
    queryKey: ["getEventDetails"],
    queryFn: async () => fetch("/api/event-details").then((res) => res.json()),
    initialData: props.event,
  });

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const [isDeleting, deleteSignup] = createAsyncFunc(async (id: number) => {
    await deleteSignupAction(id);
    await refetch();
    setSelectedRoleId(null);
  });
  const [isCreating, createSignup] = createAsyncFunc(
    async (event: number, role: number) => {
      await createSignupAction(event, role);
      await refetch();
      selectCurrentRole();
      animateFireworks(Date.now() + 1500);
    },
  );

  // todo: replace with react code
  const latest = useMemo(
    // avoid triggering suspense on initial load
    () =>
      details?.loading && details?.state === "pending"
        ? undefined
        : details?.latest?.data,
    [details],
  );

  const selectedRole = () => {
    const roleId = Number(selectedRoleId);
    return (
      latest()?.roles?.docs.find(({ id }) => id === roleId) ??
      latest()
        ?.sections.docs.flatMap((s) => s.roles?.docs ?? [])
        .find(({ id }) => id === roleId)
    );
  };
  const userSignups = () =>
    latest()?.signups?.docs.filter(({ user }) => user === props.user?.id);
  const hasUserSignedUp = () => (userSignups()?.length ?? 0) > 0;
  const newEventLoading = () => latest()?.id !== props.event?.doc.id;
  const timeRange = () => {
    const start = props.event?.start_date;
    const end = props.event?.end_date;

    if (!start || !end) return;

    return `${format(start, "iiii dd MMMM")}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  };

  useEffect((selected) => {
    // Reset selected role on exit
    if (!props.event?.doc.id) {
      setSelectedRoleId(null);
      return false;
    }

    // On new event, select the role the user has signed up for
    const shouldSelectRole = !selected && !newEventLoading();
    if (shouldSelectRole) {
      selectCurrentRole();
      return true;
    }
  });

  const selectCurrentRole = () =>
    setSelectedRoleId(
      latest()
        ?.signups?.docs.filter((signup) => signup.user === props.user?.id)
        .map((signup) => signup.role?.toString())
        .shift() ?? null,
    );

  const onSigningButtonClicked = () => {
    const id = latest()?.id;
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
            display={newEventLoading() ? "none" : undefined}
          >
            <Suspense>
              <Sheet.Header>
                <Sheet.Title fontSize="2xl">{latest()?.title}</Sheet.Title>
                {props.event?.descriptionHtml && (
                  <Sheet.Description
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                    dangerouslySetInnerHTML={{
                      __html: props.event?.descriptionHtml,
                    }}
                  />
                )}
                <Sheet.Description>
                  <Badge>{timeRange()}</Badge>
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
                  onValueChange={(event) => setSelectedRoleId(event.value)}
                  disabled={details.loading}
                >
                  <RoleRadioItems
                    details={latest()}
                    roles={
                      latest()?.roles?.docs.filter((role) => !role.section) ??
                      []
                    }
                    user={props.user}
                  />
                  {latest()?.sections?.docs.map((section) => (
                    <>
                      <panda.h3
                        key={section}
                        fontSize="lg"
                        fontWeight="medium"
                        marginTop="4"
                      >
                        {section.title}
                      </panda.h3>

                      <RoleRadioItems
                        key={section}
                        details={latest()}
                        roles={section.roles?.docs ?? []}
                        user={props.user}
                      />
                    </>
                  ))}
                </RadioButtonGroup.Root>
                {props.user && (
                  <Alert.Root marginBottom="-4" marginTop="8">
                    <Alert.Icon
                      asChild={(iconProps) => <InfoIcon {...iconProps()} />}
                    />
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
                    Want to help out?
                    <a className={button({})} href="/auth/login">
                      Sign in
                    </a>
                    or
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
                    loading={details.loading || isCreating || isDeleting}
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

const createAsyncFunc = <T, P extends unknown[]>(
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
