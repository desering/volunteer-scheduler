import type { PayloadRequest } from "payload";

export const admins = ({ req }: { req: PayloadRequest }) => {
  if (!req?.user) return false;

  return Boolean(req.user?.roles?.includes("admin"));
};
