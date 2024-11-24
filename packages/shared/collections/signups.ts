import type { CollectionConfig } from "payload";

export const Signups: CollectionConfig = {
	slug: "signups",
	admin: {},
	fields: [
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
			label: "User",
			required: true,
			hasMany: false,
		},
		{
			name: "role",
			type: "relationship",
			relationTo: "roles",
			label: "Role",
			required: true,
			hasMany: false,
		},
	],
};
