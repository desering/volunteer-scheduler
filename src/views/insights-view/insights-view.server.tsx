import { gte } from "@payloadcms/db-postgres/drizzle";
import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewProps } from "payload";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { divider, gutterX, gutterY } from "@/components/ui/utils";
import { computeInsights } from "@/lib/engagement/insights";
import { loadEngagement } from "@/lib/engagement/load";
import { daysAgo } from "@/lib/engagement/shifts";
import { regular_card_views } from "@/payload-generated-schema";
import { format } from "@/utils/tz-format";

const pct = (n: number | null) =>
  n === null ? "—" : `${Math.round(n * 100)}%`;
const monthLabel = (key: string) =>
  format(new Date(`${key}-15T12:00:00Z`), "MMM yyyy");

const muted = css({ color: "var(--theme-elevation-500)" });
const section = cx(divider, css({ paddingBlock: "24px" }));
const h2 = css({ fontSize: "1.25rem", marginBottom: "4px" });
const table = css({
  borderCollapse: "collapse",
  marginTop: "12px",
  "& th, & td": {
    textAlign: "right",
    padding: "6px 12px",
    borderBottom: "1px solid var(--theme-elevation-100)",
    whiteSpace: "nowrap",
  },
  "& th:first-child, & td:first-child": { textAlign: "left" },
});

const Tile = (props: { label: string; value: ReactNode; note?: string }) => (
  <div
    className={css({
      border: "1px solid var(--theme-elevation-150)",
      borderRadius: "4px",
      padding: "12px 16px",
    })}
  >
    <div className={muted}>{props.label}</div>
    <div className={css({ fontSize: "1.75rem", fontWeight: 600 })}>
      {props.value}
    </div>
    {props.note && (
      <div className={cx(muted, css({ fontSize: "0.85rem" }))}>
        {props.note}
      </div>
    )}
  </div>
);

const Bar = (props: { label: string; value: number; max: number }) => (
  <div
    className={css({
      display: "grid",
      gridTemplateColumns: "12rem 1fr 4rem",
      gap: "8px",
      alignItems: "center",
    })}
  >
    <span>{props.label}</span>
    <span
      className={css({
        height: "14px",
        background: "var(--theme-success-500)",
        borderRadius: "2px",
      })}
      style={{
        width: `${props.max === 0 ? 0 : (props.value / props.max) * 100}%`,
      }}
    />
    <span className={css({ textAlign: "right" })}>{props.value}</span>
  </div>
);

/**
 * /admin/insights — how many volunteers come, and come back. Every number is
 * computed by lib/engagement/insights.ts from the same attendance rule the
 * rest of the app uses.
 */
