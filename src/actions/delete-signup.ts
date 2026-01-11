"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { getUser } from "@/lib/services/get-user";

const schema = z.object({
  eventId: z.number(),
});

export type DeleteSignupRequest = z.infer<typeof schema>;

export async function deleteSignup(request: DeleteSignupRequest) {
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

  const event = await payload.findByID({
    collection: "events",
    id: data.eventId,
    depth: 0,
  });

  if (!event) {
    return {
      success: false,
      message: "Event not found",
    };
  }

  const existingSignups = await payload.find({
    collection: "signups",
    where: {
      event: {
        equals: event.id,
      },
      user: {
        equals: user.id,
      },
    },
    depth: 0,
  });

  if (existingSignups.totalDocs === 0) {
    return {
      success: false,
      message: "No signup found for this user on the specified event",
    };
  }

  const signupToDelete = existingSignups.docs[0];

  const signup = await payload.delete({
    collection: "signups",
    id: signupToDelete.id,
  });

  if (!signup) {
    return {
      success: false,
      message: "Signup could not be deleted",
    };
  }

  return {
    success: true,
    message: "Signup successfully deleted",
  };
}
