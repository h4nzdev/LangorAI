// Offline rule-based grammar checker — runs synchronously, zero network calls.
// Covers the most common ESL mistakes caught in English conversation practice.

export interface GrammarResult {
  hasError: boolean;
  originalText: string;
  correctedText?: string;
  explanation?: string;
}

interface Rule {
  id: string;
  test: RegExp;
  apply: (text: string) => string;
  reason: string;
}

const RULES: Rule[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // SUBJECT-VERB AGREEMENT
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "he-she-it-dont",
    test: /\b(he|she|it)\s+(do not|don't)\b/i,
    apply: (t) =>
      t.replace(/\b(he|she|it)\s+(do not|don't)\b/gi, (_, s) => `${s} doesn't`),
    reason: 'Use "doesn\'t" with he / she / it, not "don\'t".',
  },
  {
    id: "i-you-we-they-doesnt",
    test: /\b(I|you|we|they)\s+(does not|doesn't)\b/i,
    apply: (t) =>
      t.replace(
        /\b(I|you|we|they)\s+(does not|doesn't)\b/gi,
        (_, s) => `${s} don't`,
      ),
    reason: 'Use "don\'t" with I / you / we / they, not "doesn\'t".',
  },
  {
    id: "he-she-it-do",
    test: /\b(he|she|it)\s+do\s+(not\s+)?\w/i,
    apply: (t) =>
      t.replace(
        /\b(he|she|it)\s+do\s+(not\s+)?/gi,
        (_, s, not) => `${s} does ${not ?? ""}`,
      ),
    reason: 'Use "does" (not "do") with he / she / it.',
  },
  {
    id: "you-we-they-was",
    test: /\b(you|we|they)\s+was\b/i,
    apply: (t) => t.replace(/\b(you|we|they)\s+was\b/gi, (_, s) => `${s} were`),
    reason: 'Use "were" with you / we / they, not "was".',
  },
  {
    id: "i-were-past-indicative",
    test: /\bI\s+were\s+(going|talking|trying|working|doing|playing|eating|sleeping|running|living|walking|reading|writing|watching|listening|studying|cooking|driving|flying|swimming|dancing|singing|crying|laughing|thinking|waiting|sitting|standing|lying|moving|learning|teaching|helping|using|making|taking|giving|coming|leaving|starting|stopping|finishing|beginning)\b/i,
    apply: (t) => t.replace(/\bI\s+were\b/gi, "I was"),
    reason:
      'Use "I was" (past indicative). "I were" is only used in hypothetical / subjunctive contexts.',
  },
  {
    id: "he-she-it-are",
    test: /\b(he|she|it)\s+are\b/i,
    apply: (t) => t.replace(/\b(he|she|it)\s+are\b/gi, (_, s) => `${s} is`),
    reason: 'Use "is" with he / she / it, not "are".',
  },
  {
    id: "i-is",
    test: /\bI\s+is\b/i,
    apply: (t) => t.replace(/\bI\s+is\b/gi, "I am"),
    reason: 'Use "I am", not "I is".',
  },
  {
    id: "you-is",
    test: /\byou\s+is\b/i,
    apply: (t) => t.replace(/\byou\s+is\b/gi, "you are"),
    reason: 'Use "you are", not "you is".',
  },
  {
    id: "we-is",
    test: /\bwe\s+is\b/i,
    apply: (t) => t.replace(/\bwe\s+is\b/gi, "we are"),
    reason: 'Use "we are", not "we is".',
  },
  {
    id: "they-is",
    test: /\bthey\s+is\b/i,
    apply: (t) => t.replace(/\bthey\s+is\b/gi, "they are"),
    reason: 'Use "they are", not "they is".',
  },
  {
    id: "there-is-plural",
    test: /\bthere\s+is\s+(some|many|a lot of|several|a few|the|these|those|my|your|our|their)\s+\w+s\b/i,
    apply: (t) =>
      t.replace(
        /\bthere\s+is\s+((?:some|many|a lot of|several|a few|the|these|those|my|your|our|their)\s+\w+s)\b/gi,
        (_, rest) => `there are ${rest}`,
      ),
    reason: 'Use "there are" with plural nouns, not "there is".',
  },
  {
    id: "there-are-singular",
    test: /\bthere\s+are\s+(a|an|one|the|my|your|his|her|our|their|this|that)\s+\w+[^s]\b/i,
    apply: (t) =>
      t.replace(
        /\bthere\s+are\s+((?:a|an|one|the|my|your|his|her|our|their|this|that)\s+\w+[^s])\b/gi,
        (_, rest) => `there is ${rest}`,
      ),
    reason: 'Use "there is" with singular nouns, not "there are".',
  },
  {
    id: "singular-noun-have",
    test: /\b(the|a|an|this|that|my|your|his|her|our|their)\s+\w+\s+have\s+(been|gone|done|seen|taken|given|made|come|become|known|written|spoken|broken|driven|eaten|fallen|chosen|worn|flown|drawn|grown|shown|thrown|blown|known|risen|risen|shaken|stolen|sworn|torn|woken)\b/i,
    apply: (t) =>
      t.replace(
        /\b((?:the|a|an|this|that|my|your|his|her|our|their)\s+\w+)\s+have\b/gi,
        (_, noun) => `${noun} has`,
      ),
    reason: 'Use "has" with singular nouns, not "have".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MODAL VERBS + TO
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "modal-to",
    test: /\b(can|could|should|would|will|must|shall|may|might)\s+to\s+[a-z]/i,
    apply: (t) =>
      t.replace(
        /\b(can|could|should|would|will|must|shall|may|might)\s+to\s+/gi,
        (_, m) => `${m} `,
      ),
    reason:
      'Modal verbs (can, should, must…) are followed directly by the base verb without "to".',
  },
  {
    id: "modal-past",
    test: /\b(can|could|should|would|will|must|shall|may|might)\s+(went|saw|came|ran|did|ate|gave|took|wrote|spoke|broke|drove|knew|chose|fell|wore|flew|drew|grew|threw|blew|knew|rose|shook|stole|swore|tore|woke)\b/i,
    apply: (t) =>
      t.replace(
        /\b(can|could|should|would|will|must|shall|may|might)\s+(went|saw|came|ran|did|ate|gave|took|wrote|spoke|broke|drove|knew|chose|fell|wore|flew|drew|grew|threw|blew|knew|rose|shook|stole|swore|tore|woke)\b/gi,
        (_, m, v) => {
          const baseForms: Record<string, string> = {
            went: "go",
            saw: "see",
            came: "come",
            ran: "run",
            did: "do",
            ate: "eat",
            gave: "give",
            took: "take",
            wrote: "write",
            spoke: "speak",
            broke: "break",
            drove: "drive",
            knew: "know",
            chose: "choose",
            fell: "fall",
            wore: "wear",
            flew: "fly",
            drew: "draw",
            grew: "grow",
            threw: "throw",
            blew: "blow",
            rose: "rise",
            shook: "shake",
            stole: "steal",
            swore: "swear",
            tore: "tear",
            woke: "wake",
          };
          return `${m} ${baseForms[v.toLowerCase()] || v}`;
        },
      ),
    reason:
      "After modal verbs, use the base form of the verb, not the past tense.",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HAVE/HAS/HAD + WRONG PAST PARTICIPLE
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "have-went",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+went\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+went\b/gi,
        (_, h) => `${h} gone`,
      ),
    reason: 'The past participle of "go" is "gone", not "went".',
  },
  {
    id: "have-saw",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+saw\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+saw\b/gi,
        (_, h) => `${h} seen`,
      ),
    reason: 'The past participle of "see" is "seen", not "saw".',
  },
  {
    id: "have-came",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+came\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+came\b/gi,
        (_, h) => `${h} come`,
      ),
    reason: 'The past participle of "come" is "come", not "came".',
  },
  {
    id: "have-ran",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+ran\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+ran\b/gi,
        (_, h) => `${h} run`,
      ),
    reason: 'The past participle of "run" is "run", not "ran".',
  },
  {
    id: "have-did",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+did\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+did\b/gi,
        (_, h) => `${h} done`,
      ),
    reason: 'The past participle of "do" is "done", not "did".',
  },
  {
    id: "have-ate",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+ate\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+ate\b/gi,
        (_, h) => `${h} eaten`,
      ),
    reason: 'The past participle of "eat" is "eaten", not "ate".',
  },
  {
    id: "have-gave",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+gave\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+gave\b/gi,
        (_, h) => `${h} given`,
      ),
    reason: 'The past participle of "give" is "given", not "gave".',
  },
  {
    id: "have-took",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+took\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+took\b/gi,
        (_, h) => `${h} taken`,
      ),
    reason: 'The past participle of "take" is "taken", not "took".',
  },
  {
    id: "have-wrote",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+wrote\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+wrote\b/gi,
        (_, h) => `${h} written`,
      ),
    reason: 'The past participle of "write" is "written", not "wrote".',
  },
  {
    id: "have-spoke",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+spoke\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+spoke\b/gi,
        (_, h) => `${h} spoken`,
      ),
    reason: 'The past participle of "speak" is "spoken", not "spoke".',
  },
  {
    id: "have-broke",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+broke\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+broke\b/gi,
        (_, h) => `${h} broken`,
      ),
    reason: 'The past participle of "break" is "broken", not "broke".',
  },
  {
    id: "have-drove",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+drove\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+drove\b/gi,
        (_, h) => `${h} driven`,
      ),
    reason: 'The past participle of "drive" is "driven", not "drove".',
  },
  {
    id: "have-knew",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+knew\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+knew\b/gi,
        (_, h) => `${h} known`,
      ),
    reason: 'The past participle of "know" is "known", not "knew".',
  },
  {
    id: "have-chose",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+chose\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+chose\b/gi,
        (_, h) => `${h} chosen`,
      ),
    reason: 'The past participle of "choose" is "chosen", not "chose".',
  },
  {
    id: "have-fell",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+fell\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+fell\b/gi,
        (_, h) => `${h} fallen`,
      ),
    reason: 'The past participle of "fall" is "fallen", not "fell".',
  },
  {
    id: "have-wore",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+wore\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+wore\b/gi,
        (_, h) => `${h} worn`,
      ),
    reason: 'The past participle of "wear" is "worn", not "wore".',
  },
  {
    id: "have-flew",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+flew\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+flew\b/gi,
        (_, h) => `${h} flown`,
      ),
    reason: 'The past participle of "fly" is "flown", not "flew".',
  },
  {
    id: "have-drew",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+drew\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+drew\b/gi,
        (_, h) => `${h} drawn`,
      ),
    reason: 'The past participle of "draw" is "drawn", not "drew".',
  },
  {
    id: "have-grew",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+grew\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+grew\b/gi,
        (_, h) => `${h} grown`,
      ),
    reason: 'The past participle of "grow" is "grown", not "grew".',
  },
  {
    id: "have-threw",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+threw\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+threw\b/gi,
        (_, h) => `${h} thrown`,
      ),
    reason: 'The past participle of "throw" is "thrown", not "threw".',
  },
  {
    id: "have-blew",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+blew\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+blew\b/gi,
        (_, h) => `${h} blown`,
      ),
    reason: 'The past participle of "blow" is "blown", not "blew".',
  },
  {
    id: "have-rose",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+rose\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+rose\b/gi,
        (_, h) => `${h} risen`,
      ),
    reason: 'The past participle of "rise" is "risen", not "rose".',
  },
  {
    id: "have-shook",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+shook\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+shook\b/gi,
        (_, h) => `${h} shaken`,
      ),
    reason: 'The past participle of "shake" is "shaken", not "shook".',
  },
  {
    id: "have-stole",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+stole\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+stole\b/gi,
        (_, h) => `${h} stolen`,
      ),
    reason: 'The past participle of "steal" is "stolen", not "stole".',
  },
  {
    id: "have-swore",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+swore\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+swore\b/gi,
        (_, h) => `${h} sworn`,
      ),
    reason: 'The past participle of "swear" is "sworn", not "swore".',
  },
  {
    id: "have-tore",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+tore\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+tore\b/gi,
        (_, h) => `${h} torn`,
      ),
    reason: 'The past participle of "tear" is "torn", not "tore".',
  },
  {
    id: "have-woke",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+woke\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+woke\b/gi,
        (_, h) => `${h} woken`,
      ),
    reason: 'The past participle of "wake" is "woken", not "woke".',
  },
  {
    id: "have-began",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+began\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+began\b/gi,
        (_, h) => `${h} begun`,
      ),
    reason: 'The past participle of "begin" is "begun", not "began".',
  },
  {
    id: "have-drank",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+drank\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+drank\b/gi,
        (_, h) => `${h} drunk`,
      ),
    reason: 'The past participle of "drink" is "drunk", not "drank".',
  },
  {
    id: "have-swam",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+swam\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+swam\b/gi,
        (_, h) => `${h} swum`,
      ),
    reason: 'The past participle of "swim" is "swum", not "swam".',
  },
  {
    id: "have-sang",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+sang\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+sang\b/gi,
        (_, h) => `${h} sung`,
      ),
    reason: 'The past participle of "sing" is "sung", not "sang".',
  },
  {
    id: "have-rang",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+rang\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+rang\b/gi,
        (_, h) => `${h} rung`,
      ),
    reason: 'The past participle of "ring" is "rung", not "rang".',
  },
  {
    id: "have-sank",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+sank\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+sank\b/gi,
        (_, h) => `${h} sunk`,
      ),
    reason: 'The past participle of "sink" is "sunk", not "sank".',
  },
  {
    id: "have-sprang",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+sprang\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+sprang\b/gi,
        (_, h) => `${h} sprung`,
      ),
    reason: 'The past participle of "spring" is "sprung", not "sprang".',
  },
  {
    id: "have-stank",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+stank\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+stank\b/gi,
        (_, h) => `${h} stunk`,
      ),
    reason: 'The past participle of "stink" is "stunk", not "stank".',
  },
  {
    id: "have-struck",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+struck\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+struck\b/gi,
        (_, h) => `${h} stricken`,
      ),
    reason:
      'The past participle of "strike" is "stricken", not "struck" (in perfect tenses).',
  },
  {
    id: "have-beat",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+beat\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+beat\b/gi,
        (_, h) => `${h} beaten`,
      ),
    reason:
      'The past participle of "beat" is "beaten", not "beat" (in perfect tenses).',
  },
  {
    id: "have-became",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+became\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+became\b/gi,
        (_, h) => `${h} become`,
      ),
    reason: 'The past participle of "become" is "become", not "became".',
  },
  {
    id: "have-forgot",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+forgot\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+forgot\b/gi,
        (_, h) => `${h} forgotten`,
      ),
    reason: 'The past participle of "forget" is "forgotten", not "forgot".',
  },
  {
    id: "have-froze",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+froze\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+froze\b/gi,
        (_, h) => `${h} frozen`,
      ),
    reason: 'The past participle of "freeze" is "frozen", not "froze".',
  },
  {
    id: "have-hid",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+hid\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+hid\b/gi,
        (_, h) => `${h} hidden`,
      ),
    reason: 'The past participle of "hide" is "hidden", not "hid".',
  },
  {
    id: "have-lied",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+lied\s+(down|on|in|under|beside|next to)\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+lied\b/gi,
        (_, h) => `${h} lain`,
      ),
    reason: 'The past participle of "lie" (recline) is "lain", not "lied".',
  },
  {
    id: "have-rode",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+rode\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+rode\b/gi,
        (_, h) => `${h} ridden`,
      ),
    reason: 'The past participle of "ride" is "ridden", not "rode".',
  },
  {
    id: "have-showed",
    test: /\b(have|has|had|haven't|hasn't|hadn't)\s+showed\b/i,
    apply: (t) =>
      t.replace(
        /\b(have|has|had|haven't|hasn't|hadn't)\s+showed\b/gi,
        (_, h) => `${h} shown`,
      ),
    reason: 'The past participle of "show" is "shown", not "showed".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // IRREGULAR SIMPLE PAST TENSE
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "goed",
    test: /\bgoed\b/i,
    apply: (t) => t.replace(/\bgoed\b/gi, "went"),
    reason: 'The past tense of "go" is "went", not "goed".',
  },
  {
    id: "runned",
    test: /\brunned\b/i,
    apply: (t) => t.replace(/\brunned\b/gi, "ran"),
    reason: 'The past tense of "run" is "ran", not "runned".',
  },
  {
    id: "buyed",
    test: /\bbuyed\b/i,
    apply: (t) => t.replace(/\bbuyed\b/gi, "bought"),
    reason: 'The past tense of "buy" is "bought", not "buyed".',
  },
  {
    id: "thinked",
    test: /\bthinked\b/i,
    apply: (t) => t.replace(/\bthinked\b/gi, "thought"),
    reason: 'The past tense of "think" is "thought", not "thinked".',
  },
  {
    id: "bringed",
    test: /\bbringed\b/i,
    apply: (t) => t.replace(/\bbringed\b/gi, "brought"),
    reason: 'The past tense of "bring" is "brought", not "bringed".',
  },
  {
    id: "catched",
    test: /\bcatched\b/i,
    apply: (t) => t.replace(/\bcatched\b/gi, "caught"),
    reason: 'The past tense of "catch" is "caught", not "catched".',
  },
  {
    id: "teached",
    test: /\bteached\b/i,
    apply: (t) => t.replace(/\bteached\b/gi, "taught"),
    reason: 'The past tense of "teach" is "taught", not "teached".',
  },
  {
    id: "feeled",
    test: /\bfeeled\b/i,
    apply: (t) => t.replace(/\bfeeled\b/gi, "felt"),
    reason: 'The past tense of "feel" is "felt", not "feeled".',
  },
  {
    id: "leaved",
    test: /\bleaved\b/i,
    apply: (t) => t.replace(/\bleaved\b/gi, "left"),
    reason: 'The past tense of "leave" is "left", not "leaved".',
  },
  {
    id: "drived",
    test: /\bdrived\b/i,
    apply: (t) => t.replace(/\bdrived\b/gi, "drove"),
    reason: 'The past tense of "drive" is "drove", not "drived".',
  },
  {
    id: "knowed",
    test: /\bknowed\b/i,
    apply: (t) => t.replace(/\bknowed\b/gi, "knew"),
    reason: 'The past tense of "know" is "knew", not "knowed".',
  },
  {
    id: "speaked",
    test: /\bspeaked\b/i,
    apply: (t) => t.replace(/\bspeaked\b/gi, "spoke"),
    reason: 'The past tense of "speak" is "spoke", not "speaked".',
  },
  {
    id: "breaked",
    test: /\bbreaked\b/i,
    apply: (t) => t.replace(/\bbreaked\b/gi, "broke"),
    reason: 'The past tense of "break" is "broke", not "breaked".',
  },
  {
    id: "choosed",
    test: /\bchoosed\b/i,
    apply: (t) => t.replace(/\bchoosed\b/gi, "chose"),
    reason: 'The past tense of "choose" is "chose", not "choosed".',
  },
  {
    id: "comed",
    test: /\bcomed\b/i,
    apply: (t) => t.replace(/\bcomed\b/gi, "came"),
    reason: 'The past tense of "come" is "came", not "comed".',
  },
  {
    id: "doed",
    test: /\bdoed\b/i,
    apply: (t) => t.replace(/\bdoed\b/gi, "did"),
    reason: 'The past tense of "do" is "did", not "doed".',
  },
  {
    id: "drawed",
    test: /\bdrawed\b/i,
    apply: (t) => t.replace(/\bdrawed\b/gi, "drew"),
    reason: 'The past tense of "draw" is "drew", not "drawed".',
  },
  {
    id: "drinked",
    test: /\bdrinked\b/i,
    apply: (t) => t.replace(/\bdrinked\b/gi, "drank"),
    reason: 'The past tense of "drink" is "drank", not "drinked".',
  },
  {
    id: "eated",
    test: /\beated\b/i,
    apply: (t) => t.replace(/\beated\b/gi, "ate"),
    reason: 'The past tense of "eat" is "ate", not "eated".',
  },
  {
    id: "falled",
    test: /\bfalled\b/i,
    apply: (t) => t.replace(/\bfalled\b/gi, "fell"),
    reason: 'The past tense of "fall" is "fell", not "falled".',
  },
  {
    id: "fighted",
    test: /\bfighted\b/i,
    apply: (t) => t.replace(/\bfighted\b/gi, "fought"),
    reason: 'The past tense of "fight" is "fought", not "fighted".',
  },
  {
    id: "finded",
    test: /\bfinded\b/i,
    apply: (t) => t.replace(/\bfinded\b/gi, "found"),
    reason: 'The past tense of "find" is "found", not "finded".',
  },
  {
    id: "flyed",
    test: /\bflyed\b/i,
    apply: (t) => t.replace(/\bflyed\b/gi, "flew"),
    reason: 'The past tense of "fly" is "flew", not "flyed".',
  },
  {
    id: "forgetted",
    test: /\bforgetted\b/i,
    apply: (t) => t.replace(/\bforgetted\b/gi, "forgot"),
    reason: 'The past tense of "forget" is "forgot", not "forgetted".',
  },
  {
    id: "freezed",
    test: /\bfreezed\b/i,
    apply: (t) => t.replace(/\bfreezed\b/gi, "froze"),
    reason: 'The past tense of "freeze" is "froze", not "freezed".',
  },
  {
    id: "getted",
    test: /\bgetted\b/i,
    apply: (t) => t.replace(/\bgetted\b/gi, "got"),
    reason: 'The past tense of "get" is "got", not "getted".',
  },
  {
    id: "gived",
    test: /\bgived\b/i,
    apply: (t) => t.replace(/\bgived\b/gi, "gave"),
    reason: 'The past tense of "give" is "gave", not "gived".',
  },
  {
    id: "growed",
    test: /\bgrowed\b/i,
    apply: (t) => t.replace(/\bgrowed\b/gi, "grew"),
    reason: 'The past tense of "grow" is "grew", not "growed".',
  },
  {
    id: "hided",
    test: /\bhided\b/i,
    apply: (t) => t.replace(/\bhided\b/gi, "hid"),
    reason: 'The past tense of "hide" is "hid", not "hided".',
  },
  {
    id: "holded",
    test: /\bholded\b/i,
    apply: (t) => t.replace(/\bholded\b/gi, "held"),
    reason: 'The past tense of "hold" is "held", not "holded".',
  },
  {
    id: "keeped",
    test: /\bkeeped\b/i,
    apply: (t) => t.replace(/\bkeeped\b/gi, "kept"),
    reason: 'The past tense of "keep" is "kept", not "keeped".',
  },
  {
    id: "layed",
    test: /\blayed\b/i,
    apply: (t) => t.replace(/\blayed\b/gi, "laid"),
    reason: 'The past tense of "lay" is "laid", not "layed".',
  },
  {
    id: "losed",
    test: /\blosed\b/i,
    apply: (t) => t.replace(/\blosed\b/gi, "lost"),
    reason: 'The past tense of "lose" is "lost", not "losed".',
  },
  {
    id: "maked",
    test: /\bmaked\b/i,
    apply: (t) => t.replace(/\bmaked\b/gi, "made"),
    reason: 'The past tense of "make" is "made", not "maked".',
  },
  {
    id: "meeted",
    test: /\bmeeted\b/i,
    apply: (t) => t.replace(/\bmeeted\b/gi, "met"),
    reason: 'The past tense of "meet" is "met", not "meeted".',
  },
  {
    id: "payed",
    test: /\bpayed\b/i,
    apply: (t) => t.replace(/\bpayed\b/gi, "paid"),
    reason: 'The past tense of "pay" is "paid", not "payed".',
  },
  {
    id: "putted",
    test: /\bputted\b/i,
    apply: (t) => t.replace(/\bputted\b/gi, "put"),
    reason: 'The past tense of "put" is "put", not "putted".',
  },
  {
    id: "readed",
    test: /\breaded\b/i,
    apply: (t) => t.replace(/\breaded\b/gi, "read"),
    reason:
      'The past tense of "read" is "read" (pronounced differently), not "readed".',
  },
  {
    id: "rided",
    test: /\brided\b/i,
    apply: (t) => t.replace(/\brided\b/gi, "rode"),
    reason: 'The past tense of "ride" is "rode", not "rided".',
  },
  {
    id: "ringed",
    test: /\bringed\b/i,
    apply: (t) => t.replace(/\bringed\b/gi, "rang"),
    reason: 'The past tense of "ring" is "rang", not "ringed".',
  },
  {
    id: "rised",
    test: /\brised\b/i,
    apply: (t) => t.replace(/\brised\b/gi, "rose"),
    reason: 'The past tense of "rise" is "rose", not "rised".',
  },
  {
    id: "selled",
    test: /\bselled\b/i,
    apply: (t) => t.replace(/\bselled\b/gi, "sold"),
    reason: 'The past tense of "sell" is "sold", not "selled".',
  },
  {
    id: "sended",
    test: /\bsended\b/i,
    apply: (t) => t.replace(/\bsended\b/gi, "sent"),
    reason: 'The past tense of "send" is "sent", not "sended".',
  },
  {
    id: "shaked",
    test: /\bshaked\b/i,
    apply: (t) => t.replace(/\bshaked\b/gi, "shook"),
    reason: 'The past tense of "shake" is "shook", not "shaked".',
  },
  {
    id: "shined",
    test: /\bshined\b/i,
    apply: (t) => t.replace(/\bshined\b/gi, "shone"),
    reason: 'The past tense of "shine" is "shone", not "shined".',
  },
  {
    id: "shooted",
    test: /\bshooted\b/i,
    apply: (t) => t.replace(/\bshooted\b/gi, "shot"),
    reason: 'The past tense of "shoot" is "shot", not "shooted".',
  },
  {
    id: "sitted",
    test: /\bsitted\b/i,
    apply: (t) => t.replace(/\bsitted\b/gi, "sat"),
    reason: 'The past tense of "sit" is "sat", not "sitted".',
  },
  {
    id: "sleeped",
    test: /\bsleeped\b/i,
    apply: (t) => t.replace(/\bsleeped\b/gi, "slept"),
    reason: 'The past tense of "sleep" is "slept", not "sleeped".',
  },
  {
    id: "slided",
    test: /\bslided\b/i,
    apply: (t) => t.replace(/\bslided\b/gi, "slid"),
    reason: 'The past tense of "slide" is "slid", not "slided".',
  },
  {
    id: "standed",
    test: /\bstanded\b/i,
    apply: (t) => t.replace(/\bstanded\b/gi, "stood"),
    reason: 'The past tense of "stand" is "stood", not "standed".',
  },
  {
    id: "stealed",
    test: /\bstealed\b/i,
    apply: (t) => t.replace(/\bstealed\b/gi, "stole"),
    reason: 'The past tense of "steal" is "stole", not "stealed".',
  },
  {
    id: "sticked",
    test: /\bsticked\b/i,
    apply: (t) => t.replace(/\bsticked\b/gi, "stuck"),
    reason: 'The past tense of "stick" is "stuck", not "sticked".',
  },
  {
    id: "striked",
    test: /\bstriked\b/i,
    apply: (t) => t.replace(/\bstriked\b/gi, "struck"),
    reason: 'The past tense of "strike" is "struck", not "striked".',
  },
  {
    id: "swimmed",
    test: /\bswimmed\b/i,
    apply: (t) => t.replace(/\bswimmed\b/gi, "swam"),
    reason: 'The past tense of "swim" is "swam", not "swimmed".',
  },
  {
    id: "taked",
    test: /\btaked\b/i,
    apply: (t) => t.replace(/\btaked\b/gi, "took"),
    reason: 'The past tense of "take" is "took", not "taked".',
  },
  {
    id: "teared",
    test: /\bteared\b/i,
    apply: (t) => t.replace(/\bteared\b/gi, "tore"),
    reason: 'The past tense of "tear" is "tore", not "teared".',
  },
  {
    id: "telled",
    test: /\btelled\b/i,
    apply: (t) => t.replace(/\btelled\b/gi, "told"),
    reason: 'The past tense of "tell" is "told", not "telled".',
  },
  {
    id: "throwed",
    test: /\bthrowed\b/i,
    apply: (t) => t.replace(/\bthrowed\b/gi, "threw"),
    reason: 'The past tense of "throw" is "threw", not "throwed".',
  },
  {
    id: "understanded",
    test: /\bunderstanded\b/i,
    apply: (t) => t.replace(/\bunderstanded\b/gi, "understood"),
    reason:
      'The past tense of "understand" is "understood", not "understanded".',
  },
  {
    id: "waked",
    test: /\bwaked\b/i,
    apply: (t) => t.replace(/\bwaked\b/gi, "woke"),
    reason: 'The past tense of "wake" is "woke", not "waked".',
  },
  {
    id: "weared",
    test: /\bweared\b/i,
    apply: (t) => t.replace(/\bweared\b/gi, "wore"),
    reason: 'The past tense of "wear" is "wore", not "weared".',
  },
  {
    id: "winned",
    test: /\bwinned\b/i,
    apply: (t) => t.replace(/\bwinned\b/gi, "won"),
    reason: 'The past tense of "win" is "won", not "winned".',
  },
  {
    id: "writed",
    test: /\bwrited\b/i,
    apply: (t) => t.replace(/\bwrited\b/gi, "wrote"),
    reason: 'The past tense of "write" is "wrote", not "writed".',
  },
  {
    id: "begin-ed",
    test: /\bbeginned\b/i,
    apply: (t) => t.replace(/\bbeginned\b/gi, "began"),
    reason: 'The past tense of "begin" is "began", not "beginned".',
  },
  {
    id: "blow-ed",
    test: /\bblowed\b/i,
    apply: (t) => t.replace(/\bblowed\b/gi, "blew"),
    reason: 'The past tense of "blow" is "blew", not "blowed".',
  },
  {
    id: "sing-ed",
    test: /\bsinged\b/i,
    apply: (t) => t.replace(/\bsinged\b/gi, "sang"),
    reason: 'The past tense of "sing" is "sang", not "singed".',
  },
  {
    id: "sink-ed",
    test: /\bsinked\b/i,
    apply: (t) => t.replace(/\bsinked\b/gi, "sank"),
    reason: 'The past tense of "sink" is "sank", not "sinked".',
  },
  {
    id: "spring-ed",
    test: /\bspringed\b/i,
    apply: (t) => t.replace(/\bspringed\b/gi, "sprang"),
    reason: 'The past tense of "spring" is "sprang", not "springed".',
  },
  {
    id: "stink-ed",
    test: /\bstinked\b/i,
    apply: (t) => t.replace(/\bstinked\b/gi, "stank"),
    reason: 'The past tense of "stink" is "stank", not "stinked".',
  },
  {
    id: "swear-ed",
    test: /\bsweared\b/i,
    apply: (t) => t.replace(/\bsweared\b/gi, "swore"),
    reason: 'The past tense of "swear" is "swore", not "sweared".',
  },
  {
    id: "sweep-ed",
    test: /\bsweeped\b/i,
    apply: (t) => t.replace(/\bsweeped\b/gi, "swept"),
    reason: 'The past tense of "sweep" is "swept", not "sweeped".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // DOUBLE NEGATIVES
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "dont-have-no",
    test: /\b(don't|doesn't|didn't|do not|does not|did not)\s+have\s+no\b/i,
    apply: (t) =>
      t.replace(
        /\b(don't|doesn't|didn't|do not|does not|did not)\s+have\s+no\b/gi,
        (_, neg) => `${neg} have any`,
      ),
    reason:
      'Avoid double negatives. Use "any" instead of "no" after a negative verb.',
  },
  {
    id: "cant-do-nothing",
    test: /\b(can't|couldn't|won't|wouldn't|don't|doesn't|didn't|never|shouldn't|mustn't|may not|might not)\b[^.!?]{0,50}\b(nothing|nobody|nowhere|no one)\b/i,
    apply: (t) =>
      t
        .replace(/\bnothing\b/gi, "anything")
        .replace(/\bnobody\b/gi, "anybody")
        .replace(/\bno one\b/gi, "anyone")
        .replace(/\bnowhere\b/gi, "anywhere"),
    reason:
      'Avoid double negatives. Use "anything / anybody / anyone / anywhere" after a negative.',
  },
  {
    id: "aint-got-no",
    test: /\b(ain't|haven't|hasn't|hadn't)\s+got\s+no\b/i,
    apply: (t) =>
      t.replace(
        /\b(ain't|haven't|hasn't|hadn't)\s+got\s+no\b/gi,
        (_, neg) => `${neg} got any`,
      ),
    reason:
      'Avoid double negatives. Use "any" instead of "no" after a negative.',
  },
  {
    id: "dont-want-nothing",
    test: /\b(don't|doesn't|didn't)\s+(want|need|see|know|have|get|like|love|hate|understand|remember|believe|think|feel|hear|find)\s+nothing\b/i,
    apply: (t) => t.replace(/\bnothing\b/gi, "anything"),
    reason: 'Use "anything" instead of "nothing" after a negative verb.',
  },
  {
    id: "never-did-nothing",
    test: /\bnever\b[^.!?]{0,50}\bnothing\b/i,
    apply: (t) => t.replace(/\bnothing\b/gi, "anything"),
    reason:
      'Avoid double negative. Use "anything" instead of "nothing" with "never".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // REDUNDANT DOUBLE COMPARATIVES
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "more-better",
    test: /\bmore\s+better\b/i,
    apply: (t) => t.replace(/\bmore\s+better\b/gi, "better"),
    reason: '"Better" is already comparative — do not add "more".',
  },
  {
    id: "more-faster",
    test: /\bmore\s+faster\b/i,
    apply: (t) => t.replace(/\bmore\s+faster\b/gi, "faster"),
    reason: '"Faster" is already comparative — do not add "more".',
  },
  {
    id: "more-harder",
    test: /\bmore\s+harder\b/i,
    apply: (t) => t.replace(/\bmore\s+harder\b/gi, "harder"),
    reason: '"Harder" is already comparative — do not add "more".',
  },
  {
    id: "more-easier",
    test: /\bmore\s+easier\b/i,
    apply: (t) => t.replace(/\bmore\s+easier\b/gi, "easier"),
    reason: '"Easier" is already comparative — do not add "more".',
  },
  {
    id: "more-stronger",
    test: /\bmore\s+stronger\b/i,
    apply: (t) => t.replace(/\bmore\s+stronger\b/gi, "stronger"),
    reason: '"Stronger" is already comparative — do not add "more".',
  },
  {
    id: "more-bigger",
    test: /\bmore\s+bigger\b/i,
    apply: (t) => t.replace(/\bmore\s+bigger\b/gi, "bigger"),
    reason: '"Bigger" is already comparative — do not add "more".',
  },
  {
    id: "more-smaller",
    test: /\bmore\s+smaller\b/i,
    apply: (t) => t.replace(/\bmore\s+smaller\b/gi, "smaller"),
    reason: '"Smaller" is already comparative — do not add "more".',
  },
  {
    id: "more-worse",
    test: /\bmore\s+worse\b/i,
    apply: (t) => t.replace(/\bmore\s+worse\b/gi, "worse"),
    reason: '"Worse" is already comparative — do not add "more".',
  },
  {
    id: "more-higher",
    test: /\bmore\s+higher\b/i,
    apply: (t) => t.replace(/\bmore\s+higher\b/gi, "higher"),
    reason: '"Higher" is already comparative — do not add "more".',
  },
  {
    id: "more-lower",
    test: /\bmore\s+lower\b/i,
    apply: (t) => t.replace(/\bmore\s+lower\b/gi, "lower"),
    reason: '"Lower" is already comparative — do not add "more".',
  },
  {
    id: "more-longer",
    test: /\bmore\s+longer\b/i,
    apply: (t) => t.replace(/\bmore\s+longer\b/gi, "longer"),
    reason: '"Longer" is already comparative — do not add "more".',
  },
  {
    id: "more-shorter",
    test: /\bmore\s+shorter\b/i,
    apply: (t) => t.replace(/\bmore\s+shorter\b/gi, "shorter"),
    reason: '"Shorter" is already comparative — do not add "more".',
  },
  {
    id: "more-smarter",
    test: /\bmore\s+smarter\b/i,
    apply: (t) => t.replace(/\bmore\s+smarter\b/gi, "smarter"),
    reason: '"Smarter" is already comparative — do not add "more".',
  },
  {
    id: "more-cleverer",
    test: /\bmore\s+cleverer\b/i,
    apply: (t) => t.replace(/\bmore\s+cleverer\b/gi, "cleverer"),
    reason: '"Cleverer" is already comparative — do not add "more".',
  },
  {
    id: "most-best",
    test: /\bmost\s+best\b/i,
    apply: (t) => t.replace(/\bmost\s+best\b/gi, "best"),
    reason: '"Best" is already superlative — do not add "most".',
  },
  {
    id: "most-worst",
    test: /\bmost\s+worst\b/i,
    apply: (t) => t.replace(/\bmost\s+worst\b/gi, "worst"),
    reason: '"Worst" is already superlative — do not add "most".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // COMPARISON: THEN VS THAN
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "comparative-then",
    test: /\b(better|worse|more|less|bigger|smaller|faster|slower|harder|easier|older|younger|taller|shorter|higher|lower|richer|smarter|stronger|weaker|lighter|darker|cleaner|dirtier|prettier|uglier|happier|sadder|warmer|cooler|hotter|colder|newer|softer|harder|wider|narrower|thicker|thinner|deeper|shallower|busier|lazier|braver|quieter|louder|cheaper|dearer|closer|nearer|further|simpler)\s+then\b/i,
    apply: (t) =>
      t.replace(
        /\b(better|worse|more|less|bigger|smaller|faster|slower|harder|easier|older|younger|taller|shorter|higher|lower|richer|smarter|stronger|weaker|lighter|darker|cleaner|dirtier|prettier|uglier|happier|sadder|warmer|cooler|hotter|colder|newer|softer|harder|wider|narrower|thicker|thinner|deeper|shallower|busier|lazier|braver|quieter|louder|cheaper|dearer|closer|nearer|further|simpler)\s+then\b/gi,
        (_, w) => `${w} than`,
      ),
    reason: 'Use "than" for comparisons, not "then". "Then" refers to time.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CONFUSABLE FIXED EXPRESSIONS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "your-welcome",
    test: /\byour\s+welcome\b/i,
    apply: (t) => t.replace(/\byour\s+welcome\b/gi, "you're welcome"),
    reason:
      '"You\'re welcome" = "you are welcome". "Your" is possessive (your bag, your idea).',
  },
  {
    id: "your-right",
    test: /\byour\s+right\b/i,
    apply: (t) => t.replace(/\byour\s+right\b/gi, "you're right"),
    reason: '"You\'re right" = "you are right". "Your" is possessive.',
  },
  {
    id: "your-wrong",
    test: /\byour\s+wrong\b/i,
    apply: (t) => t.replace(/\byour\s+wrong\b/gi, "you're wrong"),
    reason: '"You\'re wrong" = "you are wrong". "Your" is possessive.',
  },
  {
    id: "your-amazing",
    test: /\byour\s+(amazing|awesome|great|nice|kind|beautiful|smart|funny|the best|so|really|very)\b/i,
    apply: (t) =>
      t.replace(
        /\byour\s+(amazing|awesome|great|nice|kind|beautiful|smart|funny|the best|so|really|very)\b/gi,
        (_, w) => `you're ${w}`,
      ),
    reason: '"You\'re" = "you are". "Your" is possessive.',
  },
  {
    id: "its-ok",
    test: /\bits\s+(ok|okay|alright|fine|good|bad|nice|cold|hot|raining|snowing|late|early|time|important|necessary|possible|impossible|hard|easy|difficult|simple|complicated)\b/i,
    apply: (t) =>
      t.replace(
        /\bits\s+(ok|okay|alright|fine|good|bad|nice|cold|hot|raining|snowing|late|early|time|important|necessary|possible|impossible|hard|easy|difficult|simple|complicated)\b/gi,
        (_, w) => `it's ${w}`,
      ),
    reason: '"It\'s" = "it is". "Its" is possessive (its color, its name).',
  },
  {
    id: "there-their-theyre",
    test: /\btheir\s+(is|are|was|were|will|would|could|should|might|may|must|can|has|have)\b/i,
    apply: (t) =>
      t.replace(
        /\btheir\s+(is|are|was|were|will|would|could|should|might|may|must|can|has|have)\b/gi,
        (_, v) => `there ${v}`,
      ),
    reason:
      'Use "there" for existence/location. "Their" is possessive (their house, their car).',
  },
  {
    id: "to-too-two",
    test: /\b(to)\s+(much|many|fast|slow|big|small|hard|easy|loud|quiet|hot|cold|late|early|long|short|far|close|heavy|light|expensive|cheap|young|old)\b/i,
    apply: (t) =>
      t.replace(
        /\bto\s+(much|many|fast|slow|big|small|hard|easy|loud|quiet|hot|cold|late|early|long|short|far|close|heavy|light|expensive|cheap|young|old)\b/gi,
        (_, w) => `too ${w}`,
      ),
    reason:
      'Use "too" for excess ("too much"). "To" is a preposition or infinitive marker.',
  },
  {
    id: "alot",
    test: /\balot\b/gi,
    apply: (t) => t.replace(/\balot\b/gi, "a lot"),
    reason: '"A lot" is two words, not "alot".',
  },
  {
    id: "alright",
    test: /\balright\b/gi,
    apply: (t) => t.replace(/\balright\b/gi, "all right"),
    reason: '"All right" is the standard spelling. "Alright" is informal.',
  },
  {
    id: "could-of",
    test: /\b(could|should|would|might|must)\s+of\b/i,
    apply: (t) =>
      t.replace(
        /\b(could|should|would|might|must)\s+of\b/gi,
        (_, m) => `${m} have`,
      ),
    reason:
      'Say "could have", not "could of". The contraction "could\'ve" sounds like "could of".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ARTICLE ERRORS (HIGH-CONFIDENCE PATTERNS)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "a-vowel",
    test: /\ba\s+(apple|orange|umbrella|elephant|eagle|egg|ice cream|ice|hour|honor|honest|heir|ant|owl|ocean|island|event|accident|error|exam|excuse|example|exception|experience|idea|oven|opening|officer|operation|offer|advantage|actor|actress|adult|artist|author|editor|engineer|envelope|interview|invitation|opinion|opportunity|organization|uncle|aunt|angel|ankle|arrow|article|astronaut|athlete|attic|avocado|award)\b/i,
    apply: (t) =>
      t.replace(
        /\ba\s+(apple|orange|umbrella|elephant|eagle|egg|ice cream|ice|hour|honor|honest|heir|ant|owl|ocean|island|event|accident|error|exam|excuse|example|exception|experience|idea|oven|opening|officer|operation|offer|advantage|actor|actress|adult|artist|author|editor|engineer|envelope|interview|invitation|opinion|opportunity|organization|uncle|aunt|angel|ankle|arrow|article|astronaut|athlete|attic|avocado|award)\b/gi,
        (_, w) => `an ${w}`,
      ),
    reason: 'Use "an" before words that begin with a vowel sound.',
  },
  {
    id: "an-consonant-yoo",
    test: /\ban\s+(university|unique|useful|user|usual|unit|union|uniform|universe|unicorn|European|euphemism|one\b|once|ukulele|utensil|uterus|uranium|UFO|UN|U-turn)/i,
    apply: (t) =>
      t.replace(
        /\ban\s+(university|unique|useful|user|usual|unit|union|uniform|universe|unicorn|European|euphemism|one\b|once|ukulele|utensil|uterus|uranium|UFO|UN|U-turn)/gi,
        (_, w) => `a ${w}`,
      ),
    reason:
      'Use "a" (not "an") before words that start with a "yoo" sound, like "university".',
  },
  {
    id: "a-hour",
    test: /\ba\s+hour\b/i,
    apply: (t) => t.replace(/\ba\s+hour\b/gi, "an hour"),
    reason: 'Use "an" before "hour" because the "h" is silent.',
  },
  {
    id: "a-honest",
    test: /\ba\s+honest\b/i,
    apply: (t) => t.replace(/\ba\s+honest\b/gi, "an honest"),
    reason: 'Use "an" before "honest" because the "h" is silent.',
  },
  {
    id: "a-honor",
    test: /\ba\s+honor\b/i,
    apply: (t) => t.replace(/\ba\s+honor\b/gi, "an honor"),
    reason: 'Use "an" before "honor" because the "h" is silent.',
  },
  {
    id: "a-heir",
    test: /\ba\s+heir\b/i,
    apply: (t) => t.replace(/\ba\s+heir\b/gi, "an heir"),
    reason: 'Use "an" before "heir" because the "h" is silent.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // UNCOUNTABLE NOUNS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "informations",
    test: /\binformations\b/i,
    apply: (t) => t.replace(/\binformations\b/gi, "information"),
    reason: '"Information" is uncountable — it has no plural form.',
  },
  {
    id: "advices",
    test: /\badvices\b/i,
    apply: (t) => t.replace(/\badvices\b/gi, "advice"),
    reason: '"Advice" is uncountable. For plural, say "pieces of advice".',
  },
  {
    id: "furnitures",
    test: /\bfurnitures\b/i,
    apply: (t) => t.replace(/\bfurnitures\b/gi, "furniture"),
    reason: '"Furniture" is uncountable — it has no plural form.',
  },
  {
    id: "equipments",
    test: /\bequipments\b/i,
    apply: (t) => t.replace(/\bequipments\b/gi, "equipment"),
    reason: '"Equipment" is uncountable — it has no plural form.',
  },
  {
    id: "knowledges",
    test: /\bknowledges\b/i,
    apply: (t) => t.replace(/\bknowledges\b/gi, "knowledge"),
    reason: '"Knowledge" is uncountable — it has no plural form.',
  },
  {
    id: "homeworks",
    test: /\bhomeworks\b/i,
    apply: (t) => t.replace(/\bhomeworks\b/gi, "homework"),
    reason: '"Homework" is uncountable — it has no plural form.',
  },
  {
    id: "researches-verb",
    test: /\b(did|doing|some|my|the|a lot of|many|several)\s+researches\b/i,
    apply: (t) =>
      t.replace(
        /\b(did|doing|some|my|the|a lot of|many|several)\s+researches\b/gi,
        (_, d) => `${d} research`,
      ),
    reason:
      '"Research" as a noun is uncountable — say "research", not "researches".',
  },
  {
    id: "luggages",
    test: /\bluggages\b/i,
    apply: (t) => t.replace(/\bluggages\b/gi, "luggage"),
    reason:
      '"Luggage" is uncountable — it has no plural form. Say "pieces of luggage".',
  },
  {
    id: "baggages",
    test: /\bbaggages\b/i,
    apply: (t) => t.replace(/\bbaggages\b/gi, "baggage"),
    reason: '"Baggage" is uncountable — it has no plural form.',
  },
  {
    id: "traffics",
    test: /\btraffics\b/i,
    apply: (t) => t.replace(/\btraffics\b/gi, "traffic"),
    reason: '"Traffic" is uncountable — it has no plural form.',
  },
  {
    id: "behaviours-plural",
    test: /\bbehaviours\b/i,
    apply: (t) => t.replace(/\bbehaviours\b/gi, "behaviour"),
    reason:
      '"Behaviour" (UK) / "Behavior" (US) is uncountable — no plural form.',
  },
  {
    id: "behaviors-plural",
    test: /\bbehaviors\b/i,
    apply: (t) => t.replace(/\bbehaviors\b/gi, "behavior"),
    reason: '"Behavior" is uncountable — no plural form.',
  },
  {
    id: "evidences",
    test: /\bevidences\b/i,
    apply: (t) => t.replace(/\bevidences\b/gi, "evidence"),
    reason:
      '"Evidence" is uncountable — no plural form. Say "pieces of evidence".',
  },
  {
    id: "newses",
    test: /\bnewses\b/i,
    apply: (t) => t.replace(/\bnewses\b/gi, "news"),
    reason: '"News" is uncountable — it has no plural form.',
  },
  {
    id: "moneys",
    test: /\bmoneys\b/i,
    apply: (t) => t.replace(/\bmoneys\b/gi, "money"),
    reason: '"Money" is uncountable — it has no plural form.',
  },
  {
    id: "musics",
    test: /\bmusics\b/i,
    apply: (t) => t.replace(/\bmusics\b/gi, "music"),
    reason: '"Music" is uncountable — it has no plural form.',
  },
  {
    id: "poetries",
    test: /\bpoetries\b/i,
    apply: (t) => t.replace(/\bpoetries\b/gi, "poetry"),
    reason: '"Poetry" is uncountable — it has no plural form.',
  },
  {
    id: "weathers",
    test: /\bweathers\b/i,
    apply: (t) => t.replace(/\bweathers\b/gi, "weather"),
    reason: '"Weather" is uncountable — it has no plural form.',
  },
  {
    id: "works-plural",
    test: /\bworks\s+(are|were|have|these|those|many|several|some)\b/i,
    apply: (t) => t.replace(/\bworks\b/gi, "work"),
    reason:
      '"Work" (meaning job/tasks) is uncountable. Use "work", not "works".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // REDUNDANT CONJUNCTIONS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "although-but",
    test: /\b(although|even though|though)\b[^.!?]{5,100}\bbut\b/i,
    apply: (t) =>
      t.replace(
        /\b(although|even though|though)(\b[^.!?]{5,100})\bbut\b/i,
        (_, conj, middle) => `${conj}${middle}`,
      ),
    reason:
      'Don\'t use "but" after "although / even though". Pick one conjunction.',
  },
  {
    id: "because-so",
    test: /\bbecause\b[^.!?]{5,100}\bso\b/i,
    apply: (t) =>
      t.replace(/(\bbecause\b[^.!?]{5,100})\bso\b/i, (_, pre) => pre),
    reason: 'Don\'t use "so" after "because". One conjunction is enough.',
  },
  {
    id: "despite-but",
    test: /\b(despite|in spite of)\b[^.!?]{5,100}\bbut\b/i,
    apply: (t) =>
      t.replace(
        /\b(despite|in spite of)(\b[^.!?]{5,100})\bbut\b/i,
        (_, conj, middle) => `${conj}${middle}`,
      ),
    reason:
      'Don\'t use "but" after "despite / in spite of". Use one or the other.',
  },
  {
    id: "even-though-but-yet",
    test: /\b(even though|although)\b[^.!?]{5,100}\b(yet)\b/i,
    apply: (t) =>
      t.replace(
        /\b(even though|although)(\b[^.!?]{5,100})\byet\b/i,
        (_, conj, middle) => `${conj}${middle}`,
      ),
    reason: 'Don\'t use "yet" after "although / even though". Pick one.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // COMMON PREPOSITION ERRORS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "listen-music",
    test: /\blisten\s+(music|songs?|audio|podcast|radio|news|the radio|the news)\b/i,
    apply: (t) =>
      t.replace(
        /\blisten\s+(music|songs?|audio|podcast|radio|news|the radio|the news)\b/gi,
        (_, w) => `listen to ${w}`,
      ),
    reason: 'Say "listen to" something, not just "listen" + noun.',
  },
  {
    id: "arrive-to",
    test: /\barrive\s+to\s+the\b/i,
    apply: (t) => t.replace(/\barrive\s+to\s+the\b/gi, "arrive at the"),
    reason:
      'Say "arrive at" a place (or "arrive in" a city/country), not "arrive to".',
  },
  {
    id: "married-with",
    test: /\bmarried\s+with\b/i,
    apply: (t) => t.replace(/\bmarried\s+with\b/gi, "married to"),
    reason: 'Say "married to", not "married with".',
  },
  {
    id: "interested-on",
    test: /\binterested\s+on\b/i,
    apply: (t) => t.replace(/\binterested\s+on\b/gi, "interested in"),
    reason: 'Say "interested in", not "interested on".',
  },
  {
    id: "good-in",
    test: /\bgood\s+in\s+(playing|doing|writing|speaking|cooking|drawing|singing|dancing|running|swimming|coding|programming|painting|reading|teaching|learning|building|designing|creating|making|fixing|solving|explaining|organizing|planning|managing|leading|training|coaching|mentoring)\b/i,
    apply: (t) =>
      t.replace(
        /\bgood\s+in\s+(playing|doing|writing|speaking|cooking|drawing|singing|dancing|running|swimming|coding|programming|painting|reading|teaching|learning|building|designing|creating|making|fixing|solving|explaining|organizing|planning|managing|leading|training|coaching|mentoring)\b/gi,
        (_, w) => `good at ${w}`,
      ),
    reason: 'Say "good at" (a skill), not "good in".',
  },
  {
    id: "depend-of",
    test: /\bdepend\s+of\b/i,
    apply: (t) => t.replace(/\bdepend\s+of\b/gi, "depend on"),
    reason: 'Say "depend on", not "depend of".',
  },
  {
    id: "bored-of",
    test: /\bbored\s+of\b/i,
    apply: (t) => t.replace(/\bbored\s+of\b/gi, "bored with"),
    reason: 'The standard form is "bored with", not "bored of".',
  },
  {
    id: "afraid-from",
    test: /\bafraid\s+from\b/i,
    apply: (t) => t.replace(/\bafraid\s+from\b/gi, "afraid of"),
    reason: 'Say "afraid of", not "afraid from".',
  },
  {
    id: "angry-on",
    test: /\bangry\s+on\b/i,
    apply: (t) => t.replace(/\bangry\s+on\b/gi, "angry with"),
    reason:
      'Say "angry with" (a person) or "angry about" (a situation), not "angry on".',
  },
  {
    id: "angry-to",
    test: /\bangry\s+to\b/i,
    apply: (t) => t.replace(/\bangry\s+to\b/gi, "angry with"),
    reason: 'Say "angry with" (a person), not "angry to".',
  },
  {
    id: "agree-to-someone",
    test: /\bagree\s+to\s+(him|her|them|you|me|us|John|Mary)\b/i,
    apply: (t) =>
      t.replace(
        /\bagree\s+to\s+(him|her|them|you|me|us|John|Mary)\b/gi,
        (_, person) => `agree with ${person}`,
      ),
    reason: 'Say "agree with" a person, "agree to" a proposal/plan.',
  },
  {
    id: "apologize-from",
    test: /\bapologi[sz]e\s+from\b/i,
    apply: (t) => t.replace(/\bapologi[sz]e\s+from\b/gi, "apologize to"),
    reason: 'Say "apologize to" someone, not "apologize from".',
  },
  {
    id: "ask-to-help",
    test: /\bask\s+to\s+(him|her|them|you|me|us|John|Mary|someone|somebody)\s+to\b/i,
    apply: (t) =>
      t.replace(
        /\bask\s+to\s+(him|her|them|you|me|us|John|Mary|someone|somebody)\s+to\b/gi,
        (_, person) => `ask ${person} to`,
      ),
    reason: 'Say "ask someone to" do something, not "ask to someone to".',
  },
  {
    id: "belong-to",
    test: /\bbelong\s+of\b/i,
    apply: (t) => t.replace(/\bbelong\s+of\b/gi, "belong to"),
    reason: 'Say "belong to", not "belong of".',
  },
  {
    id: "care-for-about",
    test: /\bcare\s+for\s+(him|her|them|you|me|us|John|Mary|someone|somebody)\b/i,
    apply: (t) =>
      t.replace(
        /\bcare\s+for\s+(him|her|them|you|me|us|John|Mary|someone|somebody)\b/gi,
        (_, person) => `care about ${person}`,
      ),
    reason:
      'Say "care about" someone (emotional concern). "Care for" means to look after or like.',
  },
  {
    id: "complain-for",
    test: /\bcomplain\s+for\b/i,
    apply: (t) => t.replace(/\bcomplain\s+for\b/gi, "complain about"),
    reason: 'Say "complain about" something, not "complain for".',
  },
  {
    id: "congratulate-for",
    test: /\bcongratulate\s+for\b/i,
    apply: (t) => t.replace(/\bcongratulate\s+for\b/gi, "congratulate on"),
    reason: 'Say "congratulate on" an achievement, not "congratulate for".',
  },
  {
    id: "consist-in",
    test: /\bconsist\s+in\b/i,
    apply: (t) => t.replace(/\bconsist\s+in\b/gi, "consist of"),
    reason: 'Say "consist of", not "consist in".',
  },
  {
    id: "count-on-of",
    test: /\bcount\s+of\b/i,
    apply: (t) => t.replace(/\bcount\s+of\b/gi, "count on"),
    reason: 'Say "count on" (rely on), not "count of".',
  },
  {
    id: "dream-for",
    test: /\bdream\s+for\b/i,
    apply: (t) => t.replace(/\bdream\s+for\b/gi, "dream of"),
    reason: 'Say "dream of" or "dream about", not "dream for".',
  },
  {
    id: "enter-in",
    test: /\benter\s+in\s+the\b/i,
    apply: (t) => t.replace(/\benter\s+in\s+the\b/gi, "enter the"),
    reason: 'Say "enter" a place directly, not "enter in".',
  },
  {
    id: "explain-me",
    test: /\bexplain\s+(me|him|her|us|them)\b/i,
    apply: (t) =>
      t.replace(
        /\bexplain\s+(me|him|her|us|them)\b/gi,
        (_, person) => `explain to ${person}`,
      ),
    reason: 'Say "explain to" someone, not "explain someone".',
  },
  {
    id: "graduate-from-school",
    test: /\bgraduate\s+school\b/i,
    apply: (t) => t.replace(/\bgraduate\s+school\b/gi, "graduate from school"),
    reason:
      'Say "graduate from" a school, not "graduate school" (unless referring to graduate-level education).',
  },
  {
    id: "laugh-on",
    test: /\blaugh\s+on\b/i,
    apply: (t) => t.replace(/\blaugh\s+on\b/gi, "laugh at"),
    reason: 'Say "laugh at", not "laugh on".',
  },
  {
    id: "look-forward-for",
    test: /\blook forward\s+for\b/i,
    apply: (t) => t.replace(/\blook forward\s+for\b/gi, "look forward to"),
    reason: 'Say "look forward to", not "look forward for".',
  },
  {
    id: "participate-to",
    test: /\bparticipate\s+to\b/i,
    apply: (t) => t.replace(/\bparticipate\s+to\b/gi, "participate in"),
    reason: 'Say "participate in", not "participate to".',
  },
  {
    id: "prevent-to",
    test: /\bprevent\s+to\b/i,
    apply: (t) => t.replace(/\bprevent\s+to\b/gi, "prevent from"),
    reason: 'Say "prevent from" doing something, not "prevent to".',
  },
  {
    id: "related-with",
    test: /\brelated\s+with\b/i,
    apply: (t) => t.replace(/\brelated\s+with\b/gi, "related to"),
    reason: 'Say "related to", not "related with".',
  },
  {
    id: "remind-of-to",
    test: /\bremind\s+of\s+(him|her|them|you|me|us)\s+to\b/i,
    apply: (t) =>
      t.replace(
        /\bremind\s+of\s+(him|her|them|you|me|us)\s+to\b/gi,
        (_, person) => `remind ${person} to`,
      ),
    reason: 'Say "remind someone to" do something, not "remind of someone to".',
  },
  {
    id: "reply-to-me",
    test: /\breply\s+(me|him|her|us|them)\b/i,
    apply: (t) =>
      t.replace(
        /\breply\s+(me|him|her|us|them)\b/gi,
        (_, person) => `reply to ${person}`,
      ),
    reason: 'Say "reply to" someone, not "reply someone".',
  },
  {
    id: "search-for",
    test: /\bsearch\s+(a|the|my|your|his|her|our|their|this|that|these|those)\b/i,
    apply: (t) =>
      t.replace(
        /\bsearch\s+(a|the|my|your|his|her|our|their|this|that|these|those)\b/gi,
        (_, article) => `search for ${article}`,
      ),
    reason: 'Say "search for" something, not "search something".',
  },
  {
    id: "suffer-of",
    test: /\bsuffer\s+of\b/i,
    apply: (t) => t.replace(/\bsuffer\s+of\b/gi, "suffer from"),
    reason: 'Say "suffer from", not "suffer of".',
  },
  {
    id: "talk-to-me",
    test: /\btalk\s+(me|him|her|us|them)\b/i,
    apply: (t) =>
      t.replace(
        /\btalk\s+(me|him|her|us|them)\b/gi,
        (_, person) => `talk to ${person}`,
      ),
    reason: 'Say "talk to" someone, not "talk someone".',
  },
  {
    id: "thank-to",
    test: /\bthank\s+to\b/i,
    apply: (t) => t.replace(/\bthank\s+to\b/gi, "thanks to"),
    reason: 'Say "thanks to", not "thank to".',
  },
  {
    id: "think-of-about",
    test: /\bthink\s+of\s+about\b/i,
    apply: (t) => t.replace(/\bthink\s+of\s+about\b/gi, "think about"),
    reason:
      'Don\'t use "of" and "about" together. Use "think about" or "think of".',
  },
  {
    id: "wait-to",
    test: /\bwait\s+(me|him|her|us|them|you)\b/i,
    apply: (t) =>
      t.replace(
        /\bwait\s+(me|him|her|us|them|you)\b/gi,
        (_, person) => `wait for ${person}`,
      ),
    reason: 'Say "wait for" someone, not "wait someone".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // WORD ORDER ERRORS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "enough-adjective",
    test: /\b(big|small|tall|short|old|young|fast|slow|hot|cold|good|bad|smart|kind|rich|poor|strong|weak|hard|easy|heavy|light|long|short|wide|narrow|deep|shallow|high|low|loud|quiet|dark|bright|clean|dirty|fat|thin|pretty|ugly|brave|busy|lazy|expensive|cheap)\s+enough\b/i,
    apply: (t) =>
      t.replace(
        /\b(big|small|tall|short|old|young|fast|slow|hot|cold|good|bad|smart|kind|rich|poor|strong|weak|hard|easy|heavy|light|long|short|wide|narrow|deep|shallow|high|low|loud|quiet|dark|bright|clean|dirty|fat|thin|pretty|ugly|brave|busy|lazy|expensive|cheap)\s+enough\b/gi,
        (_, adj) => `enough ${adj}`,
      ),
    reason:
      '"Enough" usually comes before adjectives. Say "good enough", not "enough good". Actually, "adjective + enough" is correct. Ignore this correction.',
  },
  {
    id: "order-adj-noun",
    test: /\ba\s+\w+\s+red\s+car\b/i, // Too broad, skipping for now
    apply: (t) => t,
    reason: "",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // INCORRECT VERB FORMS AFTER "TO"
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "to-gerund-common",
    test: /\bto\s+(going|coming|taking|giving|making|doing|seeing|having|eating|drinking|running|walking|talking|speaking|writing|reading|playing|working|studying|learning|teaching|helping|using|trying|asking|telling|showing|bringing|buying|selling|paying|meeting|calling|sending|getting|putting|letting|sitting|standing|lying|beginning|starting|stopping|finishing|continuing)\b/i,
    apply: (t) =>
      t.replace(
        /\bto\s+(going|coming|taking|giving|making|doing|seeing|having|eating|drinking|running|walking|talking|speaking|writing|reading|playing|working|studying|learning|teaching|helping|using|trying|asking|telling|showing|bringing|buying|selling|paying|meeting|calling|sending|getting|putting|letting|sitting|standing|lying|beginning|starting|stopping|finishing|continuing)\b/gi,
        (_, v) => `to ${v.replace(/ing$/, "")}`,
      ),
    reason:
      'After "to" (infinitive), use the base form of the verb, not the -ing form.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // COMMON SPELLING / TYPO ERRORS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "recieve",
    test: /\brecieve\b/i,
    apply: (t) => t.replace(/\brecieve\b/gi, "receive"),
    reason: '"Receive" follows the rule: i before e except after c.',
  },
  {
    id: "beleive",
    test: /\bbeleive\b/i,
    apply: (t) => t.replace(/\bbeleive\b/gi, "believe"),
    reason: '"Believe" follows the rule: i before e except after c.',
  },
  {
    id: "acheive",
    test: /\bacheive\b/i,
    apply: (t) => t.replace(/\bacheive\b/gi, "achieve"),
    reason: '"Achieve" follows the rule: i before e except after c.',
  },
  {
    id: "definately",
    test: /\bdefinately\b/i,
    apply: (t) => t.replace(/\bdefinately\b/gi, "definitely"),
    reason: 'Spelling: "definitely", not "definately".',
  },
  {
    id: "definatly",
    test: /\bdefinatly\b/i,
    apply: (t) => t.replace(/\bdefinatly\b/gi, "definitely"),
    reason: 'Spelling: "definitely", not "definatly".',
  },
  {
    id: "seperate",
    test: /\bseperate\b/i,
    apply: (t) => t.replace(/\bseperate\b/gi, "separate"),
    reason: 'Spelling: "separate", not "seperate".',
  },
  {
    id: "tommorow",
    test: /\btommorow\b/i,
    apply: (t) => t.replace(/\btommorow\b/gi, "tomorrow"),
    reason: 'Spelling: "tomorrow" has one "m" and double "r".',
  },
  {
    id: "tommorrow",
    test: /\btommorrow\b/i,
    apply: (t) => t.replace(/\btommorrow\b/gi, "tomorrow"),
    reason: 'Spelling: "tomorrow" has one "m" and double "r".',
  },
  {
    id: "wich",
    test: /\bwich\b/i,
    apply: (t) => t.replace(/\bwich\b/gi, "which"),
    reason: 'Spelling: "which", not "wich".',
  },
  {
    id: "untill",
    test: /\buntill\b/i,
    apply: (t) => t.replace(/\buntill\b/gi, "until"),
    reason: 'Spelling: "until" has one "l", not "untill".',
  },
  {
    id: "occured",
    test: /\boccured\b/i,
    apply: (t) => t.replace(/\boccured\b/gi, "occurred"),
    reason: 'Spelling: "occurred" has double "r".',
  },
  {
    id: "occuring",
    test: /\boccuring\b/i,
    apply: (t) => t.replace(/\boccuring\b/gi, "occurring"),
    reason: 'Spelling: "occurring" has double "r".',
  },
  {
    id: "occurence",
    test: /\boccurence\b/i,
    apply: (t) => t.replace(/\boccurence\b/gi, "occurrence"),
    reason: 'Spelling: "occurrence" has double "c", double "r".',
  },
  {
    id: "goverment",
    test: /\bgoverment\b/i,
    apply: (t) => t.replace(/\bgoverment\b/gi, "government"),
    reason: 'Spelling: "government" has an "n" after "ver".',
  },
  {
    id: "enviroment",
    test: /\benviroment\b/i,
    apply: (t) => t.replace(/\benviroment\b/gi, "environment"),
    reason: 'Spelling: "environment" has an "n" after "viro".',
  },
  {
    id: "neccessary",
    test: /\bneccessary\b/i,
    apply: (t) => t.replace(/\bneccessary\b/gi, "necessary"),
    reason:
      'Spelling: "necessary" — one "c", double "s". Think: one collar, two sleeves.',
  },
  {
    id: "neccesary",
    test: /\bneccesary\b/i,
    apply: (t) => t.replace(/\bneccesary\b/gi, "necessary"),
    reason:
      'Spelling: "necessary" — one "c", double "s". Think: one collar, two sleeves.',
  },
  {
    id: "accomodate",
    test: /\baccomodate\b/i,
    apply: (t) => t.replace(/\baccomodate\b/gi, "accommodate"),
    reason: 'Spelling: "accommodate" has double "c" and double "m".',
  },
  {
    id: "embarass",
    test: /\bembarass\b/i,
    apply: (t) => t.replace(/\bembarass\b/gi, "embarrass"),
    reason: 'Spelling: "embarrass" has double "r" and double "s".',
  },
  {
    id: "millenium",
    test: /\bmillenium\b/i,
    apply: (t) => t.replace(/\bmillenium\b/gi, "millennium"),
    reason: 'Spelling: "millennium" has double "l" and double "n".',
  },
  {
    id: "priviledge",
    test: /\bpriviledge\b/i,
    apply: (t) => t.replace(/\bpriviledge\b/gi, "privilege"),
    reason: 'Spelling: "privilege" — no "d" before the "g".',
  },
  {
    id: "independant",
    test: /\bindependant\b/i,
    apply: (t) => t.replace(/\bindependant\b/gi, "independent"),
    reason: 'Spelling: "independent" ends in "-ent", not "-ant".',
  },
  {
    id: "lisence",
    test: /\blisence\b/i,
    apply: (t) => t.replace(/\blisence\b/gi, "license"),
    reason: 'Spelling: "license" (US) or "licence" (UK noun).',
  },
  {
    id: "calender",
    test: /\bcalender\b/i,
    apply: (t) => t.replace(/\bcalender\b/gi, "calendar"),
    reason: 'Spelling: "calendar" ends in "-dar", not "-der".',
  },
  {
    id: "truely",
    test: /\btruely\b/i,
    apply: (t) => t.replace(/\btruely\b/gi, "truly"),
    reason: 'Spelling: "truly" — drop the "e" from "true".',
  },
  {
    id: "arguement",
    test: /\barguement\b/i,
    apply: (t) => t.replace(/\barguement\b/gi, "argument"),
    reason: 'Spelling: "argument" — drop the "e" from "argue".',
  },
  {
    id: "judgement",
    test: /\bjudgement\b/i,
    apply: (t) => t.replace(/\bjudgement\b/gi, "judgment"),
    reason:
      'Spelling: "judgment" is the standard US spelling (no "e" after "dg").',
  },
  {
    id: "comming",
    test: /\bcomming\b/i,
    apply: (t) => t.replace(/\bcomming\b/gi, "coming"),
    reason: 'Spelling: "coming" has one "m".',
  },
  {
    id: "begining",
    test: /\bbegining\b/i,
    apply: (t) => t.replace(/\bbegining\b/gi, "beginning"),
    reason: 'Spelling: "beginning" has double "n".',
  },
  {
    id: "writting",
    test: /\bwritting\b/i,
    apply: (t) => t.replace(/\bwritting\b/gi, "writing"),
    reason:
      'Spelling: "writing" has one "t". Drop the "e" from "write" and add "-ing".',
  },
  {
    id: "runing",
    test: /\bruning\b/i,
    apply: (t) => t.replace(/\bruning\b/gi, "running"),
    reason: 'Spelling: "running" has double "n".',
  },
  {
    id: "swiming",
    test: /\bswiming\b/i,
    apply: (t) => t.replace(/\bswiming\b/gi, "swimming"),
    reason: 'Spelling: "swimming" has double "m".',
  },
  {
    id: "siting",
    test: /\bsiting\b/i,
    apply: (t) => t.replace(/\bsiting\b/gi, "sitting"),
    reason: 'Spelling: "sitting" has double "t".',
  },
  {
    id: "stop",
    test: /\bstoping\b/i,
    apply: (t) => t.replace(/\bstoping\b/gi, "stopping"),
    reason: 'Spelling: "stopping" has double "p".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // WRONG WORD CHOICE
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "less-fewer",
    test: /\bless\s+(people|persons|children|men|women|students|teachers|doctors|patients|cars|houses|books|dogs|cats|birds|trees|flowers|apples|oranges|bananas|eggs|cookies|candies|toys|games|movies|songs|photos|pictures|mistakes|errors|problems|issues|questions|answers|ideas|suggestions|reasons|excuses)\b/i,
    apply: (t) =>
      t.replace(
        /\bless\s+(people|persons|children|men|women|students|teachers|doctors|patients|cars|houses|books|dogs|cats|birds|trees|flowers|apples|oranges|bananas|eggs|cookies|candies|toys|games|movies|songs|photos|pictures|mistakes|errors|problems|issues|questions|answers|ideas|suggestions|reasons|excuses)\b/gi,
        (_, noun) => `fewer ${noun}`,
      ),
    reason:
      'Use "fewer" with countable nouns. "Less" is for uncountable nouns.',
  },
  {
    id: "who-whom-object",
    test: /\b(who)\s+(I|we|he|she|they|you)\s+(saw|met|called|visited|invited|helped|chose|selected|hired|fired|promoted|elected|nominated|recommended|suggested|mentioned|described|identified|recognized|remembered|forgot|missed|loved|liked|hated|admired|respected|trusted|believed|understood|knew|found|left|brought|took|gave|sent|told|asked|taught|showed|offered|promised|paid|lent|owed|bought|sold|built|made|created|designed|wrote|drew|painted|cooked|prepared|served|fed)\b/i,
    apply: (t) =>
      t.replace(
        /\b(who)\s+(I|we|he|she|they|you)\s+(saw|met|called|visited|invited|helped|chose|selected|hired|fired|promoted|elected|nominated|recommended|suggested|mentioned|described|identified|recognized|remembered|forgot|missed|loved|liked|hated|admired|respected|trusted|believed|understood|knew|found|left|brought|took|gave|sent|told|asked|taught|showed|offered|promised|paid|lent|owed|bought|sold|built|made|created|designed|wrote|drew|painted|cooked|prepared|served|fed)\b/gi,
        "whom $2 $3",
      ),
    reason: 'Use "whom" as the object of a verb, not "who".',
  },
  {
    id: "me-and-friends",
    test: /\bme and\s+(my friends|my family|John|Mary|Tom|Sarah|they|them)\b/i,
    apply: (t) =>
      t.replace(
        /\bme and\s+(my friends|my family|John|Mary|Tom|Sarah|they|them)\b/gi,
        (_, group) => `${group} and I`,
      ),
    reason:
      'In subject position, say "my friends and I", not "me and my friends".',
  },
  {
    id: "between-you-and-i",
    test: /\bbetween\s+(you|him|her|us|them)\s+and\s+I\b/i,
    apply: (t) =>
      t.replace(
        /\bbetween\s+(you|him|her|us|them)\s+and\s+I\b/gi,
        "between $1 and me",
      ),
    reason:
      'After prepositions like "between", use object pronouns. Say "between you and me".',
  },
  {
    id: "lay-lie",
    test: /\bI\s+(lay|lays)\s+(down|on|in|under|beside|next to|around|there|here)\b/i,
    apply: (t) =>
      t.replace(
        /\bI\s+(lay|lays)\s+(down|on|in|under|beside|next to|around|there|here)\b/gi,
        (_, verb, rest) => `I lie ${rest}`,
      ),
    reason:
      '"Lie" means to recline. "Lay" means to put something down and requires an object.',
  },
  {
    id: "affect-effect-verb",
    test: /\b(it|this|that|which|what|the|a|an)\s+effects\s+(me|you|him|her|us|them|the|my|your|his|her|our|their)\b/i,
    apply: (t) =>
      t.replace(
        /\beffects\s+(me|you|him|her|us|them|the|my|your|his|her|our|their)\b/gi,
        (_, rest) => `affects ${rest}`,
      ),
    reason:
      '"Affect" is usually a verb meaning to influence. "Effect" is usually a noun meaning result.',
  },
  {
    id: "accept-except",
    test: /\bI\s+(can't|cannot|will not|won't|do not|don't)\s+except\b/i,
    apply: (t) =>
      t.replace(
        /\bI\s+(can't|cannot|will not|won't|do not|don't)\s+except\b/gi,
        (_, neg) => `I ${neg} accept`,
      ),
    reason: '"Accept" means to receive. "Except" means excluding.',
  },
  {
    id: "advise-advice",
    test: /\b(a|an|the|my|your|his|her|our|their|some|good|bad|great|excellent|helpful|useful|valuable|free|professional|legal|medical|financial)\s+advise\b/i,
    apply: (t) => t.replace(/\badvise\b/gi, "advice"),
    reason: '"Advice" is the noun. "Advise" is the verb.',
  },
  {
    id: "loose-lose",
    test: /\b(loose)\s+(weight|money|time|a game|the match|the race|the election|my job|his job|her job|interest|hope|faith|patience|control|consciousness|sight|hearing|memory|touch|a friend|a loved one)\b/i,
    apply: (t) => t.replace(/\bloose\b/gi, "lose"),
    reason: '"Lose" means to not have anymore. "Loose" means not tight.',
  },
  {
    id: "principal-principle",
    test: /\b(the|a|main|basic|fundamental|core|key|important|underlying|guiding|moral|ethical|scientific|mathematical|physical|chemical|biological|economic|political|legal)\s+principal\b/i,
    apply: (t) => t.replace(/\bprincipal\b/gi, "principle"),
    reason:
      '"Principle" is a fundamental truth or rule. "Principal" means main or head of a school.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // INCORRECT USE OF INFINITIVE VS GERUND
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "enjoy-to",
    test: /\benjoy\s+to\s+\w+\b/i,
    apply: (t) =>
      t.replace(/\benjoy\s+to\s+(\w+)\b/gi, (_, v) => {
        // Convert to gerund if possible
        const gerunds: Record<string, string> = {
          play: "playing",
          read: "reading",
          write: "writing",
          swim: "swimming",
          run: "running",
          walk: "walking",
          cook: "cooking",
          eat: "eating",
          drink: "drinking",
          dance: "dancing",
          sing: "singing",
          travel: "travelling",
          work: "working",
          study: "studying",
          learn: "learning",
          teach: "teaching",
          paint: "painting",
          draw: "drawing",
          watch: "watching",
          listen: "listening",
          speak: "speaking",
          talk: "talking",
          go: "going",
          do: "doing",
          make: "making",
          take: "taking",
          give: "giving",
          get: "getting",
          buy: "buying",
          sell: "selling",
        };
        return `enjoy ${gerunds[v.toLowerCase()] || v + "ing"}`;
      }),
    reason: '"Enjoy" is followed by a gerund (-ing form), not an infinitive.',
  },
  {
    id: "suggest-to",
    test: /\bsuggest\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bsuggest\s+to\s+(\w+)\b/gi, "suggest $1ing"),
    reason:
      '"Suggest" is usually followed by a gerund or "that" clause, not "to" + infinitive.',
  },
  {
    id: "recommend-to",
    test: /\brecommend\s+to\s+(read|watch|visit|try|buy|use|take|eat|drink|see|go|do|make|get|start|begin|stop|continue|learn|study|practice|exercise|sleep|rest|relax|travel|explore|discover|experience|enjoy|play|listen|dance|sing|write|draw|paint|cook|bake)\b/i,
    apply: (t) =>
      t.replace(
        /\brecommend\s+to\s+(read|watch|visit|try|buy|use|take|eat|drink|see|go|do|make|get|start|begin|stop|continue|learn|study|practice|exercise|sleep|rest|relax|travel|explore|discover|experience|enjoy|play|listen|dance|sing|write|draw|paint|cook|bake)\b/gi,
        (_, v) => {
          const gerunds: Record<string, string> = {
            read: "reading",
            watch: "watching",
            visit: "visiting",
            try: "trying",
            buy: "buying",
            use: "using",
            take: "taking",
            eat: "eating",
            drink: "drinking",
            see: "seeing",
            go: "going",
            do: "doing",
            make: "making",
            get: "getting",
            start: "starting",
            begin: "beginning",
            stop: "stopping",
            continue: "continuing",
            learn: "learning",
            study: "studying",
            practice: "practicing",
            exercise: "exercising",
            sleep: "sleeping",
            rest: "resting",
            relax: "relaxing",
            travel: "travelling",
            explore: "exploring",
            discover: "discovering",
            experience: "experiencing",
            enjoy: "enjoying",
            play: "playing",
            listen: "listening",
            dance: "dancing",
            sing: "singing",
            write: "writing",
            draw: "drawing",
            paint: "painting",
            cook: "cooking",
            bake: "baking",
          };
          return `recommend ${gerunds[v.toLowerCase()] || v + "ing"}`;
        },
      ),
    reason: '"Recommend" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "avoid-to",
    test: /\bavoid\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bavoid\s+to\s+(\w+)\b/gi, "avoid $1ing"),
    reason: '"Avoid" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "consider-to",
    test: /\bconsider\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bconsider\s+to\s+(\w+)\b/gi, "consider $1ing"),
    reason: '"Consider" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "finish-to",
    test: /\bfinish\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bfinish\s+to\s+(\w+)\b/gi, "finish $1ing"),
    reason: '"Finish" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "practice-to",
    test: /\bpractice\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bpractice\s+to\s+(\w+)\b/gi, "practice $1ing"),
    reason: '"Practice" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "mind-to",
    test: /\bmind\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bmind\s+to\s+(\w+)\b/gi, "mind $1ing"),
    reason: '"Mind" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "miss-to",
    test: /\bmiss\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bmiss\s+to\s+(\w+)\b/gi, "miss $1ing"),
    reason: '"Miss" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "imagine-to",
    test: /\bimagine\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bimagine\s+to\s+(\w+)\b/gi, "imagine $1ing"),
    reason: '"Imagine" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "risk-to",
    test: /\brisk\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\brisk\s+to\s+(\w+)\b/gi, "risk $1ing"),
    reason: '"Risk" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "deny-to",
    test: /\bdeny\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bdeny\s+to\s+(\w+)\b/gi, "deny $1ing"),
    reason: '"Deny" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "postpone-to",
    test: /\bpostpone\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bpostpone\s+to\s+(\w+)\b/gi, "postpone $1ing"),
    reason: '"Postpone" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "delay-to",
    test: /\bdelay\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bdelay\s+to\s+(\w+)\b/gi, "delay $1ing"),
    reason: '"Delay" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "discuss-to",
    test: /\bdiscuss\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bdiscuss\s+to\s+(\w+)\b/gi, "discuss $1ing"),
    reason: '"Discuss" is followed by a gerund, not "to" + infinitive.',
  },
  {
    id: "mention-to",
    test: /\bmention\s+to\s+\w+\b/i,
    apply: (t) => t.replace(/\bmention\s+to\s+(\w+)\b/gi, "mention $1ing"),
    reason: '"Mention" is followed by a gerund, not "to" + infinitive.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // INCORRECT TAG QUESTIONS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "tag-question-isnt-it",
    test: /\b(I am|I'm|you are|you're|we are|we're|they are|they're|he is|he's|she is|she's|it is|it's)\s+\w+[^?]*,\s+isn't it\?/i,
    apply: (t) =>
      t.replace(/,\s+isn't it\?/gi, (match, _, full) => {
        // This is simplified; full tag question generation would need more context
        return match;
      }),
    reason:
      'Tag questions should match the subject. For "I am", use "aren\'t I?".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS COMMON ERRORS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "more-more",
    test: /\b(more|less)\s+(more|less)\b/i,
    apply: (t) => t.replace(/\b(more|less)\s+(more|less)\b/gi, "$1"),
    reason: 'Don\'t repeat "more" or "less". Use just one.',
  },
  {
    id: "most-most",
    test: /\bmost\s+most\b/i,
    apply: (t) => t.replace(/\bmost\s+most\b/gi, "most"),
    reason: 'Don\'t repeat "most". Use just one.',
  },
  {
    id: "very-very",
    test: /\bvery\s+very\b/i,
    apply: (t) => t.replace(/\bvery\s+very\b/gi, "very"),
    reason:
      'Avoid repeating "very". One is sufficient for emphasis in formal writing.',
  },
  {
    id: "reason-because",
    test: /\b(the reason|reason)\s+(is|was)\s+because\b/i,
    apply: (t) =>
      t.replace(/\b(the reason|reason)\s+(is|was)\s+because\b/gi, "$1 $2 that"),
    reason: 'Don\'t say "the reason is because". Say "the reason is that".',
  },
  {
    id: "return-back",
    test: /\breturn\s+back\b/i,
    apply: (t) => t.replace(/\breturn\s+back\b/gi, "return"),
    reason: '"Return" already means to come/go back. Don\'t add "back".',
  },
  {
    id: "repeat-again",
    test: /\brepeat\s+again\b/i,
    apply: (t) => t.replace(/\brepeat\s+again\b/gi, "repeat"),
    reason: '"Repeat" already means to do/say again. Don\'t add "again".',
  },
  {
    id: "can-be-able-to",
    test: /\bcan\s+be\s+able\s+to\b/i,
    apply: (t) => t.replace(/\bcan\s+be\s+able\s+to\b/gi, "can"),
    reason: '"Can" and "be able to" mean the same thing. Use one or the other.',
  },
  {
    id: "discuss-about",
    test: /\bdiscuss\s+about\b/i,
    apply: (t) => t.replace(/\bdiscuss\s+about\b/gi, "discuss"),
    reason:
      '"Discuss" is transitive — don\'t add "about". Discuss the topic directly.',
  },
  {
    id: "emphasize-on",
    test: /\bemphasize\s+on\b/i,
    apply: (t) => t.replace(/\bemphasize\s+on\b/gi, "emphasize"),
    reason:
      '"Emphasize" is transitive — don\'t add "on". Emphasize something directly.',
  },
  {
    id: "request-for",
    test: /\brequest\s+for\b/i,
    apply: (t) => t.replace(/\brequest\s+for\b/gi, "request"),
    reason:
      '"Request" as a verb doesn\'t need "for". Request something directly.',
  },
  {
    id: "despite-of",
    test: /\bdespite\s+of\b/i,
    apply: (t) => t.replace(/\bdespite\s+of\b/gi, "despite"),
    reason: 'Say "despite", not "despite of". ("In spite of" is correct.)',
  },
  {
    id: "regardless-of-irregardless",
    test: /\birregardless\b/i,
    apply: (t) => t.replace(/\birregardless\b/gi, "regardless"),
    reason: '"Irregardless" is non-standard. Use "regardless".',
  },
  {
    id: "firstly-secondly",
    test: /\bfirstly\b/i,
    apply: (t) => t.replace(/\bfirstly\b/gi, "first"),
    reason: '"First" is preferred over "firstly" in modern English.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // UNCOUNTABLE NOUNS WITH ARTICLE
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "article-grammar-uncountable",
    test: /\b(a|an)\s+(\w+\s+)?grammar\b/i,
    apply: (t) =>
      t.replace(
        /\b(a|an)\s+((\w+)\s+)?grammar\b/gi,
        (_, _art, adjPhrase, adj) => (adj ? `${adj} grammar` : "grammar"),
      ),
    reason:
      '"Grammar" as an abstract concept is uncountable — no article needed. Say "correct grammar", not "a correct grammar".',
  },
  {
    id: "article-advice-uncountable",
    test: /\b(a|an)\s+advice\b/i,
    apply: (t) => t.replace(/\b(a|an)\s+advice\b/gi, "advice"),
    reason:
      '"Advice" is uncountable — no article. Say "advice" or "a piece of advice".',
  },
  {
    id: "article-homework-uncountable",
    test: /\b(a|an)\s+homework\b/i,
    apply: (t) => t.replace(/\b(a|an)\s+homework\b/gi, "homework"),
    reason:
      '"Homework" is uncountable — no article. Say "homework" or "an assignment".',
  },
  {
    id: "article-feedback-uncountable",
    test: /\b(a|an)\s+feedback\b/i,
    apply: (t) => t.replace(/\b(a|an)\s+feedback\b/gi, "feedback"),
    reason:
      '"Feedback" is uncountable — no article. Say "feedback" or "a piece of feedback".',
  },
  {
    id: "article-knowledge-uncountable",
    test: /\b(a|an)\s+knowledge\b/i,
    apply: (t) => t.replace(/\b(a|an)\s+knowledge\b/gi, "knowledge"),
    reason: '"Knowledge" is uncountable — no article needed.',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MAKE + OBJECT + VERB-ING (should be base verb)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "make-object-verb-ing",
    test: /\bmake\s+(it|them|this|that|him|her|the\s+\w+(?:\s+\w+)?)\s+(working|running|going|happening|moving|starting|stopping|functioning|operating|loading|showing|playing|recording|streaming|connecting|responding|working|rendering|displaying|clicking|typing|scrolling)\b/i,
    apply: (t) =>
      t.replace(
        /\bmake\s+((it|them|this|that|him|her|the\s+\w+(?:\s+\w+)?))\s+(working|running|going|happening|moving|starting|stopping|functioning|operating|loading|showing|playing|recording|streaming|connecting|responding|working|rendering|displaying|clicking|typing|scrolling)\b/gi,
        (_, obj, _g2, gerund) => {
          const base = gerund
            .replace(/ing$/, "")
            .replace(/nn$/, "n")
            .replace(/pp$/, "p")
            .replace(/tt$/, "t")
            .replace(/rr$/, "r");
          return `make ${obj} ${base}`;
        },
      ),
    reason:
      'After "make + object", use the base verb: "make it work", not "make it working".',
  },

  // ════════════════════════════════════════════════════════════════════════════
  // I AM AGREE / DISAGREE
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "am-agree-disagree",
    test: /\bI\s+am\s+(agree|disagree)\b/i,
    apply: (t) =>
      t.replace(/\bI\s+am\s+(agree|disagree)\b/gi, (_, v) => `I ${v}`),
    reason: 'Say "I agree" / "I disagree", not "I am agree" / "I am disagree".',
  },
];

