import { describe, expect, test } from "bun:test";
import type { Access, PayloadRequest, Where } from "payload";
import { hasRole, or } from "./index";

const argsFor = (roles?: "admin" | "editor" | "volunteer" | null) => ({
  req: {
    user: roles === undefined ? null : { id: 1, roles },
  } as PayloadRequest,
});

describe("hasRole", () => {
  test("allows each configured role", () => {
    const rule = hasRole("admin", "editor");

    expect(rule(argsFor("admin"))).toBe(true);
    expect(rule(argsFor("editor"))).toBe(true);
  });

  test("rejects roles that are not configured", () => {
    expect(hasRole("admin", "editor")(argsFor("volunteer"))).toBe(false);
    expect(hasRole("admin")(argsFor("editor"))).toBe(false);
  });

  test("rejects requests without a user or role", () => {
    expect(hasRole("admin")(argsFor())).toBe(false);
    expect(hasRole("admin")(argsFor(null))).toBe(false);
  });

  test("rejects all users when no roles are configured", () => {
    expect(hasRole()(argsFor("admin"))).toBe(false);
  });
});

describe("or", () => {
  test("returns false when no rules are supplied", async () => {
    expect(await or()(argsFor())).toBe(false);
  });

  test("returns false when every rule denies access", async () => {
    expect(
      await or(
        () => false,
        async () => false,
      )(argsFor()),
    ).toBe(false);
  });

  test("returns true when a synchronous rule grants access", async () => {
    expect(
      await or(
        () => false,
        () => true,
      )(argsFor()),
    ).toBe(true);
  });

  test("returns true when an asynchronous rule grants access", async () => {
    expect(
      await or(
        () => false,
        async () => true,
      )(argsFor()),
    ).toBe(true);
  });

  test("collects static and synchronous and asynchronous Where results", async () => {
    const staticWhere: Where = { id: { equals: 1 } };
    const syncWhere: Where = { preferredName: { equals: "Alex" } };
    const asyncWhere: Where = { roles: { equals: "editor" } };

    const result = await or(
      staticWhere,
      () => false,
      () => syncWhere,
      async () => asyncWhere,
    )(argsFor());

    expect(result).toEqual({ or: [staticWhere, syncWhere, asyncWhere] });
  });

  test("wraps even a single Where result in an or condition", async () => {
    const where: Where = { id: { equals: 1 } };

    expect(await or(where)(argsFor())).toEqual({ or: [where] });
  });

  test("true takes precedence over collected Where results and short-circuits", async () => {
    let laterRuleCalled = false;
    const laterRule: Access = () => {
      laterRuleCalled = true;
      return false;
    };

    const result = await or(
      { id: { equals: 1 } },
      async () => true,
      laterRule,
    )(argsFor());

    expect(result).toBe(true);
    expect(laterRuleCalled).toBe(false);
  });

  test("passes the original access arguments to function rules", async () => {
    const args = {
      ...argsFor("editor"),
      id: 1,
      data: { preferredName: "Alex" },
    };
    let receivedArgs: Parameters<Access>[0] | undefined;
    const rule: Access = (incomingArgs) => {
      receivedArgs = incomingArgs;
      return false;
    };

    await or(rule)(args);

    expect(receivedArgs).toBe(args);
  });

  test("propagates rule errors rather than granting access", async () => {
    const error = new Error("Access lookup failed");
    const rule: Access = async () => {
      throw error;
    };

    await expect(or(rule)(argsFor())).rejects.toThrow(error);
  });
});
