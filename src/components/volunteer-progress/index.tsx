import { IdCardIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Box, Grid, HStack, panda, VStack } from "styled-system/jsx";
import { Button } from "@/components/ui/button";
import type { VolunteerProgress } from "@/lib/engagement/volunteer-progress";
import { format } from "@/utils/tz-format";

const day = (d: Date | null) => (d ? format(d, "d MMM yyyy") : "—");
const eventHref = (e: { eventId: number; start: Date }) =>
  `/?date=${format(e.start, "yyyy-MM-dd")}&eventId=${e.eventId}`;

const Card = (props: { children: ReactNode }) => (
  <Box
    borderWidth="1px"
    borderColor="border.default"
    bg="bg.default"
    borderRadius="l3"
    padding="4"
    width="full"
  >
    {props.children}
  </Box>
);

const SectionTitle = (props: { children: ReactNode }) => (
  <panda.h2 fontSize="lg" fontWeight="semibold" marginBottom="3">
    {props.children}
  </panda.h2>
);

const Stat = (props: { label: string; value: ReactNode }) => (
  <Card>
    <panda.p color="fg.muted" fontSize="sm">
      {props.label}
    </panda.p>
    <panda.p fontSize="xl" fontWeight="semibold">
      {props.value}
    </panda.p>
  </Card>
);

const BadgeTile = (props: {
  badge: string;
  label: string;
  note?: string;
  locked?: boolean;
}) => (
  <VStack
    gap="1"
    padding="3"
    borderRadius="l3"
    bg={props.locked ? "transparent" : "colorPalette.a3"}
    borderWidth="1px"
    borderStyle={props.locked ? "dashed" : "solid"}
    borderColor="border.default"
    textAlign="center"
    opacity={props.locked ? 0.6 : 1}
  >
    <panda.span
      fontSize="3xl"
      lineHeight="1"
      filter={props.locked ? "grayscale(1)" : undefined}
      aria-hidden
    >
      {props.badge}
    </panda.span>
    <panda.span fontWeight="medium" fontSize="sm">
      {props.label}
    </panda.span>
    {props.note && (
      <panda.span color="fg.muted" fontSize="xs">
        {props.note}
      </panda.span>
    )}
  </VStack>
);

export const VolunteerProgressView = ({ p }: { p: VolunteerProgress }) => {
  const { summary, regular, rule, milestones, skills } = p;
  const badgeCount = skills.earned.length + milestones.earned.length;

  return (
    <VStack gap="6" alignItems="stretch">
      <HStack justifyContent="space-between" flexWrap="wrap" gap="3">
        <panda.h1 fontSize="xl" fontWeight="medium">
          My volunteering
        </panda.h1>
        {regular.isRegular && (
          <Button asChild>
            <Link href="/card">
              <IdCardIcon />
              Show my regular card
            </Link>
          </Button>
        )}
      </HStack>

      <Grid
        gridTemplateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
        gap="3"
      >
        <Stat label="Shifts done" value={summary.totalShifts} />
        <Stat label="Last 90 days" value={summary.shiftsLast90} />
        <Stat label="Volunteering since" value={day(summary.firstShift)} />
        <Stat
          label="Next shift"
          value={
            summary.nextShift ? (
              <Link href={eventHref(summary.nextShift)}>
                {format(summary.nextShift.start, "EEE d MMM")}
              </Link>
            ) : (
              "—"
            )
          }
        />
      </Grid>

      <Card>
        {regular.isRegular ? (
          <VStack alignItems="start" gap="2">
            <SectionTitle>You are a regular volunteer 💜</SectionTitle>
            {p.perks.length > 0 && (
              <panda.ul listStyleType="disc" paddingLeft="5">
                {p.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </panda.ul>
            )}
            <panda.p color="fg.muted" fontSize="sm">
              {regular.validUntil
                ? `Valid until ${day(regular.validUntil)}. Every shift you do moves that date.`
                : "Set by the team."}
            </panda.p>
          </VStack>
        ) : (
          <VStack alignItems="start" gap="2">
            <SectionTitle>Become a regular</SectionTitle>
            <panda.p>
              Do {rule.minShifts} shifts within {rule.windowDays} days.
              {regular.basis === "rule" &&
                ` You did ${regular.shiftsInWindow} in the last ${rule.windowDays} days: ${regular.shiftsNeeded} to go.`}
            </panda.p>
            {regular.basis === "rule" && (
              <Box
                width="full"
                height="2"
                bg="bg.muted"
                borderRadius="full"
                overflow="hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={rule.minShifts}
                aria-valuenow={regular.shiftsInWindow}
              >
                <Box
                  height="full"
                  bg="colorPalette.default"
                  style={{
                    width: `${Math.min(100, (regular.shiftsInWindow / rule.minShifts) * 100)}%`,
                  }}
                />
              </Box>
            )}
            {p.perks.length > 0 && (
              <panda.p color="fg.muted" fontSize="sm">
                Regulars get: {p.perks.join(", ").toLowerCase()}.
              </panda.p>
            )}
          </VStack>
        )}
      </Card>

      <section>
        <SectionTitle>
          My badges{" "}
          {badgeCount > 0 && (
            <panda.span color="fg.muted">({badgeCount})</panda.span>
          )}
        </SectionTitle>
        <Grid
          gridTemplateColumns="repeat(auto-fill, minmax(7rem, 1fr))"
          gap="3"
        >
          {skills.earned.map((s) => (
            <BadgeTile key={`skill-${s.id}`} badge={s.badge} label={s.title} />
          ))}
          {milestones.earned.map((m) => (
            <BadgeTile key={`m-${m.shifts}`} badge={m.badge} label={m.label} />
          ))}
          {milestones.next && (
            <BadgeTile
              locked
              badge={milestones.next.badge}
              label={milestones.next.label}
              note={`${milestones.toNext} more ${milestones.toNext === 1 ? "shift" : "shifts"}`}
            />
          )}
        </Grid>
        {badgeCount === 0 && (
          <panda.p color="fg.muted" marginTop="2">
            Your first shift earns your first badge.
          </panda.p>
        )}
      </section>

      {(skills.ready.length > 0 || skills.locked.length > 0) && (
        <section>
          <SectionTitle>Trainings</SectionTitle>
          <VStack gap="3" alignItems="stretch">
            {skills.ready.map(({ skill, next }) => (
              <Card key={skill.id}>
                <HStack justifyContent="space-between" flexWrap="wrap" gap="3">
                  <HStack gap="3">
                    <panda.span fontSize="2xl" aria-hidden>
                      {skill.badge}
                    </panda.span>
                    <Box>
                      <panda.p fontWeight="medium">{skill.title}</panda.p>
                      <panda.p color="fg.muted" fontSize="sm">
                        {next
                          ? `Next session: ${format(next.start, "EEEE d MMMM, HH:mm")}`
                          : "No session planned yet. Keep an eye on the schedule."}
                      </panda.p>
                    </Box>
                  </HStack>
                  {next && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={eventHref(next)}>Sign up</Link>
                    </Button>
                  )}
                </HStack>
              </Card>
            ))}
            {skills.locked.length > 0 && (
              <Grid
                gridTemplateColumns="repeat(auto-fill, minmax(9rem, 1fr))"
                gap="3"
              >
                {skills.locked.map(({ skill, shiftsToGo, missing }) => (
                  <BadgeTile
                    key={skill.id}
                    locked
                    badge={skill.badge}
                    label={skill.title}
                    note={[
                      shiftsToGo > 0
                        ? `after ${shiftsToGo} more ${shiftsToGo === 1 ? "shift" : "shifts"}`
                        : "",
                      missing.length > 0
                        ? `after ${missing.map((m) => m.title).join(", ")}`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" and ")}
                  />
                ))}
              </Grid>
            )}
          </VStack>
        </section>
      )}

      <panda.p>
        <Link href="/account/past-events">See all my past shifts →</Link>
      </panda.p>
    </VStack>
  );
};
