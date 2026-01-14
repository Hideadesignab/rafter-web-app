import type { TaskStep } from '@/stores/taskStore';

export type QueryType = 'legal' | 'document' | 'writing' | 'general';

const LEGAL_KEYWORDS = [
  'hyreslagen',
  'jordabalken',
  'besittningsskydd',
  'uppsägning',
  'hyresavtal',
  'hyresgäst',
  'hyresvärd',
  'andrahandsuthyrning',
  'hyreshöjning',
  'deposition',
  'kontrakt',
  'lag',
  'juridisk',
  'juridiskt',
  'rättighet',
  'skyldighet',
  'paragraf',
  '§',
];

const WRITING_KEYWORDS = [
  'skriv',
  'skriva',
  'formulera',
  'upprätta',
  'skapa',
  'utforma',
  'mall',
  'brev',
  'meddelande',
  'dokument',
  'utkast',
];

export function detectQueryType(message: string, hasFiles: boolean): QueryType {
  const lowerMessage = message.toLowerCase();

  // Document upload takes priority
  if (hasFiles) {
    return 'document';
  }

  // Check for writing intent
  const isWritingRequest = WRITING_KEYWORDS.some((keyword) =>
    lowerMessage.includes(keyword)
  );
  if (isWritingRequest) {
    return 'writing';
  }

  // Check for legal question
  const isLegalQuestion = LEGAL_KEYWORDS.some((keyword) =>
    lowerMessage.includes(keyword)
  );
  if (isLegalQuestion) {
    return 'legal';
  }

  return 'general';
}

export function getStepsForQuery(type: QueryType): TaskStep[] {
  switch (type) {
    case 'legal':
      return [
        { id: '1', label: 'Analyserar frågan', status: 'pending' },
        { id: '2', label: 'Söker i hyreslagen', status: 'pending' },
        { id: '3', label: 'Hämtar relevanta paragrafer', status: 'pending' },
        { id: '4', label: 'Genererar svar med källor', status: 'pending' },
      ];

    case 'document':
      return [
        { id: '1', label: 'Läser dokument', status: 'pending' },
        { id: '2', label: 'Extraherar nyckelvillkor', status: 'pending' },
        { id: '3', label: 'Jämför med standardavtal', status: 'pending' },
        { id: '4', label: 'Sammanställer analys', status: 'pending' },
      ];

    case 'writing':
      return [
        { id: '1', label: 'Förstår uppdraget', status: 'pending' },
        { id: '2', label: 'Hämtar relevant kontext', status: 'pending' },
        { id: '3', label: 'Skriver utkast', status: 'pending' },
        { id: '4', label: 'Formaterar dokument', status: 'pending' },
      ];

    case 'general':
    default:
      return [
        { id: '1', label: 'Analyserar frågan', status: 'pending' },
        { id: '2', label: 'Söker information', status: 'pending' },
        { id: '3', label: 'Genererar svar', status: 'pending' },
      ];
  }
}

// Generate random delay between 800ms and 1500ms
export function getRandomDelay(): number {
  return Math.floor(Math.random() * 700) + 800;
}

// Simulate task progress with realistic timing
export function simulateTaskProgress(
  steps: TaskStep[],
  updateStep: (id: string, status: TaskStep['status']) => void,
  onComplete: () => void
): () => void {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let cumulativeDelay = 0;

  steps.forEach((step, index) => {
    // Set step to in_progress
    const startTimeout = setTimeout(() => {
      updateStep(step.id, 'in_progress');
    }, cumulativeDelay);
    timeouts.push(startTimeout);

    // Calculate delay for this step
    const stepDelay = getRandomDelay();
    cumulativeDelay += stepDelay;

    // Set step to completed
    const completeTimeout = setTimeout(() => {
      updateStep(step.id, 'completed');

      // If this is the last step, call onComplete
      if (index === steps.length - 1) {
        onComplete();
      }
    }, cumulativeDelay);
    timeouts.push(completeTimeout);
  });

  // Return cleanup function
  return () => {
    timeouts.forEach((timeout) => clearTimeout(timeout));
  };
}
