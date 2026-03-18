import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Star, TrendingUp,
         Shield, ArrowRight, Building } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import { Link } from 'react-router-dom';

const CompanyDashboard = () => {
  const { profile } = useStore();
  const [stats, setStats] = useState({ viewed: 0, shortlisted: 0, totalStudents: 0 });
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    const { data: students } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('skill_score', { ascending: false })
      .limit(5);

    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    setTopStudents(students || []);
    setStats({ totalStudents: count || 0, viewed: 0, shortlisted: 0 });
    setLoading(false);
  };

  const getTierColor = (score) => {
    if (score >= 801) return '#FFD700';
    if (score >= 601) return '#7B61FF';
    if (score >= 401) return '#00FF94';
    if (score >= 201) return '#4A9EFF';
    return '#666';
  };

  const getTier = (score) => {
    if (score >= 801) return 'Elite';
    if (score >= 601) return 'Advanced';
    if (score >= 401) return 'Proficient';
    if (score >= 201) return 'Developing';
    return 'Beginner';
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.12), rgba(18,18,26,0.9))', border: '1px solid rgba(123,97,255,0.2)' }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #7B61FF, transparent)' }} />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(123,97,255,0.2)', border: '1px solid rgba(123,97,255,0.3)' }}>
              <Building size={24} className="text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-white">
                Welcome, {profile?.full_name || 'Company'} 👋
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Find pre-verified engineering talent — no resumes needed
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: 'Verified Students', value: stats.totalStudents, color: '#00FF94' },
            { icon: Search, label: 'Profiles Viewed', value: stats.viewed, color: '#4A9EFF' },
            { icon: Star, label: 'Shortlisted', value: stats.shortlisted, color: '#7B61FF' },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}>
                  <stat.icon size={15} style={{ color: stat.color }} />
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold font-heading" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why Genois */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="font-bold text-white font-heading mb-4 flex items-center gap-2">
            <Shield size={15} className="text-primary" />
            Why Genois Talent is Different
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { icon: '✅', title: '30+ Days Verified', desc: 'Every score built from real daily activity — not a one-time test' },
              { icon: '🔒', title: 'Anti-Cheat Protected', desc: 'Multi-layer verification ensures scores reflect actual ability' },
              { icon: '💻', title: 'Project Evidence', desc: 'GitHub commits + peer-reviewed projects prove real building skills' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl"
                style={{ background: 'rgba(0,255,148,0.04)', border: '1px solid rgba(0,255,148,0.1)' }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white font-heading flex items-center gap-2">
              <TrendingUp size={15} className="text-secondary" />
              Top Verified Students
            </h2>
            <Link to="/company/search"
              className="flex items-center gap-1.5 text-xs text-secondary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {topStudents.map((student, i) => (
              <motion.div key={student.id}
                initial={{ opacity:0, x:-10 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-dark-600 bg-dark-800 hover:border-dark-400 transition-all">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white font-heading flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${getTierColor(student.skill_score || 0)}30, ${getTierColor(student.skill_score || 0)}60)` }}>
                  {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {student.full_name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.target_role || 'Engineering Student'} · {student.college || 'College'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold font-heading"
                      style={{ color: getTierColor(student.skill_score || 0) }}>
                      {Math.round(student.skill_score || 0)}
                    </div>
                    <div className="text-xs" style={{ color: getTierColor(student.skill_score || 0) }}>
                      {getTier(student.skill_score || 0)}
                    </div>
                  </div>
                  <Link to="/company/search"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(123,97,255,0.1)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.3)' }}>
                    View
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link to="/company/search">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-5 rounded-2xl cursor-pointer transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.15), rgba(0,255,148,0.08))', border: '1px solid rgba(123,97,255,0.25)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white font-heading mb-1">
                  Search All Verified Talent →
                </h3>
                <p className="text-sm text-gray-400">
                  Filter by Genois Score, domain, college, and skills
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(123,97,255,0.2)' }}>
                <Search size={20} className="text-secondary" />
              </div>
            </div>
          </motion.div>
        </Link>

      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
