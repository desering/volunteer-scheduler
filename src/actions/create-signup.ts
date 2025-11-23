"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { getUser } from "@/lib/services/get-user";
import { sendSignupConfirmationEmail } from "@/actions/send-signup-confirmation-email";
import type { Signup } from "@/payload-types";

const schema = z.object({
  eventId: z.number(),
  roleId: z.number(),
});

export type CreateSignupRequest = z.infer<typeof schema>;

export type CreateSignupResponse =
  | {
      success: true;
      data: Signup;
    }
  | {
      success: false;
      message: string;
      errors?: ReturnType<typeof z.flattenError<CreateSignupRequest>>;
    };

export async function createSignup(
  request: CreateSignupRequest,
): Promise<CreateSignupResponse> {
  const { user } = await getUser();

  if (!user) {
    return {
      success: false,
      message: "User must be signed in",
    };
  }

  const parse = schema.safeParse(request);

  if (!parse.success) {
    return {
      success: false,
      message: "Submitted data incorrect",
      errors: z.flattenError(parse.error),
    };
  }

  const data = parse.data;

  const payload = await getPayload({ config });

  const existingSignups = await payload.find({
    collection: "signups",
    where: {
      event: { equals: data.eventId },
      role: { equals: data.roleId },
    },
  });

  const role = await payload.findByID({
    collection: "roles",
    id: data.roleId,
  });

  if (!role) {
    return {
      success: false,
      message: "Role does not exist",
    };
  }

  if (role.maxSignups !== 0 && existingSignups.totalDocs >= role.maxSignups) {
    return {
      success: false,
      message:
        "This role unfortunately has reached the maximum number of signups.",
    };
  }

  const signup = await payload.create({
    collection: "signups",
    data: {
      event: data.eventId,
      role: data.roleId,
      user: user.id,
    },
  });

  try {
    const event = await payload.findByID({
      collection: "events",
      id: data.eventId,
    });

    const roleObj = role as any;

    const payloadForEmail = {
      to: (user as any).email,
      name: (user as any).preferredName ?? "Volunteer",
      eventSummary: (event as any)?.title ?? "Volunteer Shift",
      description: (event as any)?.description ?? undefined,
      start: (event as any)?.start_date,
      end: (event as any)?.end_date,
      location:
        (event as any)?.location ?? "De Sering, Rhoneweg 6, 1043 AH Amsterdam",
      role: roleObj?.title ?? (roleObj as any),
    };

    await sendSignupConfirmationEmail(payloadForEmail as any);
  } catch (emailError) {
    console.error("Failed to send signup confirmation email:", emailError);
  }

  return {
    success: true,
    data: signup,
  };
}
