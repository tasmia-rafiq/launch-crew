"use client";

import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePost } from "@/lib/actions";

export default function PostDropdown({ postId, postSlug }: { postId: string; postSlug?: string }) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/startup/edit/${postSlug}`);
  };

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      const res = await deletePost(postId);

      if (res.status === "SUCCESS") {
        toast.success("Post deleted successfully.");
        router.push("/");
      } else {
        toast.error(res.error || "Failed to delete the post.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="self-end cursor-pointer outline-none">
          <EllipsisIcon className="size-6" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 bg-white border-[#cecece]"
      >
        <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
          <PencilIcon /> Edit Post
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-500 focus:text-red-500 cursor-pointer"
        >
          <Trash2Icon /> Delete Post
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
