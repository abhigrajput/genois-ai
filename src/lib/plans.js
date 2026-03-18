export const PLANS = {
  free: {
    label: 'Free',
    color: '#666',
    price: 0,
    features: {
      roadmap:        true,
      tasksPerDay:    2,
      testsPerMonth:  3,
      notesLimit:     1,
      projectsLimit:  2,
      skillGraph:     false,
      analyticsPage:  false,
      skillDNA:       false,
      scoreBreakdown: false,
      resumeExport:   false,
      anxietyChat:    true,
      publicProfile:  true,
    },
  },
  starter: {
    label: 'Starter',
    color: '#4A9EFF',
    price: 299,
    features: {
      roadmap:        true,
      tasksPerDay:    -1,
      testsPerMonth:  -1,
      notesLimit:     -1,
      projectsLimit:  5,
      skillGraph:     true,
      analyticsPage:  false,
      skillDNA:       false,
      scoreBreakdown: false,
      resumeExport:   true,
      anxietyChat:    true,
      publicProfile:  true,
    },
  },
  identity: {
    label: 'Identity',
    color: '#7B61FF',
    price: 499,
    features: {
      roadmap:        true,
      tasksPerDay:    -1,
      testsPerMonth:  -1,
      notesLimit:     -1,
      projectsLimit:  10,
      skillGraph:     true,
      analyticsPage:  true,
      skillDNA:       true,
      scoreBreakdown: true,
      resumeExport:   true,
      anxietyChat:    true,
      publicProfile:  true,
    },
  },
  pro: {
    label: 'Pro',
    color: '#FFD700',
    price: 1999,
    features: {
      roadmap:        true,
      tasksPerDay:    -1,
      testsPerMonth:  -1,
      notesLimit:     -1,
      projectsLimit:  -1,
      skillGraph:     true,
      analyticsPage:  true,
      skillDNA:       true,
      scoreBreakdown: true,
      resumeExport:   true,
      anxietyChat:    true,
      publicProfile:  true,
    },
  },
};

export const canAccess = (plan, feature) => {
  const planConfig = PLANS[plan || 'free'];
  if (!planConfig) return false;
  const val = planConfig.features[feature];
  if (val === undefined || val === null) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === -1 || val > 0;
  return false;
};

export const getLimit = (plan, feature) => {
  const p = PLANS[plan] || PLANS.free;
  return p.features[feature] ?? 0;
};

export const getPlanColor = (plan) => (PLANS[plan] || PLANS.free).color;
export const getPlanLabel = (plan) => (PLANS[plan] || PLANS.free).label;
