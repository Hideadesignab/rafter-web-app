import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import type { TaskStep as TaskStepType } from '@/stores/taskStore';

interface TaskStepProps {
  step: TaskStepType;
  index: number;
}

export function TaskStep({ step, index }: TaskStepProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return (
          <div className="w-4 h-4 flex items-center justify-center">
            <Check size={16} className="text-[#A3A3A3]" />
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-4 h-4 flex items-center justify-center">
            <Circle
              size={10}
              className="text-[#171717] fill-[#171717]"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="w-4 h-4 flex items-center justify-center">
            <Circle size={10} className="text-[#D4D4D4]" />
          </div>
        );
    }
  };

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex items-center gap-3 py-2.5"
    >
      <motion.div
        animate={{
          color: step.status === 'completed' ? '#A3A3A3' : '#171717',
        }}
        transition={{ duration: 0.3 }}
      >
        {getStatusIcon()}
      </motion.div>

      <motion.span
        animate={{
          color: step.status === 'in_progress' ? '#171717' : '#A3A3A3',
          fontWeight: step.status === 'in_progress' ? 500 : 400,
        }}
        transition={{ duration: 0.3 }}
        className="text-sm"
      >
        {step.label}
      </motion.span>
    </motion.li>
  );
}
