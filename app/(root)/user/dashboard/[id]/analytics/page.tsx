import AIInsightCard, {
  RecommendationBadge,
  RegenerateInsightsButton,
} from "@/components/ai/AIInsightCard";
import AnalyticsChart from "@/components/AnalyticsChart";
import StatCard from "@/components/StatCard";
import { client } from "@/sanity/lib/client";
import { STARTUP_BY_ID_QUERY } from "@/sanity/lib/queries";
import { Edit3, Flag, Lightbulb, Wrench } from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await client.fetch(
    STARTUP_BY_ID_QUERY,
    { id },
    { useCdn: false }
  );

  if (!data) return <div>Startup not found</div>;

  const feedbacks = data.feedbacks || [];
  const avg = (arr: number[]) =>
    arr.length
      ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
      : "0.0";

  const avgInnovation = avg(feedbacks.map((f: any) => f.innovation));
  const avgMarketFit = avg(feedbacks.map((f: any) => f.productMarketFit));
  const avgExecution = avg(feedbacks.map((f: any) => f.execution));
  const avgProblemClarity = avg(feedbacks.map((f: any) => f.problemClarity));
  const avgSolutionClarity = avg(feedbacks.map((f: any) => f.solutionClarity));
  const avgMonetization = avg(feedbacks.map((f: any) => f.monetization));

  const chartData = [
    { metric: "Innovation", score: Number(avgInnovation) },
    { metric: "Problem Clarity", score: Number(avgProblemClarity) },
    { metric: "Solution Clarity", score: Number(avgSolutionClarity) },
    { metric: "Market Fit", score: Number(avgMarketFit) },
    { metric: "Execution", score: Number(avgExecution) },
    { metric: "Monetization", score: Number(avgMonetization) },
  ];

  // Call Groq API
  const insights = data.aiInsights || null;

  let parsedOutput = insights;

  if (!parsedOutput) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const aiRes = await fetch(`${baseUrl}/api/feedback-suggestion`, {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    const { aiOutput } = await aiRes.json();

    try {
      parsedOutput =
        typeof aiOutput === "string" ? JSON.parse(aiOutput) : aiOutput;
    } catch {
      parsedOutput = null;
    }
  } else if (typeof parsedOutput === "string") {
    try {
      parsedOutput = JSON.parse(parsedOutput);
    } catch {
      parsedOutput = null;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 mt-22">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{data.title} - Analytics</h1>
        <Link
          href={`/startups/${id}/edit`}
          className="primary_btn secondary_btn !text-base hover:!text-primary flex items-center gap-2"
        >
          <Edit3 className="size-5" /> Refine Idea
        </Link>
      </div>

      {/* Stats Overview */}
      <section className="grid md:grid-cols-3 gap-6">
        {chartData.map((item, i) => (
          <StatCard
            key={i}
            label={item.metric}
            value={item.score.toFixed(1)}
            icon={getMetricIcon(item.metric)}
            gradient={getMetricGradient(item.metric)}
          />
        ))}
      </section>

      {/* Chart */}
      <AnalyticsChart chartData={chartData} />

      {/* AI Insights */}
      {parsedOutput ? (
        <section>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-30-semibold my-5">AI Insights</h2>
            <RegenerateInsightsButton startupId={id} />
          </div>
          <div className="grid md:grid-cols-1 gap-6">
            <AIInsightCard
              icon={<Lightbulb className="text-yellow-400" />}
              title="Key Themes"
            >
              <ul className="space-y-2">
                {parsedOutput.themes.map((t: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </AIInsightCard>

            <AIInsightCard
              icon={<Wrench className="text-yellow-400" />}
              title="Suggestions"
            >
              <ul className="space-y-2">
                {parsedOutput.suggestions.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </AIInsightCard>

            <AIInsightCard
              icon={<Flag className="text-yellow-400" />}
              title="AI Verdict"
            >
              <div className="flex items-center gap-4 mb-3">
                <RecommendationBadge type={parsedOutput.recommendation} />
                {parsedOutput.confidence && (
                  <span className="text-base text-gray-500">
                    Confidence: <strong>{parsedOutput.confidence}%</strong>
                  </span>
                )}
              </div>

              {parsedOutput.tagline && (
                <p className="text-base text-gray-700 font-semibold mb-4">
                  {parsedOutput.tagline}
                </p>
              )}

              {parsedOutput.reasoning && parsedOutput.reasoning.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {parsedOutput.reasoning.map((reason: string, idx: number) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              )}

              {parsedOutput.recommendation === "refine" && (
                <Link
                  href={`/startups/${id}/edit`}
                  className="primary_btn secondary_btn !text-base hover:!text-primary flex items-center gap-2 mt-4 w-fit !py-2 !px-6"
                >
                  <Edit3 className="size-5" /> Refine Your Idea
                </Link>
              )}
            </AIInsightCard>
          </div>
        </section>
      ) : (
        <p className="text-red-500">⚠️ AI analysis failed to parse.</p>
      )}
    </div>
  );
}

// Map metrics to icons
function getMetricIcon(metric: string) {
  const icons: Record<string, React.ReactNode> = {
    Innovation: <Lightbulb size={22} />,
    "Problem Clarity": <Flag size={22} />,
    "Solution Clarity": <Wrench size={22} />,
    "Market Fit": <Lightbulb size={22} />,
    Execution: <Wrench size={22} />,
    Monetization: <Flag size={22} />,
  };
  return icons[metric] || <Lightbulb size={22} />;
}

// Map metrics to nice gradients
function getMetricGradient(metric: string) {
  const gradients: Record<string, string> = {
    Innovation: "from-blue-500 to-blue-700",
    "Problem Clarity": "from-green-500 to-green-700",
    "Solution Clarity": "from-purple-500 to-purple-700",
    "Market Fit": "from-pink-500 to-pink-700",
    Execution: "from-orange-500 to-orange-700",
    Monetization: "from-yellow-500 to-yellow-700",
  };
  return gradients[metric] || "from-gray-500 to-gray-700";
}
