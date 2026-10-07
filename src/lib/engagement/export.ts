import type { AudienceCandidate } from "./audience";
import { toCsv } from "./csv";
import type { EngagementData } from "./load";
import { emptySummary } from "./shifts";

const day = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 10) : "";

const HEADER = [
  "Name",
  "Email",
  "Phone",
  "Account created",
  "First shift",
  "Last shift",
  "Shifts",
  "Shifts last 90 days",
  "No-shows",
  "Upcoming",
  "Regular",
  "Regular until",
  "Skills",
];

/** The volunteer spreadsheet: one row per person, same numbers as the app. */
export const volunteersCsv = (
  data: EngagementData,
  only?: AudienceCandidate[],
) => {
  const skillTitle = new Map(data.skills.map((s) => [s.id, s.title]));
  const list =
    only ??
    [...data.volunteers]
      .sort((a, b) => a.preferredName.localeCompare(b.preferredName))
      .map((v) => ({ volunteer: v }));

  const rows = list.map(({ volunteer: v }) => {
    const s = data.summaries.get(v.id) ?? emptySummary(v.id);
    const r = data.regular.get(v.id);
    return [
      v.preferredName,
      v.email,
      v.phoneNumber ?? "",
      day(v.createdAt),
      day(s.firstShift),
      day(s.lastShift),
      s.totalShifts,
      s.shiftsLast90,
      s.noShows,
      s.upcoming.length,
      r?.isRegular ? "yes" : "no",
      day(r?.validUntil),
      [...(data.skillIdsByUser.get(v.id) ?? [])]
        .map((id) => skillTitle.get(id) ?? "")
        .filter(Boolean)
        .join("; "),
    ];
  });

  return toCsv(HEADER, rows);
};

export const csvResponse = (csv: string, filename: string) =>
  new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
