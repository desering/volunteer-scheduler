import type { ShiftTemplate } from "@payload-types";
import { PublishShiftTemplateForm } from "./publish-shift-template.client";

export const PublishShiftTemplate = async ({ doc }: { doc: ShiftTemplate }) => {
  return <PublishShiftTemplateForm doc={doc} />;
};
