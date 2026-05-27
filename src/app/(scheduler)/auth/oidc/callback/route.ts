import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import {
  authenticateOidcCode,
  describeOidcError,
  getOidcCookieOptions,
  isOidcConfigured,
  oidcCookieNames,
  readOidcState,
  resolveOidcIdentity,
} from "@/lib/auth/oidc";
import { createPayloadSessionForUser } from "@/lib/auth/payload-session";
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
    const resolution = await resolveOidcIdentity(payload, identity);

    if (resolution.kind === "link-required") {
      const response = NextResponse.redirect(
        new URL("/auth/oidc/link", request.url),
      );
      response.cookies.set(
        oidcCookieNames.pendingLink,
        resolution.token,
        getOidcCookieOptions(10 * 60),
      );
      response.cookies.delete(oidcCookieNames.state);
      return response;
    }

    const session = await createPayloadSessionForUser(payload, resolution.user);

    const response = NextResponse.redirect(
      new URL(state.returnTo || "/", request.url),
    );
    const { name, value, ...options } = session.cookie;

    response.cookies.set(name, value, options);
    response.cookies.delete(oidcCookieNames.pendingLink);
    response.cookies.delete(oidcCookieNames.state);

    return response;
  } catch (callbackError) {
    redirectUrl.searchParams.set("error", describeOidcError(callbackError));
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(oidcCookieNames.pendingLink);
    response.cookies.delete(oidcCookieNames.state);
    return response;
  }
};
