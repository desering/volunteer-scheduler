import { getUser } from "@/lib/services/get-user";

/**
 * Every server action in this folder starts with this. Next.js server actions
 * can be called directly over HTTP, so the check has to live inside the
 * action, not in the screen that shows the button.
 */
export const requireAdmin = async () => {
  const { user } = await getUser();
  if (!user?.roles?.includes("admin")) {
    throw new Error("Only admins can do this.");
  }
  return user;
};
