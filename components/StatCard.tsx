"use client";

import CountUp from "react-countup";

export default function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      className={`p-6 rounded-2xl shadow-sm border border-gray-100 bg-gradient-to-br ${gradient} hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <span className="text-white/80">{icon}</span>
        <span className="text-white/90 text-sm">{label}</span>
      </div>
      <p className="text-4xl font-bold text-white mt-3">
        <CountUp
          start={0}
          end={parseFloat(value)}
          duration={2}
          decimals={1}
        /></p>
    </div>
  );
}