import type { CollectionConfig } from "payload";

export const Roles: CollectionConfig = {
	slug: "roles",
	admin: {
		useAsTitle: "title",
	},
	fields: [
		{
			name: "section",
			type: "relationship",
			relationTo: "sections",
			label: "Section",
			required: true,
			hasMany: false,
			admin: {},
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
	],
};
