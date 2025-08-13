"use client";

import { useState } from "react";
import SignoutForm from "./SignoutForm";
import Link from "next/link";
import { ChartNoAxesColumn, User2Icon } from "lucide-react";

export const ProfileDropdown = ({
  userAvatar,
  user,
}: {
  userAvatar: React.ReactNode;
  user: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {userAvatar}
      </div>

      {isOpen && (
        <div className="profile-dropdown flex flex-col gap-0">
          <Link href={`/user/dashboard`} onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 profile-dropdown-item">
            <ChartNoAxesColumn className="size-4.5" />
            <span>Dashboard</span>
          </Link>
          <Link href={`/user/${user?.username}`} onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 profile-dropdown-item">
            <User2Icon className="size-4.5" />
            <span>Profile</span>
          </Link>
          <div className="profile-dropdown-item">
            <SignoutForm />
          </div>
        </div>
      )}
    </>
  );
};
