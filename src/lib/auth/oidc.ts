import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import * as oidcClient from "openid-client";
import type { Payload, Where } from "payload";
import type { User } from "@/payload-types";
import {
  authenticateLocalPassword,
  incrementLoginAttempts,
  isUserLocked,
  type RawAuthUser,
  resetLoginAttempts,
} from "./payload-auth-helpers";

const OIDC_PENDING_LINK_COOKIE = "oidc_pending_link";
const OIDC_STATE_COOKIE = "oidc_state";
const OIDC_PENDING_LINK_TTL_SECONDS = 10 * 60;
const OIDC_STATE_TTL_SECONDS = 10 * 60;
const OIDC_SCOPE = "openid profile email";

type OIDCState = {
  exp: number;
  nonce: string;
  returnTo: string;
  state: string;
  verifier: string;
};

export type OIDCIdentity = {
  email?: string;
  emailVerified: boolean;
  issuer: string;
  name: string;
  subject: string;
};

type OIDCUserInfo = {
  email?: string;
  email_verified?: boolean | string;
  iss?: string;
  name?: string;
  preferred_username?: string;
  sub?: string;
};

type OIDCLinkedIdentityDoc = {
  emailAtLinkTime?: string | null;
  id: number | string;
  user: number | User;
};

type OIDCPendingLinkDoc = {
  email: string;
  expiresAt: string;
  id: number | string;
  issuer: string;
  name: string;
  subject: string;
  token: string;
  user: number | User;
};

type ErrorWithCause = {
  cause?: unknown;
  code?: unknown;
  expected?: unknown;
  header?: unknown;
  message?: unknown;
  reason?: unknown;
};

let oidcConfigPromise: Promise<oidcClient.Configuration> | null = null;

const base64UrlEncode = (value: Buffer | string) =>
  Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");

const base64UrlDecode = (value: string) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64");
};

const jsonToSignedToken = <T>(value: T, secret: string) => {
  const payload = base64UrlEncode(JSON.stringify(value));
  const signature = base64UrlEncode(
    createHmac("sha256", secret).update(payload).digest(),
  );

  return `${payload}.${signature}`;
};

const signedTokenToJson = <T>(token: string, secret: string): T | null => {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest();
  const actualSignature = base64UrlDecode(signature);

  if (actualSignature.length !== expectedSignature.length) {
    return null;
  }

  if (!timingSafeEqual(actualSignature, expectedSignature)) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(payload).toString("utf8")) as T;
  } catch {
    return null;
  }
};

const randomBase64Url = (bytes = 32) => base64UrlEncode(randomBytes(bytes));

const getSessionSecret = () => {
  const secret = process.env.OIDC_SESSION_SECRET ?? process.env.PAYLOAD_SECRET;

  if (!secret) {
    throw new Error("OIDC_SESSION_SECRET or PAYLOAD_SECRET must be configured");
  }

  return secret;
};

const getServerUrl = () => {
  if (!process.env.SERVER_URL) {
    throw new Error("SERVER_URL must be configured");
  }

  return process.env.SERVER_URL;
};

const getIssuer = () => {
  if (!process.env.AUTHENTIK_ISSUER) {
    throw new Error("AUTHENTIK_ISSUER must be configured");
  }

  return process.env.AUTHENTIK_ISSUER;
};

const getClientId = () => {
  if (!process.env.AUTHENTIK_CLIENT_ID) {
    throw new Error("AUTHENTIK_CLIENT_ID must be configured");
  }

  return process.env.AUTHENTIK_CLIENT_ID;
};

const getClientSecret = () => {
  if (!process.env.AUTHENTIK_CLIENT_SECRET) {
    throw new Error("AUTHENTIK_CLIENT_SECRET must be configured");
  }

  return process.env.AUTHENTIK_CLIENT_SECRET;
};

const asOptionalString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const asOptionalBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
};

const normalizePreferredName = (name: string, email?: string) => {
  const fallback = email?.split("@")[0] || "Volunteer";
  const candidate = name.trim() || fallback;
  return candidate.slice(0, 50);
};

const GENERIC_OIDC_ERROR_MESSAGES = new Set([
  "invalid response encountered",
  "something went wrong",
]);

const getErrorCause = (value: unknown) =>
  typeof value === "object" && value !== null && "cause" in value
    ? (value as ErrorWithCause).cause
    : undefined;

