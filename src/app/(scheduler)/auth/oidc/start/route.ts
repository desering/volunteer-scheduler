import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createOidcAuthorizationRequest,
  getOidcCookieOptions,
  isOidcConfigured,
  oidcCookieNames,
} from "@/lib/auth/oidc";

export const GET = async (request: NextRequest) => {
  if (!isOidcConfigured()) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=oidc-not-configured", request.url),
    );
  }

  try {
    const { stateToken, url } = await createOidcAuthorizationRequest(
      request.nextUrl.searchParams.get("returnTo"),
    );
    const response = NextResponse.redirect(url);

    response.cookies.set(
      oidcCookieNames.state,
      stateToken,
      getOidcCookieOptions(10 * 60),
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start OIDC sign-in";
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?error=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
};
