'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BarChart3, Settings, Globe, Swords, Trophy, User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navigation() {
  const pathname = usePathname();
  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState('👤');
  const [userLevel, setUserLevel] = useState('Intermediate');

  useEffect(() => {
    const savedName = localStorage.getItem('USER_NAME');
    if (savedName) setUserName(savedName);

    const savedAvatar = localStorage.getItem('USER_AVATAR');
    if (savedAvatar) setUserAvatar(savedAvatar);

    const savedLevel = localStorage.getItem('USER_LEVEL');
    if (savedLevel) setUserLevel(savedLevel);
  }, []);

  const mainNavItems = [
    { label: 'Home', icon: Home, href: '/dashboard' },
    { label: 'Practice', icon: MessageSquare, href: '/practice' },
    { label: 'Insights', icon: BarChart3, href: '/profile' },
  ];

  const profileNavItems = [
    { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border fixed inset-y-0 left-0 z-50 transition-colors duration-300">
        <div className="p-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground">Langor AI</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "group-hover:scale-110 transition-transform")} />
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Battle Mode - Highlighted */}
          <Link
            href="/battle"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
              pathname === "/battle"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-muted-foreground hover:bg-yellow-500/10 hover:text-yellow-500"
            )}
          >
            <Swords className="h-5 w-5" />
            <span className="font-bold text-sm">Battle</span>
          </Link>
          
          {/* Profile Nav Items */}
          {profileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "group-hover:scale-110 transition-transform")} />
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="bg-card rounded-[2rem] p-4 flex items-center gap-3 border border-border hover:border-primary/50 transition-colors">
                <Avatar className="h-10 w-10 border-2 border-primary/20 bg-background">
                  <AvatarFallback className="text-xl">
                    {userAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-foreground truncate">{userName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{userLevel}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px] mx-6">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span>{userName}</span>
                  <span className="text-xs text-muted-foreground font-normal">{userLevel}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/leaderboard" className="flex items-center cursor-pointer">
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="flex items-center cursor-pointer text-primary">
                  <Swords className="mr-2 h-4 w-4" />
                  Battle Mode
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left Side - Home, Practice */}
          <div className="flex items-center gap-1">
            {mainNavItems.slice(0, 2).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-colors p-2",
                    isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[9px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Center - Battle Mode - Highlighted */}
          <Link
            href="/battle"
            className="flex flex-col items-center gap-1 -mt-6"
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all",
              pathname === "/battle"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-orange-500/50 scale-110"
                : "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-orange-500/30"
            )}>
              <Swords className="h-7 w-7 text-white" />
            </div>
          </Link>
          
          {/* Right Side - Insights, More */}
          <div className="flex items-center gap-1">
            {mainNavItems.slice(2).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-colors p-2",
                    isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[9px]">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex flex-col items-center gap-1 p-2">
                <Avatar className={cn(
                  "h-8 w-8 border-2 transition-colors",
                  pathname === "/profile" || pathname === "/settings" || pathname === "/leaderboard"
                    ? "border-primary" 
                    : "border-muted-foreground/30"
                )}>
                  <AvatarFallback className="text-sm">
                    {userAvatar}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userLevel}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboard" className="flex items-center cursor-pointer">
                    <Trophy className="mr-2 h-4 w-4" />
                    Leaderboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="flex items-center cursor-pointer text-primary font-bold">
                    <Swords className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
}