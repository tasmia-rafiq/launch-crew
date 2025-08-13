import { cn, formatDate } from "@/lib/utils"
import { EyeIcon } from "lucide-react"
import Image from "next/image";
import Link from "next/link"
import { Button } from "./ui/button";
import { Author, Startup } from "@/sanity/types";
import { Skeleton } from "./ui/skeleton";
import UserAvatar from "./UserAvatar";

export type StartupCardType = Omit<Startup, "author"> & { author?: Author }

const StartupCard = ({ post }: { post: StartupCardType }) => {
    const { _createdAt, views, author, title, category, tags, description, _id, picture, slug } = post;

  return (
    <li className="startup-card group">
        <div className="flex-between">
            <p className="startup-card_date">
                {formatDate(_createdAt)}
            </p>

            <div className="flex gap-1.5">
                <EyeIcon className="size-6 text-primary" />
                <span className="text-16-medium">{views}</span>
            </div>
        </div>

        <div className="flex-between !items-start mt-5 gap-5">
            <div className="flex-1">
                <Link href={`/user/${author?.username}`}>
                    <p className="text-16-medium !text-black-100 line-clamp-1">{author?.name}</p>
                </Link>
                <Link href={`/startup/${slug?.current}`}>
                    <h3 className="text-26-semibold line-clamp-1">{title}</h3>
                </Link>
            </div>

            <Link href={`/user/${author?.username}`} className="h-[48px]">
                <UserAvatar id={author?._id?.toString() ?? ""} size="size-10"/>
                {/* <Image src={author?.image || "/placeholder-avatar.png"} alt="placeholder" width={48} height={48} className="rounded-full h-full" /> */}
            </Link>
        </div>

        <Link href={`/startup/${slug?.current}`}>
            <p className="startup-card_desc">{description}</p>

            <img src={picture} alt="placeholder" className="startup-card_img" />
        </Link>

        <div className="flex-between gap-3 mt-5">
            <Link href={`/?query=${category?.toLowerCase()}`}>
                <p className="text-16-medium">{category}</p>
            </Link>

            <Button className="startup-card_btn" asChild>
                <Link href={`/startup/${slug?.current}`}>
                    Details
                </Link>
            </Button>
        </div>
    </li>
  )
}

export const StartupCardSkeleton = () => (
    <>
        {[0, 1, 2, 3, 4].map((index: number) => (
            <li key={cn('skeleton', index)}>
                <Skeleton className="startup-card_skeleton" />
            </li>
        ))}
    </>
)

export default StartupCard