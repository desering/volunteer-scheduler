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
			type: "tabs",
			tabs: [
				{
					label: "General",
					fields: [
						{
							name: "title",
							type: "text",
							required: true,
						},
						{
							name: "date",
							type: "date",
							required: true,
							admin: {
								date: {
									pickerAppearance: "dayOnly",
								},
							},
						},
						{
							name: "description",
							type: "richText",
						},
					],
				},
				{
					label: "Sections",
					virtual: true,
					fields: [
						{
							name: "sections",
							label: false,
							type: "join",
							collection: "sections",
							on: "shift",
							virtual: true,
							admin: {
								disableListColumn: true,
							},
						},
					],
				},
				{
					label: "Roles",
					virtual: true,
					fields: [
						{
							name: "roles",
							label: "",
							type: "join",
							collection: "roles",
							on: "section",
							virtual: true,
							admin: {
								allowCreate: false,
								disableListColumn: true,
							},
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
							admin: {
								allowCreate: false,
								disableListColumn: true,
							},
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
