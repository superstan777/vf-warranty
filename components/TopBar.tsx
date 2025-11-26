"use client";

import Link from "next/link";

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 w-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-between px-8 py-4 z-50">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-xl font-semibold text-black dark:text-zinc-50"
        >
          Warranty Timeline
        </Link>
      </div>
    </div>
  );
}
