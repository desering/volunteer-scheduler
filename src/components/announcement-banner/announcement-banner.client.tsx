"use client";

import { RichText } from "@payloadcms/richtext-lexical/react";
import { useState } from "react";
import { css } from "styled-system/css";
import { Container } from "styled-system/jsx";
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
        status="warning"
        variant="subtle"
        borderWidth="0"
        bg="orange.a3"
        color="orange.text"
      >
        <Alert.Indicator color="orange.text" />
        <Alert.Content>
          <div
            className={css({
              fontSize: "xl",
              fontWeight: "bold",
              lineHeight: "short",
              marginBottom: "2",
              color: "orange.text",
            })}
          >
            {announcement.title}
          </div>
          {announcement.description && (
            <div
              className={css({
                color: "orange.text",
                "& a": {
                  textDecoration: "underline",
                },
              })}
            >
              <RichText data={announcement.description} />
            </div>
          )}
        </Alert.Content>
        <CloseButton
          pos="relative"
          top="1"
          insetEnd="1"
          colorPalette="orange"
          size="sm"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss announcement"
        />
      </Alert.Root>
    </Container>
  );
};
