import config from "@payload-config";
import type { Signup } from "@payload-types";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { pretty, render, toPlainText } from "@react-email/render";
import type { SerializedEditorState } from "lexical";
import { type CollectionAfterChangeHook, getPayload } from "payload";
import { ShiftSignupConfirmationEmail } from "@/email/templates/signup-confirmation";
import { createIcalEvent } from "@/lib/email/create-ical-event";
import { sendEmail } from "@/lib/email/send-email";
import { format } from "@/utils/tz-format";

export const sendSignupConfirmationEmailHook: CollectionAfterChangeHook =
  async ({ doc }: { doc: Signup }) => {
    const payload = await getPayload({ config });

    const event = await payload.findByID({
      collection: "events",
      id: doc.event?.id,
    });

    const to = doc.user.email;
    const name = doc.user.preferredName ?? "Volunteer";
    const eventSummary = event?.title ?? "Volunteer Shift";
    const description = event?.description ?? undefined;
    const start = event?.start_date;
    const end = event?.end_date;
    const location = "De Sering, Rhoneweg 6, 1043 AH Amsterdam";
    const role = doc.role?.title ?? "Volunteer";

    const descriptionText = convertLexicalToPlaintext({
      data: description as SerializedEditorState,
    });

    const inviteDescription = `You're joining as: ${role} \nDetails:\n ${descriptionText}`;

    const formattedDate = `${format(start, "iiii dd MMMM")}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;

    const htmlEmail = await pretty(
      await render(
        ShiftSignupConfirmationEmail({
          name,
          eventSummary,
          role,
          description: descriptionText,
          date: formattedDate,
        }),
      ),
    );

    const plainEmail = toPlainText(htmlEmail);

    const icalEvent = createIcalEvent({
      summary: eventSummary,
      description: inviteDescription,
      start,
      end,
      location,
    }).toString();

    await sendEmail({
      to,
      subject: `${eventSummary} — Signup Confirmation`,
      text: plainEmail,
      html: htmlEmail,
      attachments: [
        {
          content: icalEvent,
          contentType: "text/calendar",
        },
      ],
    });

    return doc;
  };
