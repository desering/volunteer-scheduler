import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { generatePayloadCookie } from "payload";
import { groupAndSortShiftsByDate } from "~/utils/map-shifts";

export const server = {
  createUser: defineAction({
    input: z.object({
      email: z.string(),
      password: z.string(),
      preferredName: z.string(),
    }),
    handler: async (input, { locals: { payload } }) => {
      // Check if user already exists
      const existingUser = await payload.find({
        collection: "users",
        where: {
          email: {
            equals: input.email,
          },
        },
      });

      if (existingUser.totalDocs > 0) {
        throw new ActionError({
          code: "CONFLICT",
          message: "Email is already in use",
        });
      }

      const user = await payload.create({
        collection: "users",
        data: input,
      });

      return user;
    },
  }),
  loginUser: defineAction({
    input: z.object({
      email: z.string(),
      password: z.string(),
    }),
    handler: async (input, { cookies, locals: { payload } }) => {
      const result = await payload.login({
        collection: "users",
        data: input,
      });

      if (!result.token) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Login failed. Token expected.",
        });
      }

      const collection = payload.collections.users;
      const cookie = generatePayloadCookie({
        collectionAuthConfig: collection.config.auth,
        cookiePrefix: payload.config.cookiePrefix,
        token: result.token,
        returnCookieAsObject: true,
      });

      cookies.set(cookie.name, cookie.value ?? "", {
        maxAge: cookie.maxAge,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite?.toLowerCase() as
          | "lax"
          | "strict"
          | "none"
          | undefined,
        domain: cookie.domain,
        expires: cookie.expires ? new Date(cookie.expires) : undefined,
        path: cookie.path,
      });

      return true;
    },
  }),
  deleteSignup: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async (input, context) => {
      const signup = await context.locals.payload.delete({
        collection: "signups",
        id: input.id,
      });

      if (!signup)
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Signup not found",
        });

      return true;
    },
  }),
  createSignup: defineAction({
    input: z.object({
      shift: z.number(),
      role: z.number(),
    }),
    handler: async (input, context) => {
      if (!context.locals.user)
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "User must be logged in",
        });

      const signup = await context.locals.payload.create({
        collection: "signups",
        data: {
          shift: input.shift,
          role: input.role,
          user: context.locals.user.id,
        },
      });

      return signup;
    },
  }),
  getShiftsByDay: defineAction({
    handler: async (_, context) => {
      const shifts = await context.locals.payload.find({
        collection: "shifts",

        joins: {
          roles: false,
          sections: false,
        },
      });

      return await groupAndSortShiftsByDate(shifts.docs);
    },
  }),
  getShiftDetails: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async (input, context) => {
      const shift = await context.locals.payload.findByID({
        collection: "shifts",
        id: input.id,
        depth: 1,

        populate: {
          roles: {
            signups: false,
          },
        },
      });

      // Narrow down to keep frontend simple
      // Roles are assigned to sections and remaining added to the shift
      // Signups are added to the relevant roles
      const s = {
        ...shift,
        id: forceNumber(shift.id),
        sections: {
          ...shift.sections,
          docs: mapObjects(shift.sections?.docs, (section) => ({
            ...section,
            roles: {
              ...section.roles,
              docs: mapObjects(
                shift.roles?.docs,
                (role) => ({
                  ...role,
                  signups: {
                    ...role.signups,
                    docs: mapObjects(
                      shift.signups?.docs,
                      (signup) => signup,
                      (signup) => signup.role === role.id,
                    ),
                  },
                }),
                (role) => role.section === section.id,
              ),
            },
          })),
        },
        roles: {
          ...shift.roles,
          docs: mapObjects(
            shift.roles?.docs,
            (role) => ({
              ...role,
              section: forceNumber(role.section),
              signups: {
                ...role.signups,
                docs: mapObjects(
                  shift.signups?.docs,
                  (signup) => signup,
                  (signup) => signup.role === role.id,
                ),
              },
            }),
            (role) => !role.section,
          ),
        },
        signups: {
          ...shift.signups,
          docs: mapObjects(shift.signups?.docs, (signup) => ({
            ...signup,
            user: forceNumber(signup.user),
            role: forceNumber(signup.role),
          })),
        },
      };

      return s;
    },
  }),
};

const forceNumber = (value: unknown) =>
  typeof value === "number" ? value : null;

const mapObject = <T, S>(
  value: T,
  map: (value: (T & object) | (T & null)) => S,
) => (typeof value === "object" ? map(value) : null);

const mapObjects = <T, S>(
  values: T[] | null | undefined,
  map: (value: (T & object) | (T & null)) => S,
  filter?: (value: S) => boolean,
) =>
  (values
    ?.map((value) => mapObject(value, map))
    .filter((value) => !!value && (!filter || filter?.(value))) as S[]) ?? [];
