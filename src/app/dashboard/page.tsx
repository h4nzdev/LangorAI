'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  BookOpen, 
  MessageCircle, 
  Trophy, 
  Settings, 
  LogOut, 
  Plus, 
  Play,
  TrendingUp,
  Clock,
  Mic
} from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold">L</span>
              </div>
              <span className="text-xl font-bold group-data-[collapsible=icon]:hidden">Langor AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Dashboard">
                    <TrendingUp className="h-4 w-4" />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Practice">
                    <MessageCircle className="h-4 w-4" />
                    <span>Practice Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Lessons">
                    <BookOpen className="h-4 w-4" />
                    <span>Curriculum</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Achievements">
                    <Trophy className="h-4 w-4" />
                    <span>Achievements</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-destructive" tooltip="Logout">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 ml-4">
              <Badge variant="outline" className="flex items-center gap-1 font-bold text-orange-600 border-orange-200 bg-orange-50">
                <Flame className="h-3 w-3 fill-orange-600" />
                12 Day Streak
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Button size="sm" variant="outline">
                Change Language: <span className="font-bold ml-1">Spanish 🇪🇸</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15 / 20m</div>
                  <Progress value={75} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">5 more minutes to keep your streak!</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Fluency Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">A2 Upper</div>
                  <p className="text-xs text-muted-foreground mt-1">+4% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
                  <BookOpen className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,245</div>
                  <p className="text-xs text-muted-foreground mt-1">24 new today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Rank</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Silver League</div>
                  <p className="text-xs text-muted-foreground mt-1">Top 15% of learners</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 mt-6 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Recommended Practice</CardTitle>
                  <CardDescription>Based on your recent mistakes and goals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-blue-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold">At the Restaurant</div>
                        <div className="text-sm text-muted-foreground">Practice ordering and small talk</div>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/practice">
                        <Play className="h-3 w-3 mr-1 fill-current" /> Start
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-accent/10 rounded-full text-accent">
                        <Mic className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold">The Subjunctive Mood</div>
                        <div className="text-sm text-muted-foreground">Focus on advanced grammar</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Start</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-500/10 rounded-full text-purple-600">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold">Custom Scenario</div>
                        <div className="text-sm text-muted-foreground">Describe a scene you want to practice</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Create</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Job Interview Prep', time: '2 hours ago', score: '85%' },
                      { title: 'Vocabulary Quiz', time: 'Yesterday', score: '100%' },
                      { title: 'Airport Scenario', time: '2 days ago', score: '92%' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.time}</div>
                        </div>
                        <Badge variant="secondary">{item.score}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}