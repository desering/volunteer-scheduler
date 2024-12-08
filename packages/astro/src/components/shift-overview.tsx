import { format } from "date-fns";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { Flex, panda } from "styled-system/jsx";
import type { RenderedShift, ShiftsByDay } from "~/utils/map-shifts";
import { ShiftDetailsDrawer } from "./shift-details-drawer";
import type { User } from "../../../shared/payload-types";

type Props = {
	user?: User;
	shifts: ShiftsByDay;
};

export const ShiftOverview = (props: Props) => {
	const [selectedShift, setSelectedShift] = createSignal<RenderedShift>();
	const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);

	return (
		<>
			<ShiftDetailsDrawer
				user={props.user}
				open={isDrawerOpen()}
				shift={selectedShift()}
				onClose={() => setIsDrawerOpen(false)}
				onExitComplete={() => setSelectedShift(undefined)}
			/>
			<Flex gap="4">
				<For each={Object.entries(props.shifts)}>
					{([, shifts]) => (
						<panda.div>
							<panda.h1 fontSize="6xl" fontWeight="bold" textAlign="center">
								{format(shifts[0].start_date, "dd")}
							</panda.h1>

							<panda.h3
								fontSize="xl"
								fontWeight="semibold"
								textAlign="center"
								marginBottom="4"
							>
								{format(shifts[0].start_date, "iii")}
							</panda.h3>

							<Flex
								flexDir="column"
								gap="4"
								width={{ base: "100%", md: "300px" }}
							>
								<For each={shifts}>
									{(shift) => (
										<panda.button
											onClick={() => {
												setIsDrawerOpen(true);
												setSelectedShift(shift);
											}}
											backgroundColor="colorPalette.12"
											color="colorPalette.1"
											padding="4"
											cursor="pointer"
											_hover={{
												backgroundColor: "colorPalette.1",
												color: "colorPalette.12",
												boxShadow: "inset 0 0 0 2px",
												boxShadowColor: "colorPalette.12",
											}}
											_focusVisible={{
												outline: "2px solid",
												outlineColor: "colorPalette.12",
												outlineOffset: "2px",
											}}
											class="group"
										>
											<panda.p textAlign="center">
												{format(shift.start_date, "HH:mm")} -{" "}
												{format(shift.end_date, "HH:mm")}
											</panda.p>

											<panda.h5
												color="colorPalette.1"
												fontSize="xl"
												fontWeight="semibold"
												textAlign="center"
												_groupHover={{
													color: "colorPalette.12",
												}}
											>
												{shift.doc.title}
											</panda.h5>

											<Show when={shift.html}>
												{(html) => (
													<panda.div
														color="colorPalette.3"
														_groupHover={{ color: "colorPalette.11" }}
														textAlign="left"
														innerHTML={html()}
													/>
												)}
											</Show>

											<panda.div marginTop="4">
												<Switch>
													<Match when={shift.doc.signups?.docs?.length === 0}>
														Nobody signed up yet :(, be the first!
													</Match>
													<Match when={shift.doc.signups?.docs?.length === 1}>
														1 person signed up!
													</Match>
													<Match
														when={(shift.doc.signups?.docs?.length ?? 0) > 1}
													>
														{shift.doc.signups?.docs?.length} people signed up!
													</Match>
												</Switch>
											</panda.div>
										</panda.button>
									)}
								</For>
							</Flex>
						</panda.div>
					)}
				</For>
			</Flex>
		</>
	);
};
