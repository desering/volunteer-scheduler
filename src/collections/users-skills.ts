import type { CollectionConfig } from "payload";
import { adminAndThemselves } from "./users/access/admin-and-themselves";

export const UsersSkills: CollectionConfig = {
  slug: "users-skills",
  admin: {
    useAsTitle: "skill",
    group: "User Management",
  },
  access: {
    read: adminAndThemselves,
    create: adminAndThemselves,
    update: adminAndThemselves,
    delete: adminAndThemselves,
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: {
        description: "The user who has this skill",
      },
    },
    {
      name: "skill",
      type: "relationship",
      relationTo: "skills",
      required: true,
      hasMany: false,
      admin: {
        description: "The skill the user has",
      },
    },
    {
      name: "learnt",
      type: "checkbox",
      label: "Learnt",
      defaultValue: false,
      admin: {
        description: "Whether the user has learnt this skill",
      },
    },
  ],
};
