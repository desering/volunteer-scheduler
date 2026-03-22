import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import type { Event, Location, Role } from "@/payload-types";
import { hashString } from "@/utils/hash-string";

export type SignupIcalEventData = {
  id: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
};

export const buildSignupIcalEventData = async (
  event: Event,
  role: Pick<Role, "id" | "title">,
): Promise<SignupIcalEventData> => {
  const descriptionText = event.description
    ? convertLexicalToPlaintext({
        data: event.description as SerializedEditorState,
      })
    : undefined;

  const location =
    (event.locations ?? [])
      .filter((l): l is Location => typeof l !== "number")
      .map((l) => [l.title, l.address].filter(Boolean).join(", "))
      .join("; ") || undefined;

  return {
    id: await hashString(`${event.id}-${role.id}`),
    summary: event.title ?? "Volunteer Shift",
    description: `You're joining as: ${role.title}${descriptionText ? `\nDetails:\n${descriptionText}` : ""}`,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    location,
  };
};
