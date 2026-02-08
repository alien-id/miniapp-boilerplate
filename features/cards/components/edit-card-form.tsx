"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAlien } from "@alien_org/react";
import toast from "react-hot-toast";
import type { CardDTO } from "../hooks/use-my-card";

const MAX_BIO = 280;
const MAX_NAME = 48;
const MAX_TITLE = 120;

export function EditCardForm({
  cardId,
  initial,
}: {
  cardId: string;
  initial: CardDTO | null;
}) {
  const router = useRouter();
  const { authToken } = useAlien();
  const [loading, setLoading] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  useEffect(() => {
    if (!initial) return;
    setAvatarUrl(initial.avatarUrl ?? "");
    setBannerUrl(initial.bannerUrl ?? "");
    setName(initial.name);
    setTitle(initial.title ?? "");
    setBio(initial.bio ?? "");
    setPortfolioUrl(initial.portfolioUrl ?? "");
    setLinkedinUrl(initial.linkedinUrl ?? "");
    setTwitterUrl(initial.twitterUrl ?? "");
    setInstagramUrl(initial.instagramUrl ?? "");
    setTiktokUrl(initial.tiktokUrl ?? "");
    setGithubUrl(initial.githubUrl ?? "");
  }, [initial]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setAvatarUrl(json.data.url);
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    const url = linkedinUrl.trim() || portfolioUrl.trim();
    if (!url) {
      toast.error("Enter a LinkedIn or portfolio URL first");
      return;
    }
    setScrapeLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Scrape failed");
      const d = json.data;
      if (d.name) setName(d.name);
      if (d.title) setTitle(d.title);
      if (d.bio) setBio(d.bio ?? "");
      if (d.avatarUrl) setAvatarUrl(d.avatarUrl);
      toast.success("Profile filled from URL");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not fetch profile");
    } finally {
      setScrapeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim() || null,
          bio: bio.trim().slice(0, MAX_BIO) || null,
          avatarUrl: avatarUrl || null,
          bannerUrl: bannerUrl || null,
          portfolioUrl: portfolioUrl.trim() || null,
          linkedinUrl: linkedinUrl.trim() || null,
          twitterUrl: twitterUrl.trim() || null,
          instagramUrl: instagramUrl.trim() || null,
          tiktokUrl: tiktokUrl.trim() || null,
          githubUrl: githubUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update");
      toast.success("Card updated");
      router.push(`/card/${cardId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (!initial) return null;

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setBannerUrl(json.data.url);
      toast.success("Banner updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Banner (optional)</label>
        <div className="aspect-[3/1] w-full overflow-hidden rounded-lg border border-zinc-300 bg-zinc-100">
          {bannerUrl ? (
            <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400 text-sm">Add banner</div>
          )}
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleBannerChange}
          disabled={loading}
          className="mt-1 text-sm text-zinc-600 file:mr-2 file:rounded file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-white file:text-sm"
        />
      </div>
      <div className="flex flex-col items-center gap-3">
        <label className="text-sm font-medium text-zinc-700">Photo</label>
        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-zinc-300 bg-zinc-100">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400 text-xs">
              Add
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={loading}
          className="text-sm text-zinc-600 file:mr-2 file:rounded file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-white file:text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Display name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
          placeholder="Jane Smith"
          maxLength={MAX_NAME}
          className="h-12 w-full rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
          required
        />
        <p className="mt-0.5 text-xs text-zinc-500">{name.length} of {MAX_NAME}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">What do you do?</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
          placeholder="Copywriter, Designer..."
          maxLength={MAX_TITLE}
          className="h-12 w-full rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
        />
        <p className="mt-0.5 text-xs text-zinc-500">{title.length} of {MAX_TITLE}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">About</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
          placeholder="A short bio."
          maxLength={MAX_BIO}
          rows={3}
          className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400"
        />
        <p className="mt-0.5 text-xs text-zinc-500">{bio.length} of {MAX_BIO}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Website</label>
        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://example.com"
          className="h-12 w-full rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">LinkedIn</label>
        <input
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="h-12 w-full rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Twitter</label>
          <input
            type="url"
            value={twitterUrl}
            onChange={(e) => setTwitterUrl(e.target.value)}
            placeholder="https://x.com/..."
            className="h-11 w-full rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Instagram</label>
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/..."
            className="h-11 w-full rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">TikTok</label>
          <input
            type="url"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://tiktok.com/..."
            className="h-11 w-full rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">GitHub</label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="h-11 w-full rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleScrape}
        disabled={scrapeLoading || (!linkedinUrl.trim() && !portfolioUrl.trim())}
        className="h-12 w-full rounded border border-zinc-400 bg-white text-sm font-medium text-zinc-700 disabled:opacity-50"
      >
        {scrapeLoading ? "Fetching…" : "Auto-fill from LinkedIn / URL"}
      </button>

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded bg-black font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Done"}
      </button>

      <Link
        href={`/card/${cardId}`}
        className="text-center text-sm text-zinc-600 underline"
      >
        Cancel
      </Link>
    </form>
  );
}
