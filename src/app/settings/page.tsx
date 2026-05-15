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
  const [groqKey, setGroqKey]             = useState('');
  const [geminiKey, setGeminiKey]         = useState('');
  const [elevenlabsKey, setElevenlabsKey] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedGroq = localStorage.getItem('GROQ_API_KEY');
    if (savedGroq) setGroqKey(savedGroq);

    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) setGeminiKey(savedKey);

    const savedElKey = localStorage.getItem('ELEVENLABS_API_KEY');
    if (savedElKey) setElevenlabsKey(savedElKey);

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
    if (groqKey.trim()) {
      localStorage.setItem('GROQ_API_KEY', groqKey.trim());
    } else {
      localStorage.removeItem('GROQ_API_KEY');
    }
    if (geminiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', geminiKey.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    if (elevenlabsKey.trim()) {
      localStorage.setItem('ELEVENLABS_API_KEY', elevenlabsKey.trim());
    } else {
      localStorage.removeItem('ELEVENLABS_API_KEY');
    }
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

        <main className="flex-1 max-w-xl mx-auto w-full px-6 space-y-8 pb-32 md:pb-12">
          
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
            
            {/* Groq key — Battle Mode AI */}
            <Card className="bg-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  Groq API Key
                  <span className="text-[9px] font-black uppercase tracking-widest text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full">
                    Battle AI
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Powers AI grammar checking in Battle Mode. Leave blank to use your 1 free trial session.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter your Groq API key (starts with gsk_)"
                    value={groqKey}
                    onChange={(e) => { setGroqKey(e.target.value); if (isSaved) setIsSaved(false); }}
                    className="bg-background border-border focus:ring-primary h-11"
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Stored in your browser only. Free at console.groq.com.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gemini key — Practice Mode AI */}
            <Card className="bg-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  Gemini API Key
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Practice AI
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Required for AI conversations in Practice Mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={geminiKey}
                    onChange={(e) => { setGeminiKey(e.target.value); if (isSaved) setIsSaved(false); }}
                    className="bg-background border-border focus:ring-primary h-11"
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Stored in your browser only. Free at aistudio.google.com.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  ElevenLabs API Key
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Voice AI
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Optional — enables ultra-realistic AI voice in Practice sessions. Leave blank to use the browser's built-in voice.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter your ElevenLabs API key (optional)"
                    value={elevenlabsKey}
                    onChange={(e) => { setElevenlabsKey(e.target.value); if (isSaved) setIsSaved(false); }}
                    className="bg-background border-border focus:ring-primary h-11"
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Stored locally only. Clear the field to revert to browser voice.
                  </p>
                </div>
              </CardContent>
            </Card>

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
                <><CheckCircle2 className="h-4 w-4" /> Changes Saved!</>
              ) : (
                <><Save className="h-4 w-4" /> Save Configuration</>
              )}
            </Button>
          </section>

          {/* Instructions Card */}
          <Card className="bg-primary/5 border border-primary/20">
            <CardContent className="p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-violet-500 mb-2">
                  <div className="p-1.5 bg-violet-500/10 rounded-lg">
                    <Info className="h-4 w-4" />
                  </div>
                  How to get a Groq API Key (free)
                </div>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside px-1">
                  <li>Sign up at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-violet-500 underline font-bold">console.groq.com</a> (free tier available).</li>
                  <li>Go to API Keys in the left sidebar.</li>
                  <li>Click "Create API Key".</li>
                  <li>Copy the key (starts with <code className="bg-muted px-1 rounded">gsk_</code>) and paste it above.</li>
                </ol>
              </div>
              <div className="border-t border-primary/10 pt-4">
                <div className="flex items-center gap-2 font-bold text-sm text-primary mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Info className="h-4 w-4" />
                  </div>
                  How to get a Gemini API Key (Practice Mode)
                </div>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside px-1">
                  <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">Google AI Studio</a>.</li>
                  <li>Create or select a project.</li>
                  <li>Click "Create API key in new project".</li>
                  <li>Copy and paste the key above.</li>
                </ol>
              </div>
              <div className="border-t border-primary/10 pt-4">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-500 mb-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <Info className="h-4 w-4" />
                  </div>
                  How to get an ElevenLabs API Key (Voice AI)
                </div>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside px-1">
                  <li>Sign up at <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline font-bold">elevenlabs.io</a> (free tier available).</li>
                  <li>Go to your profile → API Keys.</li>
                  <li>Copy your key and paste it above.</li>
                  <li>Practice mode will use Rachel's voice automatically.</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
