import config from "@payload-config";
import { getPayload, type SendEmailOptions } from "payload";

export const sendEmail = async (params: SendEmailOptions) => {
  const payload = await getPayload({ config });

  const users = await payload.find({
    collection: "users",
    where: {
      email: { equals: params.to },
    },
    limit: 1,
  });

  const user = users.docs[0];
  if (user && user.unsubscribeFromEmails) {
    return;
  }

  await payload.sendEmail({
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    ...params,
  });
};
