import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const UpgradePrompt = ({ feature, requiredPlan = 'starter', compact = false }) => {
  const { profile } = useStore();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const planColors = {
    starter:  '#4A9EFF',
    identity: '#7B61FF',
    pro:      '#FFD700',
  };
  const color = planColors[requiredPlan] || '#7B61FF';

  const planLabels = {
    starter:  'Starter (₹299/mo)',
    identity: 'Identity (₹499/mo)',
    pro:      'Pro (₹1999/mo)',
  };

  const joinWaitlist = async () => {
    if (!profile?.id) return;
    setJoining(true);
    try {
      await supabase.from('waitlist').upsert({
        student_id: profile.id,
        email: profile.email,
        requested_plan: requiredPlan,
        feature_requested: feature,
      }, { onConflict: 'student_id,requested_plan' });
      setJoined(true);
      toast.success("You're on the waitlist! We'll notify you.");
    } catch {
      toast.error('Something went wrong. Try again.');
    }
    setJoining(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed"
        style={{ borderColor: `${color}40`, background: `${color}08` }}>
        <Lock size={12} style={{ color }} />
        <span className="text-xs text-gray-400 flex-1">
          {feature} requires <span style={{ color }} className="font-semibold">{planLabels[requiredPlan]}</span>
        </span>
        <Link to="/pricing" className="text-xs font-semibold hover:underline" style={{ color }}>
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-8 text-center"
      style={{
        background: `linear-gradient(135deg, ${color}08, rgba(10,10,15,0.95))`,
        border: `1px solid ${color}25`,
      }}>
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Lock size={120} style={{ color }} />
      </div>
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Lock size={24} style={{ color }} />
        </div>
        <h3 className="text-lg font-bold font-heading text-white mb-2">
          {feature} is locked
        </h3>
        <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
          Upgrade to <span style={{ color }} className="font-semibold">{planLabels[requiredPlan]}</span> to unlock {feature.toLowerCase()} and build your verified skill identity.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{ background: color, color: '#0A0A0F' }}>
            <Zap size={14} /> View Plans <ArrowRight size={14} />
          </Link>
          {!joined ? (
            <button onClick={joinWaitlist} disabled={joining}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-dark-700 border border-dark-500 text-gray-300 hover:border-gray-400 transition-all disabled:opacity-50">
              {joining ? 'Joining...' : 'Join Waitlist'}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm bg-success/10 text-success border border-success/20">
              ✓ On the waitlist!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UpgradePrompt;
