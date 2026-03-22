import { describe, expect, test } from "bun:test";
import { preferredNameSchema } from "./preferred-name";

describe("preferredNameSchema", () => {
  test("accepts a valid name", () => {
    expect(preferredNameSchema.parse("Alice")).toBe("Alice");
  });

  test("trims whitespace", () => {
    expect(preferredNameSchema.parse("  Bob  ")).toBe("Bob");
  });

  test("rejects empty string", () => {
    expect(() => preferredNameSchema.parse("")).toThrow();
  });

  test("rejects name exceeding 50 characters", () => {
    expect(() => preferredNameSchema.parse("a".repeat(51))).toThrow();
  });

  test("rejects name containing a comma", () => {
    expect(() => preferredNameSchema.parse("Alice, Bob")).toThrow();
  });
});
