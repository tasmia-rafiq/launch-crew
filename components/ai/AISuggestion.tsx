"use client";

import { Skeleton } from "antd";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

function formatSuggestions(raw: string) {
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const formattedLines = lines.map((line, i) => {
    const match = line.match(/^(\d+\.)\s\*\*(.+?)\*\*:\s(.+)$/);
    if (match) {
      const [, number, boldTitle, rest] = match;
      return (
        <div key={i} className="mb-4">
          <p className="text-base text-blue-900">
            <strong>
              {number} {boldTitle}:
            </strong>{" "}
            {rest}
          </p>
        </div>
      );
    }

    return (
      <p key={i} className="text-base text-blue-900 mb-2">
        {line}
      </p>
    );
  });

  return formattedLines;
}

export default function AISuggestion({ postId }: { postId: string }) {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    const response = await fetch("/api/get-ai-suggestions", {
      method: "POST",
      body: JSON.stringify({ postId }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    setSuggestions(data.suggestions);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestions();
  }, [postId]);

  if (loading) return <Skeleton active className="h-28" />;
  if (!suggestions) return null;

  return (
    <div className="mt-6 p-6 border border-blue-200 rounded-md bg-blue-50">
      <h3 className="text-26-semibold !text-primary-900 mb-4">
        🤖 AI Suggestions to Improve This Idea
      </h3>

      {!loading && suggestions && <div>{formatSuggestions(suggestions)}</div>}

      <button
        onClick={fetchSuggestions}
        disabled={loading}
        className="text-16-medium border-1 border-secondary py-2 px-3 rounded-lg flex items-center gap-2 hover:opacity-80 mt-3"
      >
        {loading ? "Regenerating..." : "Regenerate Suggestion"} <RotateCcw className="size-5" />
      </button>

      {loading && <div className="text-gray-500 text-sm">Thinking...</div>}
    </div>
  );
}
