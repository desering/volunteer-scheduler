import { RichText } from "@payloadcms/richtext-lexical/react";
import { css } from "styled-system/css";
import * as Alert from "@/components/ui/styled/alert";
import type { getMostRecentAnnouncement } from "@/lib/services/get-most-recent-announcement";

type AnnouncementBannerContentProps = {
  announcement: Awaited<ReturnType<typeof getMostRecentAnnouncement>>;
};

export const AnnouncementBannerContent = ({
  announcement,
}: AnnouncementBannerContentProps) => {
  if (!announcement) {
    return null;
  }

  return (
    <>
      <Alert.Title
        fontSize="xl"
        fontWeight="bold"
        lineHeight="short"
        marginBottom="2"
        color="orange.text"
      >
        {announcement.title}
      </Alert.Title>
      {announcement.description && (
        <Alert.Description
          color="orange.text"
          className={css({
            "& a": {
              textDecoration: "underline",
            },
          })}
        >
          <RichText data={announcement.description} />
        </Alert.Description>
      )}
    </>
  );
};
