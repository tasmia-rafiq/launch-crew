"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SearchForm from "./SearchForm";
import { RefreshCcw } from "lucide-react";

export default function ExploreFilters({
  categories,
  query,
}: {
  categories: string[];
  query?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [category, setCategory] = useState(params.get("category") || "");
  const [sort, setSort] = useState(params.get("sort") || "newest");

  useEffect(() => {
    setCategory(params.get("category") || "");
    setSort(params.get("sort") || "newest");
  }, [params]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(params.toString());
      if (value) p.set(key, value);
      else p.delete(key);
      router.replace(`/explore?${p.toString()}`, { scroll: false });
    },
    [params, router]
  );

  const [searchKey, setSearchKey] = useState(0);

  const resetFilters = () => {
    router.replace("/explore", { scroll: false });
    setCategory("");
    setSort("newest");
    setSearchKey((k) => k + 1);
  };
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
      {/* Search */}
      {/* <input
        defaultValue={params.get("search") || ""}
        placeholder="Search ideas..."
        onKeyDown={(e) => {
          if (e.key === "Enter") setParam("search", e.currentTarget.value);
        }}
        className="w-full md:w-1/2 rounded border p-2"
      /> */}

      <SearchForm key={searchKey} query={""} />

      <div className="flex md:flex-row gap-4">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setParam("category", e.target.value);
          }}
          className="filter-dropdown"
        >
          <option className="options" value="">All Categories</option>
          {categories.map((c) => (
            <option className="options" key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setParam("sort", e.target.value);
          }}
          className="filter-dropdown"
        >
          <option className="options" value="newest">Newest</option>
          <option className="options" value="feedback">Most Feedback</option>
        </select>

        <button
          onClick={resetFilters}
          className="text-black-300 cursor-pointer relative group"
        >
          <RefreshCcw className="size-6" />
          {/* Tooltip */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            Reset Filters
          </span>
        </button>
      </div>
    </div>
  );
}
