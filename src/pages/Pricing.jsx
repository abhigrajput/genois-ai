import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Zap, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: 0,
    color: '#666',
    subtitle: 'Get started',
    features: [
      { label: '2 tasks/day',            included: true  },
      { label: '3 tests/month',          included: true  },
      { label: '1 note',                 included: true  },
      { label: 'AI Roadmap',             included: true  },
      { label: '2AM Anxiety Chat',       included: true  },
      { label: 'Public Profile',         included: true  },
      { label: 'Skill Graph',            included: false },
      { label: 'Analytics Dashboard',    included: false },
      { label: 'Skill DNA Report',       included: false },
      { label: 'Score Breakdown',        included: false },
      { label: 'Resume Export',          included: false },
    ],
  },
  {
    key: 'starter',
    label: 'Starter',
    price: 299,
    color: '#4A9EFF',
    subtitle: 'Build your foundation',
    badge: 'Popular',
    features: [
      { label: 'Unlimited tasks',        included: true  },
      { label: 'Unlimited tests',        included: true  },
      { label: 'Unlimited notes',        included: true  },
      { label: 'AI Roadmap',             included: true  },
      { label: '2AM Anxiety Chat',       included: true  },
      { label: 'Public Profile',         included: true  },
      { label: 'Skill Graph',            included: true  },
      { label: 'Analytics Dashboard',    included: false },
      { label: 'Skill DNA Report',       included: false },
      { label: 'Score Breakdown',        included: false },
      { label: 'Resume Export',          included: true  },
    ],
  },
  {
    key: 'identity',
    label: 'Identity',
    price: 499,
    color: '#7B61FF',
    subtitle: 'Build your verified identity',
    badge: 'Best Value',
    features: [
      { label: 'Unlimited tasks',        included: true  },
      { label: 'Unlimited tests',        included: true  },
      { label: 'Unlimited notes',        included: true  },
      { label: 'AI Roadmap',             included: true  },
      { label: '2AM Anxiety Chat',       included: true  },
      { label: 'Public Profile',         included: true  },
      { label: 'Skill Graph',            included: true  },
      { label: 'Analytics Dashboard',    included: true  },
      { label: 'Skill DNA Report',       included: true  },
      { label: 'Score Breakdown',        included: true  },
      { label: 'Resume Export',          included: true  },
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    price: 1999,
    color: '#FFD700',
    subtitle: 'Maximum visibility',
    features: [
      { label: 'Everything in Identity', included: true  },
      { label: 'Priority placement',     included: true  },
      { label: 'Company DMs enabled',    included: true  },
      { label: 'Verified badge',         included: true  },
      { label: '1-on-1 mentor session',  included: true  },
      { label: 'Featured in search',     included: true  },
      { label: 'LinkedIn sync (beta)',   included: true  },
      { label: 'Resume Export',          included: true  },
      { label: 'Score Breakdown',        included: true  },
      { label: 'Skill DNA Report',       included: true  },
      { label: 'Analytics Dashboard',    included: true  },
    ],
  },
];

const FAQ = [
  { q: 'Is payment live?', a: 'Not yet — we are in early access. Join the waitlist and we will notify you when your plan activates. Your spot is reserved.' },
  { q: 'Can I switch plans later?', a: 'Yes. You can upgrade or downgrade anytime. Your data is always preserved.' },
  { q: 'Will my score reset if I downgrade?', a: 'Never. Your Genois Score™ is built from real activity and is always yours, regardless of plan.' },
  { q: 'Is this for any college?', a: 'Yes. Genois is built specifically for Tier 2 and Tier 3 engineering colleges across India.' },
  { q: 'What happens to free users?', a: 'Free plan stays free forever with core features. Paid plans unlock advanced analytics and company visibility.' },
];

