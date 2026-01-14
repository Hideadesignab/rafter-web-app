import { create } from 'zustand';

export interface TaskStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TaskState {
  steps: TaskStep[];
  isVisible: boolean;
  setSteps: (steps: TaskStep[]) => void;
  updateStep: (id: string, status: TaskStep['status']) => void;
  clearSteps: () => void;
  setVisible: (visible: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  steps: [],
  isVisible: true,

  setSteps: (steps) => set({ steps, isVisible: true }),

  updateStep: (id, status) =>
    set((state) => ({
      steps: state.steps.map((step) =>
        step.id === id ? { ...step, status } : step
      ),
    })),

  clearSteps: () => set({ steps: [] }),

  setVisible: (visible) => set({ isVisible: visible }),
}));
