"use client";

import { RichText } from "@payloadcms/richtext-lexical/react";
import { useState } from "react";
import { css } from "styled-system/css";
import { Container } from "styled-system/jsx";
import { linkConverters } from "@/components/lexical/link";
import * as Alert from "@/components/ui/styled/alert";
import { CloseButton } from "@/components/ui/styled/close-button";
import type { getMostRecentAnnouncement } from "@/lib/services/get-most-recent-announcement";

type AnnouncementBannerProps = {
  announcement: Awaited<ReturnType<typeof getMostRecentAnnouncement>>;
};

export const AnnouncementBannerClient = ({
  announcement,
}: AnnouncementBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!announcement || isDismissed) {
    return null;
  }

  return (
    <Container width="100%" marginTop="4">
      <Alert.Root
        status={announcement.status ?? "info"}
        variant="subtle"
        borderWidth="0"
      >
        <Alert.Indicator />
        <Alert.Content>
          <div
            className={css({
              fontSize: "xl",
              fontWeight: "bold",
              lineHeight: "short",
              marginBottom: "2",
            })}
          >
            {announcement.title}
          </div>
          {announcement.description && (
            <RichText
              data={announcement.description}
              converters={linkConverters}
            />
          )}
        </Alert.Content>
        <CloseButton
          pos="relative"
          top="1"
          insetEnd="1"
          size="sm"
          className={css({ color: "inherit" })}
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss announcement"
        />
      </Alert.Root>
    </Container>
  );
};
