import { getFieldsToSign, jwtSign, type Payload } from "payload";
import type { User } from "@/payload-types";
import { addSessionToUser, revokeSession } from "./payload-auth-helpers";

type PayloadCookie = {
  domain?: string;
  expires: Date;
  httpOnly: true;
  name: string;
  path: "/";
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  value: string;
};

const getUsersAuthConfig = (payload: Payload) => {
  const authConfig = payload.collections.users?.config.auth;

  if (!authConfig) {
    throw new Error("Users collection auth is not configured");
  }

  return authConfig;
};

export const buildPayloadAuthCookie = (
  payload: Payload,
  token: string,
): PayloadCookie => {
  const authConfig = getUsersAuthConfig(payload);
  const sameSite =
    typeof authConfig.cookies.sameSite === "string"
      ? authConfig.cookies.sameSite.toLowerCase()
      : "lax";

  return {
    domain: authConfig.cookies.domain ?? undefined,
    expires: new Date(Date.now() + authConfig.tokenExpiration * 1000),
    httpOnly: true,
    name: `${payload.config.cookiePrefix}-token`,
    path: "/",
    sameSite:
      sameSite === "strict" || sameSite === "none" || sameSite === "lax"
        ? sameSite
        : "lax",
    secure: authConfig.cookies.secure ?? false,
    value: token,
  };
};

export const buildExpiredPayloadAuthCookie = (
  payload: Payload,
): PayloadCookie =>
  ({
    ...buildPayloadAuthCookie(payload, ""),
    expires: new Date(0),
    value: "",
  }) satisfies PayloadCookie;

export const createPayloadSessionForUser = async (
  payload: Payload,
  user: User,
) => {
  const authConfig = getUsersAuthConfig(payload);
  const sessionUser = {
    ...user,
    collection: "users" as const,
  };
  let sid: string | undefined;

  try {
    const session = await addSessionToUser({
      payload,
      tokenExpiration: authConfig.tokenExpiration,
      user: sessionUser,
    });

    sid = session.sid;

    const { token } = await jwtSign({
      fieldsToSign: getFieldsToSign({
        collectionConfig: payload.collections.users.config,
        email: user.email,
        sid,
        user: sessionUser,
      }),
      secret: payload.secret,
      tokenExpiration: authConfig.tokenExpiration,
    });

    return {
      cookie: buildPayloadAuthCookie(payload, token),
      token,
    };
  } catch (error) {
    if (sid) {
      await revokeSession({
        payload,
        sid,
        user: sessionUser,
      });
    }

    throw error;
  }
};
