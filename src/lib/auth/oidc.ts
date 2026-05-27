import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import * as oidcClient from "openid-client";
import type { Payload } from "payload";
import { logger } from "@/lib/logger";
import type { User } from "@/payload-types";

const OIDC_SESSION_COOKIE = "oidc_session";
const OIDC_STATE_COOKIE = "oidc_state";
const OIDC_SESSION_TTL_SECONDS = 31 * 24 * 60 * 60;
const OIDC_STATE_TTL_SECONDS = 10 * 60;
const OIDC_SCOPE = "openid profile email";

type OIDCState = {
  exp: number;
  nonce: string;
  returnTo: string;
  state: string;
  verifier: string;
};

type OIDCSession = {
  email: string;
  exp: number;
  iss: string;
  name: string;
  sub: string;
};

type OIDCIdentity = {
  email: string;
  iss: string;
  name: string;
  sub: string;
};

type OIDCUserInfo = {
  email?: string;
  iss?: string;
  name?: string;
  preferred_username?: string;
  sub?: string;
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

const decodeJwtHeader = (jwt: string) => {
  const [header] = jwt.split(".");

  if (!header) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(header).toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
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

const normalizePreferredName = (name: string, email: string) => {
  const fallback = email.split("@")[0] || "Volunteer";
  const candidate = name.trim() || fallback;
  return candidate.slice(0, 50);
};

const asOptionalString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

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

const parseCookieHeader = (cookieHeader: string | null) => {
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index === -1) {
          return [part, ""] as const;
        }

        return [
          part.slice(0, index),
          decodeURIComponent(part.slice(index + 1)),
        ] as const;
      }),
  );
};

const getCallbackUrl = () =>
  new URL("/auth/oidc/callback", getServerUrl()).toString();

const sanitizeReturnTo = (returnTo?: string | null) => {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/";
  }

  return returnTo;
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
      .then((configuration) => {
        configuration[oidcClient.customFetch] = async (input, init) => {
          const response = await fetch(input, init);
          const url = input instanceof Request ? input.url : input.toString();

          if (
            url.includes("/token") &&
            response.headers.get("content-type")?.includes("application/json")
          ) {
            try {
              const body = (await response.clone().json()) as {
                id_token?: unknown;
              };

              if (typeof body.id_token === "string") {
                logger.error(
                  { jwtHeader: decodeJwtHeader(body.id_token) },
                  "OIDC token response header",
                );
              }
            } catch (error) {
              logger.warn(
                { err: error },
                "Failed to inspect OIDC token response header",
              );
            }
          }

          return response;
        };

        return configuration;
      });
  }

  return oidcConfigPromise;
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

export const readOidcState = (token: string | undefined) => {
  if (!token) {
    return null;
  }

  const state = signedTokenToJson<OIDCState>(token, getSessionSecret());

  if (!state || state.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return state;
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

export const authenticateOidcCode = async (args: {
  code: string;
  expectedNonce: string;
  redirectUri?: string;
  verifier: string;
}) => {
  const configuration = await getOidcConfiguration();
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
  const userInfo = await fetchUserInfo(
    configuration,
    tokens.access_token,
    idTokenClaims?.sub ?? oidcClient.skipSubjectCheck,
  );

  const issuer =
    asOptionalString(userInfo.iss) ??
    asOptionalString(idTokenClaims?.iss) ??
    getIssuer();
  const subject =
    asOptionalString(userInfo.sub) ?? asOptionalString(idTokenClaims?.sub);
  const email =
    asOptionalString(userInfo.email) ?? asOptionalString(idTokenClaims?.email);
  const name =
    asOptionalString(userInfo.name) ??
    asOptionalString(userInfo.preferred_username) ??
    asOptionalString(idTokenClaims?.name) ??
    asOptionalString(idTokenClaims?.preferred_username) ??
    "";

  if (!subject) {
    throw new Error("OIDC response did not include a subject");
  }

  if (!email) {
    throw new Error("OIDC response did not include an email address");
  }

  return {
    email,
    iss: issuer,
    name: normalizePreferredName(name, email),
    sub: subject,
  } satisfies OIDCIdentity;
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

export const logOidcError = (error: unknown) => {
  logger.error({ err: error }, "OIDC callback failed");
};

export const createOidcSessionToken = (identity: OIDCIdentity) =>
  jsonToSignedToken<OIDCSession>(
    {
      ...identity,
      exp: Math.floor(Date.now() / 1000) + OIDC_SESSION_TTL_SECONDS,
    },
    getSessionSecret(),
  );

export const readOidcSession = (headers: Headers) => {
  const cookies = parseCookieHeader(headers.get("cookie"));
  const token = cookies.get(OIDC_SESSION_COOKIE);

  if (!token) {
    return null;
  }

  const session = signedTokenToJson<OIDCSession>(token, getSessionSecret());

  if (!session || session.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return session;
};

const findUserByOidcIdentity = async (
  payload: Payload,
  identity: OIDCIdentity,
): Promise<User | null> => {
  const result = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          oidcIssuer: {
            equals: identity.iss,
          },
        },
        {
          oidcSubject: {
            equals: identity.sub,
          },
        },
      ],
    },
  });

  return result.docs[0] ?? null;
};

const findUserByEmail = async (
  payload: Payload,
  email: string,
): Promise<User | null> => {
  const result = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      email: {
        equals: email,
      },
    },
  });

  return result.docs[0] ?? null;
};

export const syncOidcUser = async (
  payload: Payload,
  identity: OIDCIdentity,
): Promise<User> => {
  const existingByIdentity = await findUserByOidcIdentity(payload, identity);

  if (existingByIdentity) {
    const updateData: Record<string, string> = {};

    if (existingByIdentity.email !== identity.email) {
      updateData.email = identity.email;
    }

    if (existingByIdentity.preferredName !== identity.name) {
      updateData.preferredName = identity.name;
    }

    if (Object.keys(updateData).length === 0) {
      return existingByIdentity;
    }

    return await payload.update({
      collection: "users",
      data: updateData,
      depth: 0,
      id: existingByIdentity.id,
      overrideAccess: true,
    });
  }

  const existingByEmail = await findUserByEmail(payload, identity.email);

  if (existingByEmail) {
    if (
      existingByEmail.oidcSubject &&
      existingByEmail.oidcSubject !== identity.sub
    ) {
      throw new Error(
        "The matched local user is already linked to a different OIDC subject",
      );
    }

    return await payload.update({
      collection: "users",
      data: {
        oidcIssuer: identity.iss,
        oidcSubject: identity.sub,
        preferredName: identity.name,
      },
      depth: 0,
      id: existingByEmail.id,
      overrideAccess: true,
    });
  }

  return await payload.create({
    collection: "users",
    data: {
      email: identity.email,
      oidcIssuer: identity.iss,
      oidcSubject: identity.sub,
      password: randomBase64Url(24),
      preferredName: identity.name,
      roles: "volunteer",
    },
    depth: 0,
    overrideAccess: true,
  });
};

export const authenticateWithOidcSession = async ({
  headers,
  payload,
}: {
  headers: Headers;
  payload: Payload;
}) => {
  const session = readOidcSession(headers);

  if (!session) {
    return { user: null };
  }

  const user = await syncOidcUser(payload, session);

  return {
    user,
  };
};

export const oidcCookieNames = {
  session: OIDC_SESSION_COOKIE,
  state: OIDC_STATE_COOKIE,
};
