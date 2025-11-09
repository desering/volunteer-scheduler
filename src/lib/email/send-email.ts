import config from "@payload-config";
import { getPayload, type SendEmailOptions } from "payload";

type SendEmailParams = SendEmailOptions;

export const sendEmail = async (params: SendEmailParams) => {
  const payload = await getPayload({ config });

  return payload.sendEmail({
    from: "De Sering Schedule <schedule@desering.org>",
    ...params,
  });
};
