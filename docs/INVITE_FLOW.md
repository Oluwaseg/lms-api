# Invite Flow (Parent -> Child)

Summary of the invite flow implemented in this codebase and how to use the endpoints.

Flow:

1. Parent creates a child via `POST /api/parents/children` (protected endpoint, parent must be authenticated).

   - Controller: `ParentController.createChild` -> Service: `ParentService.createChildAndInvite`
   - The service creates a child `User` (unverified) and a `ParentChild` link.
   - If an email was provided for the child, the service marks any previous unused tokens for that child as used (single-active-token),
     creates a new HMAC-hashed verification token (`VerificationToken.tokenHash`) and emails a raw token link to the child's email.

2. Child receives email with invite link or token. The raw token is only sent by email and is not stored in plaintext in the DB; the DB stores
   an HMAC of the token using `process.env.TOKEN_SECRET`.

3. Frontend verifies the token using `GET /api/invites/validate?token=...` (optional step to show a friendly UI).

   - Controller: `InviteController.validate` -> Service: `InviteService.validateToken`
   - The backend checks the HMAC(token) first, falls back to legacy sha256(token) for backward compatibility, verifies expiry and used flag.

4. Child accepts the invite by calling `POST /api/invites/complete` with `{ token, password }`.
   - Controller: `InviteController.accept` -> Service: `InviteService.acceptInvite`
   - The service validates the token, sets the child's bcrypt-hashed password, marks `user.isVerified = true`, and marks the token as used.
   - Optionally the service can return a JWT for automatic sign-in (controlled by `autoSignin` param in the service or controller behavior).

Security notes / hardening implemented here:

- Tokens are stored as HMAC-SHA256(token) using `process.env.TOKEN_SECRET`.
- When generating a new invite for the same child user, any previously unused tokens for that user are marked `used = true` (single active token).
- The `POST /api/invites/complete` endpoint is rate-limited (10 requests per hour per IP) by `src/utils/rateLimiter.ts`.
- The `POST /resend-verification` endpoints are rate-limited (6 requests per hour per IP).

Implementation points to review or extend:

- Consider persisting per-user single-active-token semantics in DB migrations if you change schema or want auditability.
- Replace the in-memory `rateLimiter` with a distributed store (Redis) for multi-instance deployments.
- Improve email templates and i18n in `src/utils/mailer.ts`.
