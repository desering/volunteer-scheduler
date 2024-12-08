import LexicalHTMLRenderer from "@tryghost/kg-lexical-html-renderer";
import type { Shift } from "../../../shared/payload-types";

const renderer = new LexicalHTMLRenderer();

export const groupAndSortShiftsByDate = async (
	shifts: Shift[],
): Promise<ShiftsByDay> => {
	const mappedShifts = await Promise.all(
		shifts.map(async (doc) => {
			const html =
				(doc.description && (await renderer.render(doc.description))) ??
				undefined;

			return {
				doc,
				html,
				start_date: new Date(doc.start_date),
				end_date: new Date(doc.end_date),
			};
		}),
	);

	const sorted = mappedShifts.sort(
		(a, b) => a.start_date.getTime() - b.start_date.getTime(),
	);

	const groupedByDay = sorted.reduce(
		(acc, shift) => {
			const date = shift.start_date.toDateString();
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push(shift);
			return acc;
		},
		{} as Record<string, typeof mappedShifts>,
	);

	return groupedByDay;
};

export type RenderedShift = {
	doc: Shift;
	html?: string;
	start_date: Date;
	end_date: Date;
};
export type ShiftsByDay = Record<string, RenderedShift[]>;
