import type { ShiftTemplate } from "@payload-types";
import { PublishShiftTemplateForm } from "./form";

export const PublishShiftTemplate = async ({ doc }: { doc: ShiftTemplate }) => {
  return <PublishShiftTemplateForm doc={doc} />;
};
