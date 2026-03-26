import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PLANS, initiatePayment } from '../lib/razorpay';
import { checkTrial } from '../lib/trial';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const Pricing = () => {
  const { profile } = useStore();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(null);

  const trial = profile ? checkTrial(profile) : null;

  const handlePay = async (planId) => {
    if (!profile) {
      navigate('/login');
      return;
    }
    if (planId === 'free') {
      navigate('/register');
      return;
    }
    setPaying(planId);
    await initiatePayment({
      planId,
      profile,
      supabase,
      onSuccess: (response) => {
        toast.success(
          `${PLANS[planId].name} activated!`,
          { duration: 4000 }
        );
        setPaying(null);
        navigate('/student/dashboard');
      },
      onFailure: (reason) => {
        if (reason !== 'dismissed') {
          toast.error('Payment failed. Try again.');
        }
        setPaying(null);
      },
    });
  };

  const freePlan = {
    id: 'free',
    name: 'Free',
    display: '₹0',
    color: '#00FF94',
    features: [
      '14-day full access trial',
      'Basic roadmap (3 nodes)',
      '2 tasks per day',
      '5 test questions',
      'Basic score tracking',
    ],
  };

  const allPlans = [freePlan, ...Object.values(PLANS)];

  return (
    <div className="min-h-screen cyber-grid py-12 px-4"
      style={{ background: '#050508' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-heading mb-4"
            style={{
              background: 'linear-gradient(135deg,#00FF94,#7B61FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(0,255,148,0.3))',
            }}>
            Simple Pricing
          </motion.h1>
          <p className="text-gray-400 text-sm mb-4">
            Start free for 14 days. No credit card required.
          </p>

          {trial && !trial.isPaid && !trial.expired && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4"
              style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.25)' }}>
              <Zap size={14} className="text-primary" />
              <span className="text-sm text-primary font-semibold">
                You have {trial.daysLeft} days of free trial remaining
              </span>
            </div>
          )}
          {trial?.expired && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4"
              style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)' }}>
              <span className="text-sm text-danger font-semibold">
                Your trial has expired — choose a plan to continue
              </span>
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {allPlans.map((plan, i) => {
            const isPro = plan.id === 'pro';
            const isCurrent = profile?.plan === plan.id ||
              (plan.id === 'free' && !profile?.plan);
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl p-5 flex flex-col"
                style={{
                  background: isPro
                    ? `linear-gradient(135deg, rgba(255,215,0,0.06), rgba(8,8,14,0.95))`
                    : 'rgba(8,8,14,0.92)',
                  border: `1px solid ${isCurrent
                    ? plan.color + '50'
                    : isPro
                    ? 'rgba(255,215,0,0.3)'
                    : 'rgba(34,34,51,0.6)'}`,
                  boxShadow: isPro
                    ? '0 0 30px rgba(255,215,0,0.08)'
                    : isCurrent
                    ? `0 0 20px ${plan.color}12`
                    : 'none',
                }}>

                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-dark-900"
                      style={{ background: '#FFD700', boxShadow: '0 0 12px rgba(255,215,0,0.5)' }}>
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: `${plan.color}20`, color: plan.color, border: `1px solid ${plan.color}40` }}>
                      Current
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-base font-bold text-white font-heading mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-heading"
                      style={{ color: plan.color }}>
                      {plan.display}
                    </span>
                    {plan.id !== 'free' && (
                      <span className="text-xs text-gray-600">/month</span>
                    )}
                  </div>
                  {plan.id === 'free' && (
                    <p className="text-xs text-primary mt-1">14 days full access</p>
                  )}
                </div>

                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2">
                      <Check size={13} className="flex-shrink-0 mt-0.5"
                        style={{ color: plan.color }} />
                      <span className="text-xs text-gray-400 leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePay(plan.id)}
                  disabled={paying === plan.id || isCurrent}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  style={isCurrent ? {
                    background: `${plan.color}10`,
                    color: plan.color,
                    border: `1px solid ${plan.color}30`,
                  } : isPro ? {
                    background: 'linear-gradient(135deg,#FFD700,#FFB347)',
                    color: '#050508',
                    boxShadow: '0 0 20px rgba(255,215,0,0.3)',
                  } : {
                    background: `${plan.color}15`,
                    color: plan.color,
                    border: `1px solid ${plan.color}35`,
                    boxShadow: `0 0 12px ${plan.color}10`,
                  }}>
                  {isCurrent ? 'Current Plan'
                    : paying === plan.id ? 'Processing...'
                    : plan.id === 'free' ? 'Start Free →'
                    : `Pay ${plan.display}/mo`}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Trust section */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: '🔒', title: 'Secure Payment', desc: 'Razorpay secured. Bank-grade encryption.' },
            { icon: '↩️', title: 'No Hidden Fees', desc: 'What you see is what you pay. Cancel anytime.' },
            { icon: '⚡', title: 'Instant Access', desc: 'Account activated immediately after payment.' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl text-center"
              style={{ background: 'rgba(8,8,14,0.8)', border: '1px solid rgba(34,34,51,0.5)' }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs font-bold text-white mb-1">{item.title}</p>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(8,8,14,0.9)', border: '1px solid rgba(34,34,51,0.5)' }}>
          <h3 className="text-sm font-bold text-white font-heading mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {[
              { q: 'What happens after 14 days?', a: 'Your account switches to Free plan with limited features. Upgrade anytime to continue with full access.' },
              { q: 'Can I cancel anytime?', a: 'Yes. No contracts. Cancel anytime from your profile settings.' },
              { q: 'Is my payment secure?', a: 'Yes. Powered by Razorpay — trusted by 5 lakh+ businesses in India.' },
              { q: 'Do you offer student discounts?', a: 'The pricing is already student-friendly. Use coupon code STUDENT10 for 10% off.' },
            ].map((faq, i) => (
              <div key={i} className="pb-4 border-b border-dark-600 last:border-0">
                <p className="text-xs font-bold text-white mb-1">{faq.q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
