import { client } from "@/sanity/lib/client";
import {
  COMMENTS_BY_STARTUP_QUERY,
  FEEDBACK_STATS_QUERY,
  STARTUP_BY_ID_QUERY,
} from "@/sanity/lib/queries";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const { postId } = await req.json();

  const [feedback, startupContent] = await Promise.all([
    getFeedbackData(postId),
    getStartupContent(postId),
  ]);

  const prompt = `
You are a startup advisor helping founders improve their startup ideas before they build.

Here is the startup idea details:
${startupContent}

Here are actual comments from community users:
${feedback.comments.map((c: any, i: number) => `Comment ${i + 1}: "${c}"`).join("\n")}

Here is the aggregated feedback from user ratings (1–5):
- Innovation: ${feedback.ratings.innovation.toFixed(1)}
- Problem Clarity: ${feedback.ratings.problemClarity.toFixed(1)}
- Solution Clarity: ${feedback.ratings.solutionClarity.toFixed(1)}
- Product-Market Fit: ${feedback.ratings.productMarketFit.toFixed(1)}
- Execution Feasibility: ${feedback.ratings.execution.toFixed(1)}
- Monetization Potential: ${feedback.ratings.monetization.toFixed(1)}

Based on the startup details, user comments, and ratings, suggest 2–3 specific improvements the founder should consider. Focus on helping refine or enhance the idea, solution, or clarity.
`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct", // or "llama3-70b-8192"
        messages: [
          {
            role: "system",
            content:
              "You are a startup advisor that gives helpful, concise suggestions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await res.json();
    const suggestions =
      data.choices?.[0]?.message?.content || "No suggestions available.";

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("AI suggestion error:", err);
    return NextResponse.json({
      suggestions: "Something went wrong generating suggestions.",
    });
  }
}
