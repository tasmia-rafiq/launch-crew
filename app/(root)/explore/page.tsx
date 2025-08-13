import StartupCard, { StartupCardType } from "@/components/StartupCard";
import { client } from "@/sanity/lib/client";
import { ALL_CATEGORIES_QUERY, STARTUPS_EXPLORE_QUERY } from "@/sanity/lib/queries";
import { Suspense } from "react";
import { auth } from "@/auth";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import ExploreFilters from "@/components/ExploreFilters";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string }>;
}) {
  const {query, category} = await searchParams;
  const params = {
    search: query || null,
    category: category || null,
  };

  const session = await auth();

  const { data: posts } = await sanityFetch({ query: STARTUPS_EXPLORE_QUERY, params });

  const rawCategories: string[] = await client.fetch(ALL_CATEGORIES_QUERY);
  const categories = [
    ...new Set(
      rawCategories
        .map((c: any) => c.category)
        .filter((c: string) => typeof c === "string" && c.trim() !== "")
    ),
  ].sort();

  return (
    <div className="section_container mt-24">
      <h1 className="text-3xl font-bold mb-4">Explore Ideas</h1>

      <ExploreFilters categories={categories} />

      <Suspense fallback={<p>Loading ideas...</p>}>
        <ul className="mt-7 card_grid">
          {posts?.length > 0 ? (
            posts.map((post: StartupCardType, index: number) => (
              <StartupCard key={post?._id} post={post} />
            ))
          ) : (
            <p className="no-results">No startups found</p>
          )}
        </ul>
      </Suspense>

      <SanityLive />
    </div>
  );
}
