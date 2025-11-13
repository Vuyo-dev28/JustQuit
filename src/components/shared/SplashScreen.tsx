
import { AppLogo } from "@/components/shared/AppLogo";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

export default function SplashScreen() {
  return (
    <div 
      className="flex flex-col items-center justify-center h-screen bg-background animate-in fade-in-0 duration-1000 bg-cover bg-center"
      style={{ backgroundImage: "url('/splash.gif')" }}
    >
    </div>
  );
}
