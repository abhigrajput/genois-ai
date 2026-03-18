import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary text-dark-900 hover:bg-opacity-90 font-semibold',
  secondary: 'bg-secondary text-white hover:bg-opacity-90 font-semibold',
  ghost: 'bg-transparent border border-dark-600 text-gray-300 hover:border-primary hover:text-primary',
  danger: 'bg-danger text-white hover:bg-opacity-90',
  calm: 'bg-calm text-white hover:bg-opacity-90',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  className = '', onClick, type = 'button', ...props
}) => {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
};

export default Button;
