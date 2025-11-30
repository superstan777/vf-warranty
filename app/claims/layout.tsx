// app/claims/layout.tsx
import React from "react";
import { TopBar } from "@/components/TopBar";

interface ClaimsLayoutProps {
  children: React.ReactNode;
}

export default function ClaimsLayout({ children }: ClaimsLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* TopBar */}
      <TopBar />

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
