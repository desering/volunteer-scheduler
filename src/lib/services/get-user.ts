import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

export const getUser = async () => {
  const headers = await getHeaders();
  const payload = await getPayload({ config });

  return await payload.auth({ headers });
};