const Pricing = () => {
  const { profile } = useStore();
  const [joining, setJoining] = useState(null);
  const [joined, setJoined] = useState({});

  const handleJoinWaitlist = async (planKey) => {
    if (!profile?.id) {
      toast.error('Please log in first');
      return;
    }
    setJoining(planKey);
    try {
      await supabase.from('waitlist').upsert({
        student_id: profile.id,
        email: profile.email || profile.id,
        requested_plan: planKey,
        feature_requested: 'plan_upgrade',
      }, { onConflict: 'student_id,requested_plan' });
      setJoined(prev => ({ ...prev, [planKey]: true }));
      toast.success(`You're on the ${planKey} waitlist! 🎉`);
    } catch {
      toast.error('Something went wrong. Try again.');
    }
    setJoining(null);
  };

  const currentPlan = profile?.plan || 'free';

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 pb-24">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
        <Link to="/" className="text-xl font-bold font-heading" style={{ color: '#00FF94', textShadow: '0 0 20px rgba(0,255,148,0.4)' }}>
          GENOIS AI
        </Link>
        <div className="flex items-center gap-3">
          {profile ? (
            <Link to="/app" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft size={14} /> Back to App
            </Link>
          ) : (
            <>
              <Link to="/login"    className="text-sm text-gray-400 hover:text-white px-4 py-2">Login</Link>
              <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-dark-900 hover:bg-opacity-90 transition-all">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <div className="pt-28 px-6 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Zap size={12} className="text-primary" />
            <span className="text-xs text-primary font-medium">Early Access Pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Build your identity.<br />
            <span style={{ color: '#00FF94' }}>Not just your resume.</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Every plan gives you the tools to prove your skills through real work — not certificates or CGPA.
            Join the waitlist for early access pricing.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {PLANS.map((plan, i) => {
            const isCurrentPlan = currentPlan === plan.key;
            const hasJoined = joined[plan.key];
            const isLoading = joining === plan.key;

            return (
              <motion.div key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-5 flex flex-col"
                style={{
                  background: plan.key === 'identity'
                    ? `linear-gradient(135deg, ${plan.color}10, rgba(18,18,26,0.95))`
                    : 'rgba(18,18,26,0.8)',
                  border: `1px solid ${isCurrentPlan ? plan.color : plan.color + '25'}`,
                }}>

                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: plan.color, color: '#0A0A0F' }}>
                    {plan.badge}
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-dark-600 border border-dark-400 text-gray-300">
                    Current
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-sm font-bold mb-1" style={{ color: plan.color }}>{plan.label}</div>
                  <div className="text-xs text-gray-500 mb-3">{plan.subtitle}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-heading text-white">
                      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-xs text-gray-500">/mo</span>}
                  </div>
                </div>

                <div className="flex-1 space-y-2 mb-5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2">
                      {f.included
                        ? <CheckCircle size={13} style={{ color: plan.color, flexShrink: 0 }} />
                        : <XCircle    size={13} className="text-dark-500 flex-shrink-0" />
                      }
                      <span className={`text-xs ${f.included ? 'text-gray-300' : 'text-gray-600 line-through'}`}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.price === 0 ? (
                  <Link to={profile ? '/app' : '/register'}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all bg-dark-700 border border-dark-500 text-gray-300 hover:border-gray-400">
                    {profile ? 'Continue Free' : 'Get Started Free'}
                  </Link>
                ) : hasJoined ? (
                  <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-success/10 text-success border border-success/20">
                    ✓ On waitlist!
                  </div>
                ) : (
                  <button onClick={() => handleJoinWaitlist(plan.key)}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ background: plan.color, color: '#0A0A0F' }}>
                    {isLoading ? 'Joining...' : 'Join Waitlist'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mb-16">
          <h2 className="text-2xl font-bold font-heading text-white text-center mb-8">Full Feature Comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-dark-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.key} className="p-4 text-center font-bold" style={{ color: p.color }}>
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'AI Roadmap',          values: ['✓','✓','✓','✓'] },
                  { label: 'Tasks / Day',          values: ['2','∞','∞','∞'] },
                  { label: 'Tests / Month',        values: ['3','∞','∞','∞'] },
                  { label: 'Notes',                values: ['1','∞','∞','∞'] },
                  { label: '2AM Anxiety Chat',     values: ['✓','✓','✓','✓'] },
                  { label: 'Public Profile',       values: ['✓','✓','✓','✓'] },
                  { label: 'Skill Graph',          values: ['✗','✓','✓','✓'] },
                  { label: 'Analytics Dashboard',  values: ['✗','✗','✓','✓'] },
                  { label: 'Skill DNA AI Report',  values: ['✗','✗','✓','✓'] },
                  { label: 'Score Breakdown',      values: ['✗','✗','✓','✓'] },
                  { label: 'Resume Export',        values: ['✗','✓','✓','✓'] },
                  { label: 'Priority Placement',   values: ['✗','✗','✗','✓'] },
                  { label: 'Company DMs',          values: ['✗','✗','✗','✓'] },
                  { label: 'Verified Badge',       values: ['✗','✗','✗','✓'] },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-dark-700 ${i % 2 === 0 ? '' : 'bg-dark-800/30'}`}>
                    <td className="p-4 text-gray-300">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className={`p-4 text-center font-mono text-sm ${
                        val === '✓' ? 'text-success' :
                        val === '✗' ? 'text-dark-500' :
                        'text-gray-300'
                      }`}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold font-heading text-white text-center mb-8">FAQ</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-dark-800 border border-dark-600 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2">{item.q}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Pricing;
