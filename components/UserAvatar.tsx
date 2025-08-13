import { client } from "@/sanity/lib/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";

const UserAvatar = async ({ id, size }: { id?: string; size: string }) => {
  if (!id) return null;
  const author = await client.fetch(
    AUTHOR_BY_ID_QUERY,
    { id: id },
    { useCdn: false }
  );
  return (
    <Avatar className={size}>
      <AvatarImage
        src={author?.image || null}
        alt={author?.name || null}
        className="object-cover"
      />
      <AvatarFallback>
        <span className="text-[16px] font-semibold bg-primary !text-white rounded-full flex items-center justify-center w-full h-full">
          {author?.name?.charAt(0) || "U"}
        </span>
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
