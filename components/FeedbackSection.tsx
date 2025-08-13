"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Rate, Tooltip, Skeleton } from "antd";
import { FaInfoCircle } from "react-icons/fa";
import { deleteFeedback, getUserFeedback, submitFeedback } from "@/lib/actions";
import { client } from "@/sanity/lib/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { EllipsisIcon, Trash2Icon } from "lucide-react";

const criteria = [
  {
    key: "innovation",
    label: "Innovation",
    tooltip: "Is the idea novel, creative, or disruptive in any way?",
  },
  {
    key: "problemClarity",
    label: "Problem Clarity",
    tooltip: "Is the problem clearly identified and easy to understand?",
  },
  {
    key: "solutionClarity",
    label: "Solution Clarity",
    tooltip: "Is the proposed solution clear, realistic, and understandable?",
  },
  {
    key: "productMarketFit",
    label: "Product-Market Fit",
    tooltip: "Does this product solve a real need for a target market?",
  },
  {
    key: "execution",
    label: "Execution Feasibility",
    tooltip: "Can this idea realistically be built with current resources?",
  },
  {
    key: "monetization",
    label: "Monetization Potential",
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

export default function FeedbackSection({
  postId,
  session,
}: {
  postId: string;
  session: any;
}) {
  const [ratings, setRatings] = useState({
    innovation: 0,
    problemClarity: 0,
    solutionClarity: 0,
    productMarketFit: 0,
    execution: 0,
    monetization: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFeedback = async () => {
      if (!session?.id) {
        setLoading(false);
        return;
      }

      const data = await getUserFeedback(postId, session.id);
      if (data) {
        setRatings({
          innovation: data.innovation || 0,
          problemClarity: data.problemClarity || 0,
          solutionClarity: data.solutionClarity || 0,
          productMarketFit: data.productMarketFit || 0,
          execution: data.execution || 0,
          monetization: data.monetization || 0,
        });
        setExistingFeedback(true);
      }
      setLoading(false);
    };

    loadUserFeedback();
  }, [postId, session?.id]);

  const handleRatingChange = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!session?.id) {
      toast.warning("Sign in to submit feedback.");
      return;
    }

    const isEmpty = Object.values(ratings).some((r) => r === 0);
    if (isEmpty) {
      toast.warning("Please rate all criteria before submitting.");
      return;
    }

    setSubmitting(true);
    const res = await submitFeedback({ postId, ...ratings });

    if (res.success) {
      toast.success(
        existingFeedback ? "Feedback updated." : "Feedback submitted."
      );
      setExistingFeedback(true);
    } else {
      toast.error("Submission failed.");
    }

    setSubmitting(false);
  };

  const handleDeleteFeedback = async () => {
    const confirmed = confirm("Are you sure you want to delete your feedback?");
    if (!confirmed) return;

    try {
      const res = await deleteFeedback(postId, session.id);

      if (res.status === "SUCCESS") {
        toast.success("Feedback deleted successfully.");
        setExistingFeedback(false);
        setRatings({
          innovation: 0,
          problemClarity: 0,
          solutionClarity: 0,
          productMarketFit: 0,
          execution: 0,
          monetization: 0,
        });
      } else {
        toast.error(res.error || "Failed to delete the feedback.");
      }
    } catch (error) {
      console.error("Feeback delete error:", error);
      toast.error("Something went wrong.");
    }
  };

  if (loading) {
    return <Skeleton active className="h-[150px] w-[60%]" />;
  }

  return (
    <div className="space-y-2 md:w-[60%] w-full">
      <h3 className="text-xl font-semibold">Give Your Feedback</h3>
      <p className="text-base text-gray-500">
        Help the founder improve by rating on key criteria.
      </p>

      {existingFeedback && (
        <div className="w-full flex items-center gap-3 p-3 rounded-md bg-yellow-50 border border-yellow-300 text-yellow-800 mb-4">
          <p>You’ve already submitted feedback. You can update it below.</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="self-end cursor-pointer outline-none">
                <EllipsisIcon className="size-6" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-40 bg-white border-[#cecece]"
            >
              <DropdownMenuItem
                onClick={handleDeleteFeedback}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <Trash2Icon /> Delete Feedback
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 my-5">
        {criteria.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3"
          >
            <label className="sm:text-base text-sm font-medium flex items-center sm:gap-4 gap-1">
              {item.label}
              <Tooltip title={item.tooltip}>
                <FaInfoCircle className="text-gray-400 cursor-pointer" />
              </Tooltip>
            </label>
            <div className="flex items-center gap-2">
              <Rate
                allowHalf
                tooltips={tooltipMap[item.key]}
                value={ratings[item.key as keyof typeof ratings]}
                onChange={(val) => handleRatingChange(item.key, val)}
                style={{ color: "#ffb400" }}
              />
              <span className="text-sm text-gray-700 font-semibold min-w-[30px] text-right">
                {ratings[item.key as keyof typeof ratings]
                  ? ratings[item.key as keyof typeof ratings].toFixed(1)
                  : "0.0"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="primary_btn !text-[16px]"
      >
        {submitting
          ? "Submitting..."
          : existingFeedback
            ? "Update Feedback"
            : "Submit Feedback"}
      </button>
    </div>
  );
}
