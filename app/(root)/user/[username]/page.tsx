import { auth } from "@/auth";
import { StartupCardSkeleton } from "@/components/StartupCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserStartups from "@/components/UserStartups";
import { client } from "@/sanity/lib/client";
import {
  AUTHOR_BY_USERNAME_QUERY,
  STARTUPS_BY_AUTHOR_QUERY,
} from "@/sanity/lib/queries";
import { PenBoxIcon, PlusCircleIcon, QuoteIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

const page = async ({ params }: { params: Promise<{ username: string }> }) => {
  const username = (await params).username;
  const session = await auth();

  // FIRST: Check if the user is not logged in
  if (!session) redirect("/");

  // THEN: Get the id
  const id = session.id;
  if (!id) return null;

  const user = await client.fetch(
    AUTHOR_BY_USERNAME_QUERY,
    { username },
    { useCdn: false }
  );
  if (!user) return notFound();

  const startups = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, { id: user._id }, { useCdn: false });

  const isCurrentUser = id === user._id;

  return (
    <>
      <section className="profile_container mt-22.5">
        <div className="profile_card">
          <div className="flex flex-row md:gap-10 gap-4 items-center">
            <Avatar className="md:size-50 sm:size-22 size-18">
              <AvatarImage
                src={user?.image || null}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback>
                <span className="text-[50px] font-semibold bg-primary !text-white rounded-full flex items-center justify-center w-full h-full">
                  {user.name?.charAt(0) || "U"}
                </span>
              </AvatarFallback>
            </Avatar>
            <div className="profile_title">
              <h3 className="text-30-semibold line-clamp-1">{user.name}</h3>
              <p className="text-16-medium !font-normal !text-black-300">
                @{user?.username}
              </p>
              <div className="mt-3 flex flex-row gap-2 items-center">
                {user?.bio ? (
                  <>
                    <QuoteIcon className="size-4" />
                    <p className="text-14-normal !text-black-100">
                      {user?.bio}
                    </p>
                  </>
                ) : (
                  <p className="text-14-normal !text-black-100">
                      No bio available
                  </p>
                ) }
              </div>
            </div>
          </div>

          <div>
            {isCurrentUser && (
              <Link
                href={`/user/edit-profile`}
                className="primary_btn flex items-center gap-2"
              >
                <span>Edit Profile</span>
                <PenBoxIcon className="sm:size-6 size-4 text-secondary" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5">
          <p className="text-30-semibold sm:!text-[36px] !text-[26px]">
            {isCurrentUser ? "Your" : `${user.name}'s`} Startups
          </p>

          {startups.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-5 gap-4">
              <p className="text-xl font-medium text-gray-600">
                No startups yet
              </p>
              {isCurrentUser && (
                <Link
                  href="/startup/create"
                  className="primary_btn !bg-white !text-black-100 flex flex-row items-center gap-2"
                >
                  <span>Submit Startup</span>
                  <PlusCircleIcon className="size-6" />
                </Link>
              )}
            </div>
          ) : (
            <ul className="card_grid">
              <Suspense fallback={<StartupCardSkeleton />}>
                <UserStartups id={user._id} />
              </Suspense>
            </ul>
          )}
        </div>
      </section>
    </>
  );
};

export default page;
