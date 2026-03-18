import useStore from '../store/useStore';
import { canAccess, getLimit, getPlanColor, getPlanLabel } from '../lib/plans';

const usePlan = () => {
  const { profile } = useStore();
  const plan = profile?.plan || 'free';

  return {
    plan,
    label:    getPlanLabel(plan),
    color:    getPlanColor(plan),
    can:      (feature) => canAccess(plan, feature),
    limit:    (feature) => getLimit(plan, feature),
    isFree:   plan === 'free',
    isPro:    plan === 'pro',
  };
};

export default usePlan;
