import React from 'react';

const Skeleton = ({ width = '100%', height = '16px', className = '', rounded = 'lg' }) => (
  <div
    className={`animate-pulse ${className}`}
    style={{
      width,
      height,
      background: 'linear-gradient(90deg, #1A1A27 25%, #222233 50%, #1A1A27 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: rounded === 'full' ? '9999px' : rounded === 'lg' ? '8px' : '4px',
    }}
  />
);

export const SkeletonCard = () => (
  <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 space-y-3">
    <Skeleton height="20px" width="60%" />
    <Skeleton height="14px" width="80%" />
    <Skeleton height="14px" width="40%" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-2">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-3 p-3">
        <Skeleton width="40px" height="40px" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton height="14px" width="70%" />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
