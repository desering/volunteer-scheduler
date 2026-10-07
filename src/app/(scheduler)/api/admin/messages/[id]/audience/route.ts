import config from "@payload-config";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import { csvResponse, volunteersCsv } from "@/lib/engagement/export";
import { loadEngagement } from "@/lib/engagement/load";
import { resolveAudience, toAudienceFilter } from "@/lib/engagement/messages";
import { getUser } from "@/lib/services/get-user";
import { route } from "@/utils/http";

/**
 * Admin-only spreadsheet of a message's audience, e.g. to invite the same
 * people over WhatsApp. Includes people who switched off email invitations:
 * that setting is about email, and whoever downloads this decides.
 */
export const GET = route(
  "/api/admin/messages/[id]/audience",
  async (
    _req: NextRequest,
    ctx: RouteContext<"/api/admin/messages/[id]/audience">,
  ) => {
    const { user } = await getUser();
    if (!user?.roles?.includes("admin")) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = Number((await ctx.params).id);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const message = await payload.findByID({
      collection: "messages",
      id,
      depth: 0,
      disableErrors: true,
    });
    if (!message) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    const data = await loadEngagement();
    const audience = resolveAudience(data, toAudienceFilter(message.audience));

    return csvResponse(
      volunteersCsv(data, audience),
      `message-${id}-audience.csv`,
    );
  },
);
