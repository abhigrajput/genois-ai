import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, CheckCircle,
         Github, Zap, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateTrustSummary, calculateConsistencyScore, getTrustBadge } from '../../lib/trust';
import { LineChart, Line, XAxis, YAxis,
         Tooltip, ResponsiveContainer } from 'recharts';

const TrustPanel = ({ studentId, profile, skills, projects, compact = false }) => {
  const [scoreHistory, setScoreHistory] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);

  useEffect(() => {
    if (studentId) fetchTrustData();
  }, [studentId]);

  const fetchTrustData = async () => {
    setLoading(true);
    const [scoreRes, taskRes, testRes] = await Promise.all([
      supabase.from('score_history').select('*')
        .eq('student_id', studentId)
        .order('recorded_at', { ascending: true }).limit(14),
      supabase.from('tasks').select('*')
        .eq('student_id', studentId)
        .eq('status', 'completed')
        .order('id', { ascending: false }).limit(20),
      supabase.from('test_attempts').select('*')
        .eq('student_id', studentId)
        .order('attempted_at', { ascending: false }).limit(10),
    ]);

    setScoreHistory(scoreRes.data || []);
    setTaskHistory(taskRes.data || []);
    setTestHistory(testRes.data || []);
    setLoading(false);
  };

  const score = Math.round(profile?.skill_score || 0);
  const streak = profile?.streak_count || 0;
  const passedTests = testHistory.filter(t => t.passed).length;
  const verifiedProjects = (projects || []).filter(p => p.verified).length;
  const completedTasks = taskHistory.length;
  const avgTestScore = testHistory.length > 0
    ? Math.round(testHistory.reduce((a, t) => a + (t.percentage || 0), 0) / testHistory.length)
    : 0;

  const trustSummary = generateTrustSummary({
    score, skills, passedTests,
    totalTests: testHistory.length,
    completedTasks, verifiedProjects,
    totalProjects: (projects || []).length,
    streak, avgTestScore,
    completedNodes: 0,
  });

  const consistencyScore = calculateConsistencyScore(streak, taskHistory);
  const trustBadge = getTrustBadge(score, streak, verifiedProjects);

  const graphData = scoreHistory.length > 0
    ? scoreHistory.map(h => ({
        day: new Date(h.recorded_at).toLocaleDateString('en-IN', { month:'short', day:'numeric' }),
        score: h.score,
      }))
    : [{ day: 'Start', score: 0 }, { day: 'Today', score }];

  const trustColor = trustSummary.trustLevel === 'high' ? '#FFD700'
    : trustSummary.trustLevel === 'medium' ? '#00FF94'
    : '#4A9EFF';

  if (loading) return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-dark-600 rounded w-1/3" />
        <div className="h-20 bg-dark-600 rounded" />
      </div>
    </div>
  );

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${trustColor}15` }}>
              <Shield size={18} style={{ color: trustColor }} />
            </div>
            <div>
              <h3 className="font-bold text-white font-heading text-sm">
                Trust Engine
              </h3>
              <p className="text-xs text-gray-500">
                Verified score proof for companies
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{trustBadge.icon}</span>
            <div className="text-right">
              <p className="text-xs font-bold" style={{ color: trustBadge.color }}>
                {trustBadge.label}
              </p>
              <p className="text-xs text-gray-600">trust level</p>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="mt-4 p-3 rounded-xl"
          style={{ background: `${trustColor}08`, border: `1px solid ${trustColor}20` }}>
          <p className="text-xs font-semibold mb-1" style={{ color: trustColor }}>
            🤖 Auto-generated Trust Summary
          </p>
          <p className="text-xs text-gray-300 leading-relaxed italic">
            "{trustSummary.shortSummary}"
          </p>
        </div>

        {compact && (
          <button onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs text-gray-500 hover:text-white transition-colors">
            {expanded ? 'Show less ↑' : 'Show full trust report ↓'}
          </button>
        )}
      </div>

      {expanded && (
        <div className="p-5 space-y-5">

          {/* Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: <CheckCircle size={14} />,
                label: 'Tasks Done',
                value: completedTasks,
                sub: 'verified',
                color: '#00FF94',
              },
              {
                icon: <Zap size={14} />,
                label: 'Tests Passed',
                value: passedTests,
                sub: `${avgTestScore}% avg`,
                color: '#4A9EFF',
              },
              {
                icon: <Github size={14} />,
                label: 'Projects',
                value: `${verifiedProjects}/${(projects||[]).length}`,
                sub: 'GitHub verified',
                color: '#7B61FF',
              },
              {
                icon: <Clock size={14} />,
                label: 'Streak',
                value: `${streak}d`,
                sub: 'consistency',
                color: '#FFB347',
              },
            ].map((metric, i) => (
              <div key={i} className="p-3 rounded-xl text-center"
                style={{ background: `${metric.color}08`, border: `1px solid ${metric.color}15` }}>
                <div className="flex justify-center mb-1.5" style={{ color: metric.color }}>
                  {metric.icon}
                </div>
                <div className="text-lg font-bold font-heading" style={{ color: metric.color }}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-400">{metric.label}</div>
                <div className="text-xs text-gray-600">{metric.sub}</div>
              </div>
            ))}
          </div>

          {/* Consistency Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-300">Consistency Score</p>
              <span className="text-xs font-bold font-mono"
                style={{ color: consistencyScore >= 70 ? '#00FF94' : consistencyScore >= 40 ? '#FFB347' : '#666' }}>
                {consistencyScore}/100
              </span>
            </div>
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${consistencyScore}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full"
                style={{
                  background: consistencyScore >= 70 ? '#00FF94'
                    : consistencyScore >= 40 ? '#FFB347' : '#4A9EFF'
                }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Based on {streak}-day streak + recent task activity
            </p>
          </div>

          {/* Score History Graph */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-1.5">
              <TrendingUp size={12} /> Score History (last 14 days)
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={graphData}>
                <XAxis dataKey="day" tick={{ fill:'#444', fontSize:10 }}
                  axisLine={false} tickLine={false} />
                <YAxis domain={[0,'auto']} tick={{ fill:'#444', fontSize:10 }}
                  axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{
                  background:'#1A1A27', border:'1px solid #2A2A3F',
                  borderRadius:'8px', fontSize:'11px'
                }} />
                <Line type="monotone" dataKey="score"
                  stroke={trustColor} strokeWidth={2}
                  dot={{ fill: trustColor, r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Why tamper-proof */}
          <div className="p-3 rounded-xl"
            style={{ background:'rgba(0,255,148,0.05)', border:'1px solid rgba(0,255,148,0.12)' }}>
            <p className="text-xs font-bold text-primary mb-2">
              🔒 Why this score is tamper-proof
            </p>
            <div className="space-y-1.5">
              {[
                'Tasks have minimum 3-minute completion requirement',
                'Tests use anti-cheat tab-switch detection',
                'Projects verified via GitHub API (commit count + code)',
                'Score updated daily from real timestamped activity',
                'Cannot be manually edited — calculated automatically',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary text-xs mt-0.5">✓</span>
                  <span className="text-xs text-gray-400">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Evidence Points */}
          {trustSummary.points.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">Trust Evidence</p>
              <div className="space-y-1.5">
                {trustSummary.points.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="text-success">●</span>
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects with verification */}
          {projects?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">Project Evidence</p>
              <div className="space-y-2">
                {projects.map((project, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg"
                    style={{
                      background: project.verified ? 'rgba(0,255,148,0.05)' : 'rgba(34,34,51,0.5)',
                      border: `1px solid ${project.verified ? 'rgba(0,255,148,0.2)' : 'rgba(34,34,51,0.8)'}`,
                    }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm flex-shrink-0">
                        {project.verified ? '✅' : '⏳'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{project.title}</p>
                        {project.metadata?.commit_count && (
                          <p className="text-xs text-gray-500">
                            {project.metadata.commit_count} commits · {project.metadata.language} ·
                            <span className="capitalize ml-1">{project.metadata.difficulty}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {project.metadata?.difficulty && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                          style={{
                            background: project.metadata.difficulty === 'advanced'
                              ? 'rgba(255,179,71,0.1)'
                              : project.metadata.difficulty === 'intermediate'
                              ? 'rgba(123,97,255,0.1)'
                              : 'rgba(74,158,255,0.1)',
                            color: project.metadata.difficulty === 'advanced' ? '#FFB347'
                              : project.metadata.difficulty === 'intermediate' ? '#7B61FF' : '#4A9EFF',
                          }}>
                          {project.metadata.difficulty}
                        </span>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noreferrer"
                          className="text-gray-500 hover:text-white transition-colors">
                          <Github size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default TrustPanel;
