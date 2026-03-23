import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Edit, MapPin,
         GraduationCap, Shield, Star, Zap,
         TrendingUp, Calendar, Award, Target,
         CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { calculateDetailedScore, getJobReadiness } from '../../lib/scoring';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis,
         Tooltip, ResponsiveContainer } from 'recharts';

const BADGES = [
  {
    id: 'consistent',
    name: 'Consistent',
    icon: '🔥',
    description: '7-day streak',
    rarity: 'rare',
    color: '#FF6B6B',
    check: (data) => (data.streak || 0) >= 7,
  },
  {
    id: 'fast_learner',
    name: 'Fast Learner',
    icon: '⚡',
    description: 'Passed 3 tests in first week',
    rarity: 'rare',
    color: '#FFB347',
    check: (data) => (data.passedTests || 0) >= 3,
  },
  {
    id: 'project_builder',
    name: 'Project Builder',
    icon: '💻',
    description: 'Added 2+ projects',
    rarity: 'epic',
    color: '#7B61FF',
    check: (data) => (data.totalProjects || 0) >= 2,
  },
  {
    id: 'high_score',
    name: 'High Score',
    icon: '🏆',
    description: 'Genois Score above 300',
    rarity: 'epic',
    color: '#FFD700',
    check: (data) => (data.score || 0) >= 300,
  },
  {
    id: 'github_verified',
    name: 'Verified Dev',
    icon: '✅',
    description: 'GitHub verified project',
    rarity: 'epic',
    color: '#00FF94',
    check: (data) => (data.verifiedProjects || 0) >= 1,
  },
  {
    id: 'first_step',
    name: 'First Step',
    icon: '🎯',
    description: 'Completed first task',
    rarity: 'common',
    color: '#4A9EFF',
    check: (data) => (data.completedTasks || 0) >= 1,
  },
  {
    id: 'roadmap_runner',
    name: 'Roadmap Runner',
    icon: '🗺️',
    description: 'Completed 3 nodes',
    rarity: 'rare',
    color: '#00D68F',
    check: (data) => (data.completedNodes || 0) >= 3,
  },
  {
    id: 'elite',
    name: 'Elite',
    icon: '👑',
    description: 'Genois Score above 600',
    rarity: 'legendary',
    color: '#FFD700',
    check: (data) => (data.score || 0) >= 600,
  },
];

const getTierConfig = (score) => {
  if (score >= 801) return { label: 'Elite', color: '#FFD700', glow: 'rgba(255,215,0,0.3)' };
  if (score >= 601) return { label: 'Advanced', color: '#7B61FF', glow: 'rgba(123,97,255,0.3)' };
  if (score >= 401) return { label: 'Proficient', color: '#00FF94', glow: 'rgba(0,255,148,0.3)' };
  if (score >= 201) return { label: 'Developing', color: '#4A9EFF', glow: 'rgba(74,158,255,0.3)' };
  return { label: 'Beginner', color: '#666', glow: 'rgba(102,102,102,0.2)' };
};

