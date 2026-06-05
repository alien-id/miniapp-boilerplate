"use client";

import { useState } from "react";
import { useClipboard } from "@alien-id/miniapps-react";
import toast from "react-hot-toast";
import { Card, CardTitle } from "@/components/ui/card";

export function ClipboardCard() {
  const { writeText, readText, isReading, callable } = useClipboard();
  const [text, setText] = useState("Hello from the Alien miniapp!");

  const handleRead = async () => {
    // readText resolves with a discriminated result instead of throwing.
    const result = await readText();
    if (result.ok) {
      setText(result.text);
      toast.success("Clipboard read");
    } else if (result.errorCode) {
      toast.error(`Clipboard refused: ${result.errorCode}`);
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Card>
      <CardTitle>Clipboard</CardTitle>
      <div className="space-y-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-500"
          placeholder="Text to copy"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              writeText(text);
              toast.success("Copied to clipboard");
            }}
            disabled={!callable}
            className="flex-1 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Write
          </button>
          <button
            onClick={handleRead}
            disabled={!callable || isReading}
            className="flex-1 rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
          >
            {isReading ? "Reading..." : "Read"}
          </button>
        </div>
      </div>
    </Card>
  );
}
