import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import {
  authenticateOidcCode,
  createOidcSessionToken,
  describeOidcError,
  getOidcCookieOptions,
  isOidcConfigured,
  logOidcError,
  oidcCookieNames,
  readOidcState,
  syncOidcUser,
} from "@/lib/auth/oidc";
import config from "@/payload.config";

export const GET = async (request: NextRequest) => {
  const redirectUrl = new URL("/auth/sign-in", request.url);

  if (!isOidcConfigured()) {
    redirectUrl.searchParams.set("error", "oidc-not-configured");
    return NextResponse.redirect(redirectUrl);
  }

  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    redirectUrl.searchParams.set("error", error);
    return NextResponse.redirect(redirectUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get(oidcCookieNames.state)?.value;
  const state = readOidcState(stateCookie);

  if (!code || !returnedState || !state || state.state !== returnedState) {
    redirectUrl.searchParams.set("error", "invalid-oidc-state");
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(oidcCookieNames.state);
    return response;
  }

  try {
    const identity = await authenticateOidcCode({
      code,
      expectedNonce: state.nonce,
      redirectUri: request.url,
      verifier: state.verifier,
    });

    const payload = await getPayload({ config });
    await syncOidcUser(payload, identity);

    const response = NextResponse.redirect(
      new URL(state.returnTo || "/", request.url),
    );

    response.cookies.set(
      oidcCookieNames.session,
      createOidcSessionToken(identity),
      getOidcCookieOptions(31 * 24 * 60 * 60),
    );
    response.cookies.delete(oidcCookieNames.state);

    return response;
  } catch (callbackError) {
    logOidcError(callbackError);
    redirectUrl.searchParams.set("error", describeOidcError(callbackError));
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(oidcCookieNames.state);
    return response;
  }
};
