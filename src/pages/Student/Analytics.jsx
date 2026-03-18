import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis,
         Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import usePlan from '../../hooks/usePlan';
import UpgradePrompt from '../../components/ui/UpgradePrompt';

const Analytics = () => {
  const { profile } = useStore();
  const { can } = usePlan();
  const [tasks, setTasks] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    const [taskRes, attemptRes, nodeRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('student_id', profile.id),
      supabase.from('test_attempts').select('*').eq('student_id', profile.id),
      supabase.from('roadmap_nodes').select('*, roadmaps!inner(student_id)')
        .eq('roadmaps.student_id', profile.id),
    ]);
    setTasks(taskRes.data || []);
    setAttempts(attemptRes.data || []);
    setNodes(nodeRes.data || []);
    setLoading(false);
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const passedTests = attempts.filter(a => a.passed).length;
  const completedNodes = nodes.filter(n => n.status === 'completed').length;
  const avgTestScore = attempts.length > 0
    ? Math.round(attempts.reduce((a, t) => a + (t.percentage || 0), 0) / attempts.length)
    : 0;

  const testScoreData = attempts.slice(-7).map((a, i) => ({
    name: `Test ${i + 1}`,
    score: Math.round(a.percentage || 0),
    passed: a.passed,
  }));

  const taskTypeData = [
    { name: 'Coding',   count: tasks.filter(t => t.type === 'coding').length,  color: '#00FF94' },
    { name: 'Reading',  count: tasks.filter(t => t.type === 'reading').length,  color: '#4A9EFF' },
    { name: 'Project',  count: tasks.filter(t => t.type === 'project').length,  color: '#7B61FF' },
    { name: 'Video',    count: tasks.filter(t => t.type === 'video').length,    color: '#FFB347' },
  ].filter(d => d.count > 0);

  const stats = [
    { label: 'Tasks Completed', value: completedTasks, total: tasks.length,    color: '#00FF94' },
    { label: 'Tests Passed',    value: passedTests,    total: attempts.length,  color: '#7B61FF' },
    { label: 'Nodes Done',      value: completedNodes, total: nodes.length,     color: '#4A9EFF' },
    { label: 'Avg Test Score',  value: `${avgTestScore}%`, total: null,         color: '#FFB347' },
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
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Analytics 📊</h1>
          <p className="text-gray-500 text-sm mt-1">Your learning performance over time</p>
        </div>

        {!can('analyticsPage') ? (
          <UpgradePrompt feature="Analytics Dashboard" requiredPlan="identity" />
        ) : (<>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="text-2xl font-bold font-heading mb-1"
                style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
              {stat.total !== null && (
                <div className="mt-2 h-1 bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: stat.total > 0 ? `${(Number(stat.value) / stat.total) * 100}%` : '0%' }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: stat.color }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Test Score History */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-4">
              Test Score History
            </h2>
            {testScoreData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                Take tests to see your progress
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={testScoreData}>
                  <XAxis dataKey="name" tick={{ fill:'#666', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fill:'#666', fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background:'#1A1A27', border:'1px solid #2A2A3F', borderRadius:'8px', fontSize:'12px' }}
                    labelStyle={{ color:'#E8E8F0' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#00FF94"
                    strokeWidth={2} dot={{ fill:'#00FF94', strokeWidth:2, r:4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Task Types */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-4">
              Task Breakdown
            </h2>
            {taskTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                Generate tasks to see breakdown
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={taskTypeData}>
                  <XAxis dataKey="name" tick={{ fill:'#666', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#666', fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background:'#1A1A27', border:'1px solid #2A2A3F', borderRadius:'8px', fontSize:'12px' }}
                    labelStyle={{ color:'#E8E8F0' }}
                  />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {taskTypeData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Roadmap Progress */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="font-bold text-white font-heading text-sm mb-4">
            Roadmap Progress
          </h2>
          {nodes.length === 0 ? (
            <div className="text-center py-6 text-gray-600 text-sm">
              Generate your roadmap to track progress
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{completedNodes} completed</span>
                <span>{nodes.length} total nodes</span>
              </div>
              <div className="h-3 bg-dark-600 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nodes.length > 0 ? (completedNodes / nodes.length) * 100 : 0}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Completed', count: completedNodes,                                             color: '#00D68F' },
                  { label: 'Unlocked',  count: nodes.filter(n => n.status === 'unlocked').length,          color: '#00FF94' },
                  { label: 'Locked',    count: nodes.filter(n => n.status === 'locked').length,            color: '#444'    },
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-dark-700">
                    <div className="text-xl font-bold font-heading" style={{ color: item.color }}>
                      {item.count}
                    </div>
                    <div className="text-xs text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </>)}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
