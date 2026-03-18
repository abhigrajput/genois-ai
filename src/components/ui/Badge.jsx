import React from 'react';

const variants = {
  skill:    'bg-secondary/20 text-secondary border border-secondary/30',
  success:  'bg-success/20 text-success border border-success/30',
  warning:  'bg-warning/20 text-warning border border-warning/30',
  danger:   'bg-danger/20 text-danger border border-danger/30',
  calm:     'bg-calm/20 text-calm border border-calm/30',
  common:   'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  rare:     'bg-calm/20 text-calm border border-calm/30',
  epic:     'bg-secondary/20 text-secondary border border-secondary/30',
  legendary:'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
};

const Badge = ({ children, variant = 'skill', className = '' }) => (
  <span className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full
    text-xs font-medium ${variants[variant]} ${className}
  `}>
    {children}
  </span>
);

export default Badge;
