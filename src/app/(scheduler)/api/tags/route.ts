import type { NextRequest } from "next/server";
import config from "@payload-config";
import { getPayload } from "payload";

export const GET = async (req: NextRequest) => {
  const payload = await getPayload({ config });

  const tags = await payload.find({
    collection: "tags",
    pagination: false,
  });

  return Response.json(tags);
};
