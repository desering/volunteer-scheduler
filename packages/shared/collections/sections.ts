import type { CollectionConfig, Field } from "payload";

const virtualTitle: Field = {
	name: "virtualTitle",
	label: "Title",
	type: "text",
	admin: {
		hidden: true,
	},
	hooks: {
		beforeChange: [
			({ siblingData }) => {
				// biome-ignore lint/performance/noDelete: ensures data is not stored in DB
				delete siblingData.virtualTitle;
			},
		],
		afterRead: [({ data }) => data?.title ?? "Untitled Section"],
	},
};

export const Sections: CollectionConfig = {
	slug: "sections",
	admin: {
		useAsTitle: "virtualTitle",
		defaultColumns: ["title", "shift"],
	},
	fields: [
		{
			name: "shift",
			type: "relationship",
			relationTo: "shifts",
			label: "Shift",
			required: true,
			hasMany: false,
		},
		virtualTitle,
		{
			name: "title",
			type: "text",
			admin: {
				disableListColumn: true,
			},
		},
		{
			name: "description",
			label: "Description",
			type: "richText",
		},
		{
			name: "roles",
			label: "Roles",
			type: "join",
			collection: "roles",
			on: "section",
			virtual: true,
			admin: {
				disableListColumn: true,
			},
		},
	],
};
