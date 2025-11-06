import { NotebookText, Target, TrendingUp } from "lucide-react";
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
      
      <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">90 days</div>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Your Pledge
              <NotebookText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground truncate italic">
              "I commit to my well-being and a better future."
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress History</CardTitle>
          <CardDescription>
            Detailed charts and a full calendar view of your progress will be available here soon.
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
