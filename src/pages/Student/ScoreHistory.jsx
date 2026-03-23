import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip,
         ResponsiveContainer, AreaChart, Area } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { calculateDetailedScore, detectWeaknesses, getJobReadiness } from '../../lib/scoring';
import JobReadinessMeter from '../../components/ui/JobReadinessMeter';
import useStore from '../../store/useStore';
import usePlan from '../../hooks/usePlan';
import UpgradePrompt from '../../components/ui/UpgradePrompt';

const ScoreHistory = () => {
  const { profile } = useStore();
  const { can } = usePlan();
  const [scoreData, setScoreData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [tests, setTests] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    const [skillRes, testRes] = await Promise.all([
      supabase.from('skill_scores').select('*').eq('student_id', profile.id),
      supabase.from('test_attempts').select('*').eq('student_id', profile.id).order('attempted_at'),
    ]);

    const skillData = skillRes.data || [];
    const testData  = testRes.data  || [];

    setSkills(skillData);
    setTests(testData);

    const detailed = await calculateDetailedScore(profile.id, supabase);
    setScoreData(detailed);

    const history = testData.map((t, i) => ({
      name: `Day ${i + 1}`,
      score: Math.min(1000, (i + 1) * Math.round(detailed.total / Math.max(testData.length, 1))),
      test: Math.round(t.percentage || 0),
    }));

    setHistoryData(history.length === 0
      ? [{ name: 'Day 1', score: 0, test: 0 }, { name: 'Today', score: detailed.total, test: 0 }]
      : history
    );

    setLoading(false);
  };

  const weaknesses  = detectWeaknesses(tests, skills);
  const jobReadiness = getJobReadiness(scoreData, profile);

  const SKILL_LEVELS = [
    { min: 0,   max: 20,  label: 'Beginner',     color: '#666',    icon: '🌱' },
    { min: 20,  max: 40,  label: 'Developing',   color: '#4A9EFF', icon: '📈' },
    { min: 40,  max: 65,  label: 'Intermediate', color: '#7B61FF', icon: '⚡' },
    { min: 65,  max: 80,  label: 'Verified',     color: '#00FF94', icon: '✅' },
    { min: 80,  max: 90,  label: 'Advanced',     color: '#FFB347', icon: '🔥' },
    { min: 90,  max: 101, label: 'Job Ready',    color: '#FFD700', icon: '🏆' },
  ];

  const getVerificationLevel = (pct) =>
    SKILL_LEVELS.find(l => pct >= l.min && pct < l.max) || SKILL_LEVELS[0];

  const currentLevel = getVerificationLevel(jobReadiness.percentage);

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

        <div>
          <h1 className="text-2xl font-bold font-heading text-white">
            Why Is Your Score {scoreData?.total ?? '...'}? 🔍
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Full transparency into your skill score + improvement areas
          </p>
        </div>

        {/* Tamper-Proof Explanation */}
        <div className="p-4 rounded-xl"
          style={{ background: 'rgba(0,255,148,0.04)', border: '1px solid rgba(0,255,148,0.15)' }}>
          <p className="text-xs font-bold text-primary mb-1.5">🔒 Why This Score Cannot Be Faked</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your Genois Score is built exclusively from <span className="text-white font-semibold">real daily activity</span> — tasks completed, tests attempted, nodes unlocked, and projects submitted with GitHub evidence.
            There is no way to manually inflate it. No certificate upload. No self-rating. Every point is earned.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            {[
              { label: 'Tasks (30%)', icon: '✅' },
              { label: 'Tests (25%)', icon: '📝' },
              { label: 'Projects (30%)', icon: '💻' },
              { label: 'Activity/Streak (15%)', icon: '🔥' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
                {item.icon} {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Job Readiness Meter */}
        <JobReadinessMeter
          jobReadiness={jobReadiness}
          showBreakdown={true}
          showNextStep={true}
          compact={false}
        />

        {/* Score Breakdown Transparency */}
        {!can('scoreBreakdown') ? (
          <UpgradePrompt feature="Score Breakdown" requiredPlan="identity" />
        ) : scoreData && (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-1">
              🔍 Why is your score {scoreData.total}?
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Complete transparency — here's exactly how every point is calculated
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(scoreData.breakdown).map(([key, item], i) => {
                const colors = ['#00FF94', '#7B61FF', '#4A9EFF', '#FFB347'];
                const color  = colors[i];
                const pct    = (item.score / item.max) * 100;
                return (
                  <div key={key} className="p-4 rounded-xl"
                    style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white capitalize">{key}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{item.weight}</span>
                        <span className="text-sm font-bold font-mono" style={{ color }}>
                          {item.score}/{item.max}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{item.details}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-dark-600">
              <p className="text-xs text-gray-500 mb-3">Your activity breakdown:</p>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {[
                  { label: 'Tasks Done',    value: scoreData.raw.completedTasks },
                  { label: 'Tests Taken',   value: scoreData.raw.totalTests },
                  { label: 'Tests Passed',  value: scoreData.raw.passedTests },
                  { label: 'Nodes Done',    value: scoreData.raw.completedNodes },
                  { label: 'Projects',      value: scoreData.raw.projectCount },
                  { label: 'Active Days',   value: scoreData.raw.streakDays },
                  { label: 'Hours Studied', value: Math.round(scoreData.raw.totalMinutes/60) },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-2 bg-dark-700 rounded-lg">
                    <div className="text-sm font-bold text-white font-heading">{stat.value}</div>
                    <div className="text-xs text-gray-600 leading-tight mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Score History Chart */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="font-bold text-white font-heading text-sm mb-4">📈 Score History</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill:'#666', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,1000]} tick={{ fill:'#666', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#1A1A27', border:'1px solid #2A2A3F', borderRadius:'8px', fontSize:'12px' }} />
              <Area type="monotone" dataKey="score" stroke="#00FF94" strokeWidth={2}
                fill="url(#scoreGrad)" dot={{ fill:'#00FF94', r:3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weakness / Strength */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-4 flex items-center gap-2">
              ⚠️ Weak Areas
              <span className="text-xs text-gray-500 font-normal">({weaknesses.weakAreas.length} found)</span>
            </h2>
            {weaknesses.weakAreas.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-xs text-gray-500">No weak areas detected yet. Keep taking tests!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weaknesses.weakAreas.map((w, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: w.severity === 'high' ? 'rgba(255,107,107,0.08)' : 'rgba(255,179,71,0.08)',
                      border: `1px solid ${w.severity === 'high' ? 'rgba(255,107,107,0.2)' : 'rgba(255,179,71,0.2)'}`,
                    }}>
                    <span className="text-lg flex-shrink-0">{w.severity === 'high' ? '🔴' : '🟡'}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{w.area}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{w.advice}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-4 flex items-center gap-2">
              💪 Strong Areas
              <span className="text-xs text-gray-500 font-normal">({weaknesses.strongAreas.length} found)</span>
            </h2>
            {weaknesses.strongAreas.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">💪</div>
                <p className="text-xs text-gray-500">Complete more tests to identify your strengths!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {weaknesses.strongAreas.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(0,255,148,0.06)', border: '1px solid rgba(0,255,148,0.15)' }}>
                    <span className="text-lg">🟢</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{s.area}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Strong performance — keep building on this</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Adaptive Recommendations */}
        <div className="bg-dark-800 border border-primary/20 rounded-2xl p-5">
          <h2 className="font-bold text-white font-heading text-sm mb-4">🎯 Adaptive Recommendations</h2>
          <div className="space-y-3">
            {[
              scoreData?.raw.completedTasks < 5 && {
                priority: 'HIGH', color: '#FF6B6B', href: '/student/tasks',
                action: 'Complete 5 tasks today',
                reason: 'Tasks are 30% of your score — this is your fastest path to improvement',
              },
              scoreData?.raw.passedTests === 0 && {
                priority: 'HIGH', color: '#FF6B6B', href: '/student/tests',
                action: 'Take your first test',
                reason: 'Tests are 40% of your score — zero tests means zero performance score',
              },
              scoreData?.raw.projectCount === 0 && {
                priority: 'MEDIUM', color: '#FFB347', href: '/student/profile',
                action: 'Add your first project',
                reason: 'Projects add 40 points each to your Build Index',
              },
              scoreData?.raw.completedNodes < 3 && {
                priority: 'MEDIUM', color: '#4A9EFF', href: '/student/roadmap',
                action: 'Complete 3 roadmap nodes',
                reason: 'Each completed node unlocks new skills and adds to your score',
              },
              weaknesses.weakAreas.length > 0 && {
                priority: 'LOW', color: '#7B61FF', href: '/student/tests',
                action: `Focus on: ${weaknesses.weakAreas[0]?.area}`,
                reason: weaknesses.weakAreas[0]?.advice,
              },
            ].filter(Boolean).slice(0, 4).map((rec, i) => (
              <a key={i} href={rec.href}
                className="flex items-start gap-3 p-4 rounded-xl transition-all hover:opacity-90"
                style={{ background: `${rec.color}08`, border: `1px solid ${rec.color}20` }}>
                <span className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                  style={{ background: `${rec.color}20`, color: rec.color }}>
                  {rec.priority}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{rec.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{rec.reason}</p>
                </div>
                <span className="ml-auto text-gray-500 text-xs mt-0.5">→</span>
              </a>
            ))}
            {[
              scoreData?.raw.completedTasks >= 5,
              scoreData?.raw.passedTests > 0,
              scoreData?.raw.projectCount > 0,
              scoreData?.raw.completedNodes >= 3,
            ].every(Boolean) && (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">🔥</div>
                <p className="text-sm font-semibold text-primary">You're on track! Keep the momentum going.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ScoreHistory;