const getErrorMessage = (value: unknown) =>
  typeof value === "object" && value !== null && "message" in value
    ? asOptionalString((value as ErrorWithCause).message)
    : undefined;

const getErrorCode = (value: unknown) =>
  typeof value === "object" && value !== null && "code" in value
    ? asOptionalString((value as ErrorWithCause).code)
    : undefined;

const getErrorExpected = (value: unknown) =>
  typeof value === "object" && value !== null && "expected" in value
    ? (value as ErrorWithCause).expected
    : undefined;

const getErrorHeaderAlg = (value: unknown) => {
  if (typeof value !== "object" || value === null || !("header" in value)) {
    return undefined;
  }

  const header = (value as ErrorWithCause).header;

  if (typeof header !== "object" || header === null || !("alg" in header)) {
    return undefined;
  }

  return asOptionalString((header as { alg?: unknown }).alg);
};

const getErrorReason = (value: unknown) =>
  typeof value === "object" && value !== null && "reason" in value
    ? asOptionalString((value as ErrorWithCause).reason)
    : undefined;

const formatExpectedValue = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const values = value.filter(
      (entry): entry is string => typeof entry === "string",
    );

    if (values.length > 0) {
      return values.join(", ");
    }
  }

  return undefined;
};

const flattenErrorChain = (error: unknown) => {
  const chain: unknown[] = [];
  let current: unknown = error;

  while (current) {
    chain.push(current);
    current = getErrorCause(current);
  }

  return chain;
};

const getCallbackUrl = () =>
  new URL("/auth/oidc/callback", getServerUrl()).toString();

const sanitizeReturnTo = (returnTo?: string | null) => {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/";
  }

  return returnTo;
};

const buildExpiresAt = (ttlSeconds: number) =>
  new Date(Date.now() + ttlSeconds * 1000).toISOString();

const getPendingLinkToken = (token: string | undefined | null) => {
  if (!token || !/^[A-Za-z0-9_-]{20,}$/u.test(token)) {
    return null;
  }

  return token;
};

const getOidcConfiguration = () => {
  if (!oidcConfigPromise) {
    oidcConfigPromise = oidcClient
      .discovery(
        new URL(getIssuer()),
        getClientId(),
        undefined,
        oidcClient.ClientSecretPost(getClientSecret()),
      )
      .catch((error) => {
        oidcConfigPromise = null;
        throw error;
      });
  }

  return oidcConfigPromise;
};

const getAuthoritativeIssuer = async () => {
  const configuration = await getOidcConfiguration();
  return configuration.serverMetadata().issuer ?? getIssuer();
};

const fetchUserInfo = async (
  configuration: oidcClient.Configuration,
  accessToken: string,
  subject: string | typeof oidcClient.skipSubjectCheck,
) => {
  const response = await oidcClient.fetchUserInfo(
    configuration,
    accessToken,
    subject,
  );
  return response as OIDCUserInfo;
};

const findUserById = async (payload: Payload, userId: number) => {
  const result = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      id: {
        equals: userId,
      },
    },
  });

  return result.docs[0] ?? null;
};

const findLinkedIdentity = async (
  payload: Payload,
  identity: Pick<OIDCIdentity, "issuer" | "subject">,
) => {
  const result = await payload.find({
    collection: "user-identities",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          issuer: {
            equals: identity.issuer,
          },
        },
        {
          subject: {
            equals: identity.subject,
          },
        },
      ],
    },
  });

  return (result.docs[0] as OIDCLinkedIdentityDoc | undefined) ?? null;
};

const findExistingUserByVerifiedEmail = async (
  payload: Payload,
  identity: OIDCIdentity,
) => {
  if (!identity.email || !identity.emailVerified) {
    return null;
  }

  const result = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      email: {
        equals: identity.email,
      },
    },
  });

  return result.docs[0] ?? null;
};

const updateLinkedIdentityEmail = async (
  payload: Payload,
  linkedIdentityId: number | string,
  identity: OIDCIdentity,
) => {
  if (!identity.email || !identity.emailVerified) {
    return;
  }

  await payload.update({
    collection: "user-identities",
    id: linkedIdentityId,
    data: {
      emailAtLinkTime: identity.email,
    },
    depth: 0,
    overrideAccess: true,
  });
};

