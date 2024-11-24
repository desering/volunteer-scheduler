import type { CollectionAfterChangeHook, CollectionConfig } from "payload";

// const createDefaultSection: CollectionAfterChangeHook = async ({ req,context }) => {
// 	if (context. === "published") return;

// 	const defaultSection = {
// 		title: "Default Section",
// 		shift: doc.id,
// 	};

// 	await req.payload.create({
// 		collection: "sections",
// 		data: defaultSection,
// 	});
// };

export const Shifts: CollectionConfig = {
	slug: "shifts",
	admin: {
		useAsTitle: "title",
		group: "Shift Management",
	},
	fields: [
		{
			name: "title",
			label: "Title",
			type: "text",
			required: true,
		},
		{
			name: "start_date",
			label: "Start Date",
			type: "date",
			required: true,
			admin: {
				date: {
					pickerAppearance: "dayAndTime",
				},
			},
		},
		{
			name: "end_date",
			label: "End Date",
			type: "date",
			admin: {
				date: {
					pickerAppearance: "dayAndTime",
				},
			},
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
					label: "Sections",
					fields: [
						{
							name: "sections",
							label: false,
							type: "join",
							collection: "sections",
							on: "shift",
						},
					],
				},
				{
					label: "Roles",
					fields: [
						{
							name: "roles",
							label: "",
							type: "join",
							collection: "roles",
							on: "section",
						},
					],
				},
				{
					label: "Signups",
					fields: [
						{
							name: "Signups",
							label: "",
							type: "join",
							collection: "signups",
							on: "role",
						},
					],
				},
			],
		},
	],
	hooks: {
		// afterChange: [createDefaultSection],
	},
};
