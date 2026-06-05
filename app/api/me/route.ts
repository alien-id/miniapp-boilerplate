import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import { findOrCreateUser } from "@/features/user/queries";

export const GET = withAuth(async (_request, { auth }) => {
  const user = await findOrCreateUser(auth.sub);

  return NextResponse.json({
    id: user.id,
    alienId: user.alienId,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
});
