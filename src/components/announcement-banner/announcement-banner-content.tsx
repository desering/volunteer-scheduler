import { RichText } from "@payloadcms/richtext-lexical/react";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";
import { Alert } from "@/components/ui/alert";
import type { getActiveAnnouncement } from "@/lib/services/get-active-announcement";

type AnnouncementBannerContentProps = {
  announcement: Awaited<ReturnType<typeof getActiveAnnouncement>>;
};

export const AnnouncementBannerContent = ({
  announcement,
}: AnnouncementBannerContentProps) => {
  if (!announcement) {
    return null;
  }

  return (
    <Box flex="1">
      <Alert.Title
        className={css({
          fontSize: "xl",
          fontWeight: "bold",
        })}
      >
        {announcement.title}
      </Alert.Title>
      {announcement.description && (
        <Alert.Description
          className={css({
            "& a": {
              textDecoration: "underline",
              color: "colorPalette.text",
              fontWeight: "medium",
              _hover: {
                color: "colorPalette.emphasized",
              },
            },
          })}
        >
          <RichText data={announcement.description} />
        </Alert.Description>
      )}
    </Box>
  );
};
