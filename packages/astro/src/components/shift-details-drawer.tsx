import { actions } from "astro:actions";
import {
	For,
	Match,
	Show,
	Switch,
	children,
	createEffect,
	createResource,
	createSelector,
	type JSX,
} from "solid-js";
import { Portal } from "solid-js/web";
import type { RenderedShift } from "~/utils/map-shifts";
import XIcon from "~icons/lucide/x";
import { Button } from "./ui/button";
import { Drawer } from "./ui/drawer";
import { IconButton } from "./ui/icon-button";
import { Bleed, Divider, Flex, HStack, panda } from "styled-system/jsx";
import type { Role, Signup, User } from "../../../shared/payload-types";

type Props = {
	user?: User;

	shift?: RenderedShift;

	open: boolean;
	onClose: () => void;
	onExitComplete?: () => void;
};

export const ShiftDetailsDrawer = (props: Props) => {
	const [details] = createResource(
		() => props.shift?.doc.id,
		async (id) => {
			if (!id) return;
			return await actions.getShiftDetails({ id });
		},
	);

	return (
		<Drawer.Root
			open={props.open}
			onOpenChange={({ open }) => {
				!open && props.onClose();
			}}
			onExitComplete={props.onExitComplete}
		>
			<Portal>
				<Drawer.Backdrop />
				<Drawer.Positioner width={{ base: "100vw", sm: "xl", md: "2xl" }}>
					<Drawer.Content>
						<Drawer.Header>
							<Drawer.Title>{props.shift?.doc.title}</Drawer.Title>
							<Show when={props.shift?.html}>
								<Drawer.Description innerHTML={props.shift?.html} />
							</Show>
							<Drawer.CloseTrigger
								position="absolute"
								top="3"
								right="4"
								asChild={(closeProps) => (
									<IconButton {...closeProps()} variant="ghost" size="lg">
										<XIcon />
									</IconButton>
								)}
							/>
						</Drawer.Header>
						<Drawer.Body justifyContent="end">
							<panda.h2 fontSize="2xl" fontWeight="semibold" marginBottom="2">
								Select a role
							</panda.h2>

							<Bleed inline="6">
								<Divider />
							</Bleed>

							{/* Unsectioned roles */}

							<RoleRows
								details={details()?.data}
								roles={
									details()?.data?.roles?.docs.filter(
										(role) => !role.section,
									) ?? []
								}
								user={props.user}
							/>

							<For each={details()?.data?.sections?.docs}>
								{(section) => (
									<panda.div marginTop="8">
										<panda.h3
											fontSize="xl"
											fontWeight="semibold"
											marginBottom="2"
										>
											{section.title}
										</panda.h3>

										<Bleed inline="6">
											<Divider />
										</Bleed>

										<RoleRows
											details={details()?.data}
											roles={section.roles?.docs ?? []}
											user={props.user}
										/>
									</panda.div>
								)}
							</For>
						</Drawer.Body>
						{/* <Drawer.Footer gap="3">
							<Button variant="solid" size="lg">
								Signup
							</Button>
						</Drawer.Footer> */}
					</Drawer.Content>
				</Drawer.Positioner>
			</Portal>
		</Drawer.Root>
	);
};

const RolesNotFoundRow = () => (
	<>
		<panda.p py="4">No roles found :(</panda.p>

		<Bleed inline="6">
			<Divider />
		</Bleed>
	</>
);

type RoleRowsProps = {
	details?: Awaited<ReturnType<typeof actions.getShiftDetails>>["data"];
	roles: Role[];
	user?: User;
};

const RoleRows = (props: RoleRowsProps) => {
	const userSignups = () =>
		props.details?.signups?.docs.filter(
			(signup) => signup.user === props.user?.id,
		);

	return (
		<For each={props.roles} fallback={<RolesNotFoundRow />}>
			{(role) => (
				<>
					<Flex py="4" alignItems="center" justifyContent="space-between">
						<panda.div>{role.title}</panda.div>
						<HStack>
							<Show
								when={userSignups()?.some((su) => su.role === role.id)}
								fallback={
									<>
										<p>
											{props.details?.signups.docs
												.filter((su) => su.role === role.id)
												.map((su) => su.title)
												.join(", ")}
										</p>
										<Show when={role.maxSignups !== role.signups?.docs?.length}>
											<Button variant="solid" size="lg">
												Signup
												<Show when={role.maxSignups > 1}>
													{` (${role.signups?.docs?.length}/${role.maxSignups})`}
												</Show>
											</Button>
										</Show>
									</>
								}
							>
								<HStack>
									<Button variant="outline" size="lg">
										😭 Cancel Signup
									</Button>
								</HStack>
							</Show>
						</HStack>
					</Flex>
					<Bleed inline="6">
						<Divider />
					</Bleed>
				</>
			)}
		</For>
	);
};
