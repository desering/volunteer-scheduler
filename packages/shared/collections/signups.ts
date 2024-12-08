import { APIError, type CollectionConfig, type FieldHook } from "payload";

export const Signups: CollectionConfig = {
	slug: "signups",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["role", "user"],
	},
	fields: [
		{
			name: "shift",
			type: "relationship",
			relationTo: "shifts",
			label: "Shift",
			hasMany: false,
			required: true,
			maxDepth: 0,
			admin: {
				condition: (siblingData) => {
					return !(
						siblingData?.shift === undefined && siblingData?.role !== undefined
					);
				},
			},
			hooks: {
				// 	// When creating from sections screen, get shift from section
				beforeValidate: [
					async ({ siblingData, req }) => {
						if (!siblingData?.shift && siblingData?.role) {
							const section = await req.payload.findByID({
								collection: "roles",
								id: siblingData.role,
								depth: 0,
							});

							if (section) {
								return section.shift;
							}
						}
					},
				],
			},
		},
		{
			name: "role",
			type: "relationship",
			relationTo: "roles",
			label: "Role",
			required: true,
			hasMany: false,
			maxDepth: 0,
			filterOptions: ({ siblingData }) => {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				return { shift: { equals: (siblingData as any).shift } };
			},
			hooks: {
				beforeValidate: [
					async ({ operation, req, data }) => {
						if (operation === "create") {
							const role = await req.payload.findByID({
								collection: "roles",
								id: data?.role,
							});

							const signups = await req.payload.count({
								collection: "signups",
								where: {
									role: { equals: role.id },
								},
							});

							if (
								signups.totalDocs !== 0 &&
								signups.totalDocs >= role.maxSignups
							) {
								throw new APIError("This role is full", 400, undefined, true);
							}
						}
					},
				],
			},
		},
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
			label: "User",
			required: true,
			hasMany: false,
			maxDepth: 0,
		},

		// Lets show the user's preferred name instead of boring ID's
		{
			name: "title",
			type: "text",
			admin: {
				hidden: true, // Hide it from the list and admin ui
			},
			hooks: {
				beforeChange: [
					({ siblingData }) => {
						siblingData.title = undefined;
					},
				],
				afterRead: [
					async ({ data, req }) => {
						const user = await req.payload.findByID({
							collection: "users",
							id: data?.user,
						});

						return user.preferredName;
					},
				],
			},
		},
	],
};
