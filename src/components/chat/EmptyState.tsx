import {
  Mail,
  Scale,
  FileText,
  BarChart3,
  ClipboardList,
  Search,
} from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';

interface EmptyStateProps {
  onSuggestionClick?: (prompt: string) => void;
}

const suggestions = [
  {
    icon: Mail,
    title: 'Skriv meddelande',
    description: 'till hyresgäst',
    prompt: 'Skriv ett meddelande till hyresgäst',
  },
  {
    icon: Scale,
    title: 'Fråga om hyreslagen',
    description: 'juridisk vägledning',
    prompt: 'Fråga om hyreslagen',
  },
  {
    icon: FileText,
    title: 'Analysera dokument',
    description: 'avtal, protokoll',
    prompt: 'Analysera dokument',
  },
  {
    icon: BarChart3,
    title: 'Sammanfatta',
    description: 'långa dokument',
    prompt: 'Sammanfatta dokument',
  },
  {
    icon: ClipboardList,
    title: 'Skapa arbetsorder',
    description: 'till entreprenör',
    prompt: 'Skapa arbetsorder',
  },
  {
    icon: Search,
    title: 'Jämför avtal',
    description: 'hitta skillnader',
    prompt: 'Jämför avtal',
  },
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center bg-white">
      <div className="w-full max-w-[680px] px-6">
        {/* Hero text */}
        <h1 className="text-3xl font-bold text-gray-900 text-center tracking-tight">
          Din AI-assistent för fastighetsförvaltning
        </h1>
        <p className="text-lg font-normal text-gray-500 text-center mt-3">
          Vad kan jag hjälpa dig med idag?
        </p>

        {/* Suggestion grid - 40px gap from headline */}
        <div className="grid grid-cols-3 gap-4 mt-12 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
          {suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={suggestion.title}
              icon={suggestion.icon}
              title={suggestion.title}
              description={suggestion.description}
              prompt={suggestion.prompt}
              index={index}
              onClick={onSuggestionClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
