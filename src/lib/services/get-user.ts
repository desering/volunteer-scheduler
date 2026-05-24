import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import { traced } from "@/utils/otel";

export const getUser = async () => {
  return await traced(
    "homepage.getUser",
    async (span) => {
      const headers = await getHeaders();
      const payload = await getPayload({ config });

      const result = await payload.auth({ headers });

      span.setAttribute("auth.user_present", Boolean(result.user));
      return result;
    },
    { tracerName: "volunteer-scheduler.homepage" },
  );
};
