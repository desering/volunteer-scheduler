"use client";

import { Calendar, Check, Copy, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { HStack, panda, VStack } from "styled-system/jsx";
import { createWebcalToken } from "@/actions/create-webcal-token";
import { deleteWebcalToken } from "@/actions/delete-webcal-token";
import { Button } from "./ui/button";
import { IconButton } from "./ui/icon-button";
import { toaster } from "./ui/toast";

type Props = {
  token: string | null;
};

export function CalendarLinkSection({ token }: Props) {
  const calendarUrl = token
    ? `${window.location.origin}/api/calendar/${token}`
    : null;
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!calendarUrl) return;
    await navigator.clipboard.writeText(calendarUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await createWebcalToken();
      if (!result.success) {
        toaster.create({ type: "error", title: result.message });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWebcalToken();
      if (!result.success) {
        toaster.create({ type: "error", title: result.message });
      }
    });
  };

  if (calendarUrl) {
    return (
      <VStack alignItems="start" gap="3">
        <panda.p fontWeight="medium">Calendar subscription link</panda.p>
        <HStack
          gap="2"
          p="3"
          borderWidth="1"
          borderRadius="lg"
          borderColor="gray.6"
          bg="gray.2"
          width="full"
        >
          <panda.p
            fontSize="sm"
            color="gray.11"
            wordBreak="break-all"
            fontFamily="mono"
            flex="1"
          >
            {calendarUrl}
          </panda.p>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Copy calendar link"
            onClick={handleCopy}
            flexShrink="0"
          >
            {copied ? <Check /> : <Copy />}
          </IconButton>
        </HStack>
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
