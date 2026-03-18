import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';

const useStreak = () => {
  const { profile, setProfile } = useStore();

  const updateStreak = async () => {
    if (!profile?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile?.last_active_date;

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastActive === yesterdayStr) {
      newStreak = (profile?.streak_count || 0) + 1;
    }

    const longestStreak = Math.max(
      newStreak,
      profile?.longest_streak || 0
    );

    const { data } = await supabase.from('profiles')
      .update({
        streak_count: newStreak,
        last_active_date: today,
        longest_streak: longestStreak,
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (data) setProfile(data);
    return newStreak;
  };

  useEffect(() => {
    updateStreak();
  }, [profile?.id]);

  return { updateStreak, streak: profile?.streak_count || 0 };
};

export default useStreak;
