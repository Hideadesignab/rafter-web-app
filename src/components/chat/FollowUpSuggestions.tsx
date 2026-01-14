const SUGGESTION_SETS = {
  legal: [
    'Skriv uppsägningsmeddelandet åt mig',
    'Vilka undantag finns?',
    'Vad händer om hyresgästen överklagar?',
  ],
  document: [
    'Visa mig de viktigaste klausulerna',
    'Jämför med standardavtal',
    'Finns det potentiella problem?',
  ],
  general: [
    'Kan du förklara mer?',
    'Ge mig ett exempel',
    'Vad bör jag tänka på?',
  ],
};

export function getSuggestions(content: string): string[] {
  if (/uppsägning|hyres|avtals?rätt|besittningsskydd/i.test(content)) {
    return SUGGESTION_SETS.legal;
  }
  if (/dokument|avtal|klausul|sammanfattning/i.test(content)) {
    return SUGGESTION_SETS.document;
  }
  return SUGGESTION_SETS.general;
}

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSend: (text: string) => void;
}

export function FollowUpSuggestions({ suggestions, onSend }: FollowUpSuggestionsProps) {
  return (
    <div className="flex flex-col gap-2.5 mt-4 animate-fadeIn">
      {suggestions.slice(0, 3).map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSend(suggestion)}
          className="flex items-start gap-2 py-2 text-left group"
        >
          <span className="text-gray-400">→</span>
          <span className="text-gray-600 text-sm group-hover:text-gray-800 group-hover:underline transition-colors">
            {suggestion}
          </span>
        </button>
      ))}
    </div>
  );
}
