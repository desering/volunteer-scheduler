import { csvResponse, volunteersCsv } from "@/lib/engagement/export";
import { loadEngagement } from "@/lib/engagement/load";
import { getUser } from "@/lib/services/get-user";
import { route } from "@/utils/http";

/** Admin-only spreadsheet of every volunteer with their numbers. */
export const GET = route("/api/admin/volunteers", async () => {
  const { user } = await getUser();
  if (!user?.roles?.includes("admin")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await loadEngagement();
  const date = data.now.toISOString().slice(0, 10);
  return csvResponse(volunteersCsv(data), `volunteers-${date}.csv`);
});
