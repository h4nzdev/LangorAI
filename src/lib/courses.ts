export type CourseLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';
export type LessonType  = 'conversation' | 'vocabulary' | 'grammar' | 'pronunciation' | 'listening';

export interface Lesson {
  number:      number;
  title:       string;
  description: string;
  type:        LessonType;
  duration:    string;   // e.g. "3 mins"
}

export interface Course {
  id:           string;
  title:        string;
  subtitle:     string;
  description:  string;
  goal:         string;
  level:        CourseLevel;
  duration:     string;   // total session estimate
  points:       number;
  imageId:      string;
  color:        string;   // gradient class for the hero
  skills:       string[];
  objectives:   string[];
  lessons:      Lesson[];
  practiceTopics: string[];  // forwarded to /practice as topic query
}

export const COURSES: Course[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // CAREER GROWTH
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id:       'job-interview',
    title:    'Job Interview Prep',
    subtitle: 'Land your next role with confidence',
    description:
      'Master the most common interview questions, structure your answers with the STAR method, and handle unexpected follow-ups like a pro. Practice speaking naturally under pressure.',
    goal:     'Career Growth',
    level:    'Intermediate',
    duration: '15 mins',
    points:   40,
    imageId:  'job-interview',
    color:    'from-blue-600 to-indigo-700',
    skills:   ['Professional Vocabulary', 'STAR Method', 'Confident Delivery', 'Formal Grammar'],
    objectives: [
      'Answer "Tell me about yourself" smoothly and concisely',
      'Discuss strengths and weaknesses without sounding rehearsed',
      'Use the STAR method for behavioral questions',
      'Ask thoughtful questions at the end of an interview',
      'Handle unexpected or tricky follow-up questions',
    ],
    lessons: [
      { number: 1, title: 'Your Elevator Pitch',      description: 'Craft a 60-second "Tell me about yourself" that hooks interviewers.',        type: 'conversation',  duration: '3 mins' },
      { number: 2, title: 'Strengths & Weaknesses',   description: 'Talk honestly about yourself without underselling or overconfidence.',        type: 'vocabulary',    duration: '3 mins' },
      { number: 3, title: 'STAR Method in Practice',  description: 'Structure behavioral answers: Situation, Task, Action, Result.',               type: 'conversation',  duration: '4 mins' },
      { number: 4, title: 'Salary & Closing',         description: 'Negotiate confidently and leave a strong final impression.',                  type: 'vocabulary',    duration: '3 mins' },
      { number: 5, title: 'Questions to Ask',         description: 'Engage your interviewer with smart, informed questions.',                     type: 'conversation',  duration: '2 mins' },
    ],
    practiceTopics: ['Job Interview'],
  },
  {
    id:       'presentation',
    title:    'Executive Pitch',
    subtitle: 'Speak with authority in the boardroom',
    description:
      'Deliver executive-level presentations with a compelling structure, confident data delivery, and the ability to handle tough Q&A without flinching.',
    goal:     'Career Growth',
    level:    'Advanced',
    duration: '12 mins',
    points:   35,
    imageId:  'presentation',
    color:    'from-violet-600 to-purple-700',
    skills:   ['Executive Language', 'Persuasive Speech', 'Data Narration', 'Q&A Handling'],
    objectives: [
      'Open your pitch with a hook that captures attention in 30 seconds',
      'Present data and metrics with authority and clarity',
      'Structure your pitch around a clear problem-solution arc',
      'Handle objections and challenging questions calmly',
      'Close with a clear and confident call to action',
    ],
    lessons: [
      { number: 1, title: 'The Opening Hook',         description: 'Grab your audience in the first 30 seconds.',                                type: 'conversation',  duration: '2 mins' },
      { number: 2, title: 'Problem-Solution Arc',     description: 'Build a narrative that makes your solution feel inevitable.',                 type: 'conversation',  duration: '3 mins' },
      { number: 3, title: 'Numbers & Metrics',        description: 'Speak about data naturally — not like you\'re reading a spreadsheet.',       type: 'vocabulary',    duration: '3 mins' },
      { number: 4, title: 'Handling Objections',      description: 'Turn skeptical questions into opportunities to reinforce your case.',         type: 'conversation',  duration: '2 mins' },
      { number: 5, title: 'The Strong Close',         description: 'End with a call to action that drives decisions.',                           type: 'conversation',  duration: '2 mins' },
    ],
    practiceTopics: ['Reporting'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SOCIALIZING
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id:       'small-talk-beg',
    title:    'Simple Greetings',
    subtitle: 'Your first steps in English conversation',
    description:
      'Learn the essential phrases for meeting people, introducing yourself, and keeping short friendly conversations going. Build your comfort with real spoken English from day one.',
    goal:     'Socializing',
    level:    'Beginner',
    duration: '10 mins',
    points:   20,
    imageId:  'small-talk',
    color:    'from-emerald-500 to-teal-600',
    skills:   ['Basic Greetings', 'Self-Introduction', 'Polite Responses', 'Simple Questions'],
    objectives: [
      'Greet people confidently in formal and informal settings',
      'Introduce yourself: name, where you\'re from, what you do',
      'Ask and answer simple "How are you?" exchanges naturally',
      'Use polite expressions: please, thank you, nice to meet you',
      'Say goodbye gracefully in different contexts',
    ],
    lessons: [
      { number: 1, title: 'Hello & Goodbye',          description: 'Master every greeting and farewell for any situation.',                      type: 'vocabulary',    duration: '2 mins' },
      { number: 2, title: 'My Name Is…',              description: 'Introduce yourself clearly and ask others for their name.',                  type: 'conversation',  duration: '2 mins' },
      { number: 3, title: 'How Are You?',             description: 'Go beyond "Fine, thanks" with natural, varied responses.',                  type: 'conversation',  duration: '2 mins' },
      { number: 4, title: 'Polite Expressions',       description: 'Please, sorry, excuse me — the lubricants of English conversation.',        type: 'vocabulary',    duration: '2 mins' },
      { number: 5, title: 'Where Are You From?',      description: 'Talk about your background and ask others about theirs.',                   type: 'conversation',  duration: '2 mins' },
    ],
    practiceTopics: ['Casual Chat'],
  },
  {
    id:       'small-talk',
    title:    'Small Talk Mastery',
    subtitle: 'Make every conversation count',
    description:
      'Small talk is the gateway to friendships and professional opportunities. Learn to keep conversations alive, transition between topics, and leave people genuinely enjoying the exchange.',
    goal:     'Socializing',
    level:    'Intermediate',
    duration: '20 mins',
    points:   50,
    imageId:  'small-talk',
    color:    'from-orange-500 to-rose-600',
    skills:   ['Topic Transitions', 'Active Listening Language', 'Humor & Lightness', 'Conversation Recovery'],
    objectives: [
      'Start conversations naturally with anyone, anywhere',
      'Transition smoothly between topics without awkward silences',
      'Show genuine interest using active listening phrases',
      'Use humor and light tone without misunderstandings',
      'Gracefully exit a conversation when needed',
    ],
    lessons: [
      { number: 1, title: 'The Conversation Opener',  description: 'Go beyond "Nice weather" — open conversations that go somewhere.',           type: 'conversation',  duration: '4 mins' },
      { number: 2, title: 'Keeping It Going',         description: 'Use open-ended questions and "yes, and" techniques to sustain flow.',        type: 'conversation',  duration: '4 mins' },
      { number: 3, title: 'Topic Pivots',             description: 'Move from one subject to another without breaking the mood.',               type: 'conversation',  duration: '4 mins' },
      { number: 4, title: 'Active Listening Phrases', description: '"That\'s interesting!" — phrases that make others feel truly heard.',        type: 'vocabulary',    duration: '4 mins' },
      { number: 5, title: 'The Graceful Exit',        description: 'Close a conversation warmly while leaving a great impression.',              type: 'conversation',  duration: '4 mins' },
    ],
    practiceTopics: ['Casual Chat'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SELF-IMPROVEMENT
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id:       'grammar-books-beg',
    title:    'ABC Mastery',
    subtitle: 'Build a rock-solid English foundation',
    description:
      'Get the fundamentals right. From sentence structure to the most common verb forms, this course builds the habits that eliminate your most frequent errors.',
    goal:     'Self-Improvement',
    level:    'Beginner',
    duration: '10 mins',
    points:   15,
    imageId:  'grammar-books',
    color:    'from-sky-500 to-blue-600',
    skills:   ['Basic Sentence Structure', 'Present Tense', 'Articles', 'Pronouns'],
    objectives: [
      'Build simple sentences with correct subject-verb order',
      'Use "a", "an", and "the" correctly in basic contexts',
      'Apply present simple and present continuous correctly',
      'Use I / he / she / they / we correctly',
      'Avoid the 5 most common beginner grammar mistakes',
    ],
    lessons: [
      { number: 1, title: 'Sentence Building 101',    description: 'Subject + verb + object — the engine of every English sentence.',           type: 'grammar',       duration: '2 mins' },
      { number: 2, title: 'Articles: A, An, The',     description: 'The smallest words that cause the biggest confusion.',                      type: 'grammar',       duration: '2 mins' },
      { number: 3, title: 'I Am / He Is / They Are',  description: 'Master the verb "to be" in all its forms.',                                type: 'grammar',       duration: '2 mins' },
      { number: 4, title: 'Present Simple vs. -ing',  description: '"I eat" vs "I am eating" — when to use each.',                             type: 'grammar',       duration: '2 mins' },
      { number: 5, title: 'Common Beginner Errors',   description: 'The top 5 mistakes beginners make — and how to fix them instantly.',       type: 'conversation',  duration: '2 mins' },
    ],
    practiceTopics: ['Casual Chat'],
  },
  {
    id:       'grammar-books',
    title:    'Grammar Refinement',
    subtitle: 'Polish your English to near-native level',
    description:
      'Tighten up the grammar patterns that advanced learners still get wrong — tenses, conditionals, passive voice, and subtle agreement rules that mark a truly fluent speaker.',
    goal:     'Self-Improvement',
    level:    'Intermediate',
    duration: '10 mins',
    points:   25,
    imageId:  'grammar-books',
    color:    'from-amber-500 to-yellow-500',
    skills:   ['Perfect Tenses', 'Conditionals', 'Passive Voice', 'Agreement Rules'],
    objectives: [
      'Use present perfect vs. past simple without hesitation',
      'Form first, second, and third conditionals correctly',
      'Convert active sentences to passive voice naturally',
      'Apply subject-verb agreement in complex sentences',
      'Fix the grammar patterns that mark non-native speakers',
    ],
    lessons: [
      { number: 1, title: 'Perfect Tenses Decoded',   description: '"I have done" vs "I did" — the rule that changes everything.',              type: 'grammar',       duration: '2 mins' },
      { number: 2, title: 'Conditional Mastery',      description: 'If I had known… would have been — all three conditionals in practice.',    type: 'grammar',       duration: '2 mins' },
      { number: 3, title: 'Active vs Passive',        description: 'When to say "They built it" vs "It was built" — and why it matters.',      type: 'grammar',       duration: '2 mins' },
      { number: 4, title: 'Complex Agreements',       description: 'Tricky subject-verb agreement in real sentences, not textbook drills.',    type: 'grammar',       duration: '2 mins' },
      { number: 5, title: 'Native-Level Patterns',    description: 'The grammar habits that separate intermediate from advanced speakers.',    type: 'conversation',  duration: '2 mins' },
    ],
    practiceTopics: ['Casual Chat'],
  },
  {
    id:       'ai-tutor-session',
    title:    'Daily Fluency Check',
    subtitle: '5-minute habit that compounds over time',
    description:
      'A short, focused daily session to catch your recurring errors, reinforce what you\'ve learned, and keep your fluency metrics trending upward. Consistency beats intensity.',
    goal:     'Self-Improvement',
    level:    'Elementary',
    duration: '5 mins',
    points:   15,
    imageId:  'ai-tutor',
    color:    'from-green-500 to-emerald-600',
    skills:   ['Error Awareness', 'Daily Habits', 'Speaking Confidence', 'Quick Recall'],
    objectives: [
      'Identify your three most common recurring errors',
      'Speak fluently for at least 2 uninterrupted minutes',
      'Build a daily practice habit that sticks',
      'Track your improvement from session to session',
      'Respond spontaneously to unprompted questions',
    ],
    lessons: [
      { number: 1, title: 'Today\'s Warm-Up',         description: 'Speak freely for 1 minute on any topic — just get talking.',               type: 'conversation',  duration: '1 min'  },
      { number: 2, title: 'Error Spotlight',          description: 'Review your most frequent grammar mistakes and correct them out loud.',    type: 'grammar',       duration: '1 min'  },
      { number: 3, title: 'Vocabulary Recall',        description: 'Use 5 words from your recent sessions in natural sentences.',              type: 'vocabulary',    duration: '1 min'  },
      { number: 4, title: 'Speed Round',              description: 'Answer 3 random questions as quickly and naturally as possible.',          type: 'conversation',  duration: '1 min'  },
      { number: 5, title: 'Today\'s Takeaway',        description: 'Summarize one thing you learned and one to practice tomorrow.',           type: 'conversation',  duration: '1 min'  },
    ],
    practiceTopics: ['Casual Chat'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TRAVEL
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id:       'travel-airport',
    title:    'Airport Navigation',
    subtitle: 'Travel the world without language anxiety',
    description:
      'Check in, clear immigration, find your gate, and handle delays — all in English. The airport vocabulary and phrases that make international travel stress-free.',
    goal:     'Travel',
    level:    'Intermediate',
    duration: '15 mins',
    points:   30,
    imageId:  'small-talk',
    color:    'from-cyan-500 to-sky-600',
    skills:   ['Travel Vocabulary', 'Polite Requests', 'Clarification Language', 'Problem-Solving Phrases'],
    objectives: [
      'Check in and drop off luggage using the right phrases',
      'Navigate security and immigration confidently',
      'Ask for directions and gate information',
      'Handle delays, cancellations, and rebooking',
      'Communicate clearly in loud, stressful environments',
    ],
    lessons: [
      { number: 1, title: 'Check-In & Baggage',       description: 'Everything you need from the check-in desk to the bag drop.',              type: 'vocabulary',    duration: '3 mins' },
      { number: 2, title: 'Security & Immigration',   description: 'Answer officer questions clearly and calmly.',                             type: 'conversation',  duration: '3 mins' },
      { number: 3, title: 'Finding Your Gate',        description: 'Ask for directions and read announcements correctly.',                     type: 'conversation',  duration: '3 mins' },
      { number: 4, title: 'Delays & Problems',        description: 'Stay calm and advocate for yourself when things go wrong.',                type: 'conversation',  duration: '3 mins' },
      { number: 5, title: 'On the Plane',             description: 'Request meals, ask for help, and chat with your neighbour.',              type: 'vocabulary',    duration: '3 mins' },
    ],
    practiceTopics: ['Casual Chat'],
  },
  {
    id:       'travel-hotel',
    title:    'Hotel Check-in',
    subtitle: 'Feel at home wherever you stay',
    description:
      'From reservation confirmation to room service and checkout, master all the hotel interactions that let you travel comfortably and communicate any issue clearly.',
    goal:     'Travel',
    level:    'Elementary',
    duration: '10 mins',
    points:   20,
    imageId:  'hero-learning',
    color:    'from-rose-500 to-pink-600',
    skills:   ['Hotel Vocabulary', 'Making Requests', 'Complaint Language', 'Service Interactions'],
    objectives: [
      'Confirm your reservation and check in without confusion',
      'Request a room type, floor, or view with confidence',
      'Report a problem with your room politely but firmly',
      'Order room service and ask for amenities',
      'Check out smoothly and discuss the bill if needed',
    ],
    lessons: [
      { number: 1, title: 'Arrival & Check-In',       description: 'Confirm your booking and get your key without any awkward silences.',      type: 'conversation',  duration: '2 mins' },
      { number: 2, title: 'Making Requests',          description: '"Could I please…" and "I\'d like…" — the language of polite hotel guests.',type: 'vocabulary',    duration: '2 mins' },
      { number: 3, title: 'Reporting a Problem',      description: 'Report noise, maintenance issues, or the wrong room type calmly.',         type: 'conversation',  duration: '2 mins' },
      { number: 4, title: 'Room Service & Amenities', description: 'Order food, ask for towels, request a wake-up call.',                      type: 'vocabulary',    duration: '2 mins' },
      { number: 5, title: 'Checkout & Billing',       description: 'Review charges and resolve billing issues without stress.',                 type: 'conversation',  duration: '2 mins' },
    ],
    practiceTopics: ['Casual Chat'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EXAM PREP
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id:       'ielts-prep',
    title:    'IELTS Speaking Task',
    subtitle: 'Target Band 7+ with focused practice',
    description:
      'Practice all three parts of the IELTS speaking exam — the examiner interview, the individual long turn, and the two-way discussion — with feedback on fluency, coherence, and grammar.',
    goal:     'Exam Prep',
    level:    'Advanced',
    duration: '20 mins',
    points:   60,
    imageId:  'grammar-books',
    color:    'from-indigo-600 to-blue-700',
    skills:   ['IELTS Vocabulary', 'Extended Speaking', 'Cohesive Devices', 'Complex Grammar'],
    objectives: [
      'Answer Part 1 personal questions naturally and fluently',
      'Speak for 2 minutes on a cue card topic (Part 2)',
      'Discuss abstract topics in Part 3 with depth and nuance',
      'Use a wide range of vocabulary and grammar structures',
      'Apply band 7+ discourse markers and cohesive devices',
    ],
    lessons: [
      { number: 1, title: 'Part 1: Personal Questions', description: 'Answer questions about familiar topics fluently and naturally.',          type: 'conversation',  duration: '4 mins' },
      { number: 2, title: 'Part 2: The Long Turn',      description: 'Practice speaking for 2 minutes on a cue card topic.',                   type: 'conversation',  duration: '5 mins' },
      { number: 3, title: 'Part 3: Discussion',         description: 'Discuss abstract ideas with complex grammar and rich vocabulary.',        type: 'conversation',  duration: '5 mins' },
      { number: 4, title: 'Discourse Markers',          description: '"Furthermore, however, in contrast…" — the glue of band-7 speaking.',   type: 'vocabulary',    duration: '3 mins' },
      { number: 5, title: 'Fluency Techniques',         description: 'Fill hesitation without saying "um" — strategies for smooth delivery.',  type: 'pronunciation', duration: '3 mins' },
    ],
    practiceTopics: ['Job Interview', 'Reporting'],
  },
  {
    id:       'toefl-prep',
    title:    'TOEFL Academic Pitch',
    subtitle: 'Ace the integrated and independent tasks',
    description:
      'Build the academic language skills needed for TOEFL speaking tasks. Practice summarizing lectures, integrating information, and delivering structured independent responses under time pressure.',
    goal:     'Exam Prep',
    level:    'Advanced',
    duration: '18 mins',
    points:   55,
    imageId:  'presentation',
    color:    'from-fuchsia-600 to-violet-700',
    skills:   ['Academic Vocabulary', 'Integrated Speaking', 'Summarizing', 'Time Management'],
    objectives: [
      'Deliver a 45-second independent speaking response with structure',
      'Summarize a lecture in the integrated task clearly',
      'Use academic vocabulary naturally (not robotically)',
      'Manage time pressure without losing coherence',
      'Avoid the grammar errors that cost points on TOEFL',
    ],
    lessons: [
      { number: 1, title: 'Independent Task',          description: 'State your opinion clearly, support it, and conclude — all in 45 seconds.',type: 'conversation',  duration: '4 mins' },
      { number: 2, title: 'Integrated Task Basics',    description: 'Summarize a reading AND a lecture in one structured response.',           type: 'listening',     duration: '4 mins' },
      { number: 3, title: 'Academic Word Lists',       description: 'The 50 academic words that appear most in TOEFL speaking tasks.',         type: 'vocabulary',    duration: '3 mins' },
      { number: 4, title: 'Time Management',           description: 'Practice hitting the 45-second and 60-second marks consistently.',        type: 'conversation',  duration: '4 mins' },
      { number: 5, title: 'Common TOEFL Errors',       description: 'The grammar and structure mistakes that examiners penalise most.',        type: 'grammar',       duration: '3 mins' },
    ],
    practiceTopics: ['Reporting', 'Job Interview'],
  },
];

export function getCourse(id: string): Course | undefined {
  return COURSES.find(c => c.id === id);
}

export const LESSON_TYPE_META: Record<LessonType, { label: string; color: string }> = {
  conversation:  { label: 'Conversation',  color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'     },
  vocabulary:    { label: 'Vocabulary',    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  grammar:       { label: 'Grammar',       color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'   },
  pronunciation: { label: 'Pronunciation', color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
  listening:     { label: 'Listening',     color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'      },
};

export const LEVEL_COLOR: Record<string, string> = {
  Beginner:     'text-emerald-500 bg-emerald-500/15 border-emerald-500/30',
  Elementary:   'text-sky-500 bg-sky-500/15 border-sky-500/30',
  Intermediate: 'text-blue-500 bg-blue-500/15 border-blue-500/30',
  Advanced:     'text-orange-500 bg-orange-500/15 border-orange-500/30',
};