const updateLinkedUserFromOidcIdentity = async (
  payload: Payload,
  user: User,
  identity: OIDCIdentity,
) => {
  if (user.preferredName === identity.name) {
    return user;
  }

  return await payload.update({
    collection: "users",
    id: user.id,
    data: {
      preferredName: identity.name,
    },
    depth: 0,
    overrideAccess: true,
  });
};

const createUserFromOidcIdentity = async (
  payload: Payload,
  identity: OIDCIdentity,
) => {
  if (!identity.email || !identity.emailVerified) {
    throw new Error(
      "OIDC account creation requires a verified email address from the identity provider",
    );
  }

  return await payload.create({
    collection: "users",
    data: {
      email: identity.email,
      password: randomBase64Url(24),
      preferredName: identity.name,
      roles: "volunteer",
    },
    depth: 0,
    overrideAccess: true,
  });
};

const createUserIdentity = async (
  payload: Payload,
  user: User,
  identity: OIDCIdentity,
) =>
  await payload.create({
    collection: "user-identities",
    data: {
      emailAtLinkTime:
        identity.email && identity.emailVerified ? identity.email : undefined,
      issuer: identity.issuer,
      kind: "oidc",
      linkedAt: new Date().toISOString(),
      subject: identity.subject,
      user: user.id,
    },
    depth: 0,
    overrideAccess: true,
  });

const clearPendingLinksWhere = async (payload: Payload, where: Where) => {
  const result = await payload.find({
    collection: "oidc-pending-links",
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where,
  });

  await Promise.all(
    result.docs.map((doc) =>
      payload.delete({
        collection: "oidc-pending-links",
        id: doc.id,
        overrideAccess: true,
      }),
    ),
  );
};

const createPendingOidcLink = async (
  payload: Payload,
  user: User,
  identity: OIDCIdentity,
) => {
  if (!identity.email || !identity.emailVerified) {
    throw new Error(
      "OIDC account linking requires a verified email address from the identity provider",
    );
  }

  await clearPendingLinksWhere(payload, {
    or: [
      {
        user: {
          equals: user.id,
        },
      },
      {
        and: [
          {
            issuer: {
              equals: identity.issuer,
            },
          },
          {
            subject: {
              equals: identity.subject,
            },
          },
        ],
      },
    ],
  });

  const token = randomBase64Url(32);
  await payload.create({
    collection: "oidc-pending-links",
    data: {
      email: identity.email,
      expiresAt: buildExpiresAt(OIDC_PENDING_LINK_TTL_SECONDS),
      issuer: identity.issuer,
      name: identity.name,
      subject: identity.subject,
      token,
      user: user.id,
    },
    depth: 0,
    overrideAccess: true,
  });

  return token;
};

const deletePendingLinkById = async (
  payload: Payload,
  pendingLinkId: number | string,
) => {
  await payload.delete({
    collection: "oidc-pending-links",
    id: pendingLinkId,
    overrideAccess: true,
  });
};

const loadPendingLink = async (
  payload: Payload,
  token: string | undefined | null,
) => {
  const pendingToken = getPendingLinkToken(token);

  if (!pendingToken) {
    return null;
  }

  const result = await payload.find({
    collection: "oidc-pending-links",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      token: {
        equals: pendingToken,
      },
    },
  });

  const pendingLink =
    (result.docs[0] as OIDCPendingLinkDoc | undefined) ?? null;

  if (!pendingLink) {
    return null;
  }

  if (new Date(pendingLink.expiresAt).getTime() <= Date.now()) {
    await deletePendingLinkById(payload, pendingLink.id);
    return null;
  }

  const userId =
    typeof pendingLink.user === "number"
      ? pendingLink.user
      : pendingLink.user.id;
  const user = await findUserById(payload, userId);

  if (!user) {
    await deletePendingLinkById(payload, pendingLink.id);
    return null;
  }

  return {
    ...pendingLink,
    user,
  };
};

