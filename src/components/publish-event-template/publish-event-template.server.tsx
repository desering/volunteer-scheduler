import type { EventTemplate } from "@payload-types";
import { ClientProviders } from "@/app/(scheduler)/client-providers";
import { PublishEventTemplateForm } from "./publish-event-template.client";

export const PublishEventTemplate = async ({ doc }: { doc: EventTemplate }) => {
  return (
    <ClientProviders>
      <PublishEventTemplateForm doc={doc} />
    </ClientProviders>
  );
};
