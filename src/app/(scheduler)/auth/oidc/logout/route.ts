import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getOidcCookieOptions,
  getOidcLogoutUrl,
  oidcCookieNames,
} from "@/lib/auth/oidc";

export const GET = async (request: NextRequest) => {
  const redirectUrl =
    (await getOidcLogoutUrl()) ?? new URL("/auth/signed-out", request.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(oidcCookieNames.session, "", getOidcCookieOptions(0));
  response.cookies.set(oidcCookieNames.state, "", getOidcCookieOptions(0));

  return response;
};
