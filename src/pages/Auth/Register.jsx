import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, Mail, Lock, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const BRANCHES = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical','Other'];
const YEARS = ['1st Year','2nd Year','3rd Year','4th Year'];

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') === 'company' ? 'company' : 'student');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name:'', email:'', password:'',
    college:'', branch:'', year:'', biggest_worry:'',
    company_name:'', industry:'',
  });

  const update = (field, value) => setForm(prev => ({...prev, [field]: value}));

  const handleSubmit = async () => {
    setLoading(true);
    const metadata = role === 'student'
      ? { full_name: form.full_name, role: 'student', college: form.college, branch: form.branch, year: form.year }
      : { full_name: form.company_name, role: 'company', company_name: form.company_name, industry: form.industry };

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: metadata }
    });

    if (error) { toast.error(error.message); setLoading(false); return; }

    toast.success("Welcome to Genois AI! You just did something most students don't — you started. 🎯");
    setTimeout(() => {
      if (role === 'student') navigate('/student/assessment');
      else navigate('/company/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center p-4" style={{ position:'relative' }}>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold font-heading" style={{color:'#00FF94'}}>GENOIS AI</Link>
          <p className="text-gray-400 mt-2 text-sm">Your verified skill identity starts here.</p>
        </div>

        {/* Role Toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background:'rgba(8,8,14,0.9)', border:'1px solid rgba(0,255,148,0.12)' }}>
          {['student','company'].map(r => (
            <button key={r} onClick={() => {setRole(r); setStep(1);}}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                role === r ? 'bg-primary text-dark-900' : 'text-gray-400 hover:text-white'
              }`}>
              {r === 'student' ? '🎓 Student' : '🏢 Company'}
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-6" style={{
          background: 'rgba(8,8,14,0.95)',
          border: '1px solid rgba(0,255,148,0.15)',
          boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,255,148,0.05)',
        }}>
          {/* Step 1 - Basic Info */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-white font-heading">
                {role === 'student' ? 'Create your account' : 'Company account'}
              </h3>
              {role === 'student' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-gray-300">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input placeholder="Your full name" value={form.full_name}
                      onChange={e => update('full_name', e.target.value)}
                      className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
              )}
              {role === 'company' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-gray-300">Company Name</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input placeholder="Your company name" value={form.company_name}
                      onChange={e => update('company_name', e.target.value)}
                      className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-300">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" placeholder="your@email.com" value={form.email}
                    onChange={e => update('email', e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-300">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="password" placeholder="Min 6 characters" value={form.password}
                    onChange={e => update('password', e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!form.email || !form.password || (!form.full_name && !form.company_name)}
                className="w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all disabled:opacity-50 text-sm mt-2"
                style={{
                  background: 'linear-gradient(135deg, #00FF94, #7B61FF)',
                  color: '#050508',
                  boxShadow: '0 0 20px rgba(0,255,148,0.3)',
                }}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2 - Extra Info */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
              {role === 'student' && (
                <>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-primary">Tier 3 college? You're exactly who we built this for ✊</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-gray-300">College Name</label>
                    <input placeholder="e.g. KLEIT Engineering College" value={form.college}
                      onChange={e => update('college', e.target.value)}
                      className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-gray-300">Branch</label>
                      <select value={form.branch} onChange={e => update('branch', e.target.value)}
                        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-primary transition-colors">
                        <option value="">Select</option>
                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-gray-300">Year</label>
                      <select value={form.year} onChange={e => update('year', e.target.value)}
                        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-primary transition-colors">
                        <option value="">Select</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-gray-300">What's your biggest worry about placements? <span className="text-gray-600">(optional)</span></label>
                    <textarea placeholder="Be honest — this helps us help you better"
                      value={form.biggest_worry} onChange={e => update('biggest_worry', e.target.value)}
                      rows={2}
                      className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none" />
                  </div>
                </>
              )}
              {role === 'company' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-gray-300">Industry</label>
                  <input placeholder="e.g. Product Startup, IT Services" value={form.industry}
                    onChange={e => update('industry', e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                </div>
              )}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all disabled:opacity-50 text-sm mt-2"
                style={{
                  background: 'linear-gradient(135deg, #00FF94, #7B61FF)',
                  color: '#050508',
                  boxShadow: '0 0 20px rgba(0,255,148,0.3)',
                }}>
                {loading
                  ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight size={16}/></>
                }
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
