import { actions } from "astro:actions";
import type { User } from "@payload-types";
import {
  For,
  Match,
  Show,
  Suspense,
  Switch,
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from "solid-js";
import { Portal } from "solid-js/web";
import { HStack, panda } from "styled-system/jsx";
import { button } from "styled-system/recipes/button";
import type { DisplayableEvent } from "../../../../../src/lib/mappers/map-events";
import { format } from "~/utils/tz-format";
import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";
import { RadioButtonGroup } from "../ui/radio-button-group";
import { Sheet } from "../ui/sheet";
import { RoleRadioItems } from "./role-radio-items";

import confetti from "canvas-confetti";

import InfoIcon from "lucide-react/icons/info";
import XIcon from "lucide-react/icons/x";

type Props = {
  user?: User;

  event?: DisplayableEvent;

  open: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
};

export const EventDetailsDrawer = (props: Props) => {
  const [details, { refetch }] = createResource(
    () => props.event?.doc.id,
    async (id) => await actions.getEventDetails({ id }),
  );

  const [selectedRoleId, setSelectedRoleId] = createSignal<string | null>(null);

  const [isDeleting, deleteSignup] = createAsyncFunc(async (id: number) => {
    await actions.deleteSignup({ id });
    await refetch();
    setSelectedRoleId(null);
  });
  const [isCreating, createSignup] = createAsyncFunc(
    async (event: number, role: number) => {
      await actions.createSignup({ event, role });
      await refetch();
      selectCurrentRole();
      animateFireworks(Date.now() + 1500);
    },
  );

  const latest = createMemo(() =>
    // avoid triggering suspense on initial load
    details.loading && details.state === "pending"
      ? undefined
      : details.latest?.data,
  );

  const selectedRole = () => {
    const roleId = Number(selectedRoleId());
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

  createEffect<boolean | undefined>((selected) => {
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

    const _selectedRoleId = selectedRoleId();
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
                <Show when={props.event?.descriptionHtml}>
                  <Sheet.Description innerHTML={props.event?.descriptionHtml} />
                </Show>
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
                  asChild={(closeProps) => (
                    <IconButton {...closeProps()} variant="ghost" size="lg">
                      <XIcon />
                    </IconButton>
                  )}
                />
              </Sheet.Header>
              <Sheet.Body justifyContent="end">
                <panda.h2 fontSize="xl" fontWeight="semibold" marginBottom="2">
                  Select a role
                </panda.h2>

                <RadioButtonGroup.Root
                  direction="vertical"
                  value={selectedRoleId()}
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

                  <For each={latest()?.sections?.docs}>
                    {(section) => (
                      <>
                        <panda.h3
                          fontSize="lg"
                          fontWeight="medium"
                          marginTop="4"
                        >
                          {section.title}
                        </panda.h3>

                        <RoleRadioItems
                          details={latest()}
                          roles={section.roles?.docs ?? []}
                          user={props.user}
                        />
                      </>
                    )}
                  </For>
                </RadioButtonGroup.Root>

                <Show when={!!props.user}>
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
                </Show>
              </Sheet.Body>
              <Sheet.Footer justifyContent="center">
                <Switch>
                  <Match when={!props.user}>
                    <HStack>
                      Want to help out?
                      <a class={button({})} href="/auth/login">
                        Sign in
                      </a>
                      or
                      <a class={button({})} href="/auth/register">
                        Register
                      </a>
                    </HStack>
                  </Match>
                  <Match when={!!props.user}>
                    <Button
                      width="full"
                      variant="solid"
                      colorPalette={hasUserSignedUp() ? "tomato" : "olive"}
                      disabled={!hasUserSignedUp() && !selectedRoleId()}
                      loading={details.loading || isCreating() || isDeleting()}
                      onClick={() => onSigningButtonClicked()}
                    >
                      <Switch>
                        <Match when={!selectedRoleId()}>Select a role</Match>
                        <Match when={!!selectedRoleId()}>
                          {hasUserSignedUp() ? "Sign out of" : "Sign up for"}
                          <panda.span fontWeight="black">
                            {selectedRole()?.title}
                          </panda.span>
                          role
                        </Match>
                      </Switch>
                    </Button>
                  </Match>
                </Switch>
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
  const [isRunning, setIsRunning] = createSignal(false);

  const run = async (...args: P) => {
    setIsRunning(true);
    await fn(...args);
    setIsRunning(false);
  };

  return [isRunning, run] as const;
};
