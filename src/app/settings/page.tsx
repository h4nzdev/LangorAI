'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Key, Save, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setIsSaved(true);
    
    toast({
      title: "Settings Saved",
      description: "Your Gemini API Key has been stored locally.",
    });

    // Reset saved state after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B121F] text-white flex flex-col font-body">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-5 max-w-xl mx-auto w-full">
        <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-full">
          <Link href="/dashboard">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-6 space-y-8 pb-24">
        {/* AI Configuration Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Key className="h-5 w-5" />
            <h2 className="font-bold text-lg">AI Configuration</h2>
          </div>
          
          <Card className="bg-[#1A2333] border-none text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Gemini API Key</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
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
                  className="bg-[#0B121F] border-white/10 focus:ring-primary h-11"
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
                    : "bg-[#1D7AFC] hover:bg-[#1D7AFC]/90 text-white"
                )}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Key Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Key
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Instructions Card */}
        <Card className="bg-primary/5 border border-primary/20 text-white">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-primary">
              <Info className="h-4 w-4" />
              How to get an API Key?
            </div>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Visit the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>.</li>
              <li>Create or select a project.</li>
              <li>Click "Create API key in new project".</li>
              <li>Copy and paste the key here.</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
