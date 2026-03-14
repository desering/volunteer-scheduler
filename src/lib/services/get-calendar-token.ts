import config from "@payload-config";
import { getPayload } from "payload";

export const getCalendarToken = async (userId: number) => {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "calendar-tokens",
    where: { user: { equals: userId } },
    limit: 1,
  });

  return result.docs[0] ?? null;
};
