"use server";

import { client } from "@/sanity/lib/client";
import {
  COMMENTS_BY_STARTUP_QUERY,
  FEEDBACK_STATS_QUERY,
  STARTUP_BY_ID_QUERY,
} from "@/sanity/lib/queries";

async function getFeedbackData(postId: string) {
  const [ratingsRaw, commentsRaw] = await Promise.all([
    client.fetch(FEEDBACK_STATS_QUERY, { postId }, { useCdn: false }),
    client.fetch(COMMENTS_BY_STARTUP_QUERY, { postId }, { useCdn: false }),
  ]);

  const total = ratingsRaw.length || 1;
  const avg = ratingsRaw.reduce(
    (acc: any, f: any) => {
      acc.innovation += f.innovation;
      acc.problemClarity += f.problemClarity;
      acc.solutionClarity += f.solutionClarity;
      acc.productMarketFit += f.productMarketFit;
      acc.execution += f.execution;
      acc.monetization += f.monetization;
      return acc;
    },
    {
      innovation: 0,
      problemClarity: 0,
      solutionClarity: 0,
      productMarketFit: 0,
      execution: 0,
      monetization: 0,
    }
  );

  const ratings = {
    innovation: avg.innovation / total,
    problemClarity: avg.problemClarity / total,
    solutionClarity: avg.solutionClarity / total,
    productMarketFit: avg.productMarketFit / total,
    execution: avg.execution / total,
    monetization: avg.monetization / total,
  };

  const comments = commentsRaw.map((c: any) => c.content);

  return { ratings, comments };
}

async function getStartupContent(postId: string) {
  const startup = await client.fetch(STARTUP_BY_ID_QUERY, { id: postId });

  return `
Startup Title: ${startup.title}

Short Description:
${startup.description}

Problem:
${startup.problem}

Pitch:
${startup.pitch}
`;
}

export async function analyzeFeedback(postId: string) {
  const [feedback, startupContent] = await Promise.all([
    getFeedbackData(postId),
    getStartupContent(postId),
  ]);

  const prompt = `
You are a startup advisor helping founders improve their startup ideas before they build.

Startup details:
${startupContent}

User comments:
${feedback.comments.map((c: any, i: number) => `Comment ${i + 1}: "${c}"`).join("\n")}

Aggregated ratings (1–5):
- Innovation: ${feedback.ratings.innovation.toFixed(1)}
- Problem Clarity: ${feedback.ratings.problemClarity.toFixed(1)}
- Solution Clarity: ${feedback.ratings.solutionClarity.toFixed(1)}
- Product-Market Fit: ${feedback.ratings.productMarketFit.toFixed(1)}
- Execution Feasibility: ${feedback.ratings.execution.toFixed(1)}
- Monetization Potential: ${feedback.ratings.monetization.toFixed(1)}

Please:
1. Identify 3–5 common feedback themes.
2. Suggest 3–5 actionable improvements.
3. Give a "Build or Kill?" recommendation: "build", "refine", or "kill".
Format as JSON:
{
  "themes": [...],
  "suggestions": [...],
  "recommendation": "build" | "refine" | "kill"
}
`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile", // or your preferred Groq model
        messages: [
          {
            role: "system",
            content: "You are a concise, helpful startup advisor.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content || "{}");
  } catch (err) {
    console.error("Groq AI analytics error:", err);
    return { themes: [], suggestions: [], recommendation: "refine" };
  }
}
