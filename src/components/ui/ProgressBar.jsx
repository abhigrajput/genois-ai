import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ value = 0, max = 100, label, color = '#00FF94', className = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
