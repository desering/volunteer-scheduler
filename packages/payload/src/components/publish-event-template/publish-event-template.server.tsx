import type { EventTemplate } from "@payload-types";
import { PublishEventTemplateForm } from "./publish-event-template.client";
import Providers from "@/app/providers";

export const PublishEventTemplate = async ({ doc }: { doc: EventTemplate }) => {
  return (
    <Providers>
      <PublishEventTemplateForm doc={doc} />
    </Providers>
  );
};
