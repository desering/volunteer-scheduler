import type { UIFieldServerProps } from "payload";
import { css } from "styled-system/css";
import { milestoneProgress } from "@/lib/engagement/badges";
import {
  getEngagementSettings,
  loadAwards,
  loadShifts,
  loadSkills,
  loadVolunteers,
} from "@/lib/engagement/load";
import { regularStatus } from "@/lib/engagement/regular";
import { summarize } from "@/lib/engagement/shifts";
import { format } from "@/utils/tz-format";

const day = (d: Date | null) => (d ? format(d, "d MMM yyyy") : "—");

/**
 * Read-only "volunteer record" at the top of a user in the admin panel:
 * shifts, regular status, skills and badges in one glance.
 */
export const VolunteerSummary = async ({
  id,
  payload,
  req,
}: UIFieldServerProps) => {
  if (!id || !req.user?.roles?.includes("admin")) return null;
  const userId = Number(id);
  const now = new Date();

  const [shifts, [volunteer], skills, awards, settings] = await Promise.all([
    loadShifts(payload, { userId }),
    loadVolunteers(payload, { userIds: [userId] }),
    loadSkills(payload),
    loadAwards(payload, { userId }),
    getEngagementSettings(payload),
  ]);
  if (!volunteer) return null;

  const summary = summarize(userId, shifts, now);
  const regular = regularStatus(
    summary.attended.map((s) => s.start),
    settings,
    volunteer.regularOverride,
    now,
  );
  const milestones = milestoneProgress(
    summary.totalShifts,
    settings.milestones,
  );
  const skillById = new Map(skills.map((s) => [s.id, s]));

  const facts: [string, string][] = [
    [
      "Shifts",
      `${summary.totalShifts} (${summary.shiftsLast90} in the last 90 days)`,
    ],
    [
      "First / last shift",
      `${day(summary.firstShift)} / ${day(summary.lastShift)}`,
    ],
    ["Upcoming", `${summary.upcoming.length} signed up`],
    ["No-shows", String(summary.noShows)],
    [
      "Regular",
      regular.isRegular
        ? regular.validUntil
          ? `Yes, until ${day(regular.validUntil)} without another shift`
          : "Yes (set by an admin)"
        : regular.basis === "override"
          ? "No (set by an admin)"
          : `No — ${regular.shiftsInWindow} of ${settings.regularMinShifts} shifts in the last ${settings.regularWindowDays} days`,
    ],
    [
      "Skills",
      awards
        .map((a) => skillById.get(a.skillId))
        .filter((s) => !!s)
        .map((s) => `${s.badge} ${s.title}`)
        .join(", ") || "—",
    ],
    [
      "Badges",
      milestones.earned.map((m) => `${m.badge} ${m.label}`).join(", ") || "—",
    ],
  ];

  return (
    <section
      className={css({
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "4px",
        padding: "16px",
        marginBottom: "24px",
      })}
    >
      <strong>Volunteer record</strong>
      <dl
        className={css({
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          gap: "4px 16px",
          marginTop: "8px",
          "& dt": { color: "var(--theme-elevation-500)" },
          "& dd": { margin: 0 },
        })}
      >
        {facts.map(([label, value]) => (
          <div key={label} className={css({ display: "contents" })}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
