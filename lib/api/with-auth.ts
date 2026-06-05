import { NextResponse } from "next/server";
import { JwtErrors } from "@alien-id/miniapps-auth-client";
import { verifyToken, extractBearerToken, type TokenInfo } from "@/features/auth/lib";

export type AuthContext = {
  /** Verified JWT claims. `auth.sub` is the user's Alien ID. */
  auth: TokenInfo;
};

type AuthenticatedHandler = (
  request: Request,
  context: AuthContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a route handler with Bearer-token authentication.
 *
 * Extracts and verifies the `Authorization: Bearer <token>` header against
 * Alien's JWKS, then invokes the handler with the verified token claims.
 * Responds 401 for missing/expired/invalid tokens and 500 for unexpected
 * errors, so handlers only need to deal with their own business logic.
 */
export function withAuth(handler: AuthenticatedHandler): (request: Request) => Promise<NextResponse> {
  return async (request: Request) => {
    const token = extractBearerToken(request.headers.get("Authorization"));

    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 },
      );
    }

    try {
      const auth = await verifyToken(token);
      return await handler(request, { auth });
    } catch (error) {
      if (error instanceof JwtErrors.JWTExpired) {
        return NextResponse.json({ error: "Token expired" }, { status: 401 });
      }
      if (error instanceof JwtErrors.JOSEError) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      console.error(`Unhandled error in ${new URL(request.url).pathname}:`, error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
