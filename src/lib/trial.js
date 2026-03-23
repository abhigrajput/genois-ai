export const checkTrialStatus = (profile) => {
  if (!profile) return { active: false, expired: true, daysLeft: 0 };

  const status = profile.subscription_status || 'trial';
  const now = new Date();

  if (status === 'active') {
    const expires = profile.subscription_expires_at
      ? new Date(profile.subscription_expires_at) : null;
    if (!expires || expires > now) {
      return { active: true, expired: false, daysLeft: null, isPaid: true };
    }
  }

  if (status === 'trial' || !profile.subscription_status) {
    const trialStart = profile.trial_started_at
      ? new Date(profile.trial_started_at) : new Date();
    const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
    const expired = now > trialEnd;

    return {
      active: !expired,
      expired,
      daysLeft,
      isPaid: false,
      trialEnd,
    };
  }

  return { active: false, expired: true, daysLeft: 0 };
};

export const initializeTrial = async (userId, supabase) => {
  const trialExpires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  await supabase.from('profiles').update({
    trial_started_at: new Date().toISOString(),
    trial_expires_at: trialExpires.toISOString(),
    subscription_status: 'trial',
  }).eq('id', userId);
};
