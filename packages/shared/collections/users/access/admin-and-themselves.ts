import type { Access } from "payload";
import { admins } from "../../access/admins";
import { themselves } from "./themselves";

export const adminAndThemselves: Access = (args) =>
  admins(args) || themselves(args);
