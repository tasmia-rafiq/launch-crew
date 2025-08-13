import { auth } from "@/auth";
import EditProfileForm from "@/components/EditProfileForm";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();

  if (!session?.id) redirect("/");

  const author = await client.fetch(
    AUTHOR_BY_ID_QUERY,
    { id: session.id },
    { useCdn: false }
  );

  if (!author) {
    console.log("Author not found for session ID:", session.id);
  }

  const userProfile = {
    id: author._id || "",
    name: author.name || "",
    username: author.username || "",
    email: author.email || "",
    image: author.image || "",
    bio: author.bio || "",
  };

  return (
    <div className="py-10 lg:px-30 sm:px-3 mt-22.5">
      <EditProfileForm defaultValues={userProfile} />
    </div>
  );
};

export default page;
