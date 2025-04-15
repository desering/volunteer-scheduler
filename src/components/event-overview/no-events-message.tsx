import {panda} from "styled-system/jsx";

export function NoEventsMessage() {
  return (
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
      </panda.h5>
    </panda.div>
  );
}
