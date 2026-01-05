import { RichText } from "@payloadcms/richtext-lexical/react";
import * as Alert from "@/components/ui/styled/alert";
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
    <>
      <Alert.Title
        fontSize="xl"
        fontWeight="bold"
        lineHeight="short"
        marginBottom="2"
      >
        {announcement.title}
      </Alert.Title>
      {announcement.description && (
        <Alert.Description>
          <RichText data={announcement.description} />
        </Alert.Description>
      )}
    </>
  );
};
