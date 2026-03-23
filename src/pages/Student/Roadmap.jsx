import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, BookOpen, Code, FileText,
         Zap, Clock, ChevronRight, X, ExternalLink } from 'lucide-react';
import LearningDay from '../../components/LearningDay';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { generateRoadmap } from '../../lib/claude';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const typeIcon = {
  topic:   <BookOpen size={14} />,
  project: <Code size={14} />,
  test:    <FileText size={14} />,
};

const typeColor = {
  topic:   'text-calm',
  project: 'text-secondary',
  test:    'text-warning',
};

const Roadmap = () => {
  const { profile } = useStore();
  const [roadmap, setRoadmap] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    if (profile?.id) fetchRoadmap();
  }, [profile]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const { data: roadmaps, error: rmError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('student_id', profile.id)
        .limit(1);

      if (rmError) {
        console.error('Roadmap fetch error:', rmError);
        setLoading(false);
        return;
      }

      if (!roadmaps || roadmaps.length === 0) {
        // Check if assessment exists for "take assessment" CTA
        const { data: assessData } = await supabase
          .from('assessments').select('id').eq('student_id', profile.id).limit(1);
        setAssessment(assessData && assessData.length > 0 ? assessData[0] : null);
        setNodes([]);
        setLoading(false);
        return;
      }

      const { data: nodeData, error: nodeError } = await supabase
        .from('roadmap_nodes')
        .select('*')
        .eq('roadmap_id', roadmaps[0].id)
        .order('order_index', { ascending: true });

      if (nodeError) {
        console.error('Nodes fetch error:', nodeError);
        setLoading(false);
        return;
      }

      setRoadmap(roadmaps[0]);
      setNodes(nodeData || []);
    } catch (err) {
      console.error('fetchRoadmap error:', err);
    }
    setLoading(false);
  };

  const generateDefaultRoadmap = async () => {
    setLoading(true);
    toast.loading('Generating roadmap...', { id: 'rm' });

    const domain = profile?.domain_id || 'fullstack';

    const nodesWithResources = [
      {
        title: 'HTML & CSS Fundamentals',
        description: 'Build web page structure and styling',
        skills: ['HTML5', 'CSS3', 'Flexbox'],
        resources: [
          { title: 'HTML Full Course - freeCodeCamp YouTube', url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg', type: 'video', duration: '2 hours' },
          { title: 'CSS Full Course - freeCodeCamp YouTube', url: 'https://www.youtube.com/watch?v=OXGznpKZ_sA', type: 'video', duration: '2 hours' },
          { title: 'MDN HTML Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'docs', duration: '1 hour' },
          { title: 'CSS Flexbox Froggy Practice', url: 'https://flexboxfroggy.com', type: 'practice', duration: '1 hour' },
        ],
        mini_project: 'Build a personal portfolio page with HTML and CSS',
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn variables, functions, DOM manipulation',
        skills: ['JavaScript', 'DOM', 'ES6'],
        resources: [
          { title: 'JavaScript Full Course - freeCodeCamp YouTube', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', type: 'video', duration: '3 hours' },
          { title: 'JavaScript.info Modern Tutorial', url: 'https://javascript.info', type: 'article', duration: '4 hours' },
          { title: 'JavaScript 30 Projects - Wes Bos', url: 'https://javascript30.com', type: 'practice', duration: '10 hours' },
          { title: 'JS DOM Manipulation - Traversy YouTube', url: 'https://www.youtube.com/watch?v=0ik6X4DJKCc', type: 'video', duration: '1 hour' },
        ],
        mini_project: 'Build an interactive To-Do list with localStorage',
      },
      {
        title: 'JavaScript Advanced',
        description: 'Closures, promises, async/await, ES6+',
        skills: ['Promises', 'Async/Await', 'Closures'],
        resources: [
          { title: 'Async JavaScript - Traversy YouTube', url: 'https://www.youtube.com/watch?v=PoRJizFvM7s', type: 'video', duration: '1 hour' },
          { title: 'JavaScript: The Hard Parts - YouTube', url: 'https://www.youtube.com/watch?v=aAIqVrcYim4', type: 'video', duration: '2 hours' },
          { title: 'ES6 Guide - GeeksForGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-es6/', type: 'article', duration: '2 hours' },
          { title: 'Async Await - javascript.info', url: 'https://javascript.info/async-await', type: 'practice', duration: '1 hour' },
        ],
        mini_project: 'Build a weather app using fetch API',
      },
      {
        title: 'React Frontend',
        description: 'Build UIs with React hooks and components',
        skills: ['React', 'Hooks', 'State Management'],
        resources: [
          { title: 'React Full Course 2024 - freeCodeCamp YouTube', url: 'https://www.youtube.com/watch?v=CgkZ7MvWUAA', type: 'video', duration: '4 hours' },
          { title: 'React Official Docs - react.dev', url: 'https://react.dev/learn', type: 'docs', duration: '3 hours' },
          { title: 'React Hooks - Codevolution YouTube', url: 'https://www.youtube.com/watch?v=cF2lQ_gZeA8', type: 'video', duration: '2 hours' },
          { title: 'Build 5 React Projects YouTube', url: 'https://www.youtube.com/watch?v=a_7Z7C_JCyo', type: 'practice', duration: '5 hours' },
        ],
        mini_project: 'Build a GitHub profile finder with React',
      },
      {
        title: 'Node.js & Express Backend',
        description: 'Build REST APIs with Node.js and Express',
        skills: ['Node.js', 'Express', 'REST API'],
        resources: [
          { title: 'Node.js Crash Course - Traversy YouTube', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', type: 'video', duration: '1.5 hours' },
          { title: 'Express.js Crash Course YouTube', url: 'https://www.youtube.com/watch?v=SccSCuHhOw0', type: 'video', duration: '1 hour' },
          { title: 'REST API with Node - freeCodeCamp YouTube', url: 'https://www.youtube.com/watch?v=l8WPWK9mS5M', type: 'video', duration: '2 hours' },
          { title: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs', type: 'docs', duration: '2 hours' },
        ],
        mini_project: 'Build a REST API for notes with CRUD operations',
      },
      {
        title: 'Databases - SQL & MongoDB',
        description: 'Master PostgreSQL and MongoDB for data storage',
        skills: ['PostgreSQL', 'MongoDB', 'SQL'],
        resources: [
          { title: 'SQL Full Course - freeCodeCamp YouTube', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'video', duration: '4 hours' },
          { title: 'MongoDB Crash Course - Traversy YouTube', url: 'https://www.youtube.com/watch?v=-56x56UppqQ', type: 'video', duration: '1.5 hours' },
          { title: 'SQL Practice - HackerRank', url: 'https://www.hackerrank.com/domains/sql', type: 'practice', duration: '5 hours' },
          { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com', type: 'docs', duration: '2 hours' },
        ],
        mini_project: 'Build a student management system with PostgreSQL',
      },
      {
        title: 'Authentication & Security',
        description: 'JWT auth, OAuth, and web security basics',
        skills: ['JWT', 'OAuth', 'Security'],
        resources: [
          { title: 'JWT Auth Tutorial - Traversy YouTube', url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4', type: 'video', duration: '1 hour' },
          { title: 'Node Auth - freeCodeCamp YouTube', url: 'https://www.youtube.com/watch?v=Ud5xKCYQTjM', type: 'video', duration: '2 hours' },
          { title: 'OWASP Top 10 Guide', url: 'https://owasp.org/www-project-top-ten/', type: 'article', duration: '1 hour' },
          { title: 'Web Security - web.dev', url: 'https://web.dev/secure/', type: 'docs', duration: '1 hour' },
        ],
        mini_project: 'Add JWT login/register to your REST API',
      },
      {
        title: 'Deploy Full Stack App',
        description: 'Deploy frontend + backend + database to cloud',
        skills: ['Vercel', 'Railway', 'Docker'],
        resources: [
          { title: 'Deploy Node.js - Railway YouTube', url: 'https://www.youtube.com/watch?v=MusIvEKjqsc', type: 'video', duration: '30 min' },
          { title: 'Vercel Deployment Docs', url: 'https://vercel.com/docs', type: 'docs', duration: '1 hour' },
          { title: 'Docker for Beginners - freeCodeCamp YouTube', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', type: 'video', duration: '2 hours' },
          { title: 'GitHub Actions Tutorial YouTube', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', type: 'video', duration: '1 hour' },
        ],
        mini_project: 'Deploy your full stack app with custom domain',
      },
    ];

    const nodesToInsert = nodesWithResources.map((node, i) => ({
      roadmap_id: null, // filled after roadmap created
      title: node.title,
      description: node.description,
      order_index: i,
      status: i === 0 ? 'unlocked' : 'locked',
      skills: node.skills,
      resources: node.resources,
      mini_project: node.mini_project,
      estimated_days: 7,
    }));

    try {
      const { data: roadmap } = await supabase
        .from('roadmaps')
        .insert({
          student_id: profile.id,
          title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Roadmap`,
          domain,
          status: 'active',
          total_nodes: nodesToInsert.length,
        })
        .select().single();

      if (roadmap) {
        await supabase.from('roadmap_nodes').insert(
          nodesToInsert.map(n => ({ ...n, roadmap_id: roadmap.id }))
        );
        toast.success('Roadmap generated! 🗺️', { id: 'rm' });
        fetchRoadmap();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate', { id: 'rm' });
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!assessment) {
      toast.error('Please complete your career assessment first!');
      return;
    }
    setGenerating(true);
    try {
      toast.loading('AI is building your personalized roadmap...', { id: 'generating' });
      const aiRoadmap = await generateRoadmap(assessment.responses);

      const { data: roadmapRow, error: rErr } = await supabase
        .from('roadmaps')
        .insert({
          student_id: profile.id,
          title: aiRoadmap.title,
          domain: aiRoadmap.domain,
          target_role: aiRoadmap.target_role,
          duration_weeks: aiRoadmap.duration_weeks,
          status: 'active',
        })
        .select()
        .single();

      if (rErr) throw rErr;

      const nodesToInsert = aiRoadmap.nodes.map((n, i) => ({
        roadmap_id: roadmapRow.id,
        title: n.title,
        type: n.type,
        description: n.description,
        week_number: n.week_number,
        order_index: i,
        status: i === 0 ? 'unlocked' : 'locked',
        resources: n.resources,
        skills: n.skills,
      }));

      await supabase.from('roadmap_nodes').insert(nodesToInsert);

      toast.success(aiRoadmap.encouragement || 'Your roadmap is ready!', { id: 'generating' });
      fetchRoadmap();
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate roadmap. Try again.', { id: 'generating' });
    }
    setGenerating(false);
  };

  const completeNode = async (nodeId) => {
    const idx = nodes.findIndex(n => n.id === nodeId);
    await supabase.from('roadmap_nodes')
      .update({ status: 'completed' })
      .eq('id', nodeId);

    if (nodes[idx + 1]) {
      await supabase.from('roadmap_nodes')
        .update({ status: 'unlocked' })
        .eq('id', nodes[idx + 1].id);
    }

    toast.success('Node completed! Next one unlocked 🔓');
    setSelectedNode(null);
    fetchRoadmap();
  };

  const completed = nodes.filter(n => n.status === 'completed').length;
  const progress = nodes.length > 0 ? (completed / nodes.length) * 100 : 0;

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-primary rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-white">
            Your Roadmap 🗺️
          </h1>
          {roadmap && (
            <p className="text-gray-400 text-sm mt-1">
              {roadmap.title} · {roadmap.duration_weeks} weeks · {roadmap.target_role}
            </p>
          )}
        </div>

        {/* No Roadmap / Empty State */}
        {(!roadmap || nodes.length === 0) && !loading && (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="text-lg font-bold text-white font-heading mb-2">
              No roadmap yet
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Complete your career assessment to generate your personalized roadmap,
              or quick-generate a default one based on your domain.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/student/assessment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all">
                Take Assessment →
              </a>
              <button onClick={generateDefaultRoadmap} disabled={generating || loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-dark-700 border border-dark-500 text-white font-bold rounded-xl text-sm hover:border-primary transition-all disabled:opacity-60">
                {generating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <>Quick Generate 🚀</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {roadmap && nodes.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-primary font-semibold">
                {completed}/{nodes.length} nodes complete
              </span>
            </div>
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        )}

        {/* Skill Tree */}
        {nodes.length > 0 && (
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-dark-600" />

            <div className="flex flex-col gap-3">
              {nodes.map((node, i) => (
                <motion.div key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative ml-12 rounded-xl border p-4 transition-all cursor-pointer
                    ${node.status === 'completed'
                      ? 'border-success/30 bg-success/5'
                      : node.status === 'unlocked'
                      ? 'border-primary/50 bg-primary/5 hover:border-primary shadow-lg shadow-primary/5'
                      : 'border-dark-600 bg-dark-800 opacity-60 cursor-not-allowed'
                    }`}
                  onClick={() => node.status !== 'locked' && setSelectedNode(node)}
                >
                  {/* Node indicator on line */}
                  <div className={`absolute -left-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${node.status === 'completed'
                      ? 'border-success bg-success/20'
                      : node.status === 'unlocked'
                      ? 'border-primary bg-primary/20 animate-pulse'
                      : 'border-dark-500 bg-dark-800'
                    }`}>
                    {node.status === 'completed'
                      ? <CheckCircle size={10} className="text-success" />
                      : node.status === 'locked'
                      ? <Lock size={8} className="text-gray-600" />
                      : <div className="w-2 h-2 rounded-full bg-primary" />
                    }
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={typeColor[node.type]}>
                          {typeIcon[node.type]}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{node.type}</span>
                        <span className="text-xs text-gray-600">· Week {node.week_number}</span>
                      </div>
                      <h3 className={`text-sm font-semibold font-heading ${
                        node.status === 'locked' ? 'text-gray-600' : 'text-white'
                      }`}>
                        {node.title}
                      </h3>
                      {node.status !== 'locked' && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {node.description}
                        </p>
                      )}
                    </div>
                    {node.status === 'unlocked' && (
                      <ChevronRight size={16} className="text-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Node Detail Drawer */}
        <AnimatePresence>
          {selectedNode && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedNode(null)}
                className="fixed inset-0 bg-black/60 z-40" />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-800 border-l border-dark-600 z-50 overflow-y-auto">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={typeColor[selectedNode.type]}>
                        {typeIcon[selectedNode.type]}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{selectedNode.type}</span>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-white font-heading mb-2">
                    {selectedNode.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">{selectedNode.description}</p>

                  {selectedNode && selectedNode.status !== 'locked' && (
                    <LearningDay
                      node={selectedNode}
                      onComplete={async (completedNode) => {
                        const nextNode = nodes.find(n =>
                          n.order_index === completedNode.order_index + 1
                        );
                        if (nextNode) {
                          await supabase.from('roadmap_nodes')
                            .update({ status: 'unlocked' })
                            .eq('id', nextNode.id);
                          toast.success(`${nextNode.title} unlocked!`);
                          fetchRoadmap();
                        }
                      }}
                      onScoreUpdate={(points) => {
                        toast.success(`+${points} points!`, { duration: 1500 });
                      }}
                    />
                  )}

                  {selectedNode && selectedNode.status === 'locked' && (
                    <div className="mt-4 p-4 rounded-xl text-center"
                      style={{ background: 'rgba(34,34,51,0.5)', border: '1px solid rgba(34,34,51,0.8)' }}>
                      <div className="text-2xl mb-2">🔒</div>
                      <p className="text-sm font-semibold text-white mb-1">Day Locked</p>
                      <p className="text-xs text-gray-500">
                        Complete the previous day to unlock.
                      </p>
                    </div>
                  )}

                  {selectedNode.skills?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Skills you'll gain:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.skills.map(s => (
                          <span key={s} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedNode?.resources?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        📚 Learning Resources
                      </h4>
                      <div className="space-y-2">
                        {selectedNode.resources.map((res, i) => {
                          const typeColors = {
                            video:    { bg: 'rgba(255,107,107,0.1)', color: '#FF6B6B', icon: '🎥' },
                            article:  { bg: 'rgba(74,158,255,0.1)',  color: '#4A9EFF', icon: '📖' },
                            docs:     { bg: 'rgba(123,97,255,0.1)',  color: '#7B61FF', icon: '📄' },
                            practice: { bg: 'rgba(0,255,148,0.1)',   color: '#00FF94', icon: '💻' },
                          };
                          const t = typeColors[res.type] || typeColors['article'];
                          return (
                            <a key={i} href={res.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-90"
                              style={{ background: t.bg, border: `1px solid ${t.color}25` }}>
                              <span className="text-lg flex-shrink-0">{t.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{res.title}</p>
                                <p className="text-xs mt-0.5" style={{ color: t.color }}>
                                  {res.type} · {res.duration}
                                </p>
                              </div>
                              <span className="text-gray-500 text-xs flex-shrink-0">↗</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedNode?.mini_project && (
                    <div className="mb-4 p-3 rounded-xl"
                      style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.2)' }}>
                      <p className="text-xs font-bold text-warning mb-1">🔨 Mini Project</p>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {selectedNode.mini_project}
                      </p>
                    </div>
                  )}

                  {selectedNode.status === 'unlocked' && (
                    <button onClick={() => completeNode(selectedNode.id)}
                      className="w-full py-3 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Mark as Complete
                    </button>
                  )}

                  {selectedNode.status === 'completed' && (
                    <div className="w-full py-3 bg-success/20 text-success font-semibold rounded-xl text-sm text-center">
                      ✅ Completed
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
