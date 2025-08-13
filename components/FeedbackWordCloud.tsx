"use client";

import React from "react";
import WordCloud from "@korarit/react-wordcloud-next";

export default function FeedbackWordCloud({ text }: { text: string }) {
  if (!text) return <p className="text-muted-foreground">No feedback yet.</p>;

  const words = text
    .split(/\s+/)
    .map(w => w.toLowerCase().replace(/[^a-z0-9]/gi, ""))
    .filter(w => w.length > 3);

  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  const wordData = Object.entries(wordCounts).map(([word, count]) => ({
    text: word,
    value: count,
  }));

  return (
    <div style={{ height: 300 }}>
      <WordCloud
        words={wordData}
        options={{
          rotations: 2,
          rotationAngles: [0, 90],
          fontSizes: [14, 48],
          padding: 2,
        }}
      />
    </div>
  );
}