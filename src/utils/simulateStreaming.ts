export interface SimulateStreamingOptions {
  /** Minimum chunk size in characters (default: 5) */
  minChunkSize?: number;
  /** Maximum chunk size in characters (default: 20) */
  maxChunkSize?: number;
  /** Minimum delay between chunks in ms (default: 50) */
  minDelay?: number;
  /** Maximum delay between chunks in ms (default: 150) */
  maxDelay?: number;
}

export interface StreamingCallbacks {
  /** Called with each new chunk (receives cumulative text) */
  onChunk: (text: string) => void;
  /** Called when streaming is complete */
  onComplete: () => void;
}

/**
 * Simulates text streaming by delivering text in random chunks
 * with random delays. Useful for testing streaming UI without
 * a real backend connection.
 *
 * @param fullText - The complete text to stream
 * @param callbacks - Callbacks for chunk delivery and completion
 * @param options - Configuration options
 * @returns Cleanup function to cancel the simulation
 */
export function simulateStreaming(
  fullText: string,
  callbacks: StreamingCallbacks,
  options: SimulateStreamingOptions = {}
): () => void {
  const {
    minChunkSize = 5,
    maxChunkSize = 20,
    minDelay = 50,
    maxDelay = 150,
  } = options;

  let currentIndex = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const deliverNextChunk = () => {
    if (isCancelled) return;

    // Calculate random chunk size
    const chunkSize = Math.floor(
      Math.random() * (maxChunkSize - minChunkSize + 1) + minChunkSize
    );

    // Calculate new index, capped at full text length
    currentIndex = Math.min(currentIndex + chunkSize, fullText.length);

    // Deliver the chunk (cumulative text up to current index)
    callbacks.onChunk(fullText.slice(0, currentIndex));

    // Check if complete
    if (currentIndex >= fullText.length) {
      callbacks.onComplete();
      return;
    }

    // Schedule next chunk with random delay
    const delay = Math.floor(
      Math.random() * (maxDelay - minDelay + 1) + minDelay
    );
    timeoutId = setTimeout(deliverNextChunk, delay);
  };

  // Start the simulation
  deliverNextChunk();

  // Return cleanup function
  return () => {
    isCancelled = true;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Helper to use simulateStreaming with store updates.
 * Handles message status transitions automatically.
 */
export function createStreamingMessage(
  messageId: string,
  conversationId: string,
  fullText: string,
  updateMessage: (
    convId: string,
    msgId: string,
    updates: Partial<{ content: string; status: string }>
  ) => void,
  options?: SimulateStreamingOptions
): () => void {
  return simulateStreaming(
    fullText,
    {
      onChunk: (text) => {
        updateMessage(conversationId, messageId, { content: text });
      },
      onComplete: () => {
        updateMessage(conversationId, messageId, { status: 'complete' });
      },
    },
    options
  );
}
