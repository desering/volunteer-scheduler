import type { CollectionConfig } from "payload";

export const Roles: CollectionConfig = {
	slug: "roles",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["title", "section", "signups"],
	},
	fields: [
		{
			name: "section",
			type: "relationship",
			relationTo: "sections",
			label: "Section",
			required: true,
			hasMany: false,
			maxDepth: 0,
			admin: {
				readOnly: true,
			},
		},
		{
			name: "title",
			type: "text",
		},
		{
			name: "description",
			label: "Description",
			type: "richText",
		},

		{
			name: "signups",
			label: "Signups",
			type: "join",
			collection: "signups",
			on: "role",
		},
	],
};
