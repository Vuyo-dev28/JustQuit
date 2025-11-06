
'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import BottomNav from "@/components/shared/BottomNav";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, vault: true, intent: "subscription" }}>
      <div className="flex flex-col h-screen" style={{
         backgroundImage: 'radial-gradient(circle, #0c1445 0%, #0c1445 40%, #000 100%)'
      }}>
        <main className="flex-1 overflow-y-auto pb-28">{children}</main>
        <BottomNav />
      </div>
    </PayPalScriptProvider>
  );
}
