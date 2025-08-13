"use client";

import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const AIInsightCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeIn" }}
      whileHover={{
        scale: 1.01,
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
      className="cursor-default relative overflow-hidden bg-gradient-to-br from-gray-100/90 to-gray-200/60 backdrop-blur-lg border border-primary-100 rounded-2xl p-6 shadow-lg"
    >
      {/* Accent blur circle */}
      <div className="absolute -top-12 -left-12 w-50 h-50 bg-gradient-to-br from-indigo-500/60 to-purple-500/10 rounded-full blur-3xl" />

      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">
          {title}
        </h3>
      </div>

      <div className="text-gray-700 leading-relaxed space-y-2">{children}</div>
    </motion.div>
  );
};

export default AIInsightCard;

export function RecommendationBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    build: "from-green-500 to-emerald-600 text-green-50 shadow-green-500/30",
    refine: "from-yellow-500 to-amber-600 text-yellow-50 shadow-yellow-500/30",
    kill: "from-red-500 to-rose-600 text-red-50 shadow-red-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`px-4 py-1.5 rounded-full font-semibold text-sm bg-gradient-to-r ${
        styles[type] || "from-gray-400 to-gray-600 text-white"
      } shadow-md`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </motion.div>
  );
}

export function RegenerateInsightsButton({ startupId }: { startupId: string }) {
  const [loading, setLoading] = useState(false);
  const route = useRouter();

  async function regenerate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/feedback-suggestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: startupId, regenerate: true }),
      });

      if (!res.ok) throw new Error("Failed to regenerate");

      toast.success("✅ Insights regenerated.");
      route.refresh();
    } catch (err) {
      toast.warning("❌ Failed to regenerate insights.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={regenerate}
        disabled={loading}
        className="primary_btn !text-base flex items-center gap-2"
      >
        {loading ? "Regenerating..." : (<><RefreshCcw className="size-5" /> Regenerate Insights</>)}
      </button>
    </div>
  );
}