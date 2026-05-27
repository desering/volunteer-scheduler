import config from "@payload-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { clearPendingOidcLink, oidcCookieNames } from "@/lib/auth/oidc";

export const GET = async (request: NextRequest) => {
  const payload = await getPayload({ config });

  await clearPendingOidcLink(
    payload,
    request.cookies.get(oidcCookieNames.pendingLink)?.value,
  );

  const response = NextResponse.redirect(new URL("/auth/sign-in", request.url));
  response.cookies.delete(oidcCookieNames.pendingLink);

  return response;
};
