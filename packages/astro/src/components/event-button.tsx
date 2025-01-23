import { propsToFilename } from "astro/assets/utils";
import type { JSX } from "astro/jsx-runtime";
import { Match, Show, Switch } from "solid-js";
import { panda } from "styled-system/jsx";
import { format } from "~/utils/tz-format";

type Props = {
  startDate: Date;
  endDate: Date;
  title: string;
  description?: string;
  onClick: () => void;
  signupsAmount: number;
};

export const EventButton = (props: Props) => (
  <panda.button
    onClick={() => props.onClick()}
    backgroundColor={{
      base: "colorPalette.1",
      _dark: "colorPalette.4",
    }}
    paddingX="4"
    paddingY="6"
    cursor="pointer"
    textAlign="left"
    borderRadius="l3"
    class="group"
  >
    <panda.p>
      {format(props.startDate, "HH:mm")} - {format(props.endDate, "HH:mm")}
    </panda.p>

    <panda.h5 fontSize="xl" fontWeight="semibold">
      {props.title}
    </panda.h5>

    <Show when={props.description}>
      {(html) => (
        <panda.div color="colorPalette.3" innerHTML={props.description} />
      )}
    </Show>

    <panda.div marginTop="4">
      <Switch>
        <Match when={props.signupsAmount === 0}>
          Nobody signed up yet :( be the first!
        </Match>
        <Match when={props.signupsAmount !== 0}>
          {`${props.signupsAmount} ${props.signupsAmount === 1 ? "person" : "people"} signed up!`}
        </Match>
      </Switch>
    </panda.div>
  </panda.button>
);