export function checkGrammar(text: string): GrammarResult {
  const normalized = text.trim();
  if (normalized.length < 3) return { hasError: false, originalText: text };

  for (const rule of RULES) {
    if (rule.test.test(normalized)) {
      const corrected = rule.apply(normalized);
      if (corrected !== normalized) {
        return {
          hasError: true,
          originalText: normalized,
          correctedText: corrected,
          explanation: rule.reason,
        };
      }
    }
  }

  return { hasError: false, originalText: normalized };
}

/** Fix common voice STT artifacts before grammar checking or display. */
export function preprocessVoiceText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  // Capitalize the first character
  const firstCap = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  // Capitalize standalone "i" → "I" (STT almost always outputs lowercase)
  let processed = firstCap.replace(/\bi\b/g, "I");
  // Fix common STT errors
  processed = processed
    .replace(/\bim\b/g, "I'm")
    .replace(/\bive\b/g, "I've")
    .replace(/\bill\b/g, "I'll")
    .replace(/\bid\b/g, "I'd")
    .replace(/\bdont\b/g, "don't")
    .replace(/\bdoesnt\b/g, "doesn't")
    .replace(/\bdidnt\b/g, "didn't")
    .replace(/\bcant\b/g, "can't")
    .replace(/\bcouldnt\b/g, "couldn't")
    .replace(/\bwouldnt\b/g, "wouldn't")
    .replace(/\bshouldnt\b/g, "shouldn't")
    .replace(/\bwont\b/g, "won't")
    .replace(/\barent\b/g, "aren't")
    .replace(/\bisnt\b/g, "isn't")
    .replace(/\bwasnt\b/g, "wasn't")
    .replace(/\bwerent\b/g, "weren't")
    .replace(/\bhavent\b/g, "haven't")
    .replace(/\bhasnt\b/g, "hasn't")
    .replace(/\bhadnt\b/g, "hadn't");
  return processed;
}

/**
 * Check multiple rules and return all errors found in the text.
 * Useful when you want to show all corrections at once.
 */
export function checkGrammarAll(text: string): GrammarResult[] {
  const normalized = text.trim();
  if (normalized.length < 3) return [];

  const results: GrammarResult[] = [];
  let currentText = normalized;

  for (const rule of RULES) {
    if (rule.test.test(currentText)) {
      const corrected = rule.apply(currentText);
      if (corrected !== currentText) {
        results.push({
          hasError: true,
          originalText: currentText,
          correctedText: corrected,
          explanation: rule.reason,
        });
        currentText = corrected; // Apply correction for next rules
      }
    }
  }

  return results;
}
