"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAlien } from "@alien_org/react";
import toast from "react-hot-toast";
import type { ServiceDTO } from "../hooks/use-card";

export function EditServicesSection({
  cardId,
  services,
}: {
  cardId: string;
  services: ServiceDTO[];
}) {
  const queryClient = useQueryClient();
  const { authToken } = useAlien();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
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
      const res = await fetch(`/api/cards/${cardId}/services`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          price: price.trim() || null,
          imageUrl: imageUrl.trim() || null,
          tags: tags.trim() || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("Service added");
      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setTags("");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!authToken) return;
    setDeletingId(serviceId);
    try {
      const res = await fetch(`/api/cards/${cardId}/services/${serviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Service removed");
      refetch();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-zinc-900">Services</h2>
      <ul className="flex flex-col gap-2">
        {services.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-900">{s.title}</p>
              {s.price && (
                <p className="text-sm text-zinc-600">{s.price}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id}
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
          placeholder="Service title"
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
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (e.g. $99 or Contact)"
          className="h-11 rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
        />
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
          className="h-11 rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
          className="h-11 rounded border border-zinc-300 bg-white px-3 text-zinc-900 placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-full border border-zinc-400 bg-white font-medium text-zinc-700 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add service"}
        </button>
      </form>
    </section>
  );
}
