import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Github, ExternalLink,
         Zap, Star, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateDetailedScore, getJobReadiness } from '../lib/scoring';
import { getTrustBadge } from '../lib/trust';
import TrustPanel from '../components/ui/TrustPanel';

const CompanyView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [badges, setBadges] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const [profileRes, skillRes, projectRes, badgeRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('skill_scores').select('*').eq('student_id', id),
      supabase.from('projects').select('*').eq('student_id', id),
      supabase.from('student_badges').select('*, badges(*)').eq('student_id', id),
    ]);

    const profileData = profileRes.data;
    if (!profileData) { setLoading(false); return; }

    setProfile(profileData);
    setSkills(skillRes.data || []);
    setProjects(projectRes.data || []);
    setBadges(badgeRes.data || []);

    const detailed = await calculateDetailedScore(id, supabase);
    setScoreData(detailed);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-dark-600 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-white font-bold">Profile not found</p>
        <Link to="/" className="text-primary text-sm hover:underline mt-2 block">
          Back to Genois
        </Link>
      </div>
    </div>
  );

  const score = Math.round(profile.skill_score || 0);
  const jobReadiness = getJobReadiness(scoreData, profile);
  const trustBadge = getTrustBadge(
    score,
    profile.streak_count || 0,
    projects.filter(p => p.verified).length
  );

  const getTierConfig = (s) => {
    if (s >= 801) return { label:'Elite', color:'#FFD700' };
    if (s >= 601) return { label:'Advanced', color:'#7B61FF' };
    if (s >= 401) return { label:'Proficient', color:'#00FF94' };
    if (s >= 201) return { label:'Developing', color:'#4A9EFF' };
    return { label:'Beginner', color:'#666' };
  };
  const tier = getTierConfig(score);

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Navbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <span className="text-lg font-bold font-heading"
              style={{ color:'#00FF94', textShadow:'0 0 20px rgba(0,255,148,0.4)' }}>
              GENOIS AI
            </span>
            <span className="text-xs text-gray-600">Company View</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Recruiter Mode</span>
            <div className="px-2 py-1 rounded-lg text-xs font-bold"
              style={{ background:'rgba(123,97,255,0.15)', color:'#7B61FF' }}>
              👔 Active
            </div>
          </div>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${tier.color}10, rgba(18,18,26,0.95))`,
            border: `1px solid ${tier.color}25`,
          }}>
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
              style={{ background:`linear-gradient(135deg, ${tier.color}40, ${tier.color}80)` }}>
              {profile.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold font-heading text-white">
                  {profile.full_name}
                </h1>
                <span className="text-lg">{trustBadge.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background:`${trustBadge.color}15`, color:trustBadge.color }}>
                  {trustBadge.label}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{profile.target_role}</p>
              <p className="text-xs text-gray-600 mt-1">
                {[profile.college, profile.branch, profile.graduation_year && `Class of ${profile.graduation_year}`]
                  .filter(Boolean).join(' · ')}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background:'rgba(0,255,148,0.08)', border:'1px solid rgba(0,255,148,0.2)' }}>
                  <Shield size={11} className="text-primary" />
                  <span className="text-xs text-primary font-bold">VERIFIED BY GENOIS AI</span>
                </div>
                {profile.github_username && (
                  <a href={`https://github.com/${profile.github_username}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-gray-300 hover:text-white text-xs transition-all">
                    <Github size={11} /> {profile.github_username}
                  </a>
                )}
              </div>
            </div>

            {/* Score ring */}
            <div className="text-center flex-shrink-0">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle cx="50" cy="50" r="40" fill="none"
                    strokeWidth="8" stroke={tier.color} strokeLinecap="round"
                    initial={{ strokeDasharray:'0 251.2' }}
                    animate={{ strokeDasharray:`${(score/1000)*251.2} 251.2` }}
                    transition={{ duration:1.5 }}
                    style={{ filter:`drop-shadow(0 0 6px ${tier.color})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-heading" style={{ color:tier.color }}>
                    {score}
                  </span>
                  <span className="text-xs text-gray-500">/1000</span>
                </div>
              </div>
              <div className="text-xs font-bold mt-1" style={{ color:tier.color }}>{tier.label}</div>
              <div className="text-xs text-gray-600">Genois Score™</div>
            </div>
          </div>
        </motion.div>

        {/* Job Readiness */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-white font-heading">Job Readiness</p>
            <span className="text-lg font-bold font-heading" style={{ color:jobReadiness.color }}>
              {jobReadiness.percentage}%
            </span>
          </div>
          <div className="h-3 bg-dark-600 rounded-full overflow-hidden mb-1">
            <motion.div
              initial={{ width:0 }}
              animate={{ width:`${jobReadiness.percentage}%` }}
              transition={{ duration:1.5 }}
              className="h-full rounded-full"
              style={{ background:`linear-gradient(90deg, ${jobReadiness.color}80, ${jobReadiness.color})` }}
            />
          </div>
          <p className="text-xs font-semibold" style={{ color:jobReadiness.color }}>
            {jobReadiness.status}
          </p>
        </div>

        {/* Score Breakdown */}
        {scoreData && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <p className="text-sm font-bold text-white font-heading mb-3">Score Breakdown</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(scoreData.breakdown).map(([key, item]) => (
                <div key={key} className="text-center p-2 rounded-lg"
                  style={{ background:`${item.color}08` }}>
                  <div className="text-sm font-bold font-mono" style={{ color:item.color }}>
                    {Math.round((item.score / item.max) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{key}</div>
                  <div className="text-xs text-gray-600">{item.weight}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <p className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
              <Zap size={13} className="text-primary" /> Verified Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => {
                const colors = ['','#4A9EFF','#00FF94','#7B61FF','#FFB347','#FFD700'];
                const color = colors[Math.min(skill.level||1, 5)];
                return (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background:`${color}15`, color, border:`1px solid ${color}25` }}>
                    {skill.skill_name} L{skill.level||1}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Trust Engine Panel */}
        <TrustPanel
          studentId={id}
          profile={profile}
          skills={skills}
          projects={projects}
          compact={false}
        />

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <p className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
              <Star size={13} className="text-warning" /> Earned Badges
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map((sb, i) => {
                const badge = sb.badges;
                const rarityColors = {
                  common:'#666', rare:'#4A9EFF',
                  epic:'#7B61FF', legendary:'#FFD700'
                };
                const color = rarityColors[badge?.rarity||'common'];
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background:`${color}10`, border:`1px solid ${color}25` }}>
                    <span>{badge?.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{badge?.name}</p>
                      <p className="text-xs capitalize" style={{ color }}>{badge?.rarity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShortlisted(!shortlisted)}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: shortlisted ? 'rgba(0,214,143,0.15)' : 'rgba(123,97,255,0.15)',
              color: shortlisted ? '#00D68F' : '#7B61FF',
              border: `1px solid ${shortlisted ? 'rgba(0,214,143,0.3)' : 'rgba(123,97,255,0.3)'}`,
            }}>
            {shortlisted ? '✅ Shortlisted!' : '⭐ Shortlist Candidate'}
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            className="px-5 py-3 rounded-xl font-bold text-sm bg-dark-700 border border-dark-500 text-gray-300 hover:text-white transition-all">
            🔗 Copy
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-600">
            Verified by{' '}
            <span className="text-primary">Genois AI</span>
            {' '}· Score cannot be faked · Built from real daily activity
          </p>
        </div>

      </div>
    </div>
  );
};

export default CompanyView;
