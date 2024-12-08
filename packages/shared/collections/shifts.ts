import type { CollectionAfterChangeHook, CollectionConfig } from "payload";

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
							required: true,
							admin: {
								date: {
									pickerAppearance: "dayAndTime",
								},
							},
							validate: (
								val,
								{ siblingData }: { siblingData: { start_date?: Date } },
							) => {
								// Make sure end date is after start date
								if (
									val &&
									siblingData.start_date &&
									val <= siblingData.start_date
								) {
									return "End date must be after the starting date";
								}

								return true;
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
					fields: [
						{
							name: "sections",
							label: false,
							type: "join",
							collection: "sections",
							on: "shift",
							maxDepth: 0,
							admin: {
								disableListColumn: true,
							},
						},
					],
				},
				{
					label: "Roles",
					fields: [
						{
							name: "roles",
							label: false,
							type: "join",
							collection: "roles",
							on: "shift",
							maxDepth: 0,
							admin: {
								// allowCreate: false,
								disableListColumn: true,
							},
						},
					],
				},
				{
					label: "Signups",
					fields: [
						{
							name: "signups",
							label: false,
							type: "join",
							collection: "signups",
							on: "shift",
							maxDepth: 0,
							admin: {
								// allowCreate: false,
								disableListColumn: true,
							},
						},
					],
				},
			],
		},
	],
};
