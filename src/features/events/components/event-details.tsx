import type { Event } from "@/payload-types";
import { EventDetailsProvider } from "./event-details.context";

type RootProps = {
  eventId: Event["id"];
  children?: React.ReactNode;
};

export const Root = ({ eventId, children }: RootProps) => (
  <EventDetailsProvider eventId={eventId}>{children}</EventDetailsProvider>
);

export { Actions } from "./details/actions";
export { ToggleGroup } from "./details/toggle-group";
