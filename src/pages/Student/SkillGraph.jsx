import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Award, Lock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import usePlan from '../../hooks/usePlan';
import UpgradePrompt from '../../components/ui/UpgradePrompt';

const SKILL_COLORS = {
  1: { bg: 'rgba(74,158,255,0.15)', border: 'rgba(74,158,255,0.4)', text: '#4A9EFF', label: 'Beginner' },
  2: { bg: 'rgba(0,255,148,0.15)', border: 'rgba(0,255,148,0.4)', text: '#00FF94', label: 'Basic' },
  3: { bg: 'rgba(123,97,255,0.15)', border: 'rgba(123,97,255,0.4)', text: '#7B61FF', label: 'Intermediate' },
  4: { bg: 'rgba(255,179,71,0.15)', border: 'rgba(255,179,71,0.4)', text: '#FFB347', label: 'Advanced' },
  5: { bg: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.4)', text: '#FFD700', label: 'Expert' },
};

const getTierConfig = (score) => {
  if (score >= 801) return { label: 'Elite',      color: '#FFD700', glow: 'rgba(255,215,0,0.3)'   };
  if (score >= 601) return { label: 'Advanced',   color: '#7B61FF', glow: 'rgba(123,97,255,0.3)'  };
  if (score >= 401) return { label: 'Proficient', color: '#00FF94', glow: 'rgba(0,255,148,0.3)'   };
  if (score >= 201) return { label: 'Developing', color: '#4A9EFF', glow: 'rgba(74,158,255,0.3)'  };
  return               { label: 'Beginner',   color: '#666',    glow: 'rgba(102,102,102,0.2)' };
};

