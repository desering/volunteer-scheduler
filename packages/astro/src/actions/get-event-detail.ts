import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const getEventDetails = defineAction({
  input: z.object({
    id: z.number(),
  }),
  handler: async (input, context) => {
    const event = await context.locals.payload.findByID({
      collection: "events",
      id: input.id,
      depth: 1,

      populate: {
        roles: {
          signups: false,
        },
      },
    });

    // Narrow down to keep frontend simple
    // Roles are assigned to sections and remaining added to the event
    // Signups are added to the relevant roles
    const s = {
      ...event,
      id: forceNumber(event.id),
      sections: {
        ...event.sections,
        docs: mapObjects(event.sections?.docs, (section) => ({
          ...section,
          roles: {
            ...section.roles,
            docs: mapObjects(
              event.roles?.docs,
              (role) => ({
                ...role,
                signups: {
                  ...role.signups,
                  docs: mapObjects(
                    event.signups?.docs,
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
        ...event.roles,
        docs: mapObjects(
          event.roles?.docs,
          (role) => ({
            ...role,
            section: forceNumber(role.section),
            signups: {
              ...role.signups,
              docs: mapObjects(
                event.signups?.docs,
                (signup) => signup,
                (signup) => signup.role === role.id,
              ),
            },
          }),
          (role) => !role.section,
        ),
      },
      signups: {
        ...event.signups,
        docs: mapObjects(event.signups?.docs, (signup) => ({
          ...signup,
          user: forceNumber(signup.user),
          role: forceNumber(signup.role),
        })),
      },
    };

    return s;
  },
});

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
