# Volunteer engagement: trainings, badges, regulars and messages

> **Status: proposal.** This is a working reference implementation written on
> behalf of De Sering's director, to show what we would like the scheduler to
> do next. It is not meant to be merged as one piece. Take it apart, change
> it, or rebuild it your own way; the
> [suggested split](#suggested-split-into-small-prs) at the end is one way to
> land it as small PRs.

## Why

The [roadmap](vision-strategy-and-roadmap.md) says the scheduler should
support "participation and progression", not only filling shifts. Today it
cannot answer the questions a director or coordinator asks every week:

- Who are our regular volunteers, and who should get the regulars' perks
  (a free meal and 30% off)?
- Do new volunteers come back after their first shift?
- Who is ready for the next training, and who already has it?
- Who has gone quiet, so we can ask how they are?
- How do we invite exactly those people?

And volunteers cannot see what they have done or what comes next.

## What it adds

| For volunteers | For admins and coordinators |
| --- | --- |
| **My volunteering** page (`/account/progress`): shifts done, badges, regular status, trainings they can sign up for | **Volunteer insights** (`/admin/insights`): active volunteers, return rate, monthly cohorts, sign-up-to-regular funnel, no-shows, busiest days, people we may be losing |
| **Regular card** (`/card`): a full-screen card to show at the bar, with a live clock so a screenshot is useless | **Attendance** tab on each event: who signed up, first-timers flagged, mark a no-show, record a skill taught on the spot |
| A thank-you email after each shift, with new badges and the next training they can join (opt-out) | **Messages**: email a group picked by what they have done, with a preview of exactly who receives it, and a spreadsheet export for WhatsApp |
| Two new notification switches: "after a shift" and "invitations" | **Volunteer settings**: the regular rule, the perks text, shift badges, the thank-you email |
| | A **volunteer record** on each user, and a spreadsheet of all volunteers |

## The rules, and where they live

Every number in the app goes through the pure functions in
[`src/lib/engagement/`](/src/lib/engagement), which are unit-tested
(`engagement.spec.ts`). The pages, emails, jobs and admin views only load data
and call them, so they cannot disagree with each other.

- **A shift counts** once it is over, unless a coordinator marked a no-show
  (`isAttended` in `shifts.ts`). We trust by default because asking
  coordinators to tick every attendee is admin that never happens; they only
  act on the exception.
- **A regular** has at least N attended shifts in the last D days (default 4
  in 60), counted on a rolling window so nobody drops out on the 1st of the
  month (`regular.ts`). Admins can override per person: *Always* (staff,
  coordinators) or *Never*.
- **Badges** are skills (earned in a training or taught on a shift) plus shift
  milestones (1, 5, 10, 25, 50, 100 by default) (`badges.ts`). Badges are shown
  to the volunteer themselves and to admins, never to other volunteers, in line
  with the roadmap's "skills are internal coordination tools, not public
  achievements".
- **Ready for a training** = not earned, all prerequisite skills earned, and at
  least the skill's "invite after N shifts" (`skillProgress`). The same answer
  drives the My volunteering page and the thank-you email.
- **Message audiences** are AND-ed filters over the same data
  (`audience.ts`), e.g. "did a coordinator shift on a Tuesday in the last 90
  days" or "did 3+ shifts and does not have Kitchen basics". Weekdays use
  Amsterdam time.

## Data model

New collections (admin group **Volunteers**):

- `skills`: title, emoji badge, description (doubles as teaching guide),
  prerequisites, "invite after N shifts". Builds on the open skills PRs
  (#343–#346), keeping the same `skills` collection and `events.skills` link.
- `skill-awards`: who has which skill, how (training / coordinator), when, by
  whom. One row per person per skill. **Differs from PR #344's
  `users-skills` + `learnt` checkbox on purpose**: only admins and the job can
  create rows, because a badge a volunteer can tick for themselves cannot be
  used for perks or for pairing newcomers with experienced people.
- `messages` and `message-deliveries`: a message and one row per email sent.
  A delivery row is also what stops a retried job from emailing someone twice.
- `regular-card-views`: card openings, at most one per person per 4 hours. Not
  proof of a meal, but the only signal of what the perk costs.
- Global `volunteer-settings`.

New fields: `events.skills` and `event-templates.skills` ("Skills taught",
which makes the event a training), `signups.attendance` (admin-only),
`signups.afterShiftProcessedAt` (job bookkeeping), `users.regularOverride`
(admin-only).

See the [ER diagram](../reference/er-diagram.md).

## Background jobs

Both run on the existing Payload jobs queue (`autoRun` every 5 minutes).

- `process-ended-shifts` (scheduled every 5 minutes): for each signup whose
  shift ended more than `afterShiftDelayHours` ago (default 3, time to mark
  no-shows), awards the training's skills and, if switched on, sends the
  thank-you email. Each signup is *claimed* with a conditional `UPDATE … WHERE
  afterShiftProcessedAt IS NULL` first, so overlapping runs cannot double-send.
  It never looks back more than 7 days, so deploying this does not email people
  about old shifts. The email is **off by default**; shifts that end while it is
  off never get one later. A failed email is recorded, not retried (a late or
  repeated thank-you is worse than none).
- `send-volunteer-message` (queued by the Send button): works the audience out
  again and emails everyone who has not switched off invitations, skipping
  anyone with a `sent` delivery for that message.

Marking a no-show after a training has ended takes back the badges that
training gave; marking someone as came gives them straight away
(`syncTrainingAwards`).

## Security notes

- Every new collection sets all four access rules (create, read, update,
  delete) explicitly instead of relying on Payload's defaults. Volunteers can
  read only their own skill awards and nothing else new; admin-only fields use
  field-level access.
- Every new server action calls `requireAdmin()` itself, following Next.js'
  advice to treat server actions like public API endpoints.
- `src/lib/engagement/load.ts` reads with Drizzle (typed by the generated
  schema) instead of `payload.find`, because the Signups collection computes
  `title` and `totalShifts` with an extra query per row. It bypasses access
  control, so it is only called after an access check.

## Decisions made for this proposal (change freely)

- Regular = 4 shifts in 60 days; perks text "Free meal" and "30% off food and
  drinks". Both are settings, not code.
- Perks are shown, not enforced: there is no "one free meal per day" counter.
  The card log shows how often it is used; enforce later if needed.
- Email only. The audience spreadsheet is the WhatsApp route for now.
- Only `admin` users can mark attendance, award skills and send messages. The
  `editor` role is unused today; a coordinator role would be the natural next
  step.

## Not included

- A coordinator role and coordinator-only screens.
- WhatsApp or push messages.
- Automatic invitations when a new training session is published (today they
  ride along in the thank-you email).
- Data deletion for a leaving volunteer (issues #272, #424) — more urgent now
  that more is stored per person.

## Suggested split into small PRs

1. Skills + skill awards + `events.skills` (supersedes #343–#346).
2. Attendance on signups + the Attendance tab.
3. `src/lib/engagement` core + tests + loader.
4. Volunteer settings + My volunteering page + regular card.
5. After-shift job + email + notification types.
6. Messages + deliveries + preview/send + audience export.
7. Insights view + volunteer spreadsheet + volunteer record on users.

Each step works on its own, and the migration can be regenerated per step with
`bun run --bun payload migrate:create <name>`.
