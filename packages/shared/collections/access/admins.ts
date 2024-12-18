import type { Access } from "payload";

export const admins: Access = ({ req }) =>
  req.user?.roles?.includes("admin") || false;
