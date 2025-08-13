import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { STARTUP_BY_ID_QUERY } from "@/sanity/lib/queries";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(req: Request) {
  try {
    const { id, regenerate = false } = await req.json();

    // Get startup + feedback from Sanity
    const data = await client.fetch(
      STARTUP_BY_ID_QUERY,
      { id },
      { useCdn: false }
    );

    if (!data) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    // If we already have AI insights and not regenerating, return existing
    if (!regenerate && data.aiInsights) {
      return NextResponse.json({ aiOutput: data.aiInsights });
    }

    const feedbacks = data.feedbacks || [];
    const avg = (arr: number[]) =>
      arr.length
        ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
        : "0.0";

    const avgInnovation = avg(feedbacks.map((f: any) => f.innovation));
    const avgMarketFit = avg(feedbacks.map((f: any) => f.productMarketFit));
    const avgExecution = avg(feedbacks.map((f: any) => f.execution));
    const avgProblemClarity = avg(feedbacks.map((f: any) => f.problemClarity));
    const avgSolutionClarity = avg(
      feedbacks.map((f: any) => f.solutionClarity)
    );
    const avgMonetization = avg(feedbacks.map((f: any) => f.monetization));

    const feedbackText = (data.comments || [])
      .map((c: any) => c.content)
      .join("\n");

    // Call Groq API
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are an AI that analyzes startup feedback and MUST respond ONLY with valid JSON, no explanations or extra formatting.",
            },
            {
              role: "user",
              content: `
Startup: ${data.title}
Description: ${data.description}
Pitch: ${data.pitch}

Ratings:
Innovation: ${avgInnovation}
Problem Clarity: ${avgProblemClarity}
Solution Clarity: ${avgSolutionClarity}
Product Market Fit: ${avgMarketFit}
Execution Feasibility: ${avgExecution}
Monetization Potential: ${avgMonetization}

Feedback Comments:
${feedbackText}

Please:
1. Identify 3-5 common feedback themes.
2. Suggest 3-5 improvements with examples from the Pitch of the Startup.
3. Give a "Build or Kill?" recommendation: "build", "refine", or "kill" based on ratings & comments.
4. For the recommendation, also give:
   - A COOL and FRANK motivational one-liner to inspire the founder (tagline).
   - A numeric confidence score from 0-100 based on how certain you are.
   - A short list (2-4 bullet points) of reasoning behind your recommendation.
Format as JSON:
{
  "themes": ["..."],
  "suggestions": ["..."],
  "recommendation": "build",
  "tagline": "Build it. Good ideas don’t wait. Neither should you.",
  "confidence": 87,
  "reasoning": ["...", "...", "..."]
}
`,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const aiData = await groqRes.json();
    let aiOutput = aiData?.choices?.[0]?.message?.content || "";

    aiOutput = aiOutput.replace(/```json|```/g, "").trim();

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(aiOutput);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI output" },
        { status: 500 }
      );
    }

    // Save to Sanity
    await writeClient
      .patch(id)
      .set({ aiInsights: JSON.stringify(parsedOutput) })
      .commit();

    return NextResponse.json({ aiOutput: JSON.stringify(parsedOutput) });
  } catch (error) {
    console.error("Feedback suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to analyze feedback" },
      { status: 500 }
    );
  }
}
