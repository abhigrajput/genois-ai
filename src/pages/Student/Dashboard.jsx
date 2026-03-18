import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, CheckCircle, Clock,
         TrendingUp, Star, Play, FolderOpen, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { calculateDetailedScore } from '../../lib/scoring';
import useStore from '../../store/useStore';
import usePlan from '../../hooks/usePlan';
import { Link } from 'react-router-dom';

const ANXIETY_OPTIONS = [
  { id: 'overwhelmed', emoji: '😤', label: 'Overwhelmed' },
  { id: 'anxious',     emoji: '😰', label: 'Anxious' },
  { id: 'okay',        emoji: '😐', label: 'Okay' },
  { id: 'ready',       emoji: '💪', label: "Let's go!" },
];

const getScoreTier = (score) => {
  if (score >= 801) return { label: 'Elite',      color: '#FFD700' };
  if (score >= 601) return { label: 'Advanced',   color: '#7B61FF' };
  if (score >= 401) return { label: 'Proficient', color: '#00FF94' };
  if (score >= 201) return { label: 'Developing', color: '#4A9EFF' };
  return                    { label: 'Beginner',   color: '#666'    };
};

const ScoreTransparencyCard = ({ scoreData }) => {
  if (!scoreData) return null;
  const { breakdown } = scoreData;

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
      <h3 className="font-bold text-white font-heading text-sm mb-1">
        Why is your score {scoreData.total}?
      </h3>
      <p className="text-xs text-gray-500 mb-4">Here's exactly how it's calculated:</p>
      <div className="space-y-3">
        {Object.entries(breakdown).map(([key, item]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-300 capitalize">{key}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{item.details}</span>
                <span className="text-xs font-bold text-primary font-mono">
                  {item.score}/{item.max}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${(item.score / item.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-dark-600 flex items-center justify-between">
        <span className="text-xs text-gray-500">Total Genois Score™</span>
        <span className="text-lg font-bold font-heading text-primary">{scoreData.total}/1000</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { profile } = useStore();
  const { plan, isFree, color: planColor, label: planLabel } = usePlan();
  const [anxiety, setAnxiety] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [todayStats, setTodayStats] = useState({ done: 0, total: 0, minutes: 0 });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else if (h < 21) setGreeting('Good evening');
    else setGreeting('Still grinding');
    if (profile?.id) fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    setLoading(false);
    const today = new Date().toISOString().split('T')[0];
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('student_id', profile.id);
    const todayTasks = (taskData || []).filter(t => t.due_date === today);
    setTasks(todayTasks);
    const done = todayTasks.filter(t => t.status === 'completed').length;
    setTodayStats({ done, total: todayTasks.length, minutes: done * 25 });

    // Load score breakdown in background
    calculateDetailedScore(profile.id, supabase)
      .then(setScoreData)
      .catch(() => {});

    // Load projects
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', profile.id);
    setProjects(projectData || []);
  };

  const completeTask = async (taskId) => {
    await supabase.from('tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId);
    fetchDashboardData();
  };

  const tier = getScoreTier(profile?.skill_score || 0);
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const daysActive = profile?.streak_count || 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Plan Banner */}
        {isFree && (
          <div className="mb-4 flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed border-gray-700 bg-dark-800/50">
            <span className="text-xs text-gray-400">
              You're on the <span className="text-white font-semibold">Free plan</span> — some features are locked.
            </span>
            <Link to="/pricing" className="text-xs font-semibold text-primary hover:underline ml-3 flex-shrink-0">
              Upgrade →
            </Link>
          </div>
        )}

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {daysActive > 0
              ? `Day ${daysActive} of your journey. Keep going.`
              : 'Your journey starts today. One task at a time.'}
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Genois Score', value: Math.round(profile?.skill_score || 0), icon: <Zap size={16}/>, color: tier.color, sub: tier.label },
            { label: 'Day Streak', value: daysActive, icon: <Flame size={16}/>, color: '#FFB347', sub: daysActive >= 7 ? '🔥 On fire!' : 'Keep going' },
            { label: 'Done Today', value: `${todayStats.done}/${todayStats.total || '?'}`, icon: <CheckCircle size={16}/>, color: '#00FF94', sub: 'tasks' },
            { label: 'Study Time', value: `${todayStats.minutes}m`, icon: <Clock size={16}/>, color: '#4A9EFF', sub: 'today' },
          ].map((kpi, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2" style={{ color: kpi.color }}>
                {kpi.icon}
                <span className="text-xs text-gray-500">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold font-heading" style={{ color: kpi.color }}>
                {kpi.value}
              </div>
              <div className="text-xs text-gray-600 mt-1">{kpi.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Score Transparency Card */}
        {scoreData && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6">
            <ScoreTransparencyCard scoreData={scoreData} />
          </motion.div>
        )}

        {/* Anxiety Check-in */}
        <AnimatePresence>
          {!anxiety && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-dark-800 border border-dark-600 rounded-xl p-5 mb-6">
              <p className="text-sm font-medium text-white mb-4">
                How are you feeling right now? <span className="text-gray-500">(be honest)</span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ANXIETY_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => setAnxiety(opt.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-dark-500 hover:border-primary hover:bg-primary/5 transition-all">
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-xs text-gray-400">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anxiety Response */}
        <AnimatePresence>
          {(anxiety === 'overwhelmed' || anxiety === 'anxious') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-calm/10 border border-calm/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-calm font-medium mb-1">Hey, that's okay. 💙</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Forget the roadmap. Forget placement season. Forget what anyone else is doing.
                You have one small task today. Just one. 20 minutes. You can do this.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Today's Tasks */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white font-heading text-sm">
                {tasks.length === 0 ? "Today's Focus" : "Today's Tasks"}
              </h2>
              {tasks.length > 0 && (
                <span className="text-xs text-gray-500">
                  {todayStats.done}/{tasks.length} done
                </span>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-sm text-gray-400 mb-1">No tasks yet today</p>
                <p className="text-xs text-gray-600 mb-4">Start your roadmap to get your first task</p>
                <a href="/student/roadmap"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark-900 rounded-lg text-xs font-semibold hover:bg-opacity-90 transition-all">
                  <Play size={12} /> Start Roadmap
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map((task, i) => (
                  <motion.div key={task.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      task.status === 'completed'
                        ? 'border-success/20 bg-success/5 opacity-60'
                        : 'border-dark-500 hover:border-dark-400'
                    }`}>
                    <button onClick={() => completeTask(task.id)}
                      disabled={task.status === 'completed'}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        task.status === 'completed'
                          ? 'border-success bg-success'
                          : 'border-dark-400 hover:border-primary'
                      }`}>
                      {task.status === 'completed' && <CheckCircle size={12} className="text-dark-900" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${
                        task.status === 'completed' ? 'line-through text-gray-600' : 'text-gray-200'
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-600">{task.estimated_minutes || 25} min</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-4">

            {/* Score Card */}
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <h2 className="font-semibold text-white font-heading text-sm mb-4">
                Your Genois Score™
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#222233" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                      stroke={tier.color}
                      strokeDasharray={`${(profile?.skill_score || 0) / 10}, 100`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold" style={{ color: tier.color }}>
                      {Math.round(profile?.skill_score || 0)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-heading" style={{ color: tier.color }}>
                    {tier.label}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Complete tasks and tests to increase your score
                  </p>
                  <a href="/student/score" className="text-xs text-primary hover:underline mt-1 block">
                    View full breakdown →
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <h2 className="font-semibold text-white font-heading text-sm mb-3">Quick Actions</h2>
              <div className="flex flex-col gap-2">
                {[
                  { icon: '🗺️', label: 'View My Roadmap',          href: '/student/roadmap', color: 'text-primary'   },
                  { icon: '📝', label: 'Take a Test',               href: '/student/tests',   color: 'text-secondary' },
                  { icon: '🧠', label: 'Score Intelligence',        href: '/student/score',   color: 'text-warning'   },
                  { icon: '💬', label: 'Talk to Genois (2AM Chat)', href: '/student/chat',    color: 'text-calm'      },
                ].map((item, i) => (
                  <a key={i} href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-700 transition-all group">
                    <span className="text-base">{item.icon}</span>
                    <span className={`text-xs font-medium ${item.color} group-hover:underline`}>
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Project Milestone Card */}
        {projects.length > 0 && (() => {
          const overdue = projects.filter(p => p.status !== 'completed' && p.due_date && new Date(p.due_date) < new Date());
          const built = projects.filter(p => p.status === 'completed').length;
          return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`mb-6 rounded-xl p-4 border ${overdue.length > 0 ? 'border-warning/30 bg-warning/5' : 'border-success/20 bg-success/5'}`}>
              <div className="flex items-center gap-3">
                {overdue.length > 0
                  ? <AlertTriangle size={16} className="text-warning flex-shrink-0" />
                  : <FolderOpen size={16} className="text-success flex-shrink-0" />
                }
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {overdue.length > 0
                      ? `${overdue.length} project${overdue.length > 1 ? 's' : ''} overdue`
                      : `${built} project${built !== 1 ? 's' : ''} built`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {overdue.length > 0
                      ? overdue.map(p => p.title).join(', ')
                      : 'Great job staying on track with your project milestones!'}
                  </p>
                </div>
                <a href="/student/roadmap" className="text-xs text-primary hover:underline flex-shrink-0">
                  View →
                </a>
              </div>
            </motion.div>
          );
        })()}

        {/* Encouragement Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 text-center">
          <p className="text-xs text-gray-700">
            "The student who shows up consistently beats the genius who shows up occasionally."
          </p>
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
