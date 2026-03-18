import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle,
         Clock, Zap, BookOpen, Code, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { generateDailyTasks } from '../../lib/claude';
import useStore from '../../store/useStore';
import usePlan from '../../hooks/usePlan';
import UpgradePrompt from '../../components/ui/UpgradePrompt';
import toast from 'react-hot-toast';

const typeIcon = {
  video:   '📹',
  reading: '📖',
  coding:  '💻',
  project: '🔨',
};

const typeColor = {
  video:   'text-red-400',
  reading: 'text-blue-400',
  coding:  'text-primary',
  project: 'text-secondary',
};

const Tasks = () => {
  const { profile } = useStore();
  const { limit: planLimit, isFree } = usePlan();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('today');

  // Pomodoro timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!profile?.id) return;
    const autoGenerate = async () => {
      await fetchTasks();
      if (activeTab === 'today') {
        const today = new Date().toISOString().split('T')[0];
        const { data: todayCheck } = await supabase
          .from('tasks')
          .select('id')
          .eq('student_id', profile.id)
          .eq('due_date', today)
          .limit(1);
        if (!todayCheck || todayCheck.length === 0) {
          await handleGenerateTasks();
        }
      }
    };
    autoGenerate();
  }, [profile, activeTab]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      setTimerRunning(false);
      setTimeLeft((selectedTask.estimated_minutes || 25) * 60);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            if (!isBreak) {
              setSessionsCount(s => s + 1);
              toast.success('Pomodoro done! Take a 5 min break 🎉');
              setIsBreak(true);
              return 5 * 60;
            } else {
              toast.success('Break over! Back to work 💪');
              setIsBreak(false);
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, isBreak]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('student_id', profile.id)
        .order('id', { ascending: true });

      if (error) {
        console.error('Tasks fetch error:', error);
        setTasks([]);
      } else {
        if (activeTab === 'today') {
          const today = new Date().toISOString().split('T')[0];
          const todayTasks = (data || []).filter(t =>
            t.due_date === today
          );
          setTasks(todayTasks);
        } else {
          setTasks(data || []);
        }
      }
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
    setLoading(false);
  };

  const handleGenerateTasks = async () => {
    setGenerating(true);
    try {
      // First get student's roadmap
      const { data: roadmaps } = await supabase
        .from('roadmaps')
        .select('id')
        .eq('student_id', profile.id)
        .limit(1);

      if (!roadmaps || roadmaps.length === 0) {
        toast.error('Generate your roadmap first!');
        setGenerating(false);
        return;
      }

      // Get first unlocked node from student's roadmap
      const { data: nodes } = await supabase
        .from('roadmap_nodes')
        .select('*')
        .eq('roadmap_id', roadmaps[0].id)
        .eq('status', 'unlocked')
        .limit(1);

      if (!nodes || nodes.length === 0) {
        // If no unlocked node, get first node
        const { data: firstNodes } = await supabase
          .from('roadmap_nodes')
          .select('*')
          .eq('roadmap_id', roadmaps[0].id)
          .order('order_index', { ascending: true })
          .limit(1);

        if (!firstNodes || firstNodes.length === 0) {
          toast.error('No roadmap nodes found!');
          setGenerating(false);
          return;
        }

        // Use first node
        const node = firstNodes[0];
        await createTasksForNode(node);
        return;
      }

      await createTasksForNode(nodes[0]);

    } catch (err) {
      console.error(err);
      toast.error('Failed to generate tasks');
    }
    setGenerating(false);
  };

  const createTasksForNode = async (node) => {
    toast.loading('Generating your tasks...', { id: 'tasks' });

    const today = new Date().toISOString().split('T')[0];

    // Use mock tasks (reliable, no API needed)
    const mockTasks = [
      {
        title: `Study: ${node.title}`,
        description: `Read and understand the core concepts of ${node.title}. Take notes as you go.`,
        type: 'reading',
        estimated_minutes: 20,
      },
      {
        title: `Practice: ${node.title}`,
        description: `Write code related to ${node.title}. Experiment and try different approaches.`,
        type: 'coding',
        estimated_minutes: 30,
      },
      {
        title: `Build: Mini project using ${node.title}`,
        description: `Apply what you learned by building something small but working.`,
        type: 'project',
        estimated_minutes: 45,
      },
    ];

    // Try Claude API first, fall back to mock
    let tasksToUse = mockTasks;
    try {
      const aiTasks = await generateDailyTasks(node, 'medium');
      if (aiTasks?.tasks?.length > 0) {
        tasksToUse = aiTasks.tasks;
      }
    } catch (e) {
      console.log('Using mock tasks');
    }

    const tasksToInsert = tasksToUse.map(t => ({
      student_id: profile.id,
      node_id: node.id,
      title: t.title,
      description: t.description,
      type: t.type || 'coding',
      estimated_minutes: t.estimated_minutes || 25,
      status: 'pending',
      due_date: today,
    }));

    const { error } = await supabase.from('tasks').insert(tasksToInsert);

    if (error) {
      console.error('Insert error:', error);
      toast.error('Failed to save tasks: ' + error.message, { id: 'tasks' });
      return;
    }

    toast.success("3 tasks ready for today! 🎯", { id: 'tasks' });
    fetchTasks();
    setGenerating(false);
  };

  const completeTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await supabase.from('tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId);

    if (task.estimated_minutes) {
      await supabase.from('time_logs').insert({
        student_id: profile.id,
        task_id: taskId,
        node_id: task.node_id,
        duration_minutes: task.estimated_minutes,
        logged_at: new Date().toISOString(),
      });
    }

    toast.success('+15 Genois Points! 🔥');

    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: 'completed' } : t
    );
    const allDone = updatedTasks.every(t => t.status === 'completed');

    if (allDone && updatedTasks.length > 0) {
      toast.success('All tasks done! 🔥 Generating new ones...');
      setTimeout(() => {
        handleGenerateTasks();
      }, 1500);
    }

    fetchTasks();
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalTime = selectedTask
    ? (selectedTask.estimated_minutes || 25) * 60
    : 25 * 60;
  const timerProgress = totalTime > 0
    ? ((totalTime - timeLeft) / totalTime) * 100
    : 0;

  const taskLimit = planLimit('tasksPerDay');
  const visibleTasks = taskLimit === -1 ? tasks : tasks.slice(0, taskLimit);
  const isLimitReached = taskLimit !== -1 && tasks.length > taskLimit;

  const todayDone = visibleTasks.filter(t => t.status === 'completed').length;
  const todayTotal = visibleTasks.length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">Tasks 📋</h1>
            <p className="text-gray-500 text-sm mt-1">
              {todayDone}/{todayTotal} done today
            </p>
          </div>
          <button onClick={handleGenerateTasks} disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all disabled:opacity-50">
            {generating
              ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              : <Zap size={14} />
            }
            Generate Today's Tasks
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['today', 'all'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-primary text-dark-900'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}>
              {tab === 'today' ? "Today's Tasks" : 'All Tasks'}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Task List */}
          <div className="flex flex-col gap-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-dark-700 rounded-xl animate-pulse" />
              ))
            ) : tasks.length === 0 ? (
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-gray-400 text-sm mb-4">
                  No tasks yet. Generate your daily tasks!
                </p>
                <button onClick={handleGenerateTasks} disabled={generating}
                  className="px-4 py-2 bg-primary text-dark-900 font-semibold rounded-lg text-xs">
                  Generate Tasks
                </button>
              </div>
            ) : (
              visibleTasks.map((task, i) => (
                <motion.div key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedTask(task)}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTask?.id === task.id
                      ? 'border-primary bg-primary/5'
                      : task.status === 'completed'
                      ? 'border-success/20 bg-success/5 opacity-60'
                      : 'border-dark-600 bg-dark-800 hover:border-dark-400'
                  }`}>
                  <button
                    onClick={e => { e.stopPropagation(); completeTask(task.id); }}
                    disabled={task.status === 'completed'}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      task.status === 'completed'
                        ? 'border-success bg-success'
                        : 'border-dark-400 hover:border-primary'
                    }`}>
                    {task.status === 'completed' && <CheckCircle size={14} className="text-dark-900" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{typeIcon[task.type] || '📌'}</span>
                      <p className={`text-sm font-medium truncate ${
                        task.status === 'completed' ? 'line-through text-gray-600' : 'text-white'
                      }`}>
                        {task.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ⏱ {task.estimated_minutes || 25} min
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            {isLimitReached && (
              <div className="mt-2">
                <UpgradePrompt
                  feature={`More than ${taskLimit} tasks/day`}
                  requiredPlan="starter"
                  compact={true}
                />
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-4">

            {/* Pomodoro Timer */}
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white font-heading text-sm">
                  {selectedTask
                    ? `⏱ ${selectedTask.title.substring(0, 20)}...`
                    : '🍅 Focus Timer'
                  }
                </h3>
                <span className="text-xs text-gray-500">
                  {sessionsCount} sessions today
                </span>
              </div>

              {/* Timer Circle */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42"
                      fill="none" stroke="#222233" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42"
                      fill="none" strokeWidth="6"
                      stroke={isBreak ? '#4A9EFF' : '#00FF94'}
                      strokeDasharray={`${timerProgress * 2.64}, 264`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-heading text-white">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {isBreak ? 'break' : 'focus'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      timerRunning
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : 'bg-primary text-dark-900'
                    }`}>
                    {timerRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
                  </button>
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setTimeLeft((selectedTask?.estimated_minutes || 25) * 60);
                      setIsBreak(false);
                    }}
                    className="p-2.5 rounded-xl border border-dark-500 text-gray-400 hover:text-white transition-all">
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Task Detail */}
            <AnimatePresence>
              {selectedTask && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-dark-800 border border-primary/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{typeIcon[selectedTask.type]}</span>
                    <h3 className="font-semibold text-white font-heading text-sm">
                      {selectedTask.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                    {selectedTask.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {selectedTask.estimated_minutes} min
                    </span>
                    {selectedTask.status !== 'completed' && (
                      <button
                        onClick={() => completeTask(selectedTask.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-dark-900 font-bold rounded-lg text-xs hover:bg-opacity-90 transition-all">
                        <CheckCircle size={12} /> Done ✅
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Today's Stats */}
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 font-heading">
                Today's Progress
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Done', value: todayDone, color: 'text-primary' },
                  { label: 'Remaining', value: todayTotal - todayDone, color: 'text-warning' },
                  { label: 'Sessions', value: sessionsCount, color: 'text-calm' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-2 bg-dark-700 rounded-lg">
                    <div className={`text-xl font-bold font-heading ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