const verifyLocalPasswordForUser = async (
  payload: Payload,
  user: User,
  password: string,
) => {
  const collection = payload.collections.users.config;
  const rawUser = (await payload.db.findOne({
    collection: "users",
    where: {
      id: {
        equals: user.id,
      },
    },
  })) as RawAuthUser | null;

  if (!rawUser) {
    throw new Error("The local account could not be found");
  }

  if (rawUser.lockUntil && isUserLocked(new Date(rawUser.lockUntil))) {
    throw new Error("The password confirmation failed");
  }

  const authenticated = await authenticateLocalPassword(rawUser, password);

  if (!authenticated) {
    if (collection.auth.maxLoginAttempts > 0) {
      await incrementLoginAttempts({
        lockTime: collection.auth.lockTime,
        maxLoginAttempts: collection.auth.maxLoginAttempts,
        payload,
        user: rawUser,
      });
    }

    throw new Error("The password confirmation failed");
  }

  if (collection.auth.maxLoginAttempts > 0) {
    await resetLoginAttempts({
      payload,
      user: rawUser,
    });
  }
};

export const getOidcCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  maxAge,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
});

export const isOidcConfigured = () =>
  Boolean(
    process.env.SERVER_URL &&
      process.env.AUTHENTIK_ISSUER &&
      process.env.AUTHENTIK_CLIENT_ID &&
      process.env.AUTHENTIK_CLIENT_SECRET,
  );

export const getOidcLogoutUrl = async () => {
  if (!isOidcConfigured()) {
    return null;
  }

  const configuration = await getOidcConfiguration();
  const endSessionEndpoint =
    configuration.serverMetadata().end_session_endpoint;

  if (!endSessionEndpoint) {
    return null;
  }

  const url = new URL(endSessionEndpoint);
  url.searchParams.set(
    "post_logout_redirect_uri",
    new URL("/auth/signed-out", getServerUrl()).toString(),
  );

  return url;
};

export const createOidcAuthorizationRequest = async (
  returnTo?: string | null,
) => {
  const configuration = await getOidcConfiguration();
  const state = oidcClient.randomState();
  const nonce = randomBase64Url(24);
  const verifier = oidcClient.randomPKCECodeVerifier();
  const challenge = await oidcClient.calculatePKCECodeChallenge(verifier);

  const stateToken = jsonToSignedToken<OIDCState>(
    {
      exp: Math.floor(Date.now() / 1000) + OIDC_STATE_TTL_SECONDS,
      nonce,
      returnTo: sanitizeReturnTo(returnTo),
      state,
      verifier,
    },
    getSessionSecret(),
  );

  const url = oidcClient.buildAuthorizationUrl(configuration, {
    code_challenge: challenge,
    code_challenge_method: "S256",
    nonce,
    redirect_uri: getCallbackUrl(),
    scope: OIDC_SCOPE,
    state,
  });

  return { stateToken, url };
};

