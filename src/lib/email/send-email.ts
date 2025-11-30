import config from "@payload-config";
import { getPayload, type SendEmailOptions } from "payload";

type SendEmailParams = SendEmailOptions;

export const sendEmail = async (params: SendEmailParams) => {
  const payload = await getPayload({ config });

  return payload.sendEmail({
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    ...params,
  });
};
