import type { NextRequest } from "next/server";
import Type from "typebox";
import Value, { Errors } from "typebox/value";
import { IsoDate } from "@/lib/schemas/iso-date";
import { getEvents } from "@/lib/services/get-events";

const GetEventsRequestSchema = Type.Object({
  minDate: Type.Optional(IsoDate),
  maxDate: Type.Optional(IsoDate),
  tagIds: Type.Optional(Type.Array(Type.Number())),
});

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;

  const tagIds = searchParams
    .getAll("where[tags][in][]")
    .map((id) => parseInt(id, 10))
    .filter((id) => !Number.isNaN(id));

  const data = {
    minDate: searchParams.get("min_date") ?? undefined,
    maxDate: searchParams.get("max_date") ?? undefined,
    tagIds: tagIds.length > 0 ? tagIds : undefined,
  } satisfies Type.Static<typeof GetEventsRequestSchema>;

  const isValidRequest = Value.Check(GetEventsRequestSchema, data);

  if (!isValidRequest) {
    return Response.json(Errors(GetEventsRequestSchema, data), {
      status: 400,
    });
  }

  const decodedReq = Value.Decode(GetEventsRequestSchema, data);

  const events = await getEvents(decodedReq);

  return Response.json(events);
};
