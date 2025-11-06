import { Flame } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
        <Flame className="text-primary-foreground" />
      </div>
      <h1 className="text-xl font-bold text-foreground font-headline">
        Just Quit
      </h1>
    </div>
  );
}
