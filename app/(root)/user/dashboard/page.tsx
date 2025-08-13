import { getStartupsByAuthorWithFeedback } from "@/lib/actions";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Lightbulb, Inbox } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return redirect("/login");

  const startups = await getStartupsByAuthorWithFeedback(session.id);

  return (
    <div className="section_container mt-20">
      <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Track your ideas, feedback, and saved startups.
      </p>

      <Tabs defaultValue="my-ideas" className="w-full">
        <TabsList className="mb-6 w-full bg-gray-100 rounded-lg p-1">
          <TabsTrigger className="flex-1" value="my-ideas">
            My Ideas
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="feedback">
            Feedback I Gave
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="saved">
            Saved Ideas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-ideas">
          {startups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <Inbox className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium">
                You haven't submitted any ideas yet.
              </p>
              <p className="text-sm">
                Share your first startup idea and start collecting feedback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {startups.map((startup: any) => (
                <Card
                  key={startup._id}
                  className="hover:shadow-lg border border-gray-200 transition-all duration-200 rounded-xl"
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-semibold leading-tight truncate max-w-[80%]">
                        {startup.title}
                      </h2>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          startup.status === "draft"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {startup.status || "Published"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-5">
                      {startup.description}
                    </p>
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Avg. Rating:{" "}
                        <strong>
                          {typeof startup.avgRating === "number"
                            ? startup.avgRating.toFixed(1)
                            : "N/A"}
                        </strong>
                      </div>
                      <div>
                        Feedbacks:{" "}
                        <strong>{startup.feedbackCount || 0}</strong>
                      </div>
                    </div>
                    <Link
                      href={`/user/dashboard/${startup._id}/analytics`}
                      className="block mt-4 text-blue-600 hover:underline text-sm font-medium"
                    >
                      View Analytics →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="feedback">
          <div className="py-20 text-center text-muted-foreground">
            Coming soon: Feedback you gave will be shown here.
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="py-20 text-center text-muted-foreground">
            Coming soon: Your saved ideas will be shown here.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}