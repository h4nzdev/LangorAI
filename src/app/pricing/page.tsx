'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap, Trophy, Mic, BarChart3, Globe, Crown, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  features: PlanFeature[];
  popular?: boolean;
}

const BASIC_FEATURES: PlanFeature[] = [
  { text: 'Real-time voice conversation', included: true },
  { text: 'Voice-to-text conversion', included: true },
  { text: 'AI responses with topics', included: true },
  { text: 'Live grammar detection', included: true },
  { text: 'Grammar corrections', included: true },
  { text: 'Analytics and progress tracking', included: true },
  { text: 'Battle Mode', included: false },
  { text: 'Matchmaking', included: false },
  { text: 'Voice battles', included: false },
  { text: 'Custom error limits', included: false },
  { text: 'Leaderboard & battle stats', included: false },
];

const PRO_FEATURES: PlanFeature[] = [
  { text: 'Real-time voice conversation', included: true },
  { text: 'Voice-to-text conversion', included: true },
  { text: 'AI responses with topics', included: true },
  { text: 'Live grammar detection', included: true },
  { text: 'Grammar corrections', included: true },
  { text: 'Analytics and progress tracking', included: true },
  { text: 'Battle Mode', included: true },
  { text: 'Matchmaking', included: true },
  { text: 'Voice battles', included: true },
  { text: 'Custom error limits', included: true },
  { text: 'Leaderboard & battle stats', included: true },
];

export default function PricingPage() {
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'basic' | 'pro'>('basic');

  useEffect(() => {
    const subscription = localStorage.getItem('SUBSCRIPTION_PLAN');
    if (subscription === 'pro') {
      setCurrentPlan('pro');
    }
  }, []);

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Requested",
      description: "This is a demo. In production, this would open a payment gateway.",
    });
    
    // Simulate upgrade
    setTimeout(() => {
      localStorage.setItem('SUBSCRIPTION_PLAN', 'pro');
      setCurrentPlan('pro');
      toast({
        title: "🎉 Upgraded to Pro!",
        description: "You now have access to all premium features.",
        duration: 5000,
      });
    }, 1500);
  };

  const handleDowngrade = () => {
    localStorage.setItem('SUBSCRIPTION_PLAN', 'basic');
    setCurrentPlan('basic');
    toast({
      title: "Plan Changed",
      description: "You've been downgraded to Basic plan.",
    });
  };

  const plans: Plan[] = [
    {
      name: 'Basic',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started with language learning',
      icon: <Globe className="h-8 w-8" />,
      color: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-600/20',
      features: BASIC_FEATURES,
    },
    {
      name: 'Pro',
      price: isAnnual ? 790 : 79,
      period: isAnnual ? 'year' : 'month',
      description: 'Unlock competitive features and dominate the leaderboard',
      icon: <Crown className="h-8 w-8" />,
      color: 'text-yellow-500',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      popular: true,
      features: PRO_FEATURES,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="md:pl-64">
        <div className="container mx-auto p-6 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30">
              <Zap className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Simple, Transparent Pricing
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">
              Start free and upgrade when you're ready to compete
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={cn(
                "text-sm font-bold uppercase tracking-widest",
                !isAnnual ? "text-foreground" : "text-muted-foreground"
              )}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={cn(
                  "relative w-16 h-8 rounded-full transition-colors",
                  isAnnual ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform",
                  isAnnual ? "left-9" : "left-1"
                )} />
              </button>
              <span className={cn(
                "text-sm font-bold uppercase tracking-widest",
                isAnnual ? "text-foreground" : "text-muted-foreground"
              )}>
                Annual
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-600 border-none font-bold">
                Save 17%
              </Badge>
            </div>
          </div>

          {/* Current Plan Banner */}
          {currentPlan === 'pro' && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-yellow-500/20">
                        <Crown className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-black text-foreground">Pro Plan Active</p>
                        <p className="text-sm text-muted-foreground">You have access to all premium features</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDowngrade}
                      className="border-border bg-card hover:bg-muted"
                    >
                      Downgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
                  plan.popular 
                    ? "border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20" 
                    : "border-2 border-border",
                  currentPlan === plan.name.toLowerCase() && "ring-2 ring-primary"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white border-none font-bold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br",
                    plan.gradient
                  )}>
                    <div className={plan.color}>
                      {plan.icon}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground">
                        {plan.price === 0 ? 'Free' : `₱${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground font-medium">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {plan.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-3 text-sm",
                          feature.included 
                            ? "text-foreground" 
                            : "text-muted-foreground/50"
                        )}
                      >
                        {feature.included ? (
                          <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                        <span className={cn(
                          "font-medium",
                          !feature.included && "line-through"
                        )}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {plan.name === 'Pro' ? (
                    currentPlan === 'basic' ? (
                      <Button
                        onClick={handleUpgrade}
                        className={cn(
                          "w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all",
                          "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
                          "text-white shadow-xl shadow-orange-500/30"
                        )}
                      >
                        <Crown className="h-5 w-5 mr-2" />
                        Upgrade to Pro
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-emerald-500 text-white"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Current Plan
                      </Button>
                    )
                  ) : (
                    currentPlan === 'basic' ? (
                      <Button
                        disabled
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-muted text-foreground"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleDowngrade}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-border"
                      >
                        Switch to Basic
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Money Back Guarantee */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-border bg-card">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/20">
                    <Shield className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">30-Day Money-Back Guarantee</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      Try Pro risk-free. If you're not satisfied, get a full refund within 30 days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-foreground text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <FAQItem
                question="Can I switch plans later?"
                answer="Yes! You can upgrade or downgrade your plan at any time from your profile settings."
              />
              <FAQItem
                question="What payment methods do you accept?"
                answer="We accept all major credit cards, PayPal, and GCash for Philippine users."
              />
              <FAQItem
                question="Is there a free trial for Pro?"
                answer="While we don't offer a free trial, we have a 30-day money-back guarantee so you can try Pro risk-free."
              />
              <FAQItem
                question="What happens if I downgrade?"
                answer="You'll retain Pro features until the end of your billing period, then switch to Basic features."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-2 border-border bg-card cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">{question}</h3>
          <div className={cn(
            "w-6 h-6 rounded-full bg-muted flex items-center justify-center transition-transform",
            isOpen && "rotate-45"
          )}>
            <span className="text-lg font-bold text-muted-foreground">+</span>
          </div>
        </div>
        {isOpen && (
          <p className="text-sm text-muted-foreground font-medium mt-3">
            {answer}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
