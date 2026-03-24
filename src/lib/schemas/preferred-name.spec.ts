import { describe, expect, test } from "bun:test";
import { preferredName } from "./preferred-name";

describe("preferredNameSchema", () => {
  test("accepts one word", () => {
    expect(preferredName.parse("Alice")).toBe("Alice");
  });

  test("accepts two words", () => {
    expect(preferredName.parse("Alice Bobbinska")).toBe("Alice Bobbinska");
  });

  test("accepts emoji only", () => {
    expect(preferredName.parse("🦫")).toBe("🦫");
  });

  test("accepts word with no alphanumeric characters", () => {
    expect(preferredName.parse("-–—/\\![]€+!")).toBe("-–—/\\![]€+!");
  });

  test("trims whitespace", () => {
    expect(preferredName.parse("  Bob  ")).toBe("Bob");
  });

  test("trims whitespace, but not space between words", () => {
    expect(preferredName.parse("  Bob Cob ")).toBe("Bob Cob");
  });

  test("rejects empty string", () => {
    expect(() => preferredName.parse("")).toThrow();
  });

  test("rejects name of only space", () => {
    expect(() => preferredName.parse(" ")).toThrow();
  });

  test("rejects name exceeding 50 characters", () => {
    expect(() => preferredName.parse("a".repeat(51))).toThrow();
  });

  test("rejects name containing a comma", () => {
    expect(() => preferredName.parse("Alice, Bob")).toThrow();
  });
});
