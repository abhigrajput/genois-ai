const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    amount: 29900,
    display: '₹299',
    duration: 30,
    color: '#4A9EFF',
    features: [
      'Full roadmap access',
      'Unlimited tasks',
      'Daily + Weekly tests',
      'Study notes library',
      'AI task generation',
    ],
  },
  identity: {
    id: 'identity',
    name: 'Identity',
    amount: 49900,
    display: '₹499',
    duration: 30,
    color: '#7B61FF',
    features: [
      'Everything in Starter',
      'Skill Identity page',
      'Score breakdown',
      'Public profile link',
      'Analytics dashboard',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    amount: 199900,
    display: '₹1999',
    duration: 30,
    color: '#FFD700',
    features: [
      'Everything in Identity',
      'Company visibility',
      'Job readiness meter',
      'Resume destroyer',
      'Priority support',
      'AI mentor chat',
    ],
  },
};

export const loadRazorpay = () => new Promise(resolve => {
  if (window.Razorpay) { resolve(true); return; }
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export const initiatePayment = async ({
  planId, profile, supabase, onSuccess, onFailure,
}) => {
  const loaded = await loadRazorpay();
  if (!loaded) {
    alert('Payment gateway failed to load. Check internet.');
    return;
  }

  const plan = PLANS[planId];
  if (!plan) return;

  const options = {
    key: RAZORPAY_KEY,
    amount: plan.amount,
    currency: 'INR',
    name: 'Genois AI',
    description: `${plan.name} Plan — Monthly`,
    prefill: {
      name: profile?.full_name || '',
      email: profile?.email || '',
      contact: profile?.phone || '',
    },
    notes: {
      student_id: profile?.id,
      plan: planId,
    },
    theme: { color: '#00FF94' },
    handler: async (response) => {
      try {
        const expires = new Date(
          Date.now() + plan.duration * 24 * 60 * 60 * 1000
        ).toISOString();

        await supabase.from('payments').insert({
          student_id: profile.id,
          razorpay_payment_id: response.razorpay_payment_id,
          amount: plan.amount,
          plan: planId,
          status: 'success',
          created_at: new Date().toISOString(),
        });

        await supabase.from('profiles').update({
          subscription_status: 'active',
          subscription_plan: planId,
          subscription_expires_at: expires,
          plan: planId,
        }).eq('id', profile.id);

        if (onSuccess) onSuccess(response);
      } catch (e) {
        console.error('Payment save error:', e);
      }
    },
    modal: {
      ondismiss: () => {
        if (onFailure) onFailure('dismissed');
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
