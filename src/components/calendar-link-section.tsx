"use client";

import { Calendar, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { panda, VStack } from "styled-system/jsx";
import {
  deleteCalendarToken,
  generateCalendarToken,
} from "@/actions/calendar-token";
import { Button } from "./ui/button";
import { toaster } from "./ui/toast";

type Props = {
  token: string | null;
  tokenId: number | null;
};

export function CalendarLinkSection({ token, tokenId }: Props) {
  const calendarUrl = token
    ? `${window.location.origin}/api/calendar/${token}`
    : null;
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateCalendarToken();
      if (!result.success) {
        toaster.create({ type: "error", title: result.message });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      if (!tokenId) return;
      const result = await deleteCalendarToken(tokenId);
      if (!result.success) {
        toaster.create({ type: "error", title: result.message });
      }
    });
  };

  if (calendarUrl) {
    return (
      <VStack alignItems="start" gap="3">
        <panda.p fontWeight="medium">Calendar subscription link</panda.p>
        <panda.p
          fontSize="sm"
          color="gray.11"
          wordBreak="break-all"
          fontFamily="mono"
        >
          {calendarUrl}
        </panda.p>
        <Button variant="outline" disabled={isPending} onClick={handleDelete}>
          <Trash2 />
          Revoke link
        </Button>
      </VStack>
    );
  }

  return (
    <VStack alignItems="start" gap="3">
      <panda.p fontWeight="medium">Calendar subscription link</panda.p>
      <panda.p fontSize="sm" color="gray.11">
        Generate a private link to subscribe to your upcoming events in any
        calendar app.
      </panda.p>
      <Button variant="outline" disabled={isPending} onClick={handleGenerate}>
        <Calendar />
        Generate calendar link
      </Button>
    </VStack>
  );
}
