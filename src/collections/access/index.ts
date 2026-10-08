import type { Access, PayloadRequest, Where } from "payload";
import type { User } from "@/payload-types";

type Role = NonNullable<User["roles"]>;
type Rule = Access | Where;

export const hasRole = (...roles: Role[]) => {
  return ({ req }: { req: PayloadRequest }) => {
    const userRole = req.user?.roles;
    return !!userRole && roles.includes(userRole);
  };
};

export const or = (...rules: Rule[]): Access => {
  return async (args) => {
    const matchingConditions: Where[] = [];

    for (const rule of rules) {
      const result = typeof rule === "function" ? await rule(args) : rule;

      if (result === true) {
        return true;
      }

      if (result && typeof result === "object") {
        matchingConditions.push(result);
      }
    }

    if (matchingConditions.length === 0) {
      return false;
    }

    return { or: matchingConditions };
  };
};
