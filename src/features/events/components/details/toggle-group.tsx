"use client";

import { css } from "styled-system/css";
import { Flex, panda } from "styled-system/jsx";
import { Alert } from "@/components/ui/alert";
import { RadioButtonGroup } from "@/components/ui/radio-button-group";
import { Text } from "@/components/ui/text";
import type { EventDetails } from "@/lib/local-models/event-details";
import { useAuth } from "@/providers/auth";
import { useEventDetailsQuery } from "../../hooks/use-event-details-query";
import { useEventDetails } from "../event-details.context";

export const ToggleGroup = () => {
  const { user } = useAuth();
  const { eventId, userSignup, setSelectedRoleId, selectedRoleId } =
    useEventDetails();
  const { data } = useEventDetailsQuery(eventId);

  return (
    <>
      <panda.h2 fontSize="xl" fontWeight="semibold" marginBottom="2">
        Select a role
      </panda.h2>

      <RadioButtonGroup.Root
        value={selectedRoleId?.toString() || null}
        onValueChange={({ value }) =>
          setSelectedRoleId(Number(value) ?? undefined)
        }
      >
        {data?.roles.map((role) => (
          <RoleSignupButtonGroupItem
            key={role.id.toString()}
            role={role}
            hasUserSignedUp={userSignup?.id === role.id}
          />
        ))}

        {data?.sections.map((section) =>
          section.roles.map((role) => (
            <RoleSignupButtonGroupItem
              key={role.id.toString()}
              role={role}
              hasUserSignedUp={userSignup?.id === role.id}
            />
          )),
        )}
      </RadioButtonGroup.Root>

      {user && (
        <Alert.Root marginTop="8" borderColor="border.default">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>We are counting on your help</Alert.Title>
            <Alert.Description>
              Only apply for roles you are sure you can attend. If you are no
              longer able to attend, please remove your signup.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </>
  );
};

type RoleSignupButtonGroupItemProps = {
  role: EventDetails["roles"][number];
  hasUserSignedUp: boolean;
};

const RoleSignupButtonGroupItem = ({
  role,
  hasUserSignedUp,
}: RoleSignupButtonGroupItemProps) => {
  const isRoleFull =
    role.maxSignups === role.signups?.length && role.maxSignups > 0;

  const disabled = hasUserSignedUp ? false : isRoleFull;

  return (
    <RadioButtonGroup.Item
      value={role.id.toString()}
      disabled={disabled}
      px="0"
      height="auto"
      width="full"
    >
      <RadioButtonGroup.ItemControl />
      <RadioButtonGroup.ItemText
        className={css({
          flexDirection: "column",
          alignItems: "stretch",
          width: "full",
          px: "4",
          py: "3",
          fontWeight: "normal",
        })}
      >
        <Flex justifyContent="space-between">
          <Text fontWeight="bolder">{role.title}</Text>
          <span>
            {isRoleFull
              ? "Filled"
              : `Open (${role.signups?.length}/${role.maxSignups || "∞"})`}
          </span>
        </Flex>

        {(role.signups?.length ?? 0) > 0 && (
          <p className={css({ whiteSpace: "normal" })}>
            {role.signups
              ?.filter((su) => su.role === role.id)
              ?.map((su) => su.title)
              .join(", ")}
          </p>
        )}
      </RadioButtonGroup.ItemText>
      <RadioButtonGroup.ItemHiddenInput />
    </RadioButtonGroup.Item>
  );
};
