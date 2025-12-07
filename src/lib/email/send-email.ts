import config from "@payload-config";
import { getPayload, type SendEmailOptions } from "payload";

export const sendEmail = async (params: SendEmailOptions) => {
  const payload = await getPayload({ config });

  await payload.sendEmail({
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    ...params,
  });
};