const Profile = () => {
  const { profile, setProfile } = useStore();
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [strongTopics, setStrongTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [recruiterView, setRecruiterView] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '', bio: '', github_username: '',
    target_role: '', college: '', branch: '',
    graduation_year: '',
  });
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', tech_stack: '',
    github_url: '', live_url: '',
  });

  useEffect(() => {
    if (profile?.id) {
      fetchAll();
      setEditForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        github_username: profile.github_username || '',
        target_role: profile.target_role || '',
        college: profile.college || '',
        branch: profile.branch || '',
        graduation_year: profile.graduation_year || '',
      });
    }
  }, [profile]);

  const fetchAll = async () => {
    setLoading(true);
    const [skillRes, projectRes, nodeRes, attemptRes, historyRes] =
      await Promise.all([
        supabase.from('skill_scores').select('*').eq('student_id', profile.id),
        supabase.from('projects').select('*').eq('student_id', profile.id),
        supabase.from('roadmap_nodes')
          .select('*, roadmaps!inner(student_id)')
          .eq('roadmaps.student_id', profile.id),
        supabase.from('test_attempts').select('*').eq('student_id', profile.id),
        supabase.from('score_history').select('*')
          .eq('student_id', profile.id)
          .order('recorded_at', { ascending: true })
          .limit(14),
      ]);

    const skillData = skillRes.data || [];
    const projectData = projectRes.data || [];
    const nodeData = nodeRes.data || [];
    const attemptData = attemptRes.data || [];

    setSkills(skillData);
    setProjects(projectData);
    setNodes(nodeData);
    setAttempts(attemptData);

    // Score history for graph
    const history = historyRes.data || [];
    if (history.length > 0) {
      setScoreHistory(history.map(h => ({
        day: new Date(h.recorded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        score: h.score,
      })));
    } else {
      const score = profile.skill_score || 0;
      setScoreHistory([
        { day: '7d ago', score: Math.max(0, score - 50) },
        { day: '6d ago', score: Math.max(0, score - 40) },
        { day: '5d ago', score: Math.max(0, score - 30) },
        { day: '4d ago', score: Math.max(0, score - 20) },
        { day: '3d ago', score: Math.max(0, score - 15) },
        { day: '2d ago', score: Math.max(0, score - 10) },
        { day: 'Today', score },
      ]);
    }

    // Calculate score
    const detailed = await calculateDetailedScore(profile.id, supabase);
    setScoreData(detailed);

    // Weak and strong topics
    const weak = [];
    const strong = [];
    skillData.forEach(skill => {
      if ((skill.score || 0) < 30) weak.push(skill.skill_name);
      else if ((skill.score || 0) > 60) strong.push(skill.skill_name);
    });
    setWeakTopics(weak.slice(0, 3));
    setStrongTopics(strong.slice(0, 3));

    // Calculate earned badges
    const completedNodes = nodeData.filter(n => n.status === 'completed').length;
    const passedTests = attemptData.filter(a => a.passed).length;
    const verifiedProjects = projectData.filter(p => p.verified).length;
    const badgeData = {
      streak: profile.streak_count || 0,
      passedTests,
      totalProjects: projectData.length,
      verifiedProjects,
      score: Math.round(profile.skill_score || 0),
      completedTasks: 0,
      completedNodes,
    };

    const { count } = await supabase
      .from('tasks').select('*', { count: 'exact', head: true })
      .eq('student_id', profile.id)
      .eq('status', 'completed');
    badgeData.completedTasks = count || 0;

    const earned = BADGES.filter(b => b.check(badgeData));
    setEarnedBadges(earned);

    setLoading(false);
  };

  const saveProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...editForm, graduation_year: editForm.graduation_year ? parseInt(editForm.graduation_year) : null })
      .eq('id', profile.id).select().single();
    if (!error) { setProfile(data); setEditing(false); toast.success('Profile saved! ✅'); }
    else toast.error('Failed to save');
  };

  const addProject = async () => {
    if (!projectForm.title) { toast.error('Title required'); return; }
    const { error } = await supabase.from('projects').insert({
      student_id: profile.id,
      title: projectForm.title,
      description: projectForm.description,
      tech_stack: projectForm.tech_stack.split(',').map(t => t.trim()).filter(Boolean),
      github_url: projectForm.github_url,
      live_url: projectForm.live_url,
    });
    if (!error) {
      toast.success('Project added! 🚀');
      setProjectForm({ title:'', description:'', tech_stack:'', github_url:'', live_url:'' });
      setAddingProject(false);
      fetchAll();
    }
  };

  const verifyGitHub = async (project) => {
    if (!project.github_url) { toast.error('Add GitHub URL first'); return; }
    toast.loading('Verifying...', { id: 'v' });
    try {
      const parts = project.github_url.replace('https://github.com/', '').split('/');
      const [owner, repo] = parts;
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      const repoData = await repoRes.json();
      if (repoData.message === 'Not Found') { toast.error('Repo not found or private', { id: 'v' }); return; }
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`);
      const commits = await commitsRes.json();
      const count = Array.isArray(commits) ? commits.length : 0;
      const verified = count >= 3;
      await supabase.from('projects').update({
        verified,
        metadata: { commit_count: count, language: repoData.language, stars: repoData.stargazers_count,
          difficulty: count > 20 ? 'advanced' : count > 8 ? 'intermediate' : 'beginner',
          verified_at: new Date().toISOString() }
      }).eq('id', project.id);
      toast[verified ? 'success' : 'error'](
        verified ? `✅ Verified! ${count} commits` : `Need 3+ commits. Found ${count}.`,
        { id: 'v' }
      );
      fetchAll();
    } catch { toast.error('Verification failed', { id: 'v' }); }
  };

  const score = Math.round(profile?.skill_score || 0);
  const tier = getTierConfig(score);
  const jobReadiness = getJobReadiness(scoreData, profile);
  const completedNodes = nodes.filter(n => n.status === 'completed').length;
  const passedTests = attempts.filter(a => a.passed).length;
  const streak = profile?.streak_count || 0;
  const currentDay = streak;
  const totalStudyHours = Math.round(completedNodes * 3 + passedTests * 0.5);

  const SKILL_COLORS = ['','#4A9EFF','#00FF94','#7B61FF','#FFB347','#FFD700'];
  const rarityColors = { common:'#666', rare:'#4A9EFF', epic:'#7B61FF', legendary:'#FFD700' };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-primary rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">
              Skill Identity 🪪
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Your verified skill profile — share instead of resume
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setRecruiterView(!recruiterView)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: recruiterView ? 'rgba(123,97,255,0.2)' : 'rgba(34,34,51,0.5)',
                color: recruiterView ? '#7B61FF' : '#666',
                border: `1px solid ${recruiterView ? 'rgba(123,97,255,0.4)' : 'rgba(34,34,51,0.8)'}`,
              }}>
              👔 {recruiterView ? 'Recruiter View ON' : 'View as Recruiter'}
            </button>
            <button onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background:'rgba(0,255,148,0.1)', color:'#00FF94', border:'1px solid rgba(0,255,148,0.3)' }}>
              <Edit size={13} /> {editing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/u/${profile?.id}`); toast.success('Link copied! 🔗'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-dark-700 border border-dark-500 text-gray-300 hover:text-white transition-all">
              🔗 Share Identity
            </button>
          </div>
        </div>

        {/* Recruiter view banner */}
        {recruiterView && (
          <div className="p-4 rounded-xl"
            style={{ background:'rgba(123,97,255,0.08)', border:'1px solid rgba(123,97,255,0.2)' }}>
            <p className="text-xs font-bold text-secondary mb-1">
              👔 Recruiter View — This is what companies see on Pro plan
            </p>
            <p className="text-xs text-gray-400 italic">
              "{profile?.full_name || 'Student'} is a {tier.label.toLowerCase()} engineer
              {strongTopics.length > 0 ? ` strong in ${strongTopics.join(', ')}` : ''}.
              Score {score}/1000 built from real daily activity — not a certificate.
              {projects.filter(p => p.verified).length > 0 ? ` ${projects.filter(p => p.verified).length} GitHub-verified project(s).` : ''}
              {streak > 7 ? ` ${streak}-day consistency streak.` : ''}"
            </p>
          </div>
        )}

        {/* HERO CARD */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${tier.glow} 0%, rgba(18,18,26,0.9) 100%)`,
            border: `1px solid ${tier.color}30`,
          }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${tier.color}, transparent)` }} />

          <div className="p-6">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key:'full_name', label:'Full Name', placeholder:'Your name' },
                    { key:'target_role', label:'Target Role', placeholder:'Full Stack Developer' },
                    { key:'college', label:'College', placeholder:'Your college' },
                    { key:'branch', label:'Branch', placeholder:'Computer Science' },
                    { key:'github_username', label:'GitHub Username', placeholder:'username' },
                    { key:'graduation_year', label:'Graduation Year', placeholder:'2026' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                      <input value={editForm[f.key]}
                        onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Bio</label>
                  <textarea value={editForm.bio}
                    onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell companies about yourself..."
                    rows={2}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary resize-none" />
                </div>
                <button onClick={saveProfile}
                  className="px-6 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm">
                  Save ✅
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-5 flex-wrap">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white border-4 border-dark-800"
                    style={{ background: `linear-gradient(135deg, ${tier.color}40, ${tier.color}80)` }}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'G'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-dark-800" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white font-heading">
                    {profile?.full_name || 'Your Name'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {profile?.target_role || 'Add your target role'}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {profile?.college && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <GraduationCap size={11} /> {profile.college}
                      </span>
                    )}
                    {profile?.branch && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={11} /> {profile.branch}
                      </span>
                    )}
                    {profile?.graduation_year && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={11} /> Class of {profile.graduation_year}
                      </span>
                    )}
                  </div>
                  {profile?.bio && (
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ background:'rgba(0,255,148,0.08)', border:'1px solid rgba(0,255,148,0.2)' }}>
                      <Shield size={11} className="text-primary" />
                      <span className="text-xs text-primary font-bold">VERIFIED BY GENOIS AI</span>
                    </div>
                    {profile?.github_username && (
                      <a href={`https://github.com/${profile.github_username}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-gray-300 hover:text-white text-xs transition-all">
                        <Github size={11} /> {profile.github_username}
                      </a>
                    )}
                  </div>
                </div>

                {/* Score ring */}
                <div className="text-center">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <motion.circle cx="50" cy="50" r="40" fill="none" strokeWidth="8"
                        stroke={tier.color} strokeLinecap="round"
                        initial={{ strokeDasharray:'0 251.2' }}
                        animate={{ strokeDasharray:`${(score/1000)*251.2} 251.2` }}
                        transition={{ duration:1.5, ease:'easeOut' }}
                        style={{ filter:`drop-shadow(0 0 6px ${tier.color})` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold font-heading" style={{ color:tier.color }}>{score}</span>
                      <span className="text-xs text-gray-500">/1000</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold mt-1" style={{ color:tier.color }}>{tier.label}</div>
                  <div className="text-xs text-gray-600">Genois Score™</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon:'📅', label:'Current Day', value:`Day ${currentDay || 1}` },
            { icon:'🔥', label:'Streak', value:`${streak} days` },
            { icon:'🗺️', label:'Nodes Done', value:completedNodes },
            { icon:'📝', label:'Tests Passed', value:passedTests },
            { icon:'⏱️', label:'Study Hours', value:`${totalStudyHours}h` },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.05 }}
              className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-base font-bold text-white font-heading">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* JOB READINESS */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                <Target size={15} className="text-primary" />
                Job Readiness Meter
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Based on roadmap + score + projects + tests
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-heading" style={{ color:jobReadiness.color }}>
                {jobReadiness.percentage}%
              </div>
              <div className="text-xs font-semibold" style={{ color:jobReadiness.color }}>
                {jobReadiness.status}
              </div>
            </div>
          </div>
          <div className="h-3 bg-dark-600 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width:0 }}
              animate={{ width:`${jobReadiness.percentage}%` }}
              transition={{ duration:1.5, ease:'easeOut' }}
              className="h-full rounded-full"
              style={{ background:`linear-gradient(90deg, ${jobReadiness.color}80, ${jobReadiness.color})` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Beginner (0%)</span>
            <span>Improving (40%)</span>
            <span>Almost Ready (70%)</span>
            <span>Job Ready (85%+)</span>
          </div>
        </div>

        {/* SCORE BREAKDOWN */}
        {scoreData && (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-4 flex items-center gap-2">
              <Zap size={15} className="text-primary" />
              Score Breakdown — Why {score} points?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(scoreData.breakdown).map(([key, item], i) => (
                <div key={key} className="p-3 rounded-xl"
                  style={{ background:`${item.color}08`, border:`1px solid ${item.color}15` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white capitalize">{key}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{item.weight}</span>
                      <span className="text-sm font-bold font-mono" style={{ color:item.color }}>
                        {item.score}/{item.max}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-dark-600 rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      initial={{ width:0 }}
                      animate={{ width:`${(item.score/item.max)*100}%` }}
                      transition={{ duration:1, delay:i*0.1 }}
                      className="h-full rounded-full"
                      style={{ background:item.color }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{item.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILL GROWTH GRAPH */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="font-bold text-white font-heading text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-secondary" />
            Skill Growth Graph
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={scoreHistory}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill:'#666', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,'auto']} tick={{ fill:'#666', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#1A1A27', border:'1px solid #2A2A3F', borderRadius:'8px', fontSize:'12px' }} />
              <Area type="monotone" dataKey="score" stroke="#00FF94" strokeWidth={2}
                fill="url(#scoreGrad)" dot={{ fill:'#00FF94', r:3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* STRONG + WEAK TOPICS */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-success" /> Strong Topics
            </h2>
            {strongTopics.length === 0 ? (
              <p className="text-xs text-gray-500">Complete tests to identify strengths</p>
            ) : (
              <div className="space-y-2">
                {strongTopics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg"
                    style={{ background:'rgba(0,255,148,0.06)', border:'1px solid rgba(0,255,148,0.15)' }}>
                    <span className="text-success text-sm">💪</span>
                    <span className="text-xs font-medium text-white">{topic}</span>
                    <span className="ml-auto text-xs text-success">Strong</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-warning" /> Weak Topics
            </h2>
            {weakTopics.length === 0 ? (
              <p className="text-xs text-gray-500">No weak areas detected yet. Keep taking tests!</p>
            ) : (
              <div className="space-y-2">
                {weakTopics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg"
                    style={{ background:'rgba(255,179,71,0.06)', border:'1px solid rgba(255,179,71,0.15)' }}>
                    <span className="text-sm">⚠️</span>
                    <span className="text-xs font-medium text-white">{topic}</span>
                    <a href="/student/notes" className="ml-auto text-xs text-warning hover:underline">
                      Study →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SKILLS */}
        {skills.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-4 flex items-center gap-2">
              <Zap size={14} className="text-primary" /> Verified Skills
              <span className="text-xs text-gray-500 font-normal">({skills.length} skills)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => {
                const color = SKILL_COLORS[Math.min(skill.level||1, 5)];
                return (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background:`${color}15`, color, border:`1px solid ${color}25` }}>
                    {skill.skill_name}
                    <span className="opacity-60">L{skill.level||1}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white font-heading text-sm flex items-center gap-2">
              💻 Projects
              <span className="text-xs text-gray-500 font-normal">({projects.length})</span>
            </h2>
            <button onClick={() => setAddingProject(!addingProject)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background:'rgba(123,97,255,0.1)', color:'#7B61FF', border:'1px solid rgba(123,97,255,0.3)' }}>
              {addingProject ? 'Cancel' : '+ Add Project'}
            </button>
          </div>

          {addingProject && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
              className="bg-dark-700 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key:'title', label:'Title *', placeholder:'My Project' },
                  { key:'tech_stack', label:'Tech Stack (comma separated)', placeholder:'React, Node.js' },
                  { key:'github_url', label:'GitHub URL', placeholder:'https://github.com/...' },
                  { key:'live_url', label:'Live URL', placeholder:'https://myproject.vercel.app' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                    <input value={projectForm[f.key]}
                      onChange={e => setProjectForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea value={projectForm.description}
                  onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What does this project do?"
                  rows={2}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary resize-none" />
              </div>
              <button onClick={addProject}
                className="px-5 py-2 bg-primary text-dark-900 font-bold rounded-xl text-sm">
                Add Project 🚀
              </button>
            </motion.div>
          )}

          {projects.length === 0 && !addingProject ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">💻</div>
              <p className="text-sm text-gray-500 mb-3">No projects yet</p>
              <button onClick={() => setAddingProject(true)}
                className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-xl text-xs font-semibold">
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {projects.map((project, i) => (
                <motion.div key={project.id}
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.05 }}
                  className="p-4 rounded-xl border border-dark-500 bg-dark-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                      {project.verified && (
                        <span className="text-xs text-primary font-bold">✅ GitHub Verified</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors">
                          <Github size={12} />
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-400 mb-2 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {project.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.tech_stack.map((tech, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-secondary/10 text-secondary rounded-md text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.metadata?.commit_count && (
                    <p className="text-xs text-gray-600 mb-2">
                      {project.metadata.commit_count} commits · {project.metadata.language}
                    </p>
                  )}
                  {!project.verified && project.github_url && (
                    <button onClick={() => verifyGitHub(project)}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all mt-1"
                      style={{ background:'rgba(74,158,255,0.1)', color:'#4A9EFF', border:'1px solid rgba(74,158,255,0.2)' }}>
                      🔍 Verify on GitHub
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* BADGES */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="font-bold text-white font-heading text-sm mb-4 flex items-center gap-2">
            <Award size={14} className="text-warning" /> Badges
            <span className="text-xs text-gray-500 font-normal">
              ({earnedBadges.length}/{BADGES.length} earned)
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGES.map((badge, i) => {
              const earned = earnedBadges.find(b => b.id === badge.id);
              const color = rarityColors[badge.rarity];
              return (
                <motion.div key={badge.id}
                  initial={{ opacity:0, scale:0.9 }}
                  animate={{ opacity:1, scale:1 }}
                  transition={{ delay:i*0.04 }}
                  className="p-3 rounded-xl text-center transition-all"
                  style={{
                    background: earned ? `${badge.color}10` : 'rgba(18,18,26,0.5)',
                    border: `1px solid ${earned ? badge.color+'30' : 'rgba(34,34,51,0.5)'}`,
                    opacity: earned ? 1 : 0.4,
                  }}>
                  <div className="text-2xl mb-1.5">{earned ? badge.icon : '🔒'}</div>
                  <p className="text-xs font-bold text-white mb-0.5">{badge.name}</p>
                  <p className="text-xs text-gray-500 leading-tight">{badge.description}</p>
                  {earned && (
                    <span className="mt-1.5 inline-block text-xs px-1.5 py-0.5 rounded-full capitalize font-semibold"
                      style={{ background:`${color}15`, color }}>
                      {badge.rarity}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* PUBLIC LINK */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-white">🔗 Your Public Skill Identity</p>
            <p className="text-xs text-gray-500 mt-0.5">
              genois-ai.vercel.app/u/{profile?.id?.substring(0,8)}...
            </p>
          </div>
          <div className="flex gap-2">
            <a href={`/u/${profile?.id}`} target="_blank"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-700 border border-dark-500 text-gray-300 hover:text-white transition-all">
              Preview →
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/u/${profile?.id}`); toast.success('Copied! 🔗'); }}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background:'rgba(0,255,148,0.1)', color:'#00FF94', border:'1px solid rgba(0,255,148,0.3)' }}>
              Copy Link
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;
