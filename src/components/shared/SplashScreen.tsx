
import { AppLogo } from "@/components/shared/AppLogo";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

export default function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background animate-in fade-in-0 duration-1000">
      <div className="flex flex-col items-center gap-6">
        <AppLogo />
        <Badge variant="secondary" className="border-primary/20 border text-base text-primary/90 py-2 px-4 rounded-full">
            <Award className="mr-2 h-5 w-5"/>
            #1 in Health & Fitness
        </Badge>
      </div>
    </div>
  );
}
