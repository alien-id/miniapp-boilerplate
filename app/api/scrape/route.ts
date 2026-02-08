import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { ScrapeRequest } from "@/features/cards/dto";

const LINKEDIN_ACTOR = "scrapier~linkedin-profile-scraper";

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    if (!env.APIFY_API_TOKEN) {
      return NextResponse.json(
        { error: "Scrape not configured (missing APIFY_API_TOKEN)" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = ScrapeRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const url = parsed.data.url;
    if (!url.includes("linkedin.com")) {
      return NextResponse.json(
        { error: "Only LinkedIn profile URLs are supported for auto-fill" },
        { status: 400 },
      );
    }

    const runUrl = `https://api.apify.com/v2/acts/${LINKEDIN_ACTOR}/run-sync-get-dataset-items?token=${env.APIFY_API_TOKEN}`;
    const res = await fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: [url] }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Apify error:", res.status, text);
      return NextResponse.json(
        { error: "Scrape failed", details: text.slice(0, 200) },
        { status: 502 },
      );
    }

    const items = (await res.json()) as Array<Record<string, unknown>>;
    const first = items?.[0];
    if (!first) {
      return NextResponse.json({
        data: { name: null, title: null, bio: null, avatarUrl: null },
      });
    }

    const name = [first.fullName, first.name].find((v) => typeof v === "string") as
      | string
      | undefined;
    const title = [first.headline, first.title, first.jobTitle].find(
      (v) => typeof v === "string",
    ) as string | undefined;
    const bio = [first.summary, first.about, first.bio].find((v) => typeof v === "string") as
      | string
      | undefined;
    const avatarUrl = [first.profileImage, first.imageUrl, first.photo].find(
      (v) => typeof v === "string",
    ) as string | undefined;

    return NextResponse.json({
      data: {
        name: name ?? null,
        title: title ?? null,
        bio: bio?.slice(0, 280) ?? null,
        avatarUrl: avatarUrl ?? null,
      },
    });
  } catch (error) {
    console.error("POST /api/scrape:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
