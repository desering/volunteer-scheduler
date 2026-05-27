import { pbkdf2, randomUUID, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Payload } from "payload";

const pbkdf2Async = promisify(pbkdf2);

export type RawAuthUser = {
  hash?: string | null;
  id: number;
  lockUntil?: string | null;
  loginAttempts?: number | null;
  salt?: string | null;
  sessions?: Array<{
    createdAt?: Date | string | null;
    expiresAt: Date | string;
    id: string;
  }> | null;
  updatedAt?: Date | string | null;
};

export const isUserLocked = (date?: Date | null) =>
  Boolean(date && date.getTime() > Date.now());

export const authenticateLocalPassword = async (
  user: Pick<RawAuthUser, "hash" | "salt">,
  password: string,
) => {
  if (typeof user.hash !== "string" || typeof user.salt !== "string") {
    return false;
  }

  const derived = await pbkdf2Async(password, user.salt, 25000, 512, "sha256");
  const stored = Buffer.from(user.hash, "hex");

  return derived.length === stored.length && timingSafeEqual(derived, stored);
};

export const removeExpiredSessions = (
  sessions: NonNullable<RawAuthUser["sessions"]>,
) => {
  const now = Date.now();

  return sessions.filter((session) => {
    const expiresAt =
      session.expiresAt instanceof Date
        ? session.expiresAt.getTime()
        : new Date(session.expiresAt).getTime();

    return expiresAt > now;
  });
};

export const addSessionToUser = async (args: {
  payload: Payload;
  tokenExpiration: number;
  user: RawAuthUser;
}) => {
  const sid = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + args.tokenExpiration * 1000);
  const sessions = removeExpiredSessions(args.user.sessions ?? []);

  sessions.push({
    createdAt: now,
    expiresAt,
    id: sid,
  });

  args.user.sessions = sessions;
  args.user.updatedAt = null;

  await args.payload.db.updateOne({
    id: args.user.id,
    collection: "users",
    data: args.user,
    returning: false,
  });

  return { sid };
};

export const revokeSession = async (args: {
  payload: Payload;
  sid: string;
  user: RawAuthUser;
}) => {
  const sessions = (args.user.sessions ?? []).filter(
    (session) => session.id !== args.sid,
  );

  await args.payload.db.updateOne({
    id: args.user.id,
    collection: "users",
    data: {
      sessions,
      updatedAt: null,
    },
    returning: false,
  });
};

export const incrementLoginAttempts = async (args: {
  lockTime: number;
  maxLoginAttempts: number;
  payload: Payload;
  user: RawAuthUser;
}) => {
  const currentLoginAttempts = args.user.loginAttempts ?? 0;
  const currentLockUntil = args.user.lockUntil
    ? new Date(args.user.lockUntil)
    : null;

  if (currentLockUntil && !isUserLocked(currentLockUntil)) {
    await args.payload.db.updateOne({
      id: args.user.id,
      collection: "users",
      data: {
        lockUntil: null,
        loginAttempts: 1,
      },
      returning: false,
    });
    return;
  }

  const nextAttempts = currentLoginAttempts + 1;
  const lockUntil =
    nextAttempts >= args.maxLoginAttempts
      ? new Date(Date.now() + args.lockTime).toISOString()
      : null;

  await args.payload.db.updateOne({
    id: args.user.id,
    collection: "users",
    data: {
      lockUntil,
      loginAttempts: nextAttempts,
    },
    returning: false,
  });
};

export const resetLoginAttempts = async (args: {
  payload: Payload;
  user: RawAuthUser;
}) => {
  if (!args.user.lockUntil && !args.user.loginAttempts) {
    return;
  }

  await args.payload.db.updateOne({
    id: args.user.id,
    collection: "users",
    data: {
      lockUntil: null,
      loginAttempts: 0,
    },
    returning: false,
  });
};
