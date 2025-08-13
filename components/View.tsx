import { client } from "@/sanity/lib/client";
import Ping from "./Ping";
import { STARTUP_VIEWS_QUERY } from "@/sanity/lib/queries";
import { writeClient } from "@/sanity/lib/write-client";

const View = async ({
  id,
  authorId,
  sessionId,
}: {
  id: string;
  authorId: string;
  sessionId?: string;
}) => {
  const { views: totalViews } = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_VIEWS_QUERY, { id });

  // Update number of views
  if (sessionId && sessionId !== authorId) {
    await writeClient
      .patch(id)
      .set({ views: (totalViews || 0) + 1 })
      .commit();
  }

  return (
    <div className="view-container">
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>

      <p className="view-text">
        <span className="font-bold">Views: {totalViews == null ? (0) : ((totalViews || 0) + 1)}</span>
      </p>
    </div>
  );
};

export default View;
