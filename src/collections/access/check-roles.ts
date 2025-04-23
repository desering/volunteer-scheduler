// https://github.com/payloadcms/payload/blob/main/examples/auth/src/collections/access/checkRole.ts

import type { User } from "@payload-types";

export const checkRole = (
  allRoles: User["roles"][] = [],
  user: User | null = null,
): boolean => allRoles.includes(user?.roles);
