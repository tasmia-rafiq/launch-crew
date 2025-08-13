"use client";

import { useState } from "react";
import { LogOutIcon, Menu, RocketIcon, X } from "lucide-react";
import Link from "next/link";
import { signOutSession } from "@/lib/auth-actions";
import { LoginModal } from "./LoginModal";
import UserAvatar from "./UserAvatar";

export const MobileMenu = ({ session, profileAvatar }: { session: any; profileAvatar: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <button onClick={toggleMenu} className="text-black z-50 relative">
        <Menu size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-1000 bg-black/55 flex justify-end">
          <div className="w-[80%] h-full bg-white shadow-lg p-6 flex flex-col gap-4 relative">
            <button
              onClick={toggleMenu}
              className="absolute top-6.5 right-6 text-black"
            >
              <X size={28} />
            </button>

            <div className="mt-10 flex flex-col gap-4">
              <Link href="/explore" onClick={toggleMenu} className="text-[16px] font-medium">
                Explore
              </Link>
              <Link href="/about" onClick={toggleMenu} className="text-[16px] font-medium">
                About
              </Link>

              {session && session.user ? (
                <div className="border-t-1 border-[#cecece] pt-4 flex flex-col gap-4">
                  <Link
                    href="/startup/create"
                    onClick={toggleMenu}
                    className="text-[16px] font-medium flex items-center gap-2"
                  >
                    <RocketIcon className="size-4" /> Submit
                  </Link>

                  <Link href={`/user/${session?.id}`} className="text-[16px] font-medium flex items-center gap-2">
                    {profileAvatar} Profile
                  </Link>

                  <button
                    onClick={() => {
                      signOutSession();
                      toggleMenu();
                    }}
                    className="text-red-500 text-[16px] font-medium text-left flex items-center gap-2"
                  >
                    <LogOutIcon className="size-4" /> Logout
                  </button>
                </div>
              ) : (
                <LoginModal />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
