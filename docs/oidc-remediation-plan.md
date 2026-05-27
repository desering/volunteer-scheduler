# OIDC Remediation Plan

This document turns the current OIDC code review findings into a concrete
implementation plan for this codebase.

## Goals

1. Make OIDC production-safe as a primary login method.
2. Preserve access for existing username/password users.
3. Support linking a new OIDC identity to an existing local account when the
   email matches, but only after password confirmation.
4. Use Payload's real session system rather than a custom long-lived signed
   bearer cookie.
5. Remove avoidable trust and correctness issues in the current OIDC flow.

## Current Problems

The current implementation has five material issues:

1. It links by email implicitly on first OIDC login.
2. It uses a custom signed 31-day `oidc_session` cookie instead of a server-side
   Payload session.
3. It caches OIDC discovery failures permanently within the process.
4. It models identity inconsistently as `(issuer, subject)` in code but
   effectively `subject`-only in schema constraints.
5. It parses raw cookies manually and treats `userInfo.iss` as a stronger source
   of truth than the configured issuer.

## Design Decisions

### 1. Account linking policy

Adopt the following explicit policy:

1. OIDC login succeeds immediately when a linked identity already exists for the
   configured issuer and returned subject.
2. When no linked identity exists, but the OIDC email matches an existing local
   account:
   - Require the user to confirm ownership of the existing account using their
     current password.
   - Only after successful password confirmation, link the OIDC identity to that
     account.
3. When no linked identity exists and no local account with that email exists:
   - Create a new user account only if the IdP returned `email_verified: true`.
4. Do not silently link accounts from email alone.

This preserves existing users while preventing first-login account takeover.

### 2. Trust model for issuer and email

Treat the configured/discovered issuer as authoritative.

1. Persist the issuer from configuration/discovery, not from UserInfo.
2. Accept `email` for account creation or link candidates only when
   `email_verified` is true.
3. Assert that any `iss` returned in ID token or UserInfo, when
   present, matches the configured issuer; reject on mismatch.

### 3. Session model

Use Payload's built-in server-side auth sessions as the authenticated session of
record.

Implications:

1. The long-lived `oidc_session` cookie should be removed.
2. The OIDC state cookie is still required for the authorization-code flow.
3. After a successful OIDC callback and user resolution, the code must create a
   real Payload session for that user.
4. Subsequent request authentication should rely on Payload's session cookie and
   session storage, not on replaying a self-signed OIDC identity blob.

## Target Architecture

### Identity persistence

The current single `oidcIssuer` / `oidcSubject` fields are only adequate for one
linked OIDC identity per user. They do not scale to multiple providers or future
additional OIDC identities.

Recommended target:

1. Add a dedicated linked-identity structure.
2. Each linked identity stores:
   - `providerType` or `kind` (`oidc`)
   - `issuer`
   - `subject`
   - `emailAtLinkTime`
   - `linkedAt`
3. Enforce uniqueness on `(issuer, subject)`.

Implementation: Use a separate `user-identities` collection related to `users`.

## Implementation Plan

### Phase 1: Stabilize the current flow

This phase addresses the high-risk problems without waiting for larger schema
work.

#### 1. Replace manual cookie parsing

Files:

- `src/lib/auth/oidc.ts`
- any route handlers that call session/state helpers

Changes:

1. Remove the custom `parseCookieHeader` function.
2. Stop passing raw `Headers` into OIDC cookie readers when parsed cookies are
   already available at the route layer.
3. Refactor helpers so they accept direct cookie values where possible:
   - `readOidcState(token: string | undefined | null)`
   - remove `readOidcSession` entirely once the custom session cookie is removed
4. Use `request.cookies.get(...)` in Next route handlers.

Result:

- no raw-cookie parsing in this auth code
- no request-level crash from malformed percent-encoding in arbitrary cookies

#### 2. Fix issuer handling

Files:

- `src/lib/auth/oidc.ts`

Changes:

1. Extend the user info / claims typing to include `email_verified`.
2. Resolve the authoritative issuer from `getIssuer()` or discovered metadata.
3. If `idTokenClaims.iss` exists and does not match the configured issuer,
   reject the login.
4. If `userInfo.iss` exists and does not match the configured issuer, reject the
   login.
5. Persist the configured issuer as the linked identity issuer.

Result:

- one source of truth for provider identity
- no drift introduced by UserInfo

#### 3. Fix discovery memoization

Files:

- `src/lib/auth/oidc.ts`

Changes:

1. Keep memoization for the success path.
2. If discovery fails, clear the cached promise so the next request can retry.
3. Consider optional short-lived caching with a timestamp if repeated failures
   become noisy, but do not permanently cache rejection.

Result:

- transient IdP/discovery outage does not poison the process

### Phase 2: Replace the custom OIDC session with Payload sessions

This is the most important architectural fix.

#### 4. Remove the custom authenticated OIDC cookie

Files:

