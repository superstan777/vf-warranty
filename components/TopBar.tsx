"use client";

import Link from "next/link";
import { CreateClaimDialog } from "./CreateClaimDialog";
import { usePathname } from "next/navigation";

const LogoCircle = () => {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex flex-col">
      <div className="flex-1 bg-[#F9DC4A]"></div>
      <div className="flex-1 bg-[#3970B0]"></div>
    </div>
  );
};

export const TopBar = () => {
  const pathname = usePathname();

  return (
    <div className="w-full h-16 flex items-center justify-between px-4 bg-white">
      <Link href="/claims">
        <LogoCircle />
      </Link>

      {pathname === "/claims" && <CreateClaimDialog />}
    </div>
  );
};
