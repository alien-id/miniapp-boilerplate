"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAlien } from "@alien_org/react";
import toast from "react-hot-toast";
import type { ProjectDTO } from "../hooks/use-card";

export function EditProjectsSection({
  cardId,
  projects,
}: {
  cardId: string;
  projects: ProjectDTO[];
}) {
  const queryClient = useQueryClient();
  const { authToken } = useAlien();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["card", cardId] });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          linkUrl: linkUrl.trim() || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("Project added");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setLinkUrl("");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!authToken) return;
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/cards/${cardId}/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Project removed");
      refetch();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-zinc-900">Projects</h2>
      <ul className="flex flex-col gap-2">
        {projects.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-900">{p.title}</p>
              {p.description && (
                <p className="truncate text-sm text-zinc-600">{p.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(p.id)}
              disabled={deletingId === p.id}
              className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
          className="h-11 rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          rows={2}
          className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400"
        />
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL"
          className="h-11 rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
        />
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Project link URL"
          className="h-11 rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-full border border-zinc-400 bg-white font-medium text-zinc-700 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add project"}
        </button>
      </form>
    </section>
  );
}
