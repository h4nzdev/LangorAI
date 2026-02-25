'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BarChart3, Settings, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

  const navItems = [
    { label: 'Home', icon: Home, href: '/dashboard' },
    { label: 'Practice', icon: MessageSquare, href: '/practice' },
    { label: 'Insights', icon: BarChart3, href: '/profile' },
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
          {navItems.map((item) => {
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
          <Link href="/profile" className="block">
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
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}