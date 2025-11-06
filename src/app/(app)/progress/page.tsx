import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProgressPage() {
  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-headline">Your Progress</h1>
        <p className="text-muted-foreground">A detailed look at your journey.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Detailed charts and a full calendar view of your progress will be available here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center text-muted-foreground h-48">
          <TrendingUp className="h-16 w-16" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">Milestones you've achieved will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
