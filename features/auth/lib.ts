import { createAuthClient, type AuthClient } from "@alien-id/miniapps-auth-client";
import { getServerEnv } from "@/lib/env";

let authClient: AuthClient | null = null;

function getAuthClient(): AuthClient {
  if (!authClient) {
    const env = getServerEnv();
    authClient = createAuthClient({
      audience: env.ALIEN_AUDIENCE,
      jwksUrl: env.ALIEN_JWKS_URL,
    });
  }
  return authClient;
}

export type TokenInfo = Awaited<ReturnType<AuthClient["verifyToken"]>>;

export function verifyToken(accessToken: string): Promise<TokenInfo> {
  return getAuthClient().verifyToken(accessToken);
}

export function extractBearerToken(header: string | null): string | null {
  // Auth schemes are case-insensitive per RFC 9110.
  const match = header?.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}
