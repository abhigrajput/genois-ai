import React from 'react';
import { Link } from 'react-router-dom';
import { checkTrialStatus } from '../../lib/trial';
import useStore from '../../store/useStore';

const TrialBanner = () => {
  const { profile } = useStore();
  const trial = checkTrialStatus(profile);

  if (!trial || trial.isPaid || (!trial.active && !trial.expired)) return null;

  if (trial.expired) {
    return (
      <div className="fixed top-14 left-0 right-0 z-30 px-4 py-2 flex items-center justify-center gap-3"
        style={{ background: 'rgba(255,107,107,0.15)', borderBottom: '1px solid rgba(255,107,107,0.3)' }}>
        <span className="text-xs font-semibold text-danger">
          Your 14-day trial has expired
        </span>
        <Link to="/pricing"
          className="px-3 py-1 rounded-lg text-xs font-bold text-dark-900 bg-danger">
          Upgrade Now →
        </Link>
      </div>
    );
  }

  if (trial.daysLeft <= 3) {
    return (
      <div className="fixed top-14 left-0 right-0 z-30 px-4 py-2 flex items-center justify-center gap-3"
        style={{ background: 'rgba(255,179,71,0.12)', borderBottom: '1px solid rgba(255,179,71,0.25)' }}>
        <span className="text-xs font-semibold text-warning">
          {trial.daysLeft} days left in your free trial
        </span>
        <Link to="/pricing"
          className="px-3 py-1 rounded-lg text-xs font-bold text-dark-900 bg-warning">
          Upgrade →
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed top-14 left-0 right-0 z-30 px-4 py-1.5 flex items-center justify-center gap-3"
      style={{ background: 'rgba(0,255,148,0.06)', borderBottom: '1px solid rgba(0,255,148,0.15)' }}>
      <span className="text-xs text-primary">
        Free trial: {trial.daysLeft} days remaining — All features unlocked
      </span>
      <Link to="/pricing" className="text-xs text-gray-500 hover:text-white">
        View plans →
      </Link>
    </div>
  );
};

export default TrialBanner;
