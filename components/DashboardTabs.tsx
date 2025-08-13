"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const tabs = ["My Ideas", "Feedback I Gave", "Saved Ideas"];

export default function DashboardTabs({ activeTab, setActiveTab }: any) {
  const [hoverTab, setHoverTab] = useState<string | null>(null);

  return (
    <div className="relative flex space-x-6 border-b border-gray-200 dark:border-gray-700 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const isHover = hoverTab === tab;

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            onMouseEnter={() => setHoverTab(tab)}
            onMouseLeave={() => setHoverTab(null)}
            className={`relative pb-3 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-300"
            }`}
          >
            {tab}

            {/* Active Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-400"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {/* Hover Indicator (faint) */}
            {!isActive && isHover && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-300 dark:bg-gray-600"
                layoutId="hoverIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}