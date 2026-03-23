import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LEVELS = [
  { min: 0,   max: 30,  label: 'Beginner',        color: '#7B61FF', icon: '🌱' },
  { min: 30,  max: 60,  label: 'Learning',         color: '#4A9EFF', icon: '📈' },
  { min: 60,  max: 80,  label: 'Job Ready',        color: '#00FF94', icon: '✅' },
  { min: 80,  max: 101, label: 'Interview Ready',  color: '#FFD700', icon: '🏆' },
];

const JobReadinessMeter = ({
  jobReadiness,
  showBreakdown = false,
  showNextStep = true,
  compact = false,
}) => {
  if (!jobReadiness) return null;

  const { percentage, status, color, badge,
          description, nextStep, breakdown } = jobReadiness;

  if (compact) {
    return (
      <div className="p-3 rounded-xl"
        style={{ background:`${color}08`, border:`1px solid ${color}20` }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
            {badge} Job Readiness
          </span>
          <span className="text-sm font-bold font-mono" style={{ color }}>
            {percentage}%
          </span>
        </div>
        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color }}>{status}</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-white font-heading text-sm flex items-center gap-2">
            {badge} Job Readiness Meter
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Score 30% + Roadmap 30% + Projects 20% + Tests 20%
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold font-heading" style={{ color }}>
            {percentage}%
          </div>
          <div className="text-xs font-bold" style={{ color }}>{status}</div>
        </div>
      </div>

      {/* Main bar with level markers */}
      <div className="mb-3">
        <div className="h-4 bg-dark-600 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full rounded-full relative"
            style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold"
              style={{ color: '#0A0A0F', fontSize: '9px' }}>
              {percentage}%
            </div>
          </motion.div>
          {[30, 60, 80].map(marker => (
            <div key={marker}
              className="absolute top-0 bottom-0 w-px bg-dark-900 opacity-60"
              style={{ left: `${marker}%` }}
            />
          ))}
        </div>

        {/* Level labels */}
        <div className="flex mt-1">
          {LEVELS.map((lvl, i) => (
            <div key={i} className="text-center" style={{ width:'25%' }}>
              <span style={{
                color: percentage >= lvl.min ? lvl.color : '#444',
                fontSize: '10px',
              }}>
                {lvl.icon} {lvl.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="p-3 rounded-xl mb-4"
        style={{ background:`${color}08`, border:`1px solid ${color}15` }}>
        <p className="text-xs text-gray-300">{description}</p>
        {showNextStep && nextStep && (
          <p className="text-xs mt-1.5 font-semibold" style={{ color }}>
            → Next: {nextStep}
          </p>
        )}
      </div>

      {/* Breakdown */}
      {showBreakdown && breakdown && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-3 font-semibold">How it's calculated:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(breakdown).map(([key, item]) => (
              <div key={key} className="p-2.5 rounded-xl"
                style={{ background:`${item.color}08`, border:`1px solid ${item.color}15` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className="text-xs font-bold font-mono" style={{ color:item.color }}>
                    {item.value}/{item.max}
                  </span>
                </div>
                <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.max) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status tags + link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {LEVELS.map((lvl, i) => {
            const active = percentage >= lvl.min && percentage < lvl.max;
            return (
              <div key={i}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: active ? `${lvl.color}20` : 'rgba(34,34,51,0.3)',
                  color: active ? lvl.color : '#444',
                  border: `1px solid ${active ? lvl.color+'40' : 'transparent'}`,
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                }}>
                {lvl.icon}
                <span className="hidden md:inline">{lvl.label}</span>
              </div>
            );
          })}
        </div>
        <Link to="/student/score"
          className="text-xs text-gray-500 hover:text-white transition-colors">
          Full analysis →
        </Link>
      </div>
    </div>
  );
};

export default JobReadinessMeter;