export const readOidcState = (token: string | undefined | null) => {
  if (!token) {
    return null;
  }

  const state = signedTokenToJson<OIDCState>(token, getSessionSecret());

  if (!state || state.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return state;
};

export const authenticateOidcCode = async (args: {
  code: string;
  expectedNonce: string;
  redirectUri?: string;
  verifier: string;
}) => {
  const configuration = await getOidcConfiguration();
  const issuer = await getAuthoritativeIssuer();
  const currentUrl = new URL(args.redirectUri ?? getCallbackUrl());
  currentUrl.searchParams.set("code", args.code);

  const tokens = await oidcClient.authorizationCodeGrant(
    configuration,
    currentUrl,
    {
      expectedNonce: args.expectedNonce,
      expectedState: oidcClient.skipStateCheck,
      pkceCodeVerifier: args.verifier,
    },
  );

  const idTokenClaims = tokens.claims();
  const idTokenIssuer = asOptionalString(idTokenClaims?.iss);

  if (idTokenIssuer && idTokenIssuer !== issuer) {
    throw new Error("OIDC ID token issuer did not match the configured issuer");
  }

  const userInfo = await fetchUserInfo(
    configuration,
    tokens.access_token,
    asOptionalString(idTokenClaims?.sub) ?? oidcClient.skipSubjectCheck,
  );
  const userInfoIssuer = asOptionalString(userInfo.iss);

  if (userInfoIssuer && userInfoIssuer !== issuer) {
    throw new Error("OIDC userinfo issuer did not match the configured issuer");
  }

  const subject =
    asOptionalString(userInfo.sub) ?? asOptionalString(idTokenClaims?.sub);
  const email =
    asOptionalString(userInfo.email) ?? asOptionalString(idTokenClaims?.email);
  const emailVerified =
    asOptionalBoolean(userInfo.email_verified) ??
    asOptionalBoolean(idTokenClaims?.email_verified) ??
    false;
  const name =
    asOptionalString(userInfo.name) ??
    asOptionalString(userInfo.preferred_username) ??
    asOptionalString(idTokenClaims?.name) ??
    asOptionalString(idTokenClaims?.preferred_username) ??
    "";

  if (!subject) {
    throw new Error("OIDC response did not include a subject");
  }

  return {
    email,
    emailVerified,
    issuer,
    name: normalizePreferredName(name, email),
    subject,
  } satisfies OIDCIdentity;
};

export const resolveOidcIdentity = async (
  payload: Payload,
  identity: OIDCIdentity,
) => {
  const linkedIdentity = await findLinkedIdentity(payload, identity);

  if (linkedIdentity) {
    const userId =
      typeof linkedIdentity.user === "number"
        ? linkedIdentity.user
        : linkedIdentity.user.id;
    const linkedUser = await findUserById(payload, userId);

    if (!linkedUser) {
      throw new Error("The linked OIDC account no longer has a local user");
    }

    await updateLinkedIdentityEmail(payload, linkedIdentity.id, identity);

    return {
      kind: "sign-in" as const,
      user: await updateLinkedUserFromOidcIdentity(
        payload,
        linkedUser,
        identity,
      ),
    };
  }

  const existingUser = await findExistingUserByVerifiedEmail(payload, identity);

  if (existingUser) {
    return {
      kind: "link-required" as const,
      token: await createPendingOidcLink(payload, existingUser, identity),
    };
  }

  const createdUser = await createUserFromOidcIdentity(payload, identity);
  await createUserIdentity(payload, createdUser, identity);

  return {
    kind: "sign-in" as const,
    user: createdUser,
  };
};

export const getPendingOidcLink = async (
  payload: Payload,
  token: string | undefined | null,
) => await loadPendingLink(payload, token);

export const clearPendingOidcLink = async (
  payload: Payload,
  token: string | undefined | null,
) => {
  const pendingToken = getPendingLinkToken(token);

  if (!pendingToken) {
    return;
  }

  await clearPendingLinksWhere(payload, {
    token: {
      equals: pendingToken,
    },
  });
};

export const confirmPendingOidcLink = async (args: {
  password: string;
  payload: Payload;
  token: string | undefined | null;
}) => {
  const pendingLink = await loadPendingLink(args.payload, args.token);

  if (!pendingLink) {
    throw new Error("The OIDC linking session is invalid or has expired");
  }

  try {
    await verifyLocalPasswordForUser(
      args.payload,
      pendingLink.user,
      args.password,
    );
    await createUserIdentity(args.payload, pendingLink.user, {
      email: pendingLink.email,
      emailVerified: true,
      issuer: pendingLink.issuer,
      name: pendingLink.name,
      subject: pendingLink.subject,
    });

    return pendingLink.user;
  } finally {
    await deletePendingLinkById(args.payload, pendingLink.id);
  }
};

export const describeOidcError = (error: unknown) => {
  const messages: string[] = [];
  const chain = flattenErrorChain(error);
  const actualAlg = chain.map(getErrorHeaderAlg).find(Boolean);
  const expectedAlg = chain
    .map(getErrorExpected)
    .map(formatExpectedValue)
    .find(Boolean);
  const errorReason = chain.map(getErrorReason).find(Boolean);

  for (const current of chain) {
    const message = getErrorMessage(current);

    if (message === 'unexpected JWT "alg" header parameter') {
      messages.push(
        [
          message,
          actualAlg ? `received ${actualAlg}` : undefined,
          expectedAlg ? `expected ${expectedAlg}` : undefined,
          errorReason ? `from ${errorReason}` : undefined,
        ]
          .filter(Boolean)
          .join(", "),
      );
    } else if (message && !GENERIC_OIDC_ERROR_MESSAGES.has(message)) {
      messages.push(message);
    }
  }

  if (messages.length > 0) {
    return messages[messages.length - 1];
  }

  const fallbackMessage =
    error instanceof Error ? error.message : "OIDC callback failed";
  const code = getErrorCode(error);

  if (code && code !== fallbackMessage) {
    return `${fallbackMessage} (${code})`;
  }

  return fallbackMessage;
};

export const oidcCookieNames = {
  pendingLink: OIDC_PENDING_LINK_COOKIE,
  state: OIDC_STATE_COOKIE,
};

export const resetOidcConfigurationCacheForTests = () => {
  oidcConfigPromise = null;
};
