"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "./utils";
import slugify from "slugify";
import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";
import {
  COMMENTS_BY_STARTUP_QUERY,
  FEEDBACK_STATS_BY_USERID_QUERY,
  FEEDBACK_STATS_QUERY,
  STARTUPS_BY_AUTHOR_QUERY,
} from "@/sanity/lib/queries";
import { nanoid } from "nanoid";

function topologicalSortComments(comments: any[]) {
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  const allIds = new Set<string>();

  comments.forEach(({ _id }) => {
    graph[_id] = [];
    inDegree[_id] = 0;
    allIds.add(_id);
  });

  comments.forEach(({ _id, parent }) => {
    if (parent?._ref) {
      const parentId = parent._ref;
      if (graph[parentId]) {
        graph[parentId].push(_id);
        inDegree[_id]++;
      }
    }
  });

  const queue: string[] = Object.keys(inDegree).filter(
    (id) => inDegree[id] === 0
  );
  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    for (const neighbor of graph[current] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Reverse to delete children first
  return result.reverse();
}

export const deletePost = async (postId: string) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not authenticated",
      status: "ERROR",
    });
  }

  try {
    // Step 1: Get all comments and votes referencing the post
    const referencingDocs = await client.fetch(
      `*[_type in ["vote", "feedback", "comment"] && references($postId)]{_id, _type, parent}`,
      { postId }
    );

    // Step 2: Separate references
    const comments = referencingDocs.filter(
      (doc: { _type: string }) => doc._type === "comment"
    );
    const votes = referencingDocs.filter(
      (doc: { _type: string }) => doc._type === "vote"
    );
    const feedbacks = referencingDocs.filter(
      (doc: { _type: string }) => doc._type === "feedback"
    );

    // Step 3: Topologically sort comments so children get deleted before parents
    const sortedCommentIds = topologicalSortComments(comments);

    // Step 4: Delete all votes
    for (const vote of votes) {
      await writeClient.delete(vote._id);
    }

    for (const feedback of feedbacks) {
      await writeClient.delete(feedback._id);
    }

    // Step 5: Delete comments in correct order
    for (const commentId of sortedCommentIds) {
      await writeClient.delete(commentId);
    }

    // Step 6: Delete the post itself
    const res = await writeClient.delete(postId);

    return parseServerActionResponse({
      status: "SUCCESS",
      data: res,
    });
  } catch (error) {
    console.error("Delete failed:", error);
    return parseServerActionResponse({
      error: "Failed to delete post and references",
      status: "ERROR",
    });
  }
};

export const uploadImage = async (file: File) => {
  if (!file || !(file instanceof File) || file.size === 0) {
    return parseServerActionResponse({
      error: "No file provided",
      status: "ERROR",
    });
  }

  try {
    const imageAsset = await writeClient.assets.upload("image", file, {
      contentType: file.type,
      filename: file.name,
    });

    return parseServerActionResponse({
      url: imageAsset.url,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const sas = async (file: File) => {
  if (!file || !(file instanceof File) || file.size === 0) {
    return parseServerActionResponse({
      error: "No file provided",
      status: "ERROR",
    });
  }

  try {
    const imageAsset = await writeClient.assets.upload("image", file, {
      contentType: file.type,
      filename: file.name,
    });

    return parseServerActionResponse({
      url: imageAsset.url,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const createPitch = async (
  state: any,
  form: any,
  pitch: string,
  tags: string[]
) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { id, title, description, category, picture, problem, audience } = form;

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    const startup = {
      title,
      description,
      problem,
      audience,
      category,
      picture,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: session?.id,
      },
      pitch,
      tags,
    };

    let result;

    if (id) {
      result = await writeClient.patch(id).set(startup).commit();
    } else {
      result = await writeClient.create({ _type: "startup", ...startup });
    }

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.log(error);

    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const editProfile = async (prevState: any, data: any) => {
  const session = await auth();

  if (!session)
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });

  const { name, username, email, image, bio } = data;

  try {
    // Check for existing username
    const existingUsername = await client.fetch(
      `*[_type == "author" && username == $username && _id != $id][0]`,
      { username, id: session.id }
    );

    if (existingUsername) {
      return parseServerActionResponse({
        fieldErrors: { username: "Username already taken!" },
        status: "ERROR",
      });
    }

    // Check for existing email
    // const existingEmail = await client.fetch(
    //   `*[_type == "author" && email == $email && _id != $id][0]`,
    //   { email, id: session.id }
    // );

    // if (existingEmail) {
    //   return parseServerActionResponse({
    //     fieldErrors: { email: "Email already taken." },
    //     status: "ERROR",
    //   });
    // }

    // Proceed with update if both are unique
    const result = await writeClient
      .patch(session.id) // session.id should be the _id of the user document in Sanity
      .set({
        name,
        username,
        email,
        image,
        bio,
      })
      .commit();

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

// Vote Functionality
export async function toggleVote(postId: string) {
  const session = await auth();
  if (!session?.id) return { success: false };

  const userId = session.id;

  const existing = await client.fetch(
    `*[_type == "vote" && user._ref == $userId && post._ref == $postId][0]`,
    { userId, postId },
    { useCdn: false }
  );

  if (existing) {
    await writeClient.delete(existing._id);
    return { success: true, voted: false };
  } else {
    // Prevent double vote race condition
    const duplicate = await client.fetch(
      `*[_type == "vote" && user._ref == $userId && post._ref == $postId][0]`,
      { userId, postId },
      { useCdn: false }
    );
    if (duplicate) {
      return { success: true, voted: true }; // already voted, no need to create again
    }

    await writeClient.create({
      _type: "vote",
      user: { _type: "reference", _ref: userId },
      post: { _type: "reference", _ref: postId },
    });

    return { success: true, voted: true };
  }
}

//comment functionality
export async function postComment({
  content,
  postId,
  parentId,
}: {
  content: string;
  postId: string;
  parentId?: string;
}) {
  const session = await auth();
  if (!session?.id) return { success: false };

  const comment = {
    _type: "comment",
    content,
    createdAt: new Date().toISOString(),
    user: { _type: "reference", _ref: session.id },
    post: { _type: "reference", _ref: postId },
    ...(parentId && { parent: { _type: "reference", _ref: parentId } }),
  };

  await writeClient.create(comment);
  return { success: true };
}

export async function toggleCommentLike(commentId: string) {
  const session = await auth();
  if (!session?.id) return { success: false };

  const comment = await client.getDocument(commentId);
  const userRef = session.id;

  if (!comment) {
    return { success: false, error: "Comment not found" };
  }

  const alreadyLiked = comment.likes?.some(
    (like: any) => like._ref === userRef
  );

  if (alreadyLiked) {
    await writeClient
      .patch(commentId)
      .unset([`likes[_ref=="${userRef}"]`])
      .commit();
  } else {
    await writeClient
      .patch(commentId)
      .setIfMissing({ likes: [] })
      .insert("after", "likes[-1]", [
        {
          _type: "reference",
          _ref: userRef,
          _key: nanoid(),
        },
      ])
      .commit();
  }

  return { success: true, liked: !alreadyLiked };
}

function buildCommentTree(comments: any[]) {
  const commentMap: Record<string, any> = {};
  const rootComments: any[] = [];

  comments.forEach((comment) => {
    comment.replies = [];
    commentMap[comment._id] = comment;
  });

  comments.forEach((comment) => {
    if (comment.parent) {
      const parent = commentMap[comment.parent];
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

export async function fetchComments(postId: string) {
  const flatComments = await client.fetch(
    COMMENTS_BY_STARTUP_QUERY,
    { postId },
    { useCdn: false }
  );

  return buildCommentTree(flatComments);
}

//Delete Comment
async function deleteCommentAndReplies(commentId: string) {
  // Step 1: Get all direct replies to this comment
  const replies: { _id: string }[] = await client.fetch(
    `*[_type == "comment" && parent._ref == $commentId]{ _id }`,
    { commentId }
  );

  // Step 2: Recursively delete each reply (and its replies)
  for (const reply of replies) {
    await deleteCommentAndReplies(reply._id);
  }

  // Step 3: Delete this comment itself
  await writeClient.delete(commentId);
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.id) return { success: false, error: "Unauthorized" };

  const comment = await client.getDocument(commentId);
  if (!comment) return { success: false, error: "Comment not found" };

  if (comment.user._ref !== session.id) {
    return { success: false, error: "Permission denied" };
  }

  try {
    await deleteCommentAndReplies(commentId);
    return { success: true };
  } catch (error) {
    console.error("Delete comment failed:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

export const submitFeedback = async ({
  postId,
  innovation,
  problemClarity,
  solutionClarity,
  productMarketFit,
  execution,
  monetization,
}: {
  postId: string;
  innovation: number;
  problemClarity: number;
  solutionClarity: number;
  productMarketFit: number;
  execution: number;
  monetization: number;
}) => {
  const session = await auth();
  if (!session?.id) return { success: false, error: "Not authenticated" };

  try {
    const existing = await client.fetch(
      `*[_type == "feedback" && post._ref == $postId && user._ref == $userId][0]{
        _id
      }`,
      { postId, userId: session.id },
      { useCdn: false }
    );

    if (existing?._id) {
      await writeClient
        .patch(existing._id)
        .set({
          innovation,
          problemClarity,
          solutionClarity,
          productMarketFit,
          execution,
          monetization,
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return { success: true, updated: true };
    }

    await writeClient.create({
      _type: "feedback",
      post: { _type: "reference", _ref: postId },
      user: { _type: "reference", _ref: session.id },
      innovation,
      problemClarity,
      solutionClarity,
      productMarketFit,
      execution,
      monetization,
      createdAt: new Date().toISOString(),
    });

    return { success: true, updated: false };
  } catch (e) {
    console.error("Feedback submission error:", e);
    return { success: false, error: "Failed to submit" };
  }
};

export const getUserFeedback = async (postId: string, userId: string) => {
  return await client.fetch(
    `*[_type == "feedback" && post._ref == $postId && user._ref == $userId][0]`,
    { postId, userId },
    { useCdn: false }
  );
};

export async function feedbackAvgCalculator(
  feedbacks: any,
  totalFeedbacks: number
) {
  const avg = feedbacks.reduce(
    (acc: any, f: any) => {
      acc.innovation += f.innovation;
      acc.problemClarity += f.problemClarity;
      acc.solutionClarity += f.solutionClarity;
      acc.productMarketFit += f.productMarketFit;
      acc.execution += f.execution;
      acc.monetization += f.monetization;
      return acc;
    },
    {
      innovation: 0,
      problemClarity: 0,
      solutionClarity: 0,
      productMarketFit: 0,
      execution: 0,
      monetization: 0,
    }
  );

  return {
    innovation: avg.innovation / totalFeedbacks,
    problemClarity: avg.problemClarity / totalFeedbacks,
    solutionClarity: avg.solutionClarity / totalFeedbacks,
    productMarketFit: avg.productMarketFit / totalFeedbacks,
    execution: avg.execution / totalFeedbacks,
    monetization: avg.monetization / totalFeedbacks,
    totalFeedbacks,
  };
}

export async function getAverageFeedbackStats(postId: string) {
  const feedbacks = await client.fetch(
    FEEDBACK_STATS_QUERY,
    { postId },
    { useCdn: false }
  );

  if (feedbacks.length === 0) return null;

  const totalFeedbacks = feedbacks.length;

  return feedbackAvgCalculator(feedbacks, totalFeedbacks);
}

export async function deleteFeedback(postId: string, userId: string) {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not authenticated",
      status: "ERROR",
    });
  }

  try {
    const feedbacks = await client.fetch(FEEDBACK_STATS_BY_USERID_QUERY, {
      postId,
      userId,
    });

    if (feedbacks) {
      await writeClient.delete(feedbacks._id);
    }

    return parseServerActionResponse({
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Feedback delete failed:", error);
    return parseServerActionResponse({
      error: "Failed to delete feedback",
      status: "ERROR",
    });
  }
}

// helper function
function avg(values: number[]) {
  const filtered = values.filter((v) => typeof v === "number");
  if (filtered.length === 0) return null;
  const total = filtered.reduce((sum, val) => sum + val, 0);
  return Math.round((total / filtered.length) * 10) / 10;
}

export async function getStartupsByAuthorWithFeedback(userId: string) {
  try {
    const startups = await client.fetch(
      STARTUPS_BY_AUTHOR_QUERY,
      { id: userId },
      { useCdn: false }
    );

    if (!startups || startups.length === 0) return [];

    const startupsWithRatings = startups.map((startup: any) => {
      const feedbacks = startup.feedbacks || [];
      const totalFeedbacks = feedbacks.length;

      const avgRating =
        totalFeedbacks > 0
          ? feedbacks.reduce(
              (sum: any, f: any) =>
                sum +
                (f.innovation +
                  f.productMarketFit +
                  f.execution +
                  f.problemClarity +
                  f.solutionClarity +
                  f.monetization) /
                  6,
              0
            ) / totalFeedbacks
          : 0;

      return {
        ...startup,
        feedbackCount: totalFeedbacks,
        avgRating,
      };
    });

    return startupsWithRatings;
  } catch (error) {
    console.error("Author startups not found:", error);
    return [];
  }
}