export const InsightsView = async ({
  initPageResult,
  params,
  searchParams,
}: AdminViewProps) => {
  const user = initPageResult.req.user;
  const isAdmin = Boolean(user?.roles?.includes("admin"));

  const template = (children: ReactNode) => (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <div className={cx(gutterX, gutterY)}>{children}</div>
    </DefaultTemplate>
  );

  if (!isAdmin) return template(<p>Only admins can see volunteer insights.</p>);

  const data = await loadEngagement();
  const insights = computeInsights(data);
  const { totals } = insights;

  const cardViews = await data.payload.db.drizzle
    .select({ user: regular_card_views.user })
    .from(regular_card_views)
    .where(
      gte(regular_card_views.viewedAt, daysAgo(data.now, 30).toISOString()),
    );
  const cardUsers = new Set(cardViews.map((v) => v.user)).size;

  const holders = new Map<number, number>();
  for (const a of data.awards)
    holders.set(a.skillId, (holders.get(a.skillId) ?? 0) + 1);

  const funnelMax = insights.funnel[0]?.count ?? 0;
  const weekdayMax = Math.max(0, ...insights.byWeekday90.map((d) => d.shifts));

  return template(
    <>
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "12px",
        })}
      >
        <h1>Volunteer insights</h1>
        <a href="/api/admin/volunteers" download>
          Download all volunteers (spreadsheet)
        </a>
      </div>
      <p className={muted}>
        A shift counts once it is over, unless a coordinator marked a no-show.
        Regular = {data.settings.regularMinShifts}+ shifts in the last{" "}
        {data.settings.regularWindowDays} days (change this in{" "}
        <a href="/admin/globals/volunteer-settings">Volunteer settings</a>).
      </p>

      <div className={section}>
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(12rem, 1fr))",
            gap: "12px",
          })}
        >
          <Tile
            label="Active, last 30 days"
            value={totals.active30}
            note={`${totals.active90} in the last 90 days`}
          />
          <Tile label="Regulars right now" value={totals.regulars} />
          <Tile
            label="New this month"
            value={totals.newThisMonth}
            note={`${totals.newLastMonth} last month`}
          />
          <Tile
            label="Came back within 60 days"
            value={pct(insights.returnRate.rate)}
            note={`${insights.returnRate.returned} of ${insights.returnRate.eligible} first-timers`}
          />
          <Tile
            label="Shifts per active volunteer"
            value={totals.shiftsPerActiveVolunteer90.toFixed(1)}
            note="last 90 days"
          />
          <Tile
            label="No-shows"
            value={pct(insights.noShows90.rate)}
            note={`${insights.noShows90.noShows} of ${insights.noShows90.total} signups, last 90 days`}
          />
          <Tile
            label="Regular card opened"
            value={cardViews.length}
            note={`by ${cardUsers} ${cardUsers === 1 ? "volunteer" : "volunteers"}, last 30 days`}
          />
        </div>
      </div>

      <div className={section}>
        <h2 className={h2}>From sign-up to regular</h2>
        <p className={muted}>
          How far people get. Each line is a smaller group than the one above.
        </p>
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "12px",
            maxWidth: "48rem",
          })}
        >
          {insights.funnel.map((step) => (
            <Bar
              key={step.label}
              label={step.label}
              value={step.count}
              max={funnelMax}
            />
          ))}
        </div>
      </div>

      <div className={section}>
        <h2 className={h2}>Do new volunteers keep coming?</h2>
        <p className={muted}>
          Grouped by the month of their first shift: how many of them
          volunteered again 1, 2 and 3 months later.
        </p>
        <div className={css({ overflowX: "auto" })}>
          <table className={table}>
            <thead>
              <tr>
                <th>First shift in</th>
                <th>New volunteers</th>
                <th>1 month later</th>
                <th>2 months later</th>
                <th>3 months later</th>
              </tr>
            </thead>
            <tbody>
              {insights.cohorts.map((c) => (
                <tr key={c.month}>
                  <td>{monthLabel(c.month)}</td>
                  <td>{c.size}</td>
                  {c.stillComing.map((n, monthsLater) => (
                    // A fixed three columns: position is the identity here.
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length row
                    <td key={monthsLater}>
                      {n === null
                        ? ""
                        : `${n} (${pct(c.size ? n / c.size : null)})`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={section}>
        <h2 className={h2}>Month by month</h2>
        <div className={css({ overflowX: "auto" })}>
          <table className={table}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Shifts done</th>
                <th>Volunteers</th>
                <th>Of whom new</th>
              </tr>
            </thead>
            <tbody>
              {insights.activity.map((m) => (
                <tr key={m.month}>
                  <td>{monthLabel(m.month)}</td>
                  <td>{m.shifts}</td>
                  <td>{m.volunteers}</td>
                  <td>{m.newVolunteers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={section}>
        <h2 className={h2}>Busiest days (last 90 days)</h2>
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "12px",
            maxWidth: "48rem",
          })}
        >
          {insights.byWeekday90.map((d) => (
            <Bar
              key={d.weekday}
              label={d.weekday}
              value={d.shifts}
              max={weekdayMax}
            />
          ))}
        </div>
      </div>

      <div className={section}>
        <h2 className={h2}>People we may be losing</h2>
        <p className={muted}>
          Did at least {data.settings.regularMinShifts} shifts, but none in the
          last 30 days and nothing booked. A personal message works better than
          a group one;{" "}
          <a href="/admin/collections/messages/create">or write a message</a>{" "}
          with "Not volunteered for 30 days".
        </p>
        {insights.lapsed.length === 0 ? (
          <p>Nobody right now.</p>
        ) : (
          <div className={css({ overflowX: "auto" })}>
            <table className={table}>
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Shifts</th>
                  <th>Last shift</th>
                </tr>
              </thead>
              <tbody>
                {insights.lapsed.slice(0, 50).map(({ volunteer, summary }) => (
                  <tr key={volunteer.id}>
                    <td>
                      <a href={`/admin/collections/users/${volunteer.id}`}>
                        {volunteer.preferredName}
                      </a>
                    </td>
                    <td>{summary.totalShifts}</td>
                    <td>
                      {summary.lastShift
                        ? format(summary.lastShift, "d MMM yyyy")
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={section}>
        <h2 className={h2}>Skills</h2>
        {data.skills.length === 0 ? (
          <p>
            No skills yet.{" "}
            <a href="/admin/collections/skills/create">Add the first one</a>,
            then tick it under "Skills taught" on a training event.
          </p>
        ) : (
          <table className={table}>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Volunteers who have it</th>
              </tr>
            </thead>
            <tbody>
              {data.skills.map((s) => (
                <tr key={s.id}>
                  <td>
                    <a href={`/admin/collections/skills/${s.id}`}>
                      {s.badge} {s.title}
                    </a>
                  </td>
                  <td>{holders.get(s.id) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>,
  );
};
