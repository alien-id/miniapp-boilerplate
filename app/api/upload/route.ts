import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifyToken, extractBearerToken } from "@/features/auth/lib";
import { getServerEnv } from "@/lib/env";
import { JwtErrors } from "@alien_org/auth-client";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }
    await verifyToken(token);

    const env = getServerEnv();
    if (!env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Upload not configured (missing BLOB_READ_WRITE_TOKEN)" },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 2MB)" },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid type (use JPEG, PNG, or WebP)" },
        { status: 400 },
      );
    }

    const blob = await put(`avatars/${Date.now()}-${file.name}`, file, {
      access: "public",
      token: env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ data: { url: blob.url } });
  } catch (err: unknown) {
    if (err instanceof JwtErrors.JWTExpired) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (err instanceof JwtErrors.JOSEError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.error("POST /api/upload:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

