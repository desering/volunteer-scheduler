import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import type { Event, Location, Role } from "@/payload-types";
import { hashString } from "@/utils/hash-string";

export type SignupIcalEventData = {
  id: string;
  summary: string;
  description: string;
  roleTitle: string;
  start: Date;
  end: Date;
  location?: string;
};

export const buildSignupIcalEventData = async (
  event: Event,
  role: number | Pick<Role, "id" | "title">,
): Promise<SignupIcalEventData> => {
  const resolvedRole =
    typeof role === "number" ? { id: 0, title: "Volunteer" } : role;
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
    id: await hashString(`${event.id}-${resolvedRole.id}`),
    summary: event.title ?? "Volunteer Shift",
    roleTitle: resolvedRole.title,
    description: descriptionText ?? "",
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    location,
  };
};
