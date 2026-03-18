import React from 'react';

const SkeletonLoader = ({ variant = 'text', className = '' }) => {
  const base = 'animate-pulse bg-dark-600 rounded';
  const variants = {
    text:   `${base} h-4 w-full`,
    card:   `${base} h-32 w-full rounded-xl`,
    avatar: `${base} h-12 w-12 rounded-full`,
    chart:  `${base} h-48 w-full rounded-xl`,
    title:  `${base} h-6 w-48`,
  };
  return <div className={`${variants[variant]} ${className}`} />;
};

export default SkeletonLoader;
