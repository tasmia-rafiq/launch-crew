import StartupCard, { StartupCardType } from "@/components/StartupCard";
import { STARTUPS_QUERY } from "@/sanity/lib/queries";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { auth } from "@/auth";
import Link from "next/link";
import {
  ArrowRight,
  Lightbulb,
  MessageCircleDashed,
  MessageCircleIcon,
  NetworkIcon,
  PlusCircle,
  RocketIcon,
  SearchIcon,
  TrendingUp,
} from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const query = (await searchParams).query;
  const params = { search: query || null };

  const session = await auth();
  // console.log(session?.id);

  const { data: posts } = await sanityFetch({ query: STARTUPS_QUERY, params });

  const howItWorks = [
    {
      icon: Lightbulb,
      title: "Share Your Idea",
      description:
        "Submit your startup concept and share it with our community of entrepreneurs and early users.",
    },
    {
      icon: MessageCircleIcon,
      title: "Get Feedback",
      description:
        "Receive valuable feedback from real users to validate your idea before you build.",
    },
    {
      icon: RocketIcon,
      title: "Iterate & Launch",
      description:
        "Use the insights to refine your concept and prepare for a successful launch.",
    },
  ];

  const benefits = [
    {
      icon: SearchIcon,
      title: "Validate Fast, Build Smarter",
      description:
        "Avoid wasting time on ideas that don’t resonate. Validate first — iterate later.",
    },
    {
      icon: MessageCircleDashed,
      title: "Get Constructive, Honest Feedback",
      description:
        "Crowdsource insights from early users and other startup founders.",
    },
    {
      icon: TrendingUp,
      title: "Discover Trends and Niches",
      description:
        "See what others are working on. Learn from trending startup ideas.",
    },
    {
      icon: NetworkIcon,
      title: "Grow Your Network",
      description:
        "Connect with other builders who might be your future co-founder, user, or advisor.",
    },
  ];

  return (
    <>
      <section className="pink_container mt-22.5">
        <h1 className="heading">
          Validate Your Startup Ideas Before You Build
        </h1>

        <p className="sub-heading !max-w-3xl">
          Share your startup concept and get real feedback from entrepreneurs,
          creators, and early users.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link
            href={"/startup/create"}
            className="secondary_btn flex gap-2 items-center"
          >
            <span>Submit Your Idea</span>
            <PlusCircle className="size-5" />
          </Link>

          <Link
            href={"/explore"}
            className="secondary_btn flex gap-2 items-center"
          >
            <span>Explore Ideas</span>
            <RocketIcon className="size-5" />
          </Link>
        </div>

        {/* <SearchForm query={query} /> */}
      </section>

      {/* HOW LAUNCHMATE WORKS */}
      <section className="section_container bg-white-100">
        <h2 className="text-30-bold text-center">How LaunchMate Works</h2>
        <p className="text-14-normal !text-[16px] !text-black-300 text-center py-2">
          In just 3 simple steps, move from raw idea to refined concept with
          clarity and direction.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {howItWorks.map((item: any, index: number) => (
            <div
              key={index}
              className="card p-6 flex flex-col items-center text-center border-1 border-[#cecece] rounded-xl bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-primary rounded-full p-3 mb-4">
                <item.icon className="size-7 text-secondary" />
              </div>
              <h3 className="text-20-medium mb-2">{item.title}</h3>
              <p className="text-14-normal !text-black-100">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING IDEAS */}
      <section className="section_container">
        <h2 className="text-30-bold text-center">Trending Startup Ideas</h2>
        <p className="text-14-normal !text-[16px] !text-black-300 text-center py-2">
          Discover innovative concepts already submitted by our growing
          community — and get inspired.
        </p>

        <ul className="mt-7 card_grid">
          {posts?.length > 0 ? (
            posts.map((post: StartupCardType, index: number) => (
              <StartupCard key={post?._id} post={post} />
            ))
          ) : (
            <p className="no-results">No startups found</p>
          )}
        </ul>
      </section>

      {/* CTA BANNER */}
      <section className="relative isolate overflow-hidden py-14 sm:py-20 bg-[url('/constellation.png')] bg-no-repeat bg-cover bg-center">
        {/* Background gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-primary via-blue-950 to-blue-300 opacity-90 dark:opacity-80"
        />

        {/* Decorative blurred blob */}
        <div
          aria-hidden
          className="absolute -top-40 right-1/2 h-[480px] w-[480px] translate-x-1/2 rounded-full bg-secondary/20 blur-3xl -z-1"
        />

        <div className="mx-auto max-w-3xl text-center px-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-md">
            Ready to Validate Your Idea?
          </h2>

          <p className="mt-4 text-lg sm:text-xl text-indigo-100">
            Join hundreds of founders using&nbsp;
            <span className="font-semibold text-white">LaunchMate</span>
            &nbsp;to refine their concepts before writing a single line of code.
          </p>

          <Link
            href="/startup/create"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base sm:text-lg font-semibold text-primary hover:bg-indigo-50 active:scale-[0.98] transition z-100"
          >
            <RocketIcon className="h-5 w-5" />
            Submit Your Idea
          </Link>
        </div>
      </section>

      {/* WHY LAUNCHMATE */}
      <section className="section_container">
        <h2 className="text-30-bold text-center">
          Why Creators Choose LaunchMate?
        </h2>
        <p className="text-14-normal !text-[16px] !text-black-300 text-center py-2">
          We're built for early-stage creators who want to save time, reduce
          risk, and build smarter from day one.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          {benefits.map((benefit: any, index: number) => (
            <div
              key={index}
              className="card p-6 flex flex-col items-center justify-between text-center border-1 border-[#cecece] rounded-xl bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-primary rounded-full p-3 mb-4">
                <benefit.icon className="size-7 text-secondary" />
              </div>
              <h3 className="text-20-medium mb-2 leading-5.5">
                {benefit.title}
              </h3>
              <p className="text-14-normal !text-black-100">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="section_container">
        <p className="text-30-semibold">
          {query ? `Search results for "${query}"` : "All Startups"}
        </p>

        <ul className="mt-7 card_grid">
          {posts?.length > 0 ? (
            posts.map((post: StartupCardType, index: number) => (
              <StartupCard key={post?._id} post={post} />
            ))
          ) : (
            <p className="no-results">No startups found</p>
          )}
        </ul>
      </section> */}

      <SanityLive />
    </>
  );
}
