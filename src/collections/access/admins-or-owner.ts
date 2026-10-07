import type { Access } from "payload";

/**
 * Admins see everything; anyone else only the documents whose `field` points
 * at themselves. Returns a query constraint rather than `true`, so it also
 * protects list endpoints (`GET /payload-api/<collection>`), not just
 * single-document reads.
 */
export const adminsOrOwner =
  (field = "user"): Access =>
  ({ req }) => {
    if (!req?.user) return false;
    if (req.user.roles?.includes("admin")) return true;
    return { [field]: { equals: req.user.id } };
  };
