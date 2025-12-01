"use client";

import Image from "next/image";
import { HomeButton } from "@/components/HomeButton";
import { SignInWithMicrosoftButton } from "@/components/SignInButton";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Lewa kolumna */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center items-center gap-2 md:justify-start">
          <HomeButton withText={true} />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <SignInWithMicrosoftButton />
        </div>
      </div>

      {/* Prawa kolumna */}
      <div className="relative hidden lg:flex items-center justify-center">
        <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-t-full">
          <Image
            src="https://group.vattenfall.com/cdn-cgi/image/width=1494,format=auto,fit=crop,height=1494/globalassets/com/sustainability/beach_sun_1x1.jpg"
            alt="Image"
            fill
            className="object-cover"
            loading="eager"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  );
}
