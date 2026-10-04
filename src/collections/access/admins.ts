import type { FieldAccess, PayloadRequest } from "payload";

export const admins = ({ req }: { req: PayloadRequest }) => {
  if (!req?.user) return false;

  return Boolean(req.user?.roles?.includes("admin"));
};

export const adminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return Boolean(user?.roles?.includes("admin"));
};
