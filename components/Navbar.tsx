import { auth } from "@/auth";
import { BadgePlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LoginModal } from "./LoginModal";
import UserAvatar from "./UserAvatar";
import { ProfileDropdown } from "./ProfileDropdown";
import { MobileMenu } from "./MobileNav";
import { getUserById } from "@/sanity/lib/user";

const Navbar = async () => {
  const session = await auth();
  const user = session?.id ? await getUserById(session.id) : null;

  return (
    <header className="px-5 py-3 bg-white shadow-md font-work-san fixed top-0 z-1000 w-full">
      <nav className="flex justify-between items-center">
        <Link href="/" className="w-[200px] h-[auto] flex items-center">
          <Image src="/logo.png" alt="Logo" width={200} height={40} className="!w-[auto] !h-auto" />
        </Link>

        {/* RENDERING THE BELOW BASED ON IF USER IS LOGGED IN OR NOT */}
        <div className="hidden lg:flex items-center gap-5">
          <div className="flex items-center gap-5">
            <Link href={"/explore"} className="nav-menu">
              Explore
            </Link>
            <Link href={"/about"} className="nav-menu">
              About
            </Link>
          </div>
          {session && session?.user ? (
            <>
              <Link
                href={"/startup/create"}
                className="primary_btn !text-[16px] !bg-white !text-black-100 flex items-center gap-2"
              >
                <span className="max-sm:hidden">Submit</span>
                <BadgePlus className="size-6 text-secondary" />
              </Link>

              {/* <form action={signOutSession}>
                <button type="submit">Logout</button>
              </form> */}

              {/* <Link href={`/user/${session?.id}`}>
                <UserAvatar id={session?.id} size="size-10" />
              </Link> */}

              <ProfileDropdown
                userAvatar={<UserAvatar id={session?.id} size="size-10" />}
                user={user}
              />
            </>
          ) : (
            <LoginModal />
          )}
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden">
          <MobileMenu session={session} profileAvatar={<UserAvatar id={session?.id} size="size-6" />} />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
