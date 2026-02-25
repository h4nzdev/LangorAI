'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Key, 
  Save, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Moon, 
  Sun,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/navigation';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load API key
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) setApiKey(savedKey);

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('THEME_MODE');
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('THEME_MODE', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('THEME_MODE', 'light');
    }
  };

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setIsSaved(true);
    
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-body transition-colors duration-300">
      <Navigation />

      <div className="flex-1 flex flex-col md:pl-64">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-5 max-w-xl mx-auto w-full shrink-0">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full md:hidden">
            <Link href="/dashboard">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </header>

        <main className="flex-1 max-w-xl mx-auto w-full px-6 space-y-8 pb-24 md:pb-12">
          
          {/* Appearance Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Palette className="h-5 w-5" />
              <h2 className="font-bold text-lg">Appearance</h2>
            </div>
            
            <Card className="bg-card border-none shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm">Theme Mode</CardTitle>
                <CardDescription className="text-xs">
                  Switch between light and dark themes for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-yellow-500" />
                    )}
                    <Label htmlFor="dark-mode" className="font-bold cursor-pointer">
                      {isDarkMode ? 'Dark' : 'Light'} Mode
                    </Label>
                  </div>
                  <Switch 
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* AI Configuration Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Key className="h-5 w-5" />
              <h2 className="font-bold text-lg">AI Configuration</h2>
            </div>
            
            <Card className="bg-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Gemini API Key</CardTitle>
                <CardDescription className="text-xs">
                  Required for real-time AI conversations and feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="Enter your API key" 
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      if (isSaved) setIsSaved(false);
                    }}
                    className="bg-background border-border focus:ring-primary h-11"
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Your key is saved only in your browser's local storage.
                  </p>
                </div>
                <Button 
                  onClick={handleSave} 
                  className={cn(
                    "w-full transition-all duration-300 font-bold gap-2",
                    isSaved 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  )}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Changes Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Configuration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Instructions Card */}
          <Card className="bg-primary/5 border border-primary/20">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-primary">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Info className="h-4 w-4" />
                </div>
                How to get an API Key?
              </div>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside px-1">
                <li>Visit the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">Google AI Studio</a>.</li>
                <li>Create or select a project.</li>
                <li>Click "Create API key in new project".</li>
                <li>Copy and paste the key here.</li>
              </ol>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
