# Voice Chat Architecture Deep Dive

## Interaction States
The system operates in a state machine managed by `src/app/practice/page.tsx`:

| State | Visual Feedback | Component Logic |
| :--- | :--- | :--- |
| **IDLE** | 20% Intensity Wave | Awaiting user mic activation. |
| **LISTENING** | Radar Pulse / Sonar Rings | Web Speech API capturing audio buffers. |
| **THINKING** | Glowing Neural Core | Genkit calling Gemini 2.5 Flash via Server Action. |
| **SPEAKING** | Music Waves / Avatar Pulse | Synthesis utterance active; UI feedback cards rendering. |

## Sequence Diagram
1. **User Event**: `toggleListening()` triggers `recognition.start()`.
2. **Recognition**: `onresult` event captures transcript.
3. **AI Trigger**: `handleUserSpeech(text)` sends transcript to Genkit.
4. **Processing**: AI returns `aiResponse` + `feedback` (grammar corrections).
5. **Synthesis**: `speakText(aiResponse)` initiates the voice output.
6. **Persistence**: History is appended to `history` array for context maintenance.
