import config from "@payload-config";
import { getPayload } from "payload";

export const GET = async () => {
  const payload = await getPayload({ config });

  const locations = await payload.find({
    collection: "locations",
    pagination: false,
    select: {
      id: true,
      title: true,
    },
  });

  return Response.json(locations);
};
