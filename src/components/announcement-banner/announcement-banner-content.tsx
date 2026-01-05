import { RichText } from "@payloadcms/richtext-lexical/react";
import { Alert } from "@/components/ui";
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
    {/* <Alert.Title>{announcement.title}</Alert.Title> <-- revert to OG Park UI styling */}

    <Alert.Title fontSize="xl" fontWeight="bold" lineHeight="short" marginBottom="2">
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
