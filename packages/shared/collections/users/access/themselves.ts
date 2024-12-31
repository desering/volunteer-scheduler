import type { Access } from "payload";

export const themselves: Access = ({ id, req }) => {
  if (!req?.user) {
    return false;
  }
  return req.user.id === id;
};
