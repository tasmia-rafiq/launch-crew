"use client";

import { getAverageFeedbackStats } from "@/lib/actions";
import { client } from "@/sanity/lib/client";
import { FEEDBACK_STATS_QUERY } from "@/sanity/lib/queries";
import { Rate, Skeleton } from "antd";
import { useEffect, useState } from "react";
import AISuggestion from "./ai/AISuggestion";
import { Lightbulb } from "lucide-react";

export default function FeedbackStats({
  postId,
  authorId,
  currentUserId,
}: {
  postId: string;
  authorId: string;
  currentUserId?: string;
}) {
  const criteria = [
    {
      key: "innovation",
      label: "Innovation / Uniqueness",
      tooltip: "Is the idea novel, creative, or disruptive in any way?",
    },
    {
      key: "problemClarity",
      label: "Problem Clarity",
      tooltip: "Is the startup solving a clearly defined problem?",
    },
    {
      key: "solutionClarity",
      label: "Solution Clarity",
      tooltip: "Is the proposed solution clear, realistic, and understandable?",
    },
    {
      key: "productMarketFit",
      label: "Product-Market Fit",
      tooltip: "Is there a real need or large enough audience for this idea?",
    },
    {
      key: "execution",
      label: "Execution Feasibility",
      tooltip: "Can this idea realistically be built with current resources?",
    },
    {
      key: "monetization",
      label: "Monetization Potential ",
      tooltip: "Can this idea generate revenue effectively?",
    },
  ];

  const tooltipMap: Record<string, string[]> = {
    innovation: [
      "Unoriginal",
      "Basic",
      "Somewhat Unique",
      "Innovative",
      "Groundbreaking",
    ],
    productMarketFit: ["No Fit", "Weak", "Moderate", "Strong", "Perfect"],
    execution: ["Poor", "Below Avg", "Decent", "Well Executed", "Flawless"],
    problemClarity: [
      "Confusing",
      "Unclear",
      "Moderate",
      "Clear",
      "Crystal Clear",
    ],
    solutionClarity: [
      "Confusing",
      "Unclear",
      "Moderate",
      "Clear",
      "Crystal Clear",
    ],
    monetization: [
      "No Revenue Model",
      "Weak Potential",
      "Viable",
      "Profitable",
      "Highly Scalable",
    ],
  };

  const [feedbacks, setFeedbacks] = useState<any>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const feedbackStats = await getAverageFeedbackStats(postId);
      setFeedbacks(feedbackStats);
    };
    fetchFeedbacks();

    const subscription = client
      .listen(FEEDBACK_STATS_QUERY, { postId })
      .subscribe(async () => {
        const updated = await getAverageFeedbackStats(postId);
        setFeedbacks(updated);
      });

    return () => subscription.unsubscribe();
  }, [postId]);

  if (!feedbacks) {
    return (
      <div className="flex-[100%]">
        {/* <Skeleton active className="h-[140px] w-full rounded-lg" /> */}
        <div className="w-full p-3 rounded-md bg-yellow-50 border border-yellow-300 text-yellow-800 mb-4">
          No feedbacks submitted yet.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 pb-10 border-b-1 border-[#cecece]">
      <div className="flex md:flex-row flex-col md:gap-2 gap-5 items-center mt-7">
        <div className="md:w-[40%] max-md:text-center w-full space-y-1">
          <h3 className="text-xl font-semibold">Average Community Ratings</h3>
          <p className="text-30-semibold !text-[50px]">
            {(
              criteria.reduce(
                (sum, item) =>
                  sum + feedbacks[item.key as keyof typeof feedbacks],
                0
              ) / criteria.length
            ).toFixed(1)}
          </p>

          <p className="text-16-medium leading-5 !text-black-100">
            Based on {feedbacks?.totalFeedbacks} feedbacks
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 md:w-[60%] w-full">
          {criteria.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-2"
            >
              <label className="sm:text-base text-sm font-medium">
                {item.label}
              </label>
              <div className="flex items-center gap-2">
                <Rate
                  allowHalf
                  disabled
                  tooltips={tooltipMap[item.key]}
                  value={feedbacks[item.key as keyof typeof feedbacks]}
                  style={{ color: "#ffb400" }}
                />
                <span className="text-sm font-semibold text-gray-700 min-w-[30px] text-right">
                  {feedbacks[item.key as keyof typeof feedbacks].toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentUserId === authorId && (
        <>
          {feedbacks?.totalFeedbacks >= 1 ? (
            <div className="pt-6 w-full">
              <button
                className="primary_btn secondary_btn !text-base !py-2 hover:!text-primary"
                onClick={() => setShowAISuggestions(!showAISuggestions)}
              >
                {showAISuggestions
                  ? "Hide AI Suggestions"
                  : "Get AI Suggestions"}
              </button>

              {showAISuggestions && (
                <div className="mt-5">
                  <AISuggestion postId={postId} />
                </div>
              )}
            </div>
          ) : (
            <div className="mt-10 py-4 px-3 rounded-lg border-secondary border-1 w-full bg-primary-100 flex items-center gap-2 cursor-default">
              <Lightbulb className="size-4" />
              <p>
                Get AI Suggestions once you get more than 2 feedbacks from the
                LaunchMate Community.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