const SkillGraph = () => {
  const { profile } = useStore();
  const { can } = usePlan();
  const [skills, setSkills] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [testAttempts, setTestAttempts] = useState([]);

  useEffect(() => {
    if (profile?.id) fetchAllData();
  }, [profile]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [skillRes, nodeRes, badgeRes, attemptRes] = await Promise.all([
        supabase.from('skill_scores').select('*').eq('student_id', profile.id),
        supabase.from('roadmap_nodes').select('*, roadmaps!inner(student_id)')
          .eq('roadmaps.student_id', profile.id),
        supabase.from('student_badges').select('*, badges(*)').eq('student_id', profile.id),
        supabase.from('test_attempts').select('*').eq('student_id', profile.id),
      ]);

      setSkills(skillRes.data || []);
      setNodes(nodeRes.data || []);
      setBadges(badgeRes.data || []);
      setTestAttempts(attemptRes.data || []);

      if ((!skillRes.data || skillRes.data.length === 0) && nodeRes.data?.length > 0) {
        await generateSkillsFromNodes(nodeRes.data, attemptRes.data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const generateSkillsFromNodes = async (nodeData, attempts) => {
    const completedNodes = nodeData.filter(n => n.status === 'completed');
    const allSkills = new Set();
    completedNodes.forEach(n => {
      if (Array.isArray(n.skills)) n.skills.forEach(s => allSkills.add(s));
    });

    if (allSkills.size === 0) {
      const unlockedNodes = nodeData.filter(n => n.status === 'unlocked');
      unlockedNodes.forEach(n => {
        if (Array.isArray(n.skills)) n.skills.forEach(s => allSkills.add(s));
      });
    }

    const passedTests = attempts.filter(a => a.passed).length;
    const baseScore = Math.min(100, (completedNodes.length * 15) + (passedTests * 20));

    const skillsToInsert = Array.from(allSkills).map(skill => ({
      student_id: profile.id,
      skill_name: skill,
      domain: 'Web Development',
      score: baseScore + Math.random() * 20,
      level: Math.min(5, Math.floor(baseScore / 20) + 1),
      last_updated: new Date().toISOString(),
    }));

    if (skillsToInsert.length > 0) {
      const { data } = await supabase
        .from('skill_scores')
        .upsert(skillsToInsert, { onConflict: 'student_id,skill_name' })
        .select();
      setSkills(data || skillsToInsert);
    }
  };

  const recalculateScore = async () => {
    const completedNodes = nodes.filter(n => n.status === 'completed').length;
    const totalNodes = nodes.length || 1;
    const passedTests = testAttempts.filter(a => a.passed).length;
    const totalTests = testAttempts.length || 1;
    const avgTestScore = testAttempts.length > 0
      ? testAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / testAttempts.length
      : 0;

    const performanceIndex = (avgTestScore / 100) * 400;
    const consistencyIndex = (completedNodes / totalNodes) * 300;
    const buildIndex = Math.min(200, completedNodes * 25);
    const growthIndex = (passedTests / Math.max(totalTests, 1)) * 100;

    const newScore = Math.min(1000, Math.round(
      performanceIndex + consistencyIndex + buildIndex + growthIndex
    ));

    await supabase.from('profiles')
      .update({ skill_score: newScore })
      .eq('id', profile.id);

    return newScore;
  };

  useEffect(() => {
    if (nodes.length > 0 && testAttempts.length >= 0) {
      recalculateScore();
    }
  }, [nodes, testAttempts]);

  const score = Math.round(profile?.skill_score || 0);
  const tier = getTierConfig(score);
  const completedNodes = nodes.filter(n => n.status === 'completed').length;
  const passedTests = testAttempts.filter(a => a.passed).length;

  const scoreBreakdown = [
    { label: 'Performance', value: Math.min(100, Math.round(testAttempts.length > 0 ? testAttempts.reduce((a, t) => a + (t.percentage || 0), 0) / testAttempts.length : 0)), max: 100, color: '#00FF94', weight: '40%' },
    { label: 'Consistency', value: Math.min(100, nodes.length > 0 ? Math.round((completedNodes / nodes.length) * 100) : 0), max: 100, color: '#7B61FF', weight: '30%' },
    { label: 'Build Index', value: Math.min(100, completedNodes * 10), max: 100, color: '#4A9EFF', weight: '20%' },
    { label: 'Growth',      value: Math.min(100, passedTests * 20),    max: 100, color: '#FFB347', weight: '10%' },
  ];

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-primary rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Skill Graph ⚡</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your verified skill identity — built from real performance
          </p>
        </div>

        {/* Genois Score Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${tier.glow} 0%, rgba(18,18,26,0.9) 60%)`,
            border: `1px solid ${tier.color}30`,
          }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${tier.color}, transparent)` }} />

          <div className="relative flex items-center gap-8">
            {/* Score Ring */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40"
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle cx="50" cy="50" r="40"
                  fill="none" strokeWidth="8"
                  stroke={tier.color}
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 251.2' }}
                  animate={{ strokeDasharray: `${(score / 1000) * 251.2} 251.2` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{ filter: `drop-shadow(0 0 8px ${tier.color})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-2xl font-bold font-heading"
                  style={{ color: tier.color }}>
                  {score}
                </motion.span>
                <span className="text-xs text-gray-500">/ 1000</span>
              </div>
            </div>

            {/* Score Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold font-heading" style={{ color: tier.color }}>
                  {tier.label}
                </span>
                <span className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{ background: `${tier.glow}`, color: tier.color, border: `1px solid ${tier.color}30` }}>
                  Genois Score™
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Built from {completedNodes} completed nodes · {passedTests} tests passed · real verified activity
              </p>

              {/* Breakdown bars */}
              <div className="space-y-2">
                {scoreBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 flex-shrink-0">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-xs font-mono w-8 text-right" style={{ color: item.color }}>
                      {item.value}
                    </span>
                    <span className="text-xs text-gray-600 w-8">{item.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex flex-col gap-3">
              {[
                { icon: '🗺️', label: 'Nodes Done', value: completedNodes },
                { icon: '📝', label: 'Tests Passed', value: passedTests },
                { icon: '🏆', label: 'Badges', value: badges.length },
              ].map((stat, i) => (
                <div key={i} className="text-center px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-lg">{stat.icon}</div>
                  <div className="text-lg font-bold font-heading text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Skill Cards Grid */}
        {!can('skillGraph') ? (
          <UpgradePrompt feature="Skill Graph" requiredPlan="starter" />
        ) : (
        <div>
          <h2 className="font-bold text-white font-heading mb-4 flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            Your Skills
            <span className="text-xs text-gray-500 font-normal ml-1">({skills.length} verified)</span>
          </h2>

          {skills.length === 0 ? (
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-white font-heading mb-2">No skills yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Complete roadmap nodes and pass tests to build your skill graph
              </p>
              <a href="/student/roadmap"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm">
                Go to Roadmap →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skills.map((skill, i) => {
                const level = skill.level || 1;
                const config = SKILL_COLORS[Math.min(level, 5)];
                const isSelected = selectedSkill?.skill_name === skill.skill_name;

                return (
                  <motion.div key={skill.id || i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedSkill(isSelected ? null : skill)}
                    className="p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105"
                    style={{
                      background: isSelected ? config.bg : 'rgba(18,18,26,0.8)',
                      border: `1px solid ${isSelected ? config.border : 'rgba(34,34,51,0.8)'}`,
                      boxShadow: isSelected ? `0 0 20px ${config.bg}` : 'none',
                    }}>
                    {/* Level indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(l => (
                          <div key={l} className="w-1.5 h-4 rounded-full transition-all"
                            style={{ background: l <= level ? config.text : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: config.text }}>
                        L{level}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white mb-1 truncate">
                      {skill.skill_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: config.text }}>{config.label}</span>
                      <span className="text-xs text-gray-600 font-mono">
                        {Math.round(skill.score || 0)}pts
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="mt-2 h-1 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, skill.score || 0)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: config.text }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* Selected Skill Detail */}
        {selectedSkill && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 border border-primary/30 rounded-2xl p-5">
            <h3 className="font-bold text-white font-heading mb-3">
              ⚡ {selectedSkill.skill_name} — Deep Dive
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Current Level', value: `Level ${selectedSkill.level || 1}` },
                { label: 'Score', value: `${Math.round(selectedSkill.score || 0)} pts` },
                { label: 'Status', value: SKILL_COLORS[Math.min(selectedSkill.level || 1, 5)].label },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 bg-dark-700 rounded-xl">
                  <div className="text-sm font-bold text-white font-heading">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-xs text-gray-300">
                💡 <span className="text-primary font-semibold">How to improve:</span>
                {' '}Complete more roadmap nodes and pass tests related to {selectedSkill.skill_name}.
                Each passed test adds up to 50 points to your Genois Score.
              </p>
            </div>
          </motion.div>
        )}

        {/* Badges */}
        <div>
          <h2 className="font-bold text-white font-heading mb-4 flex items-center gap-2">
            <Award size={16} className="text-warning" />
            Earned Badges
            <span className="text-xs text-gray-500 font-normal ml-1">({badges.length} earned)</span>
          </h2>

          {badges.length === 0 ? (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-gray-500 text-sm">Complete tasks and pass tests to earn badges</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map((sb, i) => {
                const badge = sb.badges;
                const rarityColors = {
                  common:    { bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.3)', color: '#888' },
                  rare:      { bg: 'rgba(74,158,255,0.1)',  border: 'rgba(74,158,255,0.3)',  color: '#4A9EFF' },
                  epic:      { bg: 'rgba(123,97,255,0.1)',  border: 'rgba(123,97,255,0.3)',  color: '#7B61FF' },
                  legendary: { bg: 'rgba(255,215,0,0.1)',   border: 'rgba(255,215,0,0.3)',   color: '#FFD700' },
                };
                const rc = rarityColors[badge?.rarity || 'common'];
                return (
                  <motion.div key={sb.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl border text-center"
                    style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
                    <div className="text-3xl mb-2">{badge?.icon || '🏆'}</div>
                    <p className="text-xs font-bold text-white mb-1">{badge?.name}</p>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{badge?.description}</p>
                    <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full"
                      style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                      {badge?.rarity || 'common'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Roadmap Progress */}
        <div>
          <h2 className="font-bold text-white font-heading mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-secondary" />
            Roadmap Progress
          </h2>
          <div className="grid gap-2">
            {nodes.slice(0, 8).map((node, i) => (
              <motion.div key={node.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                style={{
                  background: node.status === 'completed'
                    ? 'rgba(0,214,143,0.05)'
                    : node.status === 'unlocked'
                    ? 'rgba(0,255,148,0.05)'
                    : 'rgba(18,18,26,0.5)',
                  border: node.status === 'completed'
                    ? '1px solid rgba(0,214,143,0.2)'
                    : node.status === 'unlocked'
                    ? '1px solid rgba(0,255,148,0.2)'
                    : '1px solid rgba(34,34,51,0.5)',
                }}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  node.status === 'completed' ? 'bg-success/20' :
                  node.status === 'unlocked'  ? 'bg-primary/20' :
                  'bg-dark-600'
                }`}>
                  {node.status === 'completed' ? (
                    <span className="text-success text-xs">✓</span>
                  ) : node.status === 'unlocked' ? (
                    <span className="text-primary text-xs">●</span>
                  ) : (
                    <Lock size={10} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${
                    node.status === 'locked' ? 'text-gray-600' : 'text-white'
                  }`}>
                    {node.title}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${
                  node.status === 'completed' ? 'bg-success/20 text-success' :
                  node.status === 'unlocked'  ? 'bg-primary/20 text-primary' :
                  'bg-dark-600 text-gray-600'
                }`}>
                  {node.status}
                </span>
              </motion.div>
            ))}
            {nodes.length > 8 && (
              <p className="text-xs text-gray-600 text-center py-2">
                +{nodes.length - 8} more nodes in roadmap
              </p>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SkillGraph;
