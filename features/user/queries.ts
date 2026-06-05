import { db, schema } from "@/lib/db";
import type { User } from "@/lib/db/schema";

/**
 * Atomic upsert: creates the user on first sight, bumps `updatedAt` on
 * subsequent auths. A single statement avoids the check-then-insert race
 * between concurrent requests for the same Alien ID.
 */
export async function findOrCreateUser(alienId: string): Promise<User> {
  const [user] = await db
    .insert(schema.users)
    .values({ alienId })
    .onConflictDoUpdate({
      target: schema.users.alienId,
      set: { updatedAt: new Date() },
    })
    .returning();
  return user;
}
