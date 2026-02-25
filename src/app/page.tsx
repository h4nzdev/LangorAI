import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mic, Zap, Globe, ShieldCheck, TrendingUp } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-learning');
  const aiImage = PlaceHolderImages.find(img => img.id === 'ai-tutor');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Globe className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold tracking-tight">Langor AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard">
            Dashboard
          </Link>
          <Button asChild variant="default" size="sm">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-blue-50/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit">
                    AI-Powered Fluency
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Master any language through <span className="text-primary">natural conversation</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Stop memorizing flashcards. Start speaking with our advanced AI tutors who understand context, culture, and your unique learning pace.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="px-8" asChild>
                    <Link href="/dashboard">Start Learning Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="px-8">
                    View Demo
                  </Button>
                </div>
              </div>
              {heroImage && (
                <div className="flex items-center justify-center">
                  <div className="relative w-full aspect-video lg:aspect-square overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      alt={heroImage.description}
                      className="object-cover"
                      src={heroImage.imageUrl}
                      fill
                      priority
                      data-ai-hint={heroImage.imageHint}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Why Langor AI works better
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We combine the latest in GenAI with proven linguistic methodologies.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-none shadow-md bg-blue-50/30">
                <CardContent className="pt-6">
                  <div className="p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Voice-First Practice</h3>
                  <p className="text-muted-foreground mt-2">
                    Real-time speech recognition and synthesis. Talk to your AI tutor just like a human friend.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-green-50/30">
                <CardContent className="pt-6">
                  <div className="p-2 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold">Instant Feedback</h3>
                  <p className="text-muted-foreground mt-2">
                    Get corrections on grammar, pronunciation, and vocabulary the moment you make them.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-purple-50/30">
                <CardContent className="pt-6">
                  <div className="p-2 w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold">Contextual Learning</h3>
                  <p className="text-muted-foreground mt-2">
                    Our AI simulates real-world scenarios, from ordering coffee to high-stakes job interviews.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to reach fluency?
                </h2>
                <p className="max-w-[600px] md:text-xl/relaxed text-primary-foreground/80">
                  Join 50,000+ learners who are speaking confidently with Langor AI.
                </p>
              </div>
              <Button size="lg" variant="secondary" className="px-8" asChild>
                <Link href="/dashboard">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 Langor AI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}