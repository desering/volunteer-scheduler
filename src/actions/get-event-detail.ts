import { convertLexicalToHTML } from "@/utils/convert-lexical-to-html";

export const getEventDetails = async (id: number)=> {
  const event = await payload.findByID({
    collection: "events",
    id: id,
    depth: 1,

    populate: {
      roles: {
        signups: false,
      },
    },
  });

  // Narrow down to keep frontend simple
  // Roles are assigned to their sections, any remaining added to the event itself
  // Signups are added to the relevant roles
  const transformedEvent = {
    ...event,
    id: forceNumber(event.id),
    descriptionHtml: "" as string | null | undefined,
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
              descriptionHtml: "" as string | null | undefined,
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
          descriptionHtml: "" as string | null | undefined,
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

  // add descriptionHtml
  for (const role of transformedEvent.roles.docs) {
    role.descriptionHtml =
      role.description && (await convertLexicalToHTML(role.description));
  }
  for (const section of transformedEvent.sections.docs) {
    for (const role of section.roles.docs) {
      role.descriptionHtml =
        role.description && (await convertLexicalToHTML(role.description));
    }
  }

  return transformedEvent;
}

const forceNumber = (value: unknown) =>
  typeof value === "number" ? value : null;

const mapObject = <T, S>(
  value: T,
  map: (value: (T & object) | (T & null)) => S,
) => (typeof value === "object" ? map(value) : null);

/**
 * Maps an array of objects to a new array of transformed objects, with optional filtering
 *
 * @template T - The type of the input array elements
 * @template S - The type of the output array elements
 * @param values - The input array to map over
 * @param map - A function that transforms each element from type T to type S
 * @param filter - Optional predicate function to filter the mapped results
 * @returns A new array containing the mapped and filtered elements, or an empty array if input is null/undefined
 */
const mapObjects = <T, S>(
  values: T[] | null | undefined,
  map: (value: (T & object) | (T & null)) => S,
  filter?: (value: S) => boolean,
) =>
  (values
    ?.map((value) => mapObject(value, map))
    .filter((value) => !!value && (!filter || filter?.(value))) as S[]) ?? [];

export type EventDetails = Awaited<ReturnType<typeof getEventDetails>>["data"];
