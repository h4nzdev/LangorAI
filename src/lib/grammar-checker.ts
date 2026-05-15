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
  // ── Subject-verb agreement ──────────────────────────────────────────────────
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
    // "he do", "she do" — but not "how do", "what do", etc.
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
    // "I were" is only correct in subjunctive ("if I were"). Flag straightforward uses.
    test: /\bI\s+were\s+(going|talking|trying|working|doing|playing|eating|sleeping|running|living)\b/i,
    apply: (t) => t.replace(/\bI\s+were\b/gi, "I was"),
    reason:
      'Use "I was" (past indicative). "I were" is only used in hypothetical / subjunctive contexts.',
  },

  // ── Modal verbs + to ────────────────────────────────────────────────────────
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

  // ── Have/has/had + wrong past participle ────────────────────────────────────
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

  // ── Irregular simple past tense ─────────────────────────────────────────────
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

  // ── Double negatives ────────────────────────────────────────────────────────
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
    test: /\b(can't|couldn't|won't|wouldn't|don't|doesn't|didn't|never)\b[^.!?]{0,50}\b(nothing|nobody|nowhere|no one)\b/i,
    apply: (t) =>
      t
        .replace(/\bnothing\b/gi, "anything")
        .replace(/\bnobody\b/gi, "anybody")
        .replace(/\bno one\b/gi, "anyone")
        .replace(/\bnowhere\b/gi, "anywhere"),
    reason:
      'Avoid double negatives. Use "anything / anybody / anyone / anywhere" after a negative.',
  },

  // ── Redundant double comparatives ───────────────────────────────────────────
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

  // ── Comparison: then vs than ────────────────────────────────────────────────
  {
    id: "comparative-then",
    test: /\b(better|worse|more|less|bigger|smaller|faster|slower|harder|easier|older|younger|taller|shorter|higher|lower|richer|smarter|stronger|weaker)\s+then\b/i,
    apply: (t) =>
      t.replace(
        /\b(better|worse|more|less|bigger|smaller|faster|slower|harder|easier|older|younger|taller|shorter|higher|lower|richer|smarter|stronger|weaker)\s+then\b/gi,
        (_, w) => `${w} than`,
      ),
    reason: 'Use "than" for comparisons, not "then". "Then" refers to time.',
  },

  // ── Confusable fixed expressions ────────────────────────────────────────────
  {
    id: "your-welcome",
    test: /\byour\s+welcome\b/i,
    apply: (t) => t.replace(/\byour\s+welcome\b/gi, "you're welcome"),
    reason:
      '"You\'re welcome" = "you are welcome". "Your" is possessive (your bag, your idea).',
  },

  // ── Article errors (high-confidence patterns only) ──────────────────────────
  {
    id: "a-vowel",
    test: /\ba\s+(apple|orange|umbrella|elephant|eagle|egg|ice cream|ice|hour|honor|honest|heir|ant|owl|ocean|island|event|accident|error|exam|excuse|example|exception|experience|idea|oven|opening|officer|operation|offer|advantage)\b/i,
    apply: (t) =>
      t.replace(
        /\ba\s+(apple|orange|umbrella|elephant|eagle|egg|ice cream|ice|hour|honor|honest|heir|ant|owl|ocean|island|event|accident|error|exam|excuse|example|exception|experience|idea|oven|opening|officer|operation|offer|advantage)\b/gi,
        (_, w) => `an ${w}`,
      ),
    reason: 'Use "an" before words that begin with a vowel sound.',
  },
  {
    id: "an-consonant-yoo",
    // Words that start with a "yoo" sound use "a", not "an"
    test: /\ban\s+(university|unique|useful|user|usual|unit|union|uniform|universe|unicorn|European|euphemism|one\b)/i,
    apply: (t) =>
      t.replace(
        /\ban\s+(university|unique|useful|user|usual|unit|union|uniform|universe|unicorn|European|euphemism|one\b)/gi,
        (_, w) => `a ${w}`,
      ),
    reason:
      'Use "a" (not "an") before words that start with a "yoo" sound, like "university".',
  },

  // ── Uncountable nouns ───────────────────────────────────────────────────────
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
    // "I did researches" — wrong; "The researcher researches" is fine (verb)
    test: /\b(did|doing|some|my|the|a lot of|many|several)\s+researches\b/i,
    apply: (t) =>
      t.replace(
        /\b(did|doing|some|my|the|a lot of|many|several)\s+researches\b/gi,
        (_, d) => `${d} research`,
      ),
    reason:
      '"Research" as a noun is uncountable — say "research", not "researches".',
  },

  // ── Redundant conjunctions ───────────────────────────────────────────────────
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

  // ── Common preposition errors ────────────────────────────────────────────────
  {
    id: "listen-music",
    test: /\blisten\s+(music|songs?|audio|podcast|radio|news)\b/i,
    apply: (t) =>
      t.replace(
        /\blisten\s+(music|songs?|audio|podcast|radio|news)\b/gi,
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
    test: /\bgood\s+in\s+(playing|doing|writing|speaking|cooking|drawing|singing|dancing|running|swimming|coding|programming)\b/i,
    apply: (t) =>
      t.replace(
        /\bgood\s+in\s+(playing|doing|writing|speaking|cooking|drawing|singing|dancing|running|swimming|coding|programming)\b/gi,
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
    // "bored of" is increasingly accepted but "bored with" is standard
    test: /\bbored\s+of\b/i,
    apply: (t) => t.replace(/\bbored\s+of\b/gi, "bored with"),
    reason: 'The standard form is "bored with", not "bored of".',
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
  return firstCap.replace(/\bi\b/g, "I");
}
