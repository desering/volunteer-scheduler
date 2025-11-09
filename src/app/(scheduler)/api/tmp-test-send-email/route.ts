"use server";

import type { NextRequest } from "next/server";
import { sendSignupConfirmationEmail } from "@/actions/send-signup-confirmation-email";

export const GET = async (request: NextRequest) => {
  const result = await sendSignupConfirmationEmail();

  return Response.json({
    endpoint: "sendSignupConfirmationEmail",
    ...result,
  });
};
