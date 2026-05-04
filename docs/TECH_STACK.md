# Langor AI - Technical Stack Overview

## 🏗️ Core Frameworks
- **Next.js 15.5.9**: Leveraging the App Router for optimized server-side rendering and client-side navigation.
- **React 19.2.1**: Utilizing modern hooks and concurrent rendering for a smooth UI.
- **TypeScript**: Ensuring full type safety across AI flows and UI components.

## 🎙️ Voice Chat Architecture (The Neural Loop)
The voice interaction system is a tri-stage loop designed for high-fidelity real-time practice:

1. **Speech-to-Text (Uplink)**: 
   - Powered by the **Web Speech API (`SpeechRecognition`)**.
   - Handles localized processing to reduce latency and protect privacy.
2. **Cognitive Processing (AI Flow)**:
   - **Genkit**: Orchestrates the interaction with Google's **Gemini 2.5 Flash** model.
   - **Contextual Prompting**: Dynamically shifts personas (Interviewer vs. Peer) based on user-selected scenarios.
   - **Grammar Engine**: Parallel processing of user input to detect structure errors while generating responses.
3. **Text-to-Speech (Downlink)**:
   - Powered by the **Web Speech API (`SpeechSynthesis`)**.
   - Synchronized with UI states to trigger visualizer animations.

## 🎨 UI & Animation
- **Tailwind CSS**: Utility-first styling with a custom semantic theme (Light/Dark).
- **ShadCN UI**: Accessible component primitives.
- **Matrix Wave Visualizer**: A custom **HTML5 Canvas** particle system using 3D depth perception and state-based intensity (Idle/Listening/Thinking/Speaking).
- **Lucide React**: Vector-based tactical iconography.

## ☁️ Backend & Persistence
- **Firebase Authentication**: (Setup phase) Managed sign-in with Google.
- **Firebase Firestore**: (Setup phase) Distributed document database for User Profiles, Battle Stats, and Roadmaps.
- **LocalStorage**: Current client-side persistence for session data and theme preferences.

## 🤖 AI Orchestration
- **Genkit Flow**: `startPracticeSession` handles the conversation logic.
- **Genkit Summary**: `summarizeSession` performs post-session linguistic analysis.
