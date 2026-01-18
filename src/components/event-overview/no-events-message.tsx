import { panda } from "styled-system/jsx";

type NoEventsMessageProps = {
  tagsSelected: boolean;
  locationsSelected: boolean;
};

export const NoEventsMessage = ({
  tagsSelected,
  locationsSelected,
}: NoEventsMessageProps) => (
  <panda.div
    backgroundColor={{
      base: "colorPalette.1",
      _dark: "colorPalette.4",
    }}
    borderRadius="l3"
    padding="6"
  >
    <panda.h5
      color="colorPalette.12"
      fontSize="xl"
      fontWeight="semibold"
      marginBottom={3}
    >
      There are no shifts yet, have a look at other days.
      {tagsSelected &&
        " Consider clearing the tag filter to see all available shifts."}
      {locationsSelected &&
        " Consider clearing the location filter to see all available shifts."}
    </panda.h5>
  </panda.div>
);
