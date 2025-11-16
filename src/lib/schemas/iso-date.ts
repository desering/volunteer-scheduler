import Type from "typebox";

export const IsoDate = Type.Codec(Type.String({ format: "date-time" }))
  .Decode((s) => new Date(s))
  .Encode((d) => d.toISOString());
