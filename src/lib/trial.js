export const checkTrial = (profile) => {
  if (!profile) return { active: false, expired: true, daysLeft: 0 };

  const status = profile.subscription_status || 'trial';

  if (status === 'active') {
    const expires = profile.subscription_expires_at
      ? new Date(profile.subscription_expires_at) : null;
    if (!expires || expires > new Date()) {
      return { active: true, expired: false, daysLeft: null, isPaid: true };
    }
  }

  const trialStart = profile.trial_started_at
    ? new Date(profile.trial_started_at) : new Date();
  const trialEnd = new Date(
    trialStart.getTime() + 14 * 24 * 60 * 60 * 1000
  );
  const now = new Date();
  const daysLeft = Math.max(0,
    Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
  );
  const expired = now > trialEnd;

  return { active: !expired, expired, daysLeft, isPaid: false, trialEnd };
};

export const initTrial = async (userId, supabase) => {
  const expires = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000
  ).toISOString();
  await supabase.from('profiles').update({
    trial_started_at: new Date().toISOString(),
    trial_expires_at: expires,
    subscription_status: 'trial',
    plan: 'trial',
  }).eq('id', userId);
};
