
'use client';

import BottomNav from "@/components/shared/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex flex-col h-screen" style={{
         backgroundImage: 'radial-gradient(circle, #0c1445 0%, #0c1445 40%, #000 100%)'
      }}>
        <main className="flex-1 overflow-y-auto pb-28">{children}</main>
        <BottomNav />
      </div>
  );
}
