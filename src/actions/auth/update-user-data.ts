"use server";

import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";

const schema = z.object({
  preferredName: z.string().min(1, "Preferred name is required"),
  email: z.email({ error: "Invalid email" }),
  phoneNumber: z
    .e164({ error: "Invalid phone number e.g +31612345678" })
    .min(1, "Phone number is required"),
});

export type UpdateUserData = z.infer<typeof schema>;

export type UpdateSuccess = {
  success: true;
  message: string;
};

export type UpdateFailure = {
  success: false;
  errors: ReturnType<typeof z.flattenError<UpdateUserData>>;
};

export type UpdateUserResult = UpdateSuccess | UpdateFailure;

export const updateUser = async (
  formData: FormData,
): Promise<UpdateUserResult> => {
  const parse = schema.safeParse({
    preferredName: formData.get("preferred-name"),
    email: formData.get("email"),
    phoneNumber: formData.get("phone-number"),
  });

  if (!parse.success) {
    return {
      success: false,
      errors: z.flattenError(parse.error),
    };
  }

  const data = parse.data;
  const payload = await getPayload({ config });

  // Ensure the requester is authenticated and only updates their own record
  const headers = await getHeaders();
  const auth = await payload.auth({ headers });

  if (!auth.user) {
    return {
      success: false,
      errors: {
        formErrors: ["Not authorized to update this user"],
        fieldErrors: {},
      },
    };
  }

  try {
    if (auth.user.email !== data.email) {
      const existing = await payload.find({
        collection: "users",
        where: { email: { equals: data.email } },
        limit: 1,
      });
      if (existing.totalDocs > 0) {
        return {
          success: false,
          errors: {
            formErrors: [],
            fieldErrors: { email: ["The provided e-mail is already in use"] },
          },
        };
      }
    }

    await payload.update({
      collection: "users",
      id: auth.user.id,
      data: {
        preferredName: data.preferredName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
    });

    revalidatePath("/account");

    return { success: true, message: "Account details updated" };
  } catch (error) {
    return {
      success: false,
      errors: {
        formErrors: [error instanceof Error ? error.message : "Unknown error"],
        fieldErrors: {},
      },
    };
  }
};
