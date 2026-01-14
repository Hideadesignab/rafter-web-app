import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { TaskStep } from './TaskStep';

export function TaskProgress() {
  const { steps, isVisible } = useTaskStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (steps.length === 0 || !isVisible) return null;

  return (
    <section className="bg-[#FAFAFA] p-4 px-5 rounded-xl mb-4">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full group"
      >
        <h3 className="text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-[0.05em]">
          TASK
        </h3>
        <ChevronUp
          size={16}
          className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3"
          >
            {steps.map((step, index) => (
              <TaskStep key={step.id} step={step} index={index} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}
