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
		afterRead: [({ data }) => data?.title || "Untitled Section"],
	},
};

export const Sections: CollectionConfig = {
	slug: "sections",
	admin: {
		useAsTitle: "virtualTitle",
	},
	fields: [
		{
			name: "shift",
			type: "relationship",
			relationTo: "shifts",
			label: "Shift",
			required: true,
			hasMany: false,
			admin: {
				allowEdit: false,
				readOnly: true,
			},
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
			type: "row",
			fields: [
				{
					name: "start",
					type: "date",
					label: "Start Time",
					admin: {
						date: {
							pickerAppearance: "timeOnly",
							displayFormat: "HH:mm",
							timeFormat: "HH:mm",
						},
					},
				},
				{
					name: "end",
					type: "date",
					label: "End Time",
					admin: {
						date: {
							pickerAppearance: "timeOnly",
							displayFormat: "HH:mm",
							timeFormat: "HH:mm",
						},
					},
				},
			],
		},
		{
			name: "description",
			label: "Description",
			type: "richText",
		},
		{
			type: "tabs",
			tabs: [
				{
					label: "Roles",
					fields: [
						{
							name: "roles",
							label: "",
							type: "join",
							collection: "roles",
							on: "section",
							virtual: true,
							admin: {
								disableListColumn: true,
							},
						},
					],
				},
			],
		},
	],
};
