import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createLocalReq, getPayload, logoutOperation } from "payload";
import {
  clearPendingOidcLink,
  getOidcLogoutUrl,
  oidcCookieNames,
} from "@/lib/auth/oidc";
import { buildExpiredPayloadAuthCookie } from "@/lib/auth/payload-session";
import config from "@/payload.config";

export const GET = async (request: NextRequest) => {
  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: request.headers });
  const redirectUrl =
    (await getOidcLogoutUrl()) ?? new URL("/auth/signed-out", request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (authResult.user) {
    const req = await createLocalReq({ user: authResult.user }, payload);

    await logoutOperation({
      allSessions: false,
      collection: payload.collections[authResult.user.collection],
      req,
    });
  }

  await clearPendingOidcLink(
    payload,
    request.cookies.get(oidcCookieNames.pendingLink)?.value,
  );

  const expiredAuthCookie = buildExpiredPayloadAuthCookie(payload);
  const { name, value, ...options } = expiredAuthCookie;
  response.cookies.set(name, value, options);
  response.cookies.delete(oidcCookieNames.pendingLink);
  response.cookies.delete(oidcCookieNames.state);

  return response;
};
