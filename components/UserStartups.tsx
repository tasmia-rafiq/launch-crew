import { client } from "@/sanity/lib/client";
import { STARTUPS_BY_AUTHOR_QUERY } from "@/sanity/lib/queries";
import StartupCard, { StartupCardType } from "./StartupCard";

const UserStartups = async ({ id }: { id: string }) => {
  const startups = await client.fetch(STARTUPS_BY_AUTHOR_QUERY, { id });

  return (
    <>
      {startups.map((startup: StartupCardType) => (
        <StartupCard key={startup._id} post={startup} />
      ))}
    </>
  );
};

export default UserStartups;
