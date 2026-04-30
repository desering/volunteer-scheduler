import type { Access } from "payload";

export const themselves =
  <T>(getter: (data: T) => string | number): Access =>
  ({ req, data }) => {
    if (!req?.user) {
      return false;
    }
    return req.user.id === getter(data);
  };
