"use client";
import { useState, useTransition } from "react";
import { AlertTriangle, ArrowBigUpDash, DotIcon } from "lucide-react";
import { toggleVote } from "@/lib/actions";

export default function VoteButton({
  postId,
  alreadyVoted,
  voteCount,
  isLoggedIn,
}: {
  postId: string;
  alreadyVoted: boolean;
  voteCount: number;
  isLoggedIn?: boolean;
}) {
  const [voted, setVoted] = useState(alreadyVoted);
  const [count, setCount] = useState(voteCount);
  const [isPending, startTransition] = useTransition();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleVote = () => {
    if (!isLoggedIn) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }
    startTransition(async () => {
      const result = await toggleVote(postId);
      if (result.success) {
        setVoted(result.voted ?? false);
        if (result.voted) {
          setCount((prev) => prev + 1);
        } else {
          setCount((prev) => Math.max(0, prev - 1));
        }
      }
    });
  };

  return (
    <div className="relative inline-block max-sm:w-full">
      {showTooltip && (
        <div className="flex items-start gap-2 absolute -top-15 left-1/2 -translate-x-1/2 px-3 py-2 text-sm leading-4 bg-primary w-[160px] text-white rounded shadow">
          <AlertTriangle className="size-8" /> Sign in to Upvote this Startup
        </div>
      )}

      <button
        className={`w-full justify-center flex items-center gap-2 px-6 py-2 rounded-full border transition-colors duration-200
      ${voted ? "bg-primary text-white border-primary" : "bg-muted text-black border-gray-300 hover:bg-gray-100"}
      disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={handleVote}
        disabled={isPending}
      >
        <ArrowBigUpDash className="size-7" />
        <span className="text-lg font-medium flex items-center gap-0">
          {voted ? "Upvoted" : "Upvote"} <DotIcon className="size-5" /> {count}
        </span>
      </button>
    </div>
  );
}
