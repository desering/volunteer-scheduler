import type { Role, User } from "@payload-types";
import type { EventDetails } from "@/lib/services/get-event-details";
import { RadioButtonGroup } from "../ui/radio-button-group";
import { Bleed, Divider, Flex, panda } from "styled-system/jsx";
import { Text } from "@/components/ui/text";

type RoleItemsProps = {
  details?: EventDetails;
  roles: Role[];
  user?: User;
};

export const RoleRadioItems = (props: RoleItemsProps) => {
  const userSignups = () =>
    props.details?.signups?.docs.filter(
      (signup) => signup.user === props.user?.id,
    );

  const hasUserSignedUp = () => (userSignups()?.length ?? 0) > 0;

  const roles = props.roles.map((role) => {
    const isUserSignedToThisRole = () =>
      !!userSignups()?.find((su) => su.role === role.id);
    const isRoleFull = () =>
      role.maxSignups === role.signups?.docs?.length && role.maxSignups > 0;

    const shouldDisable = () => {
      if (isUserSignedToThisRole()) return false;
      if (isRoleFull()) return true;
      if (hasUserSignedUp()) return true;
    };

    return (
      <RadioButtonGroup.Item
        value={role.id.toString()}
        px="0"
        disabled={shouldDisable()}
        height="auto"
      >
        <RadioButtonGroup.ItemControl />
        <RadioButtonGroup.ItemText
          flexDirection="column"
          alignItems="stretch"
          width="full"
          px="4"
          py="3"
          fontWeight="normal"
        >
          <Flex justifyContent="space-between">
            <Text fontWeight="bolder">{role.title}</Text>
            <div>
              {isRoleFull()
                ? "Filled"
                : `Open (${role.signups?.docs?.length}/${role.maxSignups || "∞"})`}
            </div>
          </Flex>
          {(role.signups?.docs?.length ?? 0) > 0 ? (
            <panda.p whiteSpace="normal">
              {props.details?.signups?.docs
                ?.filter((su) => su.role === role.id)
                ?.map((su) => su.title)
                .join(", ")}
            </panda.p>
          ) : (
            ""
          )}
        </RadioButtonGroup.ItemText>
        <RadioButtonGroup.ItemHiddenInput />
      </RadioButtonGroup.Item>
    );
  });

  return roles ?? <NoRolesFound />;
};

const NoRolesFound = () => (
  <>
    <panda.p py="4">No roles found :(</panda.p>

    <Bleed inline="6">
      <Divider />
    </Bleed>
  </>
);
