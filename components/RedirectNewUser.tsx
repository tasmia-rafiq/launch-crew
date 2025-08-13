"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectNewUser() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.isNewUser) {
      router.replace("/user/edit-profile?new=true");
    }
  }, [status, session, router]);

  return null;
}