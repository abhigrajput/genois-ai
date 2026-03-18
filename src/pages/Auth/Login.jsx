import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      toast.error("Hmm, that email or password doesn't match. Try again?");
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    if (profile?.role === 'admin') navigate('/admin/dashboard');
    else if (profile?.role === 'company') navigate('/company/dashboard');
    else navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold font-heading" style={{color:'#00FF94'}}>
            GENOIS AI
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Welcome back. Keep building.</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email" required placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password" required placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-dark-900 font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 text-sm mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <><span>Continue</span><ArrowRight size={16}/></>
              )}
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">Sign up free</Link>
          </p>
        </div>
        <p className="text-center text-xs text-gray-600 mt-6">
          "Every expert was once a beginner who didn't give up."
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
