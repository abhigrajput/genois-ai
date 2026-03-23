const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const PLAN_PRICES = {
  starter:  { amount: 29900,  label: 'Starter Plan',  duration: 30 },
  identity: { amount: 49900,  label: 'Identity Plan', duration: 30 },
  pro:      { amount: 199900, label: 'Pro Plan',       duration: 30 },
};

export const loadRazorpay = () => {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async ({
  plan,
  profile,
  onSuccess,
  onFailure,
  supabase,
}) => {
  const loaded = await loadRazorpay();
  if (!loaded) {
    alert('Payment failed to load. Check internet connection.');
    return;
  }

  const planConfig = PLAN_PRICES[plan];
  if (!planConfig) return;

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: planConfig.amount,
    currency: 'INR',
    name: 'Genois AI',
    description: planConfig.label,
    image: 'https://genois-ai.vercel.app/logo.png',
    prefill: {
      name: profile?.full_name || '',
      email: profile?.email || '',
      contact: profile?.phone || '',
    },
    notes: {
      student_id: profile?.id,
      plan,
    },
    theme: {
      color: '#00FF94',
    },
    handler: async function (response) {
      try {
        const expiresAt = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);

        await supabase.from('payments').insert({
          student_id: profile.id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || '',
          razorpay_signature: response.razorpay_signature || '',
          amount: planConfig.amount,
          plan,
          status: 'success',
        });

        await supabase.from('profiles').update({
          subscription_status: 'active',
          subscription_plan: plan,
          subscription_expires_at: expiresAt.toISOString(),
          razorpay_payment_id: response.razorpay_payment_id,
          plan,
        }).eq('id', profile.id);

        if (onSuccess) onSuccess(response);
      } catch (err) {
        console.error('Payment save error:', err);
      }
    },
    modal: {
      ondismiss: function () {
        if (onFailure) onFailure('dismissed');
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
