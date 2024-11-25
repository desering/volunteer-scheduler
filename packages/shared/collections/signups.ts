import type { CollectionConfig, FieldHook } from "payload";

export const Signups: CollectionConfig = {
	slug: "signups",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["role", "user"],
	},
	fields: [
		{
			name: "role",
			type: "relationship",
			relationTo: "roles",
			label: "Role",
			required: true,
			hasMany: false,
			admin: {
				readOnly: true,
			},
		},
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
			label: "User",
			required: true,
			hasMany: false,
		},

		// Virtual Title
		{
			name: "title",
			type: "text",
			admin: {
				hidden: true,
				disableListColumn: true,
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
