"use server";

import config from "@payload-config";
import { getPayload } from "payload";

export const getEventDetails = async (id: number) => {
  const payload = await getPayload({ config });

  const event = await payload.findByID({
    collection: "events",
    id: id,
    depth: 1,

    joins: {
      signups: {
        limit: 100,
      },
    },
  });

  // Narrow down to keep frontend simple
  // Roles are assigned to their sections, any remaining added to the event itself
  // Signups are added to the relevant roles
  return {
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
};

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

export type EventDetails = Awaited<ReturnType<typeof getEventDetails>>;
