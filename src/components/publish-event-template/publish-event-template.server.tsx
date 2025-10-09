import type { EventTemplate } from "@payload-types";
import { PublishEventTemplateForm } from "./publish-event-template.client";
import { ClientProviders } from "@/app/(scheduler)/client-providers";

export const PublishEventTemplate = async ({ doc }: { doc: EventTemplate }) => {
  return (
    <ClientProviders>
      <PublishEventTemplateForm doc={doc} />
    </ClientProviders>
  );
};
