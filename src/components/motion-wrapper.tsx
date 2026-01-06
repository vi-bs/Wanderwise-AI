'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  key: string;
}

export function MotionWrapper({ children, key }: MotionWrapperProps) {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
