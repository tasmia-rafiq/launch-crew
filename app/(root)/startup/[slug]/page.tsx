import { formatDate } from "@/lib/utils";
import { client } from "@/sanity/lib/client";
import {
  PLAYLIST_BY_SLUG_QUERY,
  STARTUP_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import markdownit from "markdown-it";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import StartupCard, { StartupCardType } from "@/components/StartupCard";
import UserAvatar from "@/components/UserAvatar";
import { TimerIcon } from "lucide-react";
import PostDropdown from "@/components/PostDropdown";
import { auth } from "@/auth";
import VoteButton from "@/components/VoteButton";
import CommentSection from "@/components/CommentSection";
import FeedbackSection from "@/components/FeedbackSection";
import FeedbackStats from "@/components/FeedbackStats";

const md = markdownit();

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const session = await auth();

  // Parallel fetching: In this case, we are fetching the startup post and the editor picks at the same time to improve performance and reduce loading time.

  const [post, { select: editorPosts }] = await Promise.all([
    client.fetch(
      STARTUP_BY_SLUG_QUERY(session?.id),
      { slug },
      { useCdn: false }
    ),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, { slug: "editor-picks" }),
  ]);

  if (!post) return notFound();

  const parsedContent = md.render(post?.pitch || "");

  // const avgStats = await getAverageFeedbackStats(post._id);

  return (
    <>
      <section className="section_container mt-22.5 pink_container !w-[80%] !min-h-[100px] !bg-local rounded-2xl shadow-300 -mb-26 relative !z-10 max-sm:!px-4 max-sm:!py-5 max-sm:mb-0 max-sm:!w-[90%]">
        <h1 className="heading sm:!text-[30px] !text-[20px] !mt-0 !mb-2!px-0">
          {post.title}
        </h1>
        <p className="sub-heading !font-normal !text-[18px] max-sm:!text-[14px] !max-width-[100%]">
          {post.description}
        </p>
      </section>

      <section className="section_container">
        <img
          src={post.picture}
          alt="Thumbnail"
          className="w-full h-auto rounded-xl"
        />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5 !items-stretch max-sm:mb-10">
            <div className="flex flex-col">
              <Link
                href={`/user/${post.author?._id}`}
                className="flex gap-2 items-center mb-3"
              >
                <UserAvatar id={post.author._id} size="sm:size-16 size-10" />

                <div>
                  <p className="sm:!text-20-medium !text-lg !font-medium max-sm:leading-5">
                    {post.author.name}
                  </p>
                  <p className="sm:!text-16-medium !text-sm !font-medium !text-black-300">
                    {post.author.username}
                  </p>
                </div>
              </Link>

              <p className="text-14-normal !text-black-100 flex gap-1 items-center">
                <TimerIcon className="size-3.5" />
                <span>{formatDate(post?._createdAt)}</span>
              </p>
            </div>

            <div className="flex flex-col gap-3 justify-between">
              {session?.id === post.author._id && (
                <PostDropdown postId={post._id} postSlug={slug} />
              )}

              <p className="category-tag sm:px-6">{post.category}</p>
            </div>
          </div>

          <div>
            <h3 className="startup_heading">
              Problem Description{" "}
              <span className="text-black-300 text-[18px] font-medium align-middle">
                (Problem Solved by the Startup)
              </span>
            </h3>
            <p className="content">{post.problem}</p>
          </div>

          <div className="flex flex-row items-center gap-5">
            <h4 className="text-26-semibold !text-[18px] max-sm:!text-[16px] !text-black-100">
              Target Audience:{" "}
            </h4>
            <p className="category-tag !text-[14px]">{post.audience}</p>
          </div>

          <h3 className="startup_heading pt-3">Pitch Idea Details</h3>

          {parsedContent ? (
            <article
              dangerouslySetInnerHTML={{ __html: parsedContent }}
              className="prose max-w-4xl font-work-sans break-all max-sm:!text-sm max-sm:!leading-6"
            />
          ) : (
            <p className="no-result">No details provided</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-16-medium">Tags: </p>
            {Array.isArray(post.tags) && post.tags.length > 0 ? (
              post.tags.map((tag: string, i: number) => (
                <span
                  className="tag !rounded-full !text-[14px] !font-medium !py-1 !px-3 !lowercase"
                  key={i}
                >
                  #{tag}
                </span>
              ))
            ) : (
              <p className="text-16-medium text-gray-500">No tags available</p>
            )}
          </div>

          <div className="mt-10">
            <VoteButton
              postId={post._id}
              voteCount={post.voteCount}
              alreadyVoted={post.alreadyVoted}
              isLoggedIn={!!session?.id}
            />
          </div>

          {/* Comment Section here */}
          <div>
            <h3 className="text-30-semibold mt-15">Community Feedback</h3>
            <p className="text-16-medium text-gray-500 mb-6">
              Share your thoughts and feedback on this startup.
            </p>

            <div className="flex flex-col items-start gap-10 mt-8">
              <FeedbackStats postId={post._id} authorId={post.author?._id} currentUserId={session?.id} />
              <FeedbackSection postId={post._id} session={session} />
            </div>
          </div>

          <CommentSection
            postId={post._id}
            postAuthor={post?.author?._id}
            session={session}
          />
        </div>

        {/* <hr className="divider" /> */}

        {editorPosts?.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <p className="text-30-semibold">Editor Picks</p>
            <ul className="mt-7 card_grid-sm">
              {editorPosts.map((post: StartupCardType, i: number) => (
                <StartupCard key={i} post={post} />
              ))}
            </ul>
          </div>
        )}

        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          {/* VIEW COMPONENT IS THE DYNAMIC PART OF OUR PAGE */}
          <View
            id={post._id}
            authorId={post.author._id}
            sessionId={session?.id}
          />
        </Suspense>
      </section>
    </>
  );
};

export default page;
