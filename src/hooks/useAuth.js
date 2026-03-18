import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';

const useAuth = () => {
  const { setUser, setProfile, setLoading } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else { setProfile(null); setLoading(false); }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (data && data.length > 0) {
        setProfile(data[0]);
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email,
            full_name: user?.user_metadata?.full_name || 'Student',
            role: user?.user_metadata?.role || 'student',
            college: user?.user_metadata?.college || '',
            branch: user?.user_metadata?.branch || '',
            skill_score: 0,
            streak_count: 0,
          })
          .select();
        setProfile(newProfile ? newProfile[0] : null);
      }
    } catch (err) {
      console.error('Profile error:', err);
    }
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { logout };
};

export default useAuth;
