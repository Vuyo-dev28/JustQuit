
'use client';

import BottomNav from "@/components/shared/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto pb-28">{children}</main>
        <BottomNav />
      </div>
  );
}
