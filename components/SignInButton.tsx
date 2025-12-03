"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";

export function SignInWithMicrosoftButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("microsoft-entra-id");
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="h-[41px] gap-3 px-4 py-2 rounded-md flex items-center justify-center"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      <Image
        src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.svg"
        alt="Microsoft Logo"
        width={20}
        height={20}
      />

      {isLoading ? (
        <span className="text-[15px] font-semibold text-[#5e5e5e] animate-pulse">
          Redirecting...
        </span>
      ) : (
        <span className="text-[15px] font-semibold text-[#5e5e5e]">
          Sign in with Microsoft
        </span>
      )}
    </Button>
  );
}
