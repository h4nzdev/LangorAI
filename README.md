# Langor AI - AI-Powered Language Learning Platform

## Overview

**Langor AI** is a modern, voice-first language learning application that leverages artificial intelligence to provide real-time conversational practice with instant grammar corrections and fluency feedback. Built with Next.js 15, React 19, and Google's Genkit AI framework, it offers an immersive learning experience that simulates natural language tutoring.

---

## 🎯 Core Features

### 1. **Voice-First Learning Experience**
- Real-time speech recognition using Web Speech API
- Text-to-speech synthesis for AI responses
- Natural, hands-free conversation practice
- Support for multiple languages (English, Spanish, French, German, Japanese, Korean)

### 2. **AI-Powered Conversational Tutor**
- Powered by Google's Gemini 2.5 Flash model via Genkit
- Contextual conversation flow with topic-based discussions
- Live grammar detection and corrections
- Personalized feedback based on user's proficiency level

### 3. **Session Analytics & Progress Tracking**
- Comprehensive session analysis with scores for:
  - **Fluency** - Natural flow of speech
  - **Grammar** - Correctness of sentence structure
  - **Vocabulary** - Word choice and variety
  - **Pronunciation** - Estimated from text patterns
- Key improvement suggestions with corrections
- Recommended exercises based on weaknesses
- Progress metrics: streak count, sessions completed, total practice time

### 4. **Battle Mode (Pro Feature)**
- Competitive multiplayer grammar battles
- Matchmaking system for skill-based pairing
- Real-time error tracking with visual feedback
- Custom error limits for difficulty adjustment
- Battle statistics and leaderboard rankings
- Points system for competitive progression

### 5. **Personalized Learning Paths**
- User profiling with:
  - Current proficiency level (Beginner → Fluent)
  - Learning goals (Career Growth, Travel, Self-Improvement, Exam Prep, Socializing)
  - Customizable avatar selection
- Smart activity recommendations based on profile
- Adaptive difficulty based on performance

### 6. **Dashboard & Insights**
- Weekly activity visualization
- Confidence level tracking (0-100%)
- Streak tracking with daily goals
- Session history and statistics
- Personalized activity cards with time/point estimates

### 7. **Leaderboard System**
- Weekly, Monthly, and All-Time rankings
- Player statistics (wins, losses, win rate, accuracy)
- Trend indicators for rank changes
- Podium display for top 3 players

---

## 🏗️ Architecture & Tech Stack

### Frontend Framework
- **Next.js 15.5.9** - React framework with App Router
- **React 19.2.1** - Latest React with concurrent features
- **TypeScript 5** - Full type safety

### AI & Backend
- **Genkit 1.28.0** - Google's AI orchestration framework
- **@genkit-ai/google-genai** - Google AI plugin for Gemini models
- **Server Actions** - For AI prompt execution

### UI Components
- **shadcn/ui** - Radix UI primitives with Tailwind CSS
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Lucide React** - Icon library
- **Custom Components**:
  - Navigation (Desktop sidebar + Mobile bottom bar)
  - Battle components (BattleRoom, PlayerCard, ErrorCounter, BattleResult)
  - UI primitives (Button, Card, Dialog, Progress, etc.)

### State Management
- **localStorage** - Client-side persistence for:
  - User profile (name, avatar, level, goal)
  - Session statistics (streak, sessions, total minutes)
  - Battle stats (points, wins, losses)
  - Subscription plan
  - API key (user-provided Google AI key)
  - Theme preference (light/dark mode)

### Additional Libraries
- **react-hook-form** + **zod** - Form handling and validation
- **date-fns** - Date utilities
- **class-variance-authority** - Component variant management
- **vite-pwa** - Progressive Web App support

---

## 📁 Project Structure

```
src/
├── ai/
│   ├── flows/
│   │   └── practice-flow.ts    # AI prompts for practice & analysis
│   ├── dev.ts                   # Genkit dev server entry
│   └── genkit.ts                # Genkit AI configuration
├── app/
│   ├── battle/                  # Battle mode pages
│   ├── dashboard/               # Main user dashboard
│   ├── leaderboard/             # Global rankings
│   ├── practice/
│   │   ├── analysis/            # Session analysis results
│   │   └── page.tsx             # Practice session interface
│   ├── pricing/                 # Subscription plans
│   ├── profile/                 # User profile & settings
│   ├── settings/                # App settings (API key, theme)
│   ├── welcome/                 # Onboarding tour
│   ├── layout.tsx               # Root layout with theme
│   └── page.tsx                 # Landing page
├── components/
│   ├── battle/                  # Battle mode components
│   │   ├── BattleMenu.tsx
│   │   ├── BattleResult.tsx
│   │   ├── BattleRoom.tsx
│   │   ├── ErrorCounter.tsx
│   │   ├── Matchmaking.tsx
│   │   └── PlayerCard.tsx
│   ├── ui/                      # shadcn/ui components (35 files)
│   └── navigation.tsx           # Responsive navigation
├── hooks/
│   ├── use-mobile.tsx           # Mobile detection hook
│   └── use-toast.ts             # Toast notification hook
└── lib/
    ├── placeholder-images.ts    # Image utilities
    └── utils.ts                 # CN utility for class merging
```

---

## 🔑 Key AI Flows

### 1. Practice Session Flow (`startPracticeSession`)
Handles real-time conversation with the AI tutor:
- Takes user speech transcription
- Maintains conversation history
- Generates contextual AI responses
- Provides grammar feedback with corrections

