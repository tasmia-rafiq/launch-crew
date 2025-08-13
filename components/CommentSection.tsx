"use client";

import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import {
  toggleCommentLike,
  postComment,
  fetchComments,
  deleteComment,
} from "@/lib/actions";
import { formatDate } from "@/lib/utils";
import { client } from "@/sanity/lib/client";

import markdownit from "markdown-it";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import {
  ArrowBigUp,
  Clock,
  MessageCircleReply,
  MinusCircle,
  PlusCircleIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function CommentSection({
  postId,
  postAuthor,
  session,
}: {
  postId: string;
  postAuthor: string;
  session?: any;
}) {
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<null | {
    id: string;
    username: string;
  }>(null);
  const [commentsState, setComments] = useState<any[]>([]);

  useEffect(() => {
    const fetchedComments = async () => {
      const fetchedComments = await fetchComments(postId);
      setComments(fetchedComments);
    };
    fetchedComments();

    const subscription = client
      .listen(
        `*[_type == "comment" && post._ref == $postId]{
          _id,
          content,
          likes,
          parent,
          createdAt,
          user->{
            _id,
            name,
            username,
            image
          }
        }`,
        { postId }
      )
      .subscribe(async () => {
        const updated = await fetchComments(postId);
        setComments(updated);
      });

    return () => subscription.unsubscribe();
  }, [postId]);

  const handleSubmit = async () => {
    if (!session?.id) {
      toast.warning("Sign in to post a comment");
      return;
    }

    if (!content.trim()) return;
    setSubmitting(true);
    await postComment({
      postId,
      content,
      parentId: replyTo?.id ?? undefined,
    });
    setContent("");
    setReplyTo(null);
    setSubmitting(false);
  };

  return (
    <div className="mt-10 space-y-6">
      <h3 className="text-xl font-semibold">Comments</h3>

      <div className="space-y-3" data-color-mode="light">
        <MDEditor
          value={content}
          onChange={(value) => setContent(value || "")}
          id="comment-content"
          preview="edit"
          height={150}
          style={{ borderRadius: 10, overflow: "hidden" }}
          textareaProps={{
            placeholder: "What do you think?...",
            className: "!font-work-sans",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />
        <button
          disabled={submitting}
          onClick={handleSubmit}
          className="primary_btn !text-[16px]"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>

      <div className="space-y-4">
        {commentsState.map((comment: any) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            postId={postId}
            postAuthor={postAuthor}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            session={session}
            setComments={setComments}
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  postAuthor,
  setReplyTo,
  session,
  setComments,
  replyTo,
}: any) {
  const md = markdownit();

  const rawContent = comment?.content || "";
  const processedContent = rawContent.replace(
    /@(\w+)/g,
    (_: string, username: string) => {
      return `[@${username}](/user/${username})`;
    }
  );

  const parsedContent = md.render(processedContent);

  const isReplying = replyTo?.id === comment._id;
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const likes = comment.likes ?? [];
  const hasLiked = likes.some((l: any) => l._id === session?.id);
  const [showReplies, setShowReplies] = useState(true);

  useEffect(() => {
    if (isReplying) {
      setReplyContent(`@${comment.user.username} `);
    }
  }, [isReplying, comment.user.username]);

  const handleLike = async () => {
    if (!session?.id) {
      toast.warning("Sign in to upvote the comment");
      return;
    }

    const result = await toggleCommentLike(comment._id);
    if (!result.success) {
      toast.error("Failed to update like.");
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;
    const res = await deleteComment(comment._id);
    if (res.success) {
      const updated = await fetchComments(postId);
      setComments(updated);
    } else {
      alert(res.error || "Failed to delete comment");
    }
  };

  return (
    <div>
      <div className="flex sm:gap-3 gap-1.5 items-start relative">
        <Link href={`/user/${comment.user.username}`}>
          <Avatar className="sm:size-9 size-6">
            <AvatarImage
              src={comment.user?.image || null}
              alt={comment.user?.name || null}
              className="object-cover"
            />
            <AvatarFallback>
              <span className="text-[16px] font-semibold bg-primary !text-white rounded-full flex items-center justify-center w-full h-full">
                {comment.user?.name?.charAt(0) || "U"}
              </span>
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col sm:gap-2 gap-1 items-start">
          <div className="flex items-center gap-2">
            <Link
              href={`/user/${comment.user.username}`}
              className="sm:text-[18px] text-[16px] font-medium sm:leading-7 leading-5"
            >
              {comment.user.name}
            </Link>
            {comment.user._id === postAuthor && (
              <p className="text-xs text-black-300">Author</p>
            )}
          </div>

          <article
            className="prose !leading-[22px] !text-black sm:text-[16px] text-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />

          <div className="flex gap-4 text-sm font-semibold text-gray-600 mt-1">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-primary transition-colors duration-300 ${
                hasLiked ? "text-primary" : "text-gray-600"
              }`}
            >
              <ArrowBigUp className="size-5" />
              <span className="max-md:hidden">
                {hasLiked ? "Upvoted" : "Upvote"}
              </span>{" "}
              ({likes.length})
            </button>

            <button
              onClick={() => {
                session?.id
                  ? setReplyTo({
                      id: comment._id,
                      username: comment.user.username,
                    })
                  : toast.warning("Sign in to reply");
              }}
              className={`flex items-center gap-1 hover:text-primary transition-colors duration-500 ease-in-out `}
            >
              <MessageCircleReply className="size-4.5" />
              <span className="max-md:hidden">Reply</span>
            </button>
            <p className="font-normal flex items-center gap-1">
              <Clock className="size-4" />
              {formatDate(comment.createdAt)}
            </p>

            {session?.id === comment.user._id && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>

          {comment.replies?.length > 0 && (
            <button
              onClick={() => setShowReplies((prev) => !prev)}
              className="text-sm text-gray-500 hover:text-gray-800 absolute sm:left-4 left-1.5 bottom-0.5"
            >
              {showReplies ? (
                <MinusCircle className="size-4" />
              ) : (
                <PlusCircleIcon className="size-4" />
              )}
            </button>
          )}

          {/* If clicked on Reply button, then a new comment editor will open */}
          {isReplying && session?.user && (
            <div className="mt-3 space-y-2 ml-2" data-color-mode="light">
              <MDEditor
                value={replyContent}
                onChange={(value) => setReplyContent(value || "")}
                height={120}
                preview="edit"
                textareaProps={{
                  placeholder: `Replying to @${comment.user.username}...`,
                  className: "!font-work-sans",
                }}
              />
              <div className="flex gap-2">
                <button
                  className="primary_btn !text-sm !py-1"
                  disabled={submittingReply}
                  onClick={async () => {
                    if (!replyContent.trim()) return;
                    setSubmittingReply(true);
                    await postComment({
                      postId,
                      content: replyContent,
                      parentId: comment._id,
                    });
                    setReplyTo(null);
                    setReplyContent("");
                    setSubmittingReply(false);
                  }}
                >
                  {submittingReply ? "Replying..." : "Reply"}
                </button>
                <button
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && showReplies && (
        <div className="sm:ml-7 ml-4 mt-5 space-y-6 relative sm:pl-3 pl-2">
          {/* Vertical line for threading */}
          <div className="absolute -left-1 top-0 bottom-0 w-px bg-gray-300 pointer-events-none" />
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              postAuthor={postAuthor}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              session={session}
              setComments={setComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
