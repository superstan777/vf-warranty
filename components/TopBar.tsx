"use client";

import { CreateClaimDialog } from "./CreateClaimDialog";
import { usePathname } from "next/navigation";
import { HomeButton } from "./HomeButton";

export const TopBar = () => {
  const pathname = usePathname();

  return (
    <div className="w-full h-16 flex items-center justify-between px-4 bg-white">
      <HomeButton />
      {pathname === "/claims" && <CreateClaimDialog />}
    </div>
  );
};
