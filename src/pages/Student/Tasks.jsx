import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Zap,
         Play, RotateCcw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { profile } = useStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [taskStartTimes, setTaskStartTimes] = useState({});
  const [activeNode, setActiveNode] = useState(null);

  useEffect(() => {
    if (profile?.id) {
      fetchTasks();
      fetchActiveNode();
    }
  }, [profile?.id, activeTab]);

  const fetchActiveNode = async () => {
    try {
      const { data: rms } = await supabase
        .from('roadmaps').select('id')
        .eq('student_id', profile.id).limit(1);
      if (!rms?.length) return;

      const { data: nodes } = await supabase
        .from('roadmap_nodes').select('*')
        .eq('roadmap_id', rms[0].id)
        .neq('status', 'locked')
        .order('order_index', { ascending: true })
        .limit(1);

      if (nodes?.length) {
        setActiveNode(nodes[0]);
      } else {
        const { data: first } = await supabase
          .from('roadmap_nodes').select('*')
          .eq('roadmap_id', rms[0].id)
          .order('order_index', { ascending: true })
          .limit(1);
        if (first?.length) setActiveNode(first[0]);
      }
    } catch(e) { console.error(e); }
  };

  const fetchTasks = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tasks').select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) { setTasks([]); setLoading(false); return; }

      const all = data || [];
      if (activeTab === 'today') {
        setTasks(all.filter(t => !t.due_date || t.due_date === today));
      } else {
        setTasks(all);
      }
    } catch(e) { setTasks([]); }
    setLoading(false);
  };

  const handleGenerateTasks = async () => {
    if (!profile?.id) return;
    setGenerating(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('tasks').select('id')
        .eq('student_id', profile.id)
        .eq('due_date', today);

      if (existing && existing.length > 0) {
        toast('Tasks already generated for today! ✅');
        setGenerating(false);
        fetchTasks();
        return;
      }

      if (!activeNode) {
        toast.error('Generate your roadmap first in Domain Explorer!');
        setGenerating(false);
        return;
      }

      const studyHours = profile?.study_hours_per_day || 2;
      const taskCount = studyHours <= 1 ? 1
        : studyHours === 2 ? 2
        : studyHours === 3 ? 3 : 4;

      const allTemplates = [
        {
          title: `🎥 Watch: ${activeNode.title}`,
          description: `Watch the YouTube video for ${activeNode.title}. Take notes. Understand core concepts before moving to practice.`,
          type: 'reading',
          estimated_minutes: 60,
        },
        {
          title: `💻 Code: Practice ${activeNode.title}`,
          description: `Write code implementing ${activeNode.title} concepts. Start small, build working examples.`,
          type: 'coding',
          estimated_minutes: 45,
        },
        {
          title: `🔨 Build: ${activeNode.mini_project || activeNode.title + ' project'}`,
          description: `Apply ${activeNode.title} by building: ${activeNode.mini_project || 'a small working project from scratch'}`,
          type: 'practice',
          estimated_minutes: 60,
        },
        {
          title: `📝 Revise: ${activeNode.title} concepts`,
          description: `Review your notes on ${activeNode.title}. Test yourself. Write key concepts from memory.`,
          type: 'reading',
          estimated_minutes: 20,
        },
      ];

      const tasksToCreate = allTemplates.slice(0, taskCount);

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(
          tasksToCreate.map(t => ({
            student_id: profile.id,
            node_id: activeNode.id,
            title: t.title,
            description: t.description,
            type: t.type,
            estimated_minutes: t.estimated_minutes,
            status: 'pending',
            due_date: today,
            created_at: new Date().toISOString(),
          }))
        );

      if (insertError) {
        toast.error('Error: ' + insertError.message);
      } else {
        toast.success(`${tasksToCreate.length} tasks ready! 🎯`);
        fetchTasks();
      }
    } catch(e) {
      console.error(e);
      toast.error('Failed to generate tasks');
    }
    setGenerating(false);
  };

  const startTask = (taskId) => {
    if (!taskStartTimes[taskId]) {
      setTaskStartTimes(prev => ({ ...prev, [taskId]: Date.now() }));
      toast('Timer started! Work for at least 3 minutes ⏱️', { duration: 2000 });
    }
  };

  const completeTask = async (taskId) => {
    const startTime = taskStartTimes[taskId];
    const minMs = 3 * 60 * 1000;

    if (startTime && (Date.now() - startTime) < minMs) {
      const remaining = Math.ceil((minMs - (Date.now() - startTime)) / 1000);
      toast.error(`Work ${remaining}s more before completing!`);
      return;
    }

    const timeSpent = startTime
      ? Math.round((Date.now() - startTime) / 60000) : 25;

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        time_spent_minutes: timeSpent,
      })
      .eq('id', taskId);

    if (!error) {
      toast.success('Task completed! +8 points 🎯');
      await supabase.from('profiles').update({
        skill_score: Math.min(1000, (profile.skill_score||0) + 8),
      }).eq('id', profile.id);
      fetchTasks();
    }
  };

  const typeConfig = {
    reading: { color:'#4A9EFF', bg:'rgba(74,158,255,0.08)', icon:'📖', label:'Study' },
    coding:  { color:'#00FF94', bg:'rgba(0,255,148,0.08)',  icon:'💻', label:'Code' },
    practice:{ color:'#7B61FF', bg:'rgba(123,97,255,0.08)', icon:'🔨', label:'Build' },
  };

  const todayStr = new Date().toLocaleDateString('en-IN',
    { weekday:'long', month:'long', day:'numeric' });
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white"
              style={{ textShadow:'0 0 15px rgba(0,255,148,0.3)' }}>
              ⚡ Daily Tasks
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{todayStr}</p>
          </div>
          <button
            onClick={handleGenerateTasks}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{
              background: generating
                ? 'rgba(0,255,148,0.05)'
                : 'linear-gradient(135deg,#00FF94,#7B61FF)',
              color: '#050508',
              boxShadow: generating ? 'none' : '0 0 15px rgba(0,255,148,0.3)',
            }}>
            {generating ? (
              <>
                <div className="w-3 h-3 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"/>
                Generating...
              </>
            ) : (
              <><Zap size={14}/> Generate Today's Tasks</>
            )}
          </button>
        </div>

        {/* Active node info */}
        {activeNode && (
          <div className="p-3 rounded-xl mb-4"
            style={{ background:'rgba(0,255,148,0.05)', border:'1px solid rgba(0,255,148,0.12)' }}>
            <p className="text-xs text-gray-400">
              📍 Currently on:
              <span className="text-primary font-semibold ml-1">
                Day {activeNode.day_number || activeNode.order_index+1}: {activeNode.title}
              </span>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id:'today', label:'Today' },
            { id:'all', label:'All Tasks' },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={activeTab===tab.id
                ? { background:'#00FF94', color:'#050508' }
                : { background:'rgba(18,18,26,0.8)', color:'#666', border:'1px solid rgba(34,34,51,0.5)' }
              }>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Progress */}
        {totalCount > 0 && activeTab === 'today' && (
          <div className="p-3 rounded-xl mb-4"
            style={{ background:'rgba(18,18,26,0.8)', border:'1px solid rgba(34,34,51,0.6)' }}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500">Today's Progress</span>
              <span style={{ color:'#00FF94' }}>{completedCount}/{totalCount} done</span>
            </div>
            <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width:0 }}
                animate={{ width:`${totalCount > 0 ? (completedCount/totalCount)*100 : 0}%` }}
                transition={{ duration:1 }}
                className="h-full rounded-full"
                style={{ background:'linear-gradient(90deg,#00FF94,#7B61FF)' }}
              />
            </div>
          </div>
        )}

        {/* Tasks list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-dark-700 rounded-2xl animate-pulse"/>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-bold text-white font-heading mb-2">
              No tasks yet
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {activeNode
                ? 'Click Generate to get your tasks for today'
                : 'Choose your domain first to get tasks'}
            </p>
            {!activeNode ? (
              <a href="/explore-domains"
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-dark-900"
                style={{ background:'#00FF94' }}>
                Choose Domain →
              </a>
            ) : (
              <button onClick={handleGenerateTasks} disabled={generating}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-dark-900 disabled:opacity-50"
                style={{ background:'#00FF94', boxShadow:'0 0 15px rgba(0,255,148,0.3)' }}>
                Generate Tasks ⚡
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => {
              const tc = typeConfig[task.type] || typeConfig['reading'];
              const isStarted = !!taskStartTimes[task.id];
              const isDone = task.status === 'completed';
              return (
                <motion.div key={task.id}
                  initial={{ opacity:0, y:8 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.05 }}
                  className="p-4 rounded-2xl transition-all"
                  style={{
                    background: isDone
                      ? 'rgba(0,255,148,0.04)'
                      : 'rgba(10,10,18,0.9)',
                    border: isDone
                      ? '1px solid rgba(0,255,148,0.2)'
                      : '1px solid rgba(34,34,51,0.6)',
                    opacity: isDone ? 0.7 : 1,
                  }}>
                  <div className="flex items-start gap-3">

                    {/* Type icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background:tc.bg, border:`1px solid ${tc.color}20` }}>
                      {tc.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`text-sm font-semibold leading-tight ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                        {isDone && (
                          <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5"/>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background:tc.bg, color:tc.color }}>
                          {tc.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock size={10}/>
                          {task.estimated_minutes} min
                        </span>
                        {isStarted && !isDone && (
                          <span className="text-xs text-warning flex items-center gap-1">
                            ⏱️ Timer running
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      {!isDone && (
                        <div className="flex gap-2 mt-3">
                          {!isStarted ? (
                            <button onClick={() => startTask(task.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={{ background:'rgba(74,158,255,0.1)', color:'#4A9EFF', border:'1px solid rgba(74,158,255,0.25)' }}>
                              <Play size={11}/> Start Task
                            </button>
                          ) : (
                            <button onClick={() => completeTask(task.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={{ background:'rgba(0,255,148,0.12)', color:'#00FF94', border:'1px solid rgba(0,255,148,0.3)', boxShadow:'0 0 10px rgba(0,255,148,0.15)' }}>
                              <CheckCircle size={11}/> Mark Complete
                            </button>
                          )}
                        </div>
                      )}

                      {isDone && task.time_spent_minutes > 0 && (
                        <p className="text-xs text-gray-600 mt-2">
                          ✅ Completed in {task.time_spent_minutes} minutes
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Score info */}
        {tasks.length > 0 && (
          <div className="mt-4 p-3 rounded-xl text-center"
            style={{ background:'rgba(18,18,26,0.5)', border:'1px solid rgba(34,34,51,0.4)' }}>
            <p className="text-xs text-gray-500">
              Each completed task gives <span className="text-primary font-bold">+8 Genois Score</span>
              {' '} · Start task first · Minimum 3 minutes required
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Tasks;
