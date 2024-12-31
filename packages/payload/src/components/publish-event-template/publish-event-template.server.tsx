import type { EventTemplate } from "@payload-types";
import { PublishEventTemplateForm } from "./publish-event-template.client";

export const PublishEventTemplate = async ({ doc }: { doc: EventTemplate }) => {
  return <PublishEventTemplateForm doc={doc} />;
};
