"use client";

import { useState } from "react";
import { SignInForms } from "./SignInForms";
import { ArrowRightToLine, X } from "lucide-react";

export const LoginModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="primary_btn flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <span>Sign in</span>
        <ArrowRightToLine className="size-5 text-secondary" />
      </button>

      {isOpen && (
        <div className="login_modal">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-12 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-semibold text-center mb-6">
              Sign in to LaunchMate
            </h2>
            <p className="text-16-medium !text-black-200 text-center mb-6">
              Validate your startup idea, share with the community, and gain
              early insights — all in one place.
            </p>

            <SignInForms />
          </div>
        </div>
      )}
    </>
  );
};
