import Link from "next/link";
import { redirect } from "next/navigation";
import { Box, Container, panda, VStack } from "styled-system/jsx";
import { RegularCard } from "@/components/regular-card";
import { Button } from "@/components/ui/button";
import {
  getVolunteerProgress,
  logCardView,
} from "@/lib/engagement/volunteer-progress";
import { logger } from "@/lib/logger";
import { getUser } from "@/lib/services/get-user";

export const metadata = { title: "Regular card" };

/**
 * The regular card, at its own address so volunteers can add it to their
 * home screen. Status is worked out fresh on every open, so it is never out
 * of date when someone stops being a regular.
 */
export default async function Page() {
  const { user } = await getUser();
  if (!user) redirect("/auth/sign-in");

  const p = await getVolunteerProgress(user.id);

  if (p.regular.isRegular) {
    try {
      await logCardView(user.id);
    } catch (error) {
      // The card must work at the bar even if logging fails.
      logger.error(
        { err: error, userId: user.id },
        "Failed to log regular card view",
      );
    }
  }

  return (
    <Container marginTop={{ base: 4, md: 10 }} marginBottom="8" width="full">
      {p.regular.isRegular ? (
        <RegularCard
          orgName={process.env.ORG_NAME ?? ""}
          name={p.name}
          perks={p.perks}
          note={p.cardNote}
          validUntil={p.regular.validUntil?.toISOString() ?? null}
        />
      ) : (
        <VStack gap="4" maxWidth="md" marginX="auto" textAlign="center">
          <panda.h1 fontSize="xl" fontWeight="medium">
            Not a regular volunteer yet
          </panda.h1>
          <panda.p>
            Regulars do {p.rule.minShifts} shifts within {p.rule.windowDays}{" "}
            days
            {p.perks.length > 0 &&
              ` and get: ${p.perks.join(", ").toLowerCase()}`}
            .
          </panda.p>
          {p.regular.basis === "rule" && (
            <panda.p fontWeight="semibold">
              You did {p.regular.shiftsInWindow} in the last {p.rule.windowDays}{" "}
              days: {p.regular.shiftsNeeded} to go.
            </panda.p>
          )}
          <Box display="flex" gap="3" flexWrap="wrap" justifyContent="center">
            <Button asChild>
              <Link href="/">Find a shift</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/progress">My volunteering</Link>
            </Button>
          </Box>
        </VStack>
      )}
    </Container>
  );
}
