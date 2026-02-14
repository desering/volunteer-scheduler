import config from "@payload-config";
import { getPayload, type SendEmailOptions } from "payload";
import { logger } from "@/lib/logger";

type SendEmailResult = {
  accepted: string[];
  rejected: string[];
  ehlo: string[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: {
    from: string;
    to: string[];
  };
  messageId: string;
};

export const sendEmail = async (params: SendEmailOptions) => {
  const payload = await getPayload({ config });

  try {
    const result = (await payload.sendEmail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      ...params,
    })) as SendEmailResult;

    logger.info(
      {
        accepted: result.accepted.length,
        rejected: result.rejected.length,
        response: result.response,
        messageId: result.messageId,
      },
      "Email sent",
    );
  } catch (error) {
    logger.error({ error }, "Error sending email");
  }
};
