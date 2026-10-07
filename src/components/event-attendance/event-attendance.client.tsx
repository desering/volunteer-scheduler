"use client";

import { Button, toast } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { css, cx } from "styled-system/css";
import { awardSkill } from "@/actions/admin/award-skill";
import { setAttendance } from "@/actions/admin/set-attendance";
import type { Attendance } from "@/lib/engagement/types";
import { divider, gutterX, gutterY } from "../ui/utils";

export type AttendanceRow = {
  signupId: number;
  userId: number;
  name: string;
  role: string;
  attendance: Attendance;
  shiftsBefore: number;
  badges: { id: number; badge: string; title: string }[];
};

type SkillOption = { id: number; badge: string; title: string };

const muted = css({ color: "var(--theme-elevation-500)" });

const segment = css({
  display: "inline-flex",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "4px",
  overflow: "hidden",
  "& button": {
    padding: "4px 10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--theme-text)",
    whiteSpace: "nowrap",
  },
  "& button[aria-pressed=true]": {
    background: "var(--theme-elevation-800)",
    color: "var(--theme-elevation-0)",
  },
});

const Row = ({
  row,
  eventId,
  skills,
}: {
  row: AttendanceRow;
  eventId: number;
  skills: SkillOption[];
}) => {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [skillId, setSkillId] = useState("");
  const has = new Set(row.badges.map((b) => b.id));
  const teachable = skills.filter((s) => !has.has(s.id));

  const mark = (attendance: Attendance) =>
    start(async () => {
      try {
        await setAttendance({ signupId: row.signupId, attendance });
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save");
      }
    });

  const teach = () =>
    start(async () => {
      try {
        await awardSkill({
          userId: row.userId,
          skillId: Number(skillId),
          eventId,
        });
        toast.success("Skill added");
        setSkillId("");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save");
      }
    });

  return (
    <tr className={css({ opacity: pending ? 0.5 : 1 })}>
      <td>
        <a href={`/admin/collections/users/${row.userId}`}>{row.name}</a>
        {row.shiftsBefore === 0 && (
          <span
            className={css({ marginLeft: "8px" })}
            title="This is their first shift"
          >
            🌱 first shift
          </span>
        )}
      </td>
      <td>{row.role}</td>
      <td className={muted}>{row.shiftsBefore}</td>
      <td title={row.badges.map((b) => b.title).join(", ")}>
        {row.badges.map((b) => b.badge).join(" ") || (
          <span className={muted}>—</span>
        )}
      </td>
      <td>
        <span className={segment}>
          {(
            [
              [null, "Not marked"],
              ["attended", "Came"],
              ["no-show", "No-show"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={row.attendance === value}
              disabled={pending}
              onClick={() => mark(value)}
            >
              {label}
            </button>
          ))}
        </span>
      </td>
      <td>
        {teachable.length > 0 && (
          <span className={css({ display: "inline-flex", gap: "6px" })}>
            <select
              className={css({
                height: "auto",
                padding: "4px 8px",
                border: "1px solid var(--theme-elevation-150)",
                borderRadius: "4px",
                background: "var(--theme-input-bg)",
                color: "var(--theme-text)",
              })}
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
              aria-label={`Skill learned by ${row.name}`}
            >
              <option value="">Learned a skill…</option>
              {teachable.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.badge} {s.title}
                </option>
              ))}
            </select>
            <Button
              size="small"
              buttonStyle="secondary"
              disabled={!skillId || pending}
              onClick={teach}
            >
              Add
            </Button>
          </span>
        )}
      </td>
    </tr>
  );
};

export const EventAttendanceList = (props: {
  eventId: number;
  rows: AttendanceRow[];
  skills: SkillOption[];
  taughtSkillIds: number[];
}) => {
  const firstTimers = props.rows.filter((r) => r.shiftsBefore === 0).length;
  const experienced = props.rows.filter((r) => r.shiftsBefore >= 10).length;
  const taught = props.skills.filter((s) =>
    props.taughtSkillIds.includes(s.id),
  );

  return (
    <div className={cx(gutterX, gutterY)}>
      <div className={cx(divider, css({ paddingBlock: "16px" }))}>
        <p>
          <strong>{props.rows.length}</strong> signed up ·{" "}
          <strong>{firstTimers}</strong> first shift ·{" "}
          <strong>{experienced}</strong> with 10+ shifts
        </p>
        {taught.length > 0 && (
          <p className={muted}>
            Training: attendees earn{" "}
            {taught.map((s) => `${s.badge} ${s.title}`).join(", ")}{" "}
            automatically, a few hours after it ends (see Volunteer settings).
            Marking a no-show takes it back.
          </p>
        )}
        <p className={muted}>
          Only mark people who did not come: everyone else counts as attended
          once the shift is over.
        </p>
      </div>

      {props.rows.length === 0 ? (
        <p className={css({ paddingBlock: "16px" })}>
          Nobody has signed up yet.
        </p>
      ) : (
        <div className={css({ overflowX: "auto" })}>
          <table
            className={css({
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "16px",
              "& th, & td": {
                textAlign: "left",
                padding: "8px",
                borderBottom: "1px solid var(--theme-elevation-100)",
                verticalAlign: "middle",
              },
            })}
          >
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Role</th>
                <th>Shifts before</th>
                <th>Skills</th>
                <th>Attendance</th>
                <th>Taught on this shift</th>
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row) => (
                <Row
                  key={row.signupId}
                  row={row}
                  eventId={props.eventId}
                  skills={props.skills}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
