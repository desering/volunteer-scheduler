import { Button, NavGroup } from "@payloadcms/ui";
import { Undo2Icon } from "lucide-react";
import Link from "next/link";
import { HStack } from "styled-system/jsx";

export const BackToSchedule = () => (
  <NavGroup label="Navigate...">
    <Link href="/">
      <Button buttonStyle="secondary">
        <HStack gap={1}>
          <Undo2Icon size={16} />
          Back to schedule
        </HStack>
      </Button>
    </Link>
  </NavGroup>
);