- `src/lib/auth/oidc.ts`
- `src/app/(scheduler)/auth/oidc/callback/route.ts`
- `src/app/(scheduler)/auth/oidc/logout/route.ts`
- `src/collections/users/index.ts`

Changes:

1. Delete:
   - `OIDC_SESSION_COOKIE`
   - `OIDCSession`
   - `createOidcSessionToken`
   - `readOidcSession`
   - `authenticateWithOidcSession`
2. Remove the custom `oidc` auth strategy from the users collection if it only
   exists to read that cookie.
3. Keep only the OIDC state cookie used between authorization start and callback.

Result:

- the application no longer authenticates requests from a long-lived self-signed
  identity cookie

#### 5. Establish a real Payload session after OIDC login

Files:

- `src/app/(scheduler)/auth/oidc/callback/route.ts`
- possibly a new helper under `src/lib/auth/`

Changes:

1. After resolving the OIDC identity to a concrete user, create a real Payload
   authenticated session for that user.
2. Ensure the callback response sets the same auth/session cookies that standard
   Payload login uses.
3. Use Payload's own session expiration, revocation, and logout semantics.

Implementation note from the current codebase:

1. `src/actions/auth/sign-in.ts` uses `@payloadcms/next/auth` `login(...)`.
2. That helper delegates to `payload.login(...)` and then
   `setPayloadAuthCookie(...)`.
3. Payload's internal login flow also calls `addSessionToUser(...)` and
   `jwtSign(...)`, so a valid session under `auth.useSessions: true` is not just
   a cookie; it also requires a server-side session record with a `sid`.

Open implementation task:

1. Prefer a first-party public API if one exists for "log this already-resolved
   user in".
2. If Payload does not expose that directly, implement a narrow helper that
   mirrors Payload's internal sequence for an already-authenticated user:
   - create local req
   - add session to user
   - sign JWT with the correct fields including `sid`
   - set the Payload auth cookie
3. Do not keep the custom `oidc_session` cookie as a fallback.

Acceptance criteria:

1. After OIDC login, the browser holds Payload's normal auth/session cookies.
2. The app recognizes the user on subsequent requests without any custom OIDC
   session cookie.
3. Logging out invalidates the Payload session and clears any OIDC state cookie.

#### 6. Update logout flow

Files:

- `src/app/(scheduler)/auth/oidc/logout/route.ts`

Changes:

1. Log the user out locally from Payload first.
2. Clear the OIDC state cookie.
3. Redirect to the IdP logout endpoint if available.
4. If IdP logout is unavailable, still complete local logout safely.

Result:

- local session state and IdP logout are both handled correctly

### Phase 3: Implement safe account linking for existing users

#### 7. Distinguish login, link-candidate, and new-account flows

Files:

- `src/lib/auth/oidc.ts`
- `src/app/(scheduler)/auth/oidc/callback/route.ts`
- likely new routes/actions/pages for link confirmation

Changes:

Split the current `syncOidcUser` behavior into explicit flows:

1. `findLinkedUserByOidcIdentity(...)`
2. `findExistingUserByVerifiedEmail(...)`
3. `createUserFromOidcIdentity(...)`
4. `linkOidcIdentityToExistingUser(...)`

Callback behavior:

1. If linked identity exists:
   - sign in that user
2. Else if verified email matches an existing user:
   - do not log in yet
   - create a short-lived pending-link state
   - redirect to a password confirmation step
3. Else:
   - create the new account
   - create Payload session

#### 8. Add pending-link state

Purpose:

The callback needs a secure way to carry "OIDC identity passed validation, but
must still be linked to an existing password account" into the password
confirmation step.

Implementation options:

1. Short-lived signed cookie containing:
   - issuer
   - subject
   - verified email
   - display name
   - expiry
2. Short-lived server-side record keyed by opaque nonce

Recommendation:

Use a short-lived server-side record if practical. If not, a signed short-lived
cookie is acceptable for the pending-link step because it is not itself the auth
session of record.

Requirements:

1. TTL around 10 minutes.
2. Single-use if stored server-side.
3. Cleared on success, failure, or cancellation.

#### 9. Add password-confirmed linking flow

Files:

- new route/action/page under `src/app/(scheduler)/auth/`
- `src/lib/auth/oidc.ts`

Behavior:

1. User returns from IdP.
2. OIDC identity is valid but not yet linked.
3. App prompts for the existing local password.
4. Password is verified against the matched local account.
5. On success:
   - create the link
   - create a real Payload session
6. On failure:
   - do not create the link
   - do not log the user in

Security requirements:

1. Rate-limit or rely on existing auth throttling where applicable.
2. Do not disclose unnecessary account details beyond the matched email.
3. Ensure the link step is bound to the validated pending OIDC identity, not to
   arbitrary form input.

#### 10. Require verified email for account creation and candidate linking

Files:

- `src/lib/auth/oidc.ts`

Changes:

1. Parse `email_verified` from claims / UserInfo.
2. Reject flows that need an email when no verified email is present.
3. Distinguish between:
   - existing linked identity by `(issuer, subject)` which may still sign in even
     if UserInfo omits email on a later request
   - new account creation or email-based candidate matching, which require a
     verified email

