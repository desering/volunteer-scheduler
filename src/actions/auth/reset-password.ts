import { getPayload } from "payload";
import config from "@payload-config";

export type ResetPasswordSuccess = {
  success: true;
  // message: string;
  // user: User;
  // token?: string;
};

export type ResetPasswordFailure = {
  success: false;
  // message: ReturnType<typeof z.flattenError<SignInUserData>>;
};

export type ResetPasswordResult = ResetPasswordSuccess | ResetPasswordFailure;

export const resetPassword = async (
  formData: FormData,
): Promise<ResetPasswordResult> => {
  const payload = await getPayload({ config });

  const result = await payload.resetPassword({
    collection: "users", // required
    data: {
      // required
      password: "", // req.body.password, // the new password to set
      token: "afh3o2jf2p3f...", // the token generated from the forgotPassword operation
    },
    overrideAccess: false,
    // req: req, // optional, pass a Request object to be provided to all hooks
  });

  return { success: true };
};
