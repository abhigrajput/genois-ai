import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  default: 'bg-dark-800 border border-dark-600',
  elevated: 'bg-dark-700 border border-dark-500 shadow-xl',
  bordered: 'bg-dark-800 border-2 border-dark-500',
  glow: 'bg-dark-800 border border-dark-600 hover:border-primary hover:shadow-lg hover:shadow-primary/10',
};

const Card = ({
  children, variant = 'default',
  className = '', hover = false, onClick, ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`
        rounded-xl p-5 transition-all duration-300
        ${cardVariants[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
