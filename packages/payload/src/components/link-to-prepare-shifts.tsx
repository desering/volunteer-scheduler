import { Button } from "@payloadcms/ui";
import Link from "next/link";

export const LinkToPrepareShifts = () => {
  return (
    <Button el="link" Link={Link} to="/prepare-shifts">
      Prepare Shifts
    </Button>
  );
};
