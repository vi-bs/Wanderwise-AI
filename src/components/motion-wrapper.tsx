'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  motionKey: string;
}

export function MotionWrapper({ children, motionKey }: MotionWrapperProps) {
  return (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
