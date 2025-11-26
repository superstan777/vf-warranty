"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Button
        className="p-6 flex bg-slate-900 rounded-lg cursor-pointer"
        onClick={() => signIn("microsoft-entra-id")}
      >
        <span>Sign in with Microsoft Entra ID</span>
        <Image
          src="https://authjs.dev/img/providers/microsoft-entra-id.svg"
          alt="ms-entra-logo"
          loading="lazy"
          height="24"
          width="24"
        />
      </Button>
    </div>
  );
}
