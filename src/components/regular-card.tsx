"use client";

import { useEffect, useState } from "react";
import { Box, panda, VStack } from "styled-system/jsx";
import { format } from "@/utils/tz-format";

type Props = {
  orgName: string;
  name: string;
  perks: string[];
  note: string;
  /** ISO date; null when an admin made them a regular. */
  validUntil: string | null;
};

/**
 * The card a regular shows at the bar. The live clock (with seconds) and the
 * spinning leaf are what make a screenshot useless: staff only need to see
 * today's date and the time moving.
 */
export const RegularCard = (props: Props) => {
  // Render the clock only after mount, so server and browser HTML match.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <VStack
      gap="4"
      padding={{ base: "6", md: "10" }}
      borderRadius="l3"
      color="white"
      textAlign="center"
      width="full"
      maxWidth="md"
      marginX="auto"
      boxShadow="lg"
      style={{
        background:
          "linear-gradient(135deg, #5b3f8c 0%, #7d5bb5 50%, #4f7a3a 100%)",
      }}
    >
      <panda.span
        fontSize="5xl"
        lineHeight="1"
        animation="spin"
        style={{ animationDuration: "4s" }}
        aria-hidden
      >
        🌿
      </panda.span>
      <panda.p
        letterSpacing="widest"
        fontSize="sm"
        fontWeight="semibold"
        textTransform="uppercase"
      >
        Regular volunteer · {props.orgName}
      </panda.p>
      <panda.h1
        fontSize={{ base: "3xl", md: "4xl" }}
        fontWeight="bold"
        lineHeight="1.1"
        wordBreak="break-word"
      >
        {props.name}
      </panda.h1>

      {props.perks.length > 0 && (
        <VStack gap="1">
          {props.perks.map((perk) => (
            <panda.p key={perk} fontSize="xl" fontWeight="semibold">
              {perk}
            </panda.p>
          ))}
        </VStack>
      )}

      <Box
        borderRadius="l2"
        paddingX="4"
        paddingY="2"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <panda.p fontSize="lg">
          {now ? format(now, "EEEE d MMMM yyyy") : " "}
        </panda.p>
        <panda.p
          fontSize="4xl"
          fontWeight="bold"
          fontVariantNumeric="tabular-nums"
          aria-live="off"
        >
          {now ? format(now, "HH:mm:ss") : " "}
        </panda.p>
      </Box>

      <panda.p fontSize="sm" opacity="0.9">
        {props.validUntil
          ? `Valid until ${format(new Date(props.validUntil), "d MMMM yyyy")}`
          : "Regular volunteer"}
        {props.note ? ` · ${props.note}` : ""}
      </panda.p>
    </VStack>
  );
};
