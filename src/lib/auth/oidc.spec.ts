import { beforeEach, describe, expect, it, mock } from "bun:test";

const discoveryMock = mock();
const authorizationCodeGrantMock = mock();
const fetchUserInfoMock = mock();

mock.module("openid-client", () => ({
  ClientSecretPost: mock((secret: string) => secret),
  authorizationCodeGrant: authorizationCodeGrantMock,
  buildAuthorizationUrl: mock(() => new URL("https://idp.example.test/auth")),
  calculatePKCECodeChallenge: mock(async () => "challenge"),
  discovery: discoveryMock,
  fetchUserInfo: fetchUserInfoMock,
  randomPKCECodeVerifier: mock(() => "verifier"),
  randomState: mock(() => "state"),
  skipStateCheck: Symbol("skip-state"),
  skipSubjectCheck: Symbol("skip-subject"),
}));

const {
  authenticateOidcCode,
  resetOidcConfigurationCacheForTests,
  resolveOidcIdentity,
} = await import("./oidc");

const makeConfiguration = (issuer = "https://issuer.example.test") =>
  ({
    serverMetadata: () => ({
      issuer,
    }),
  }) as never;

const makeIdentity = () => ({
  email: "alice@example.test",
  emailVerified: true,
  issuer: "https://issuer.example.test",
  name: "Alice",
  subject: "subject-123",
});

describe("resolveOidcIdentity", () => {
  beforeEach(() => {
    resetOidcConfigurationCacheForTests();
  });

  it("requires password-confirmed linking when verified email matches an existing user", async () => {
    const payload = {
      create: mock(async ({ data, collection }) => ({
        ...data,
        collection,
        id: 99,
      })),
      delete: mock(),
      find: mock()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({
          docs: [
            { id: 7, email: "alice@example.test", preferredName: "Alice" },
          ],
        })
        .mockResolvedValueOnce({ docs: [] }),
    };

    const result = await resolveOidcIdentity(payload as never, makeIdentity());

    expect(result.kind).toBe("link-required");
    if (result.kind !== "link-required") {
      throw new Error("Expected link-required result");
    }
    expect(result.token.length).toBeGreaterThan(20);
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "oidc-pending-links",
      }),
    );
  });

  it("creates a new user and linked identity for a verified new OIDC account", async () => {
    const payload = {
      create: mock(async ({ collection, data }) => {
        if (collection === "users") {
          return { id: 3, ...data };
        }

        return { id: 4, ...data };
      }),
      find: mock()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] }),
    };

    const result = await resolveOidcIdentity(payload as never, makeIdentity());

    expect(result.kind).toBe("sign-in");
    if (result.kind !== "sign-in") {
      throw new Error("Expected sign-in result");
    }
    expect(result.user.id).toBe(3);
    expect(payload.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: "users",
      }),
    );
    expect(payload.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: "user-identities",
      }),
    );
  });

  it("rejects unverified email for first-time account creation", async () => {
    const payload = {
      find: mock()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] }),
    };

    await expect(
      resolveOidcIdentity(payload as never, {
        ...makeIdentity(),
        emailVerified: false,
      }),
    ).rejects.toThrow(/verified email address/);
  });

  it("resolves an existing linked identity by issuer and subject", async () => {
    const payload = {
      find: mock()
        .mockResolvedValueOnce({ docs: [{ id: 11, user: 5 }] })
        .mockResolvedValueOnce({
          docs: [
            { id: 5, email: "alice@example.test", preferredName: "Old Name" },
          ],
        }),
      update: mock(async ({ id, data }) => ({
        id,
        email: "alice@example.test",
        preferredName: data.preferredName ?? "Old Name",
      })),
    };

    const result = await resolveOidcIdentity(payload as never, makeIdentity());

    expect(result.kind).toBe("sign-in");
    if (result.kind !== "sign-in") {
      throw new Error("Expected sign-in result");
    }
    expect(result.user.preferredName).toBe("Alice");
    expect(payload.update).toHaveBeenCalledTimes(2);
  });
});

describe("authenticateOidcCode", () => {
  beforeEach(() => {
    process.env.AUTHENTIK_CLIENT_ID = "client-id";
    process.env.AUTHENTIK_CLIENT_SECRET = "client-secret";
    process.env.AUTHENTIK_ISSUER = "https://issuer.example.test";
    process.env.SERVER_URL = "https://app.example.test";

    discoveryMock.mockReset();
    authorizationCodeGrantMock.mockReset();
    fetchUserInfoMock.mockReset();
    resetOidcConfigurationCacheForTests();
  });

  it("retries discovery after a transient failure", async () => {
    discoveryMock
      .mockRejectedValueOnce(new Error("temporary discovery failure"))
      .mockResolvedValueOnce(makeConfiguration());
    authorizationCodeGrantMock.mockResolvedValue({
      access_token: "access-token",
      claims: () => ({
        email: "alice@example.test",
        email_verified: true,
        iss: "https://issuer.example.test",
        name: "Alice",
        sub: "subject-123",
      }),
    });
    fetchUserInfoMock.mockResolvedValue({
      email: "alice@example.test",
      email_verified: true,
      sub: "subject-123",
    });

    await expect(
      authenticateOidcCode({
        code: "code",
        expectedNonce: "nonce",
        redirectUri: "https://app.example.test/auth/oidc/callback",
        verifier: "verifier",
      }),
    ).rejects.toThrow("temporary discovery failure");

    const identity = await authenticateOidcCode({
      code: "code",
      expectedNonce: "nonce",
      redirectUri: "https://app.example.test/auth/oidc/callback",
      verifier: "verifier",
    });

    expect(identity.subject).toBe("subject-123");
    expect(discoveryMock).toHaveBeenCalledTimes(2);
  });

  it("rejects issuer mismatch from the ID token", async () => {
    discoveryMock.mockResolvedValue(makeConfiguration());
    authorizationCodeGrantMock.mockResolvedValue({
      access_token: "access-token",
      claims: () => ({
        email: "alice@example.test",
        email_verified: true,
        iss: "https://wrong-issuer.example.test",
        sub: "subject-123",
      }),
    });

    await expect(
      authenticateOidcCode({
        code: "code",
        expectedNonce: "nonce",
        redirectUri: "https://app.example.test/auth/oidc/callback",
        verifier: "verifier",
      }),
    ).rejects.toThrow(/issuer did not match/);
  });
});
