/**
 * Minimal authorized JSON fetcher for client-side hooks.
 *
 * Sends the Alien auth token as a Bearer header, parses the JSON response,
 * and throws an `Error` carrying the server's `{ error }` message on failure.
 */
export async function fetchApi(
  path: string,
  authToken: string,
  init?: Omit<RequestInit, "headers"> & { headers?: Record<string, string> },
): Promise<unknown> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${authToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `Request to ${path} failed (${res.status})`;
    throw new Error(message);
  }

  return body;
}
