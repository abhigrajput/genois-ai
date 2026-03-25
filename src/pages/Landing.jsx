import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap, Shield, TrendingUp, Users, Star, Award } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen cyber-grid text-gray-100" style={{ position:'relative' }}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
        <span className="text-xl font-bold font-heading" style={{color:'#00FF94',textShadow:'0 0 20px rgba(0,255,148,0.4)'}}>
          GENOIS AI
        </span>
        <div className="flex items-center gap-3">
          <Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
            Pricing
          </Link>
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
            Login
          </Link>
          <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-dark-900 hover:bg-opacity-90 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Zap size={12} className="text-primary" />
            <span className="text-xs text-primary font-medium">Built for Tier 3 Engineers</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading leading-tight mb-4"
            style={{
              background: 'linear-gradient(135deg, #00FF94 0%, #7B61FF 50%, #4A9EFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 30px rgba(0,255,148,0.3))',
            }}>
            Replace Your Resume With
            <span style={{color:'#00FF94'}}> Real Skill Identity.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Genois builds verified proof of your skills through real tasks, tests and projects — so companies find you by what you can do, not what you studied.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-neon inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold transition-all">
              Start Building Your Profile <ArrowRight size={16} />
            </Link>
            <Link to="/demo" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-dark-700 border border-dark-500 text-gray-300 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all text-sm">
              Try Demo
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-4">No resume required. No fake certificates. Just your real skills.</p>

          {/* Trust Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 pt-6 border-t border-dark-700">
            {[
              { value: '100%', label: 'Activity-Verified Score', color: '#00FF94' },
              { value: '₹0', label: 'Fake Certificates Needed', color: '#7B61FF' },
              { value: '6+', label: 'Engineering Domains', color: '#4A9EFF' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold font-heading" style={{color: stat.color}}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Truth Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-center text-white mb-4">
            The system is broken. You already know it.
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">Three things nobody wants to admit out loud:</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '📄', text: 'Your CGPA doesn\'t show that you built 3 projects at 2AM while your classmates were sleeping.' },
              { icon: '🤝', text: 'The student with connections gets the job. The student with real skills gets rejected.' },
              { icon: '💸', text: 'You\'ve spent ₹10,000 on certificates companies never look at.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                className="bg-dark-800 border border-dark-600 rounded-xl p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <p className="text-gray-300 text-sm leading-relaxed">"{item.text}"</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works — 5 Steps */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-center text-white mb-3">
          From Zero to Job-Ready in One System
        </h2>
        <p className="text-center text-gray-500 text-sm mb-10">Five steps. No college rank required.</p>
        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-dark-600 z-0" />
          <div className="grid md:grid-cols-5 gap-4 relative z-10">
            {[
              { step:'01', icon: '🎯', title:'Pick Domain', desc:'Choose your engineering path: Fullstack, DSA, AI/ML, Cyber, DevOps, or Android.', color:'#00FF94' },
              { step:'02', icon: '🗺️', title:'Get Roadmap', desc:'AI builds a personalized learning roadmap with nodes calibrated to your level.', color:'#4A9EFF' },
              { step:'03', icon: '✅', title:'Do Daily Tasks', desc:'Complete 1–4 tasks/day based on your timeline. Build real proof every day.', color:'#7B61FF' },
              { step:'04', icon: '📝', title:'Pass Tests', desc:'Take verified domain tests. Every score is recorded and cannot be faked.', color:'#FFB347' },
              { step:'05', icon: '🚀', title:'Share Profile', desc:'Your Genois Score replaces your resume. Companies find you by what you built.', color:'#FFD700' },
            ].map((item, i) => (
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg mx-auto mb-3"
                  style={{background:`${item.color}15`, border:`1px solid ${item.color}30`}}>
                  {item.icon}
                </div>
                <div className="text-xs font-bold mb-1" style={{color: item.color}}>{item.step}</div>
                <h3 className="font-semibold text-white mb-1.5 font-heading text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Genois Score */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-heading text-white mb-2">The Genois Score™</h2>
            <p className="text-gray-400 text-sm">Built from 30 days of real verified activity</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label:'Performance', pct:'40%', color:'#00FF94', desc:'Test scores + accuracy' },
              { label:'Consistency', pct:'30%', color:'#7B61FF', desc:'Streak + daily activity' },
              { label:'Build Index', pct:'20%', color:'#4A9EFF', desc:'Projects + GitHub' },
              { label:'Growth',      pct:'10%', color:'#FFB347', desc:'Improvement rate' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-dark-700 rounded-xl">
                <div className="text-2xl font-bold font-heading mb-1" style={{color:item.color}}>{item.pct}</div>
                <div className="text-sm font-medium text-white mb-1">{item.label}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Companies */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-dark-600 rounded-2xl p-8 text-center">
          <Users size={32} className="text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-heading text-white mb-3">For Companies</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto text-sm">
            Tired of fake resumes? Search our database of verified Tier 3 engineers by Genois Score, domain, and skill level. Every profile is backed by 30+ days of real activity.
          </p>
          <Link to="/register?role=company" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-opacity-90 transition-all text-sm">
            Access Talent Pool <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 max-w-2xl mx-auto text-center">
        <Award size={40} className="text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold font-heading text-white mb-4">
          Your skills deserve to be seen.
        </h2>
        <p className="text-gray-400 mb-8 text-sm">
          Join thousands of Tier 3 students building their verified skill identity on Genois.
        </p>
        <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-dark-900 font-bold rounded-xl hover:bg-opacity-90 transition-all">
          Start For Free <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-8 px-6 text-center">
        <p className="text-gray-600 text-sm">© 2025 Genois AI. Built for the students the system ignored.</p>
      </footer>
    </div>
  );
};

export default Landing;
