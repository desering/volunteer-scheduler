import { describe, expect, test } from "bun:test";
import { preferredNameSchema } from "./preferred-name";

describe("preferredNameSchema", () => {
  test("accepts one word", () => {
    expect(preferredNameSchema.parse("Alice")).toBe("Alice");
  });

  test("accepts two words", () => {
    expect(preferredNameSchema.parse("Alice Bobbinska")).toBe(
      "Alice Bobbinska",
    );
  });

  test("accepts emoji only", () => {
    expect(preferredNameSchema.parse("🦫")).toBe("🦫");
  });

  test("accepts word with no alphanumeric characters", () => {
    expect(preferredNameSchema.parse("-–—/\\![]€+!")).toBe("-–—/\\![]€+!");
  });

  test("trims whitespace", () => {
    expect(preferredNameSchema.parse("  Bob  ")).toBe("Bob");
  });

  test("trims whitespace, but not space between words", () => {
    expect(preferredNameSchema.parse("  Bob Cob ")).toBe("Bob Cob");
  });

  test("rejects empty string", () => {
    expect(() => preferredNameSchema.parse("")).toThrow();
  });

  test("rejects name of only space", () => {
    expect(() => preferredNameSchema.parse(" ")).toThrow();
  });

  test("rejects name exceeding 50 characters", () => {
    expect(() => preferredNameSchema.parse("a".repeat(51))).toThrow();
  });

  test("rejects name containing a comma", () => {
    expect(() => preferredNameSchema.parse("Alice, Bob")).toThrow();
  });
});
