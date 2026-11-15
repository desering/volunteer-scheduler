import config from "@payload-config";
import { getPayload } from "payload";

export const getWebcalToken = async (userId: number) => {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "webcal-tokens",
    where: { user: { equals: userId } },
    limit: 1,
  });

  return result.docs[0] ?? null;
};
