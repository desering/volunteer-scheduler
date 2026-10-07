import config from "@payload-config";
import type { Event } from "@payload-types";
import { getPayload } from "payload";
import { ClientProviders } from "@/app/(scheduler)/client-providers";
import {
  loadAwards,
  loadShifts,
  loadSkills,
  loadVolunteers,
} from "@/lib/engagement/load";
import { isAttended } from "@/lib/engagement/shifts";
import { getUser } from "@/lib/services/get-user";
import {
  type AttendanceRow,
  EventAttendanceList,
} from "./event-attendance.client";

/**
 * "Attendance" tab on an event in the admin panel: who signed up, how
 * experienced each person is, and buttons to mark a no-show or teach a skill.
 * The "first shift" flag is there so a coordinator can pair newcomers with
 * someone experienced without knowing everyone personally.
 */
export const EventAttendance = async ({ doc }: { doc: Event }) => {
  const { user } = await getUser();
  if (!user?.roles?.includes("admin")) return null;

  const payload = await getPayload({ config });
  const now = new Date();
  const eventShifts = await loadShifts(payload, { eventId: doc.id });
  const userIds = [...new Set(eventShifts.map((s) => s.userId))];

  const [volunteers, history, skills, awards] = await Promise.all([
    loadVolunteers(payload, { userIds }),
    loadShifts(payload, { userIds }),
    loadSkills(payload),
    loadAwards(payload, { userIds }),
  ]);

  const start = new Date(doc.start_date);
  const skillById = new Map(skills.map((s) => [s.id, s]));

  const rows: AttendanceRow[] = eventShifts
    .map((shift) => {
      const volunteer = volunteers.find((v) => v.id === shift.userId);
      const before = history.filter(
        (s) =>
          s.userId === shift.userId &&
          s.signupId !== shift.signupId &&
          s.start < start &&
          isAttended(s, now),
      ).length;
      return {
        signupId: shift.signupId,
        userId: shift.userId,
        name: volunteer?.preferredName ?? `User ${shift.userId}`,
        role: shift.roleTitle,
        attendance: shift.attendance,
        shiftsBefore: before,
        badges: awards
          .filter((a) => a.userId === shift.userId)
          .map((a) => skillById.get(a.skillId))
          .filter((s) => !!s)
          .map((s) => ({ id: s.id, badge: s.badge, title: s.title })),
      };
    })
    .sort(
      (a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name),
    );

  return (
    <ClientProviders>
      <EventAttendanceList
        eventId={doc.id}
        rows={rows}
        skills={skills.map((s) => ({
          id: s.id,
          badge: s.badge,
          title: s.title,
        }))}
        taughtSkillIds={(doc.skills ?? []).map((s) =>
          typeof s === "object" ? s.id : s,
        )}
      />
    </ClientProviders>
  );
};