Result:

- email is treated as a trusted linking attribute only when the IdP actually
  vouches for it

### Phase 4: Clean up identity storage

#### 11. Replace single OIDC fields with linked identities

Preferred files:

- `src/collections/users/index.ts`
- new identity collection file
- generated Payload types
- migration files

Changes:

1. Introduce a linked-identity data model.
2. Add uniqueness on `(issuer, subject)`.
3. Update lookup and link code to query linked identities instead of user fields.
4. Remove legacy fields once migration is complete and code no longer depends on
   them.

Interim option:

If a full model split is too much for the first iteration, retain current fields
temporarily but document that:

1. only one OIDC identity per user is supported
2. only one issuer is supported
3. the schema is transitional

### Phase 5: Verification and hardening

#### 12. Add tests for the security-sensitive branches

Add targeted tests for:

1. successful OIDC login with existing linked identity
2. new-account creation with verified email
3. refusal to create account when `email_verified` is absent or false
4. email match with existing password user requires password confirmation
5. failed password confirmation does not link or log in
6. successful password confirmation links identity and creates Payload session
7. repeated login after linking resolves by `(issuer, subject)`
8. discovery failure does not poison future requests
9. issuer mismatch between config and returned claims is rejected
10. logout clears local session and state cookie
11. deleted or disabled users are not silently recreated from stale auth state

#### 13. Add migration and rollout notes

Document operational rollout steps:

1. deploy schema changes first
2. keep password login enabled during migration
3. enable OIDC login entry point
4. monitor first-link events and failures
5. only later consider reducing password-login prominence if desired

## Detailed Code Changes

### `src/lib/auth/oidc.ts`

Refactor this file from "does everything" into smaller responsibilities:

1. provider configuration and discovery
2. authorization request generation
3. callback token exchange and claims extraction
4. identity lookup / link / creation helpers
5. pending-link helpers

Delete from this file:

1. custom authenticated session token code
2. manual cookie parser

Add to this file:

1. `email_verified` parsing
2. authoritative issuer enforcement
3. retry-safe discovery caching
4. explicit link-candidate vs linked-user resolution helpers

### `src/app/(scheduler)/auth/oidc/start/route.ts`

Keep this route simple:

1. create state cookie
2. redirect to authorization URL
3. handle startup/configuration failures cleanly

No major behavioral change beyond any helper signature updates.

### `src/app/(scheduler)/auth/oidc/callback/route.ts`

This route needs the largest redesign.

New responsibilities:

1. validate returned `state`
2. exchange code for tokens
3. validate issuer and extract verified identity attributes
4. resolve one of three outcomes:
   - existing linked user
   - existing password user needing link confirmation
   - new user creation
5. create Payload session only after the user is fully resolved
6. clear temporary state artifacts

### `src/app/(scheduler)/auth/oidc/logout/route.ts`

Change this route to:

1. terminate the local Payload session
2. clear temporary OIDC cookies
3. redirect to the provider logout endpoint if configured

### `src/collections/users/index.ts`

Planned changes depend on whether linked identities are normalized now or later.

At minimum:

1. remove the custom OIDC session-based auth strategy
2. keep Payload session auth as the actual auth mechanism

If moving to linked identities now:

1. remove `oidcIssuer`
2. remove `oidcSubject`
3. add relation to linked identities if needed for admin visibility

## Recommended Execution Order

1. Fix discovery caching, cookie parsing, and issuer handling.
2. Replace custom OIDC session with Payload session creation in the callback.
3. Implement pending-link plus password-confirmed linking.
4. Add `email_verified` enforcement.
5. Move to a linked-identity data model.
6. Add test coverage for all security-sensitive paths.

## Acceptance Criteria

The OIDC work is ready for production only when all of the following are true:

1. No request authentication depends on a custom self-signed long-lived OIDC
   cookie.
2. Local authenticated state is represented by Payload sessions.
3. Existing users with matching verified email must confirm their password
   before a new OIDC identity is linked.
4. New account creation from OIDC requires verified email.
5. Linked identity resolution uses a stable identity key with correct uniqueness.
6. Discovery failures are retryable without process restart.
7. No raw cookie parsing remains in this OIDC auth path.
8. Issuer handling uses configuration/discovery as the source of truth.
9. Automated tests cover the major success and failure paths.

## Notes on Scope

There are two reasonable implementation slices:

### Minimal secure slice

1. keep single-provider assumption
2. keep current user fields temporarily
3. add password-confirmed link flow
4. enforce `email_verified`
5. replace custom session with Payload session
6. fix discovery/cookies/issuer handling

This is the fastest route to a safe production rollout.

### Full identity-model slice

1. all of the above
2. introduce first-class linked identities
3. support future multiple providers cleanly

This is the better long-term model, but it is a larger change.

## Recommendation

Implement the minimal secure slice first, but structure the code so the linked
identity model can be introduced without rewriting the callback flow again.