**Input Schema:**
```typescript
{
  userInput: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
  topic: string;
  apiKey?: string;
}
```

**Output Schema:**
```typescript
{
  aiResponse: string;
  feedback: {
    originalText: string;
    correctedText?: string;
    explanation?: string;
    hasCorrection: boolean;
  };
}
```

### 2. Session Analysis Flow (`summarizeSession`)
Analyzes complete practice sessions:
- Evaluates overall performance (0-100 score)
- Breaks down metrics (fluency, grammar, vocabulary, pronunciation)
- Generates insights for each skill area
- Identifies key improvements (up to 3 corrections)
- Recommends next exercise based on weaknesses

---

## 💎 Subscription Model

### Basic Plan (Free)
- Real-time voice conversation
- Voice-to-text conversion
- AI responses with topics
- Live grammar detection & corrections
- Analytics and progress tracking

### Pro Plan (₱79/month or ₱790/year)
- **All Basic features, plus:**
- Battle Mode access
- Matchmaking system
- Voice battles
- Custom error limits
- Leaderboard & battle stats

---

## 🎨 Design System

### Visual Identity
- **Font**: Inter (Google Fonts) - weights 400, 500, 700, 900
- **Color Palette**:
  - Primary: Accent color for main actions
  - Secondary: Muted tones for backgrounds
  - Destructive: Red for errors/alerts
  - Emerald: Success states
  - Yellow/Orange: Pro features (Battle Mode)

### UI Patterns
- Rounded corners (xl, 2xl, 3xl) for friendly aesthetic
- Subtle shadows and gradients for depth
- Smooth transitions (duration-300)
- Dark mode support via `prefers-color-scheme`
- Responsive design with mobile-first approach

### Typography
- **Headings**: `font-black` (900 weight), tight tracking
- **Body**: `font-bold` (700), medium weight
- **Labels**: `text-[10px]`, uppercase, wide tracking

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Google AI API Key (for AI features)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Genkit AI dev server (separate terminal)
npm run genkit:dev

# Run type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup

1. Get a Google AI API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Enter the key in the app's Settings page
3. Complete the onboarding tour to set up your profile

---

## 📱 User Flow

1. **Landing Page** → Introduction to Langor AI
2. **Welcome Tour** → Onboarding (name, avatar, level, goal)
3. **Dashboard** → Overview of progress and recommendations
4. **Practice Session** → Voice conversation with AI tutor
5. **Session Analysis** → Detailed feedback and scores
6. **Profile** → Track statistics and adjust settings
7. **Battle Mode** (Pro) → Competitive grammar battles
8. **Leaderboard** → View rankings and stats

---

## 🔧 Configuration Files

### `next.config.ts`
- TypeScript: Ignores build errors (for development)
- ESLint: Ignores during builds
- Images: Allows remote images from Unsplash, Picsum, Placehold.co

### `tailwind.config.ts`
- Custom color scheme with CSS variables
- shadcn/ui component configuration
- Animation utilities

### `components.json`
- shadcn/ui project configuration
- Component style (default)
- TypeScript path aliases

---

## 📊 Data Persistence

All user data is stored in **browser localStorage**:

| Key | Description |
|-----|-------------|
| `USER_NAME` | User's display name |
| `USER_AVATAR` | Selected emoji avatar |
| `USER_LEVEL` | Proficiency level |
| `USER_GOAL` | Learning goal |
| `SESSIONS_COUNT` | Total sessions completed |
| `TOTAL_MINUTES` | Total practice time |
| `STREAK_COUNT` | Current day streak |
| `BATTLE_STATS` | Battle mode statistics |
| `SUBSCRIPTION_PLAN` | 'basic' or 'pro' |
| `GEMINI_API_KEY` | User's Google AI API key |
| `THEME_MODE` | 'light' or 'dark' |
| `LAST_SESSION_ANALYSIS` | Most recent session analysis |

---

## 🎮 Battle Mode Mechanics

### How It Works
1. **Matchmaking**: Find an opponent (simulated)
2. **Battle Room**: Speak to practice; grammar mistakes = errors
3. **Error System**: First to reach error limit loses
4. **Scoring**:
   - Win: +20 points
   - Draw: +10 points
   - Loss: +5 points

### Error Detection
The system simulates grammar corrections from a predefined list:
- "I go to school yesterday" → "I went to school yesterday"
- "She don't like apples" → "She doesn't like apples"
- "He have a car" → "He has a car"
- And more...

---

## 🧪 Development Scripts

```json
{
  "dev": "next dev --turbopack -p 9002",
  "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
  "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
  "build": "NODE_ENV=production next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit"
}
```

---

## 📝 Notes

- **Speech Recognition**: Uses browser's Web Speech API (Chrome/Edge recommended)
- **API Key**: Users can provide their own Google AI API key for unlimited usage
- **Privacy**: All data stored locally; no server-side user accounts
- **PWA**: Supports installation as a Progressive Web App

---

## 🛠️ Known Issues & Fixes

### Progress Component Import Error
**Issue**: `Progress is not defined` in `PlayerCard.tsx`
**Fix**: Ensure proper import:
```typescript
import { Progress } from '@/components/ui/progress';
```

---

## 📄 License

Private project - All rights reserved © 2024 Langor AI

---

## 🤝 Support

For issues or questions:
1. Check the `Error.md` file for known errors
2. Review `Prompt.md` for feature specifications
3. Contact support via the app's settings page

---

**Built with ❤️ using Next.js, React, and Google AI**
