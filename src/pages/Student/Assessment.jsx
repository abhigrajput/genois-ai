import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { generateRoadmap } from '../../lib/claude';
import useStore from '../../store/useStore';

const DOMAINS = [
  { id:'web',      label:'Web Development',   icon:'🌐' },
  { id:'aiml',     label:'AI / ML',            icon:'🤖' },
  { id:'security', label:'Cybersecurity',      icon:'🔒' },
  { id:'data',     label:'Data Science',       icon:'📊' },
  { id:'mobile',   label:'Mobile Dev',         icon:'📱' },
  { id:'cloud',    label:'Cloud / DevOps',     icon:'☁️' },
  { id:'embedded', label:'Embedded Systems',   icon:'⚙️' },
  { id:'blockchain',label:'Blockchain',        icon:'🔗' },
];

const ROLES = [
  'Frontend Developer','Backend Developer','Full Stack Developer',
  'ML Engineer','Data Analyst','Security Analyst',
  'DevOps Engineer','Mobile Developer',
];

const SKILLS = [
  'HTML/CSS','JavaScript','Python','C++','Java',
  'React','Node.js','SQL','Git','Linux',
];

const Assessment = () => {
  const navigate = useNavigate();
  const { profile } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    confidence: 5,
    has_projects: '',
    hours_per_day: 2,
    domains: [],
    target_role: '',
    dream_company: '',
    timeline: '6',
    known_skills: [],
    skill_ratings: {},
    learning_style: 'projects',
    best_time: 'evening',
    biggest_fear: '',
    one_thing: '',
  });

  const update = (field, value) => setForm(p => ({...p, [field]: value}));

  const toggleDomain = (id) => {
    setForm(p => ({
      ...p,
      domains: p.domains.includes(id)
        ? p.domains.filter(d => d !== id)
        : [...p.domains, id]
    }));
  };

  const toggleSkill = (skill) => {
    setForm(p => ({
      ...p,
      known_skills: p.known_skills.includes(skill)
        ? p.known_skills.filter(s => s !== skill)
        : [...p.known_skills, skill]
    }));
  };

  const domainMap = {
    web: 'fullstack', aiml: 'aiml', security: 'cybersecurity',
    data: 'aiml', mobile: 'android', cloud: 'devops',
    embedded: 'fullstack', blockchain: 'fullstack',
  };

  const getDefaultRoadmap = (studentProfile) => {
    const domain = studentProfile.domain_id || 'fullstack';
    const roadmaps = {
      fullstack: {
        title: 'Full Stack Developer Roadmap',
        nodes: [
          { title: 'HTML & CSS Fundamentals', description: 'Build the structure and style of web pages', skills: ['HTML', 'CSS'] },
          { title: 'JavaScript Basics', description: 'Learn programming fundamentals with JS', skills: ['JavaScript'] },
          { title: 'JavaScript Advanced', description: 'ES6+, async, promises, closures', skills: ['JavaScript', 'ES6'] },
          { title: 'React Frontend', description: 'Build interactive UIs with React', skills: ['React', 'JSX'] },
          { title: 'Node.js Backend', description: 'Server-side JavaScript with Node', skills: ['Node.js', 'Express'] },
          { title: 'Databases', description: 'SQL and NoSQL databases', skills: ['MongoDB', 'PostgreSQL'] },
          { title: 'REST APIs', description: 'Build and consume REST APIs', skills: ['API', 'REST'] },
          { title: 'Deploy Your App', description: 'Deploy to cloud platforms', skills: ['Vercel', 'AWS'] },
        ],
      },
      dsa: {
        title: 'DSA & Problem Solving Roadmap',
        nodes: [
          { title: 'Arrays & Strings', description: 'Foundation of all data structures', skills: ['Arrays'] },
          { title: 'Linked Lists', description: 'Pointer-based data structures', skills: ['LinkedList'] },
          { title: 'Stacks & Queues', description: 'Linear data structures', skills: ['Stack', 'Queue'] },
          { title: 'Trees & Binary Search', description: 'Hierarchical data structures', skills: ['Trees', 'BST'] },
          { title: 'Graphs & BFS/DFS', description: 'Network traversal algorithms', skills: ['Graphs'] },
          { title: 'Dynamic Programming', description: 'Optimization with memoization', skills: ['DP'] },
          { title: 'Sorting Algorithms', description: 'Master all sorting techniques', skills: ['Sorting'] },
          { title: 'Mock Interviews', description: 'Practice real interview problems', skills: ['Interview'] },
        ],
      },
      aiml: {
        title: 'AI/ML Engineer Roadmap',
        nodes: [
          { title: 'Python for Data Science', description: 'Python basics + data libraries', skills: ['Python'] },
          { title: 'Statistics & Math', description: 'Probability, linear algebra basics', skills: ['Statistics'] },
          { title: 'Pandas & Data Analysis', description: 'Data manipulation and analysis', skills: ['Pandas'] },
          { title: 'Machine Learning Basics', description: 'Supervised and unsupervised learning', skills: ['ML'] },
          { title: 'Scikit-learn', description: 'Build ML models with sklearn', skills: ['Scikit-learn'] },
          { title: 'Deep Learning', description: 'Neural networks with PyTorch', skills: ['PyTorch'] },
          { title: 'NLP Fundamentals', description: 'Natural language processing', skills: ['NLP'] },
          { title: 'AI Project Portfolio', description: 'Build and deploy AI projects', skills: ['MLOps'] },
        ],
      },
      cybersecurity: {
        title: 'Cybersecurity Roadmap',
        nodes: [
          { title: 'Networking Fundamentals', description: 'TCP/IP, DNS, HTTP basics', skills: ['Networking'] },
          { title: 'Linux Command Line', description: 'Essential Linux skills', skills: ['Linux'] },
          { title: 'Python for Security', description: 'Automation and scripting', skills: ['Python'] },
          { title: 'Web Security Basics', description: 'HTTP, HTTPS, cookies, sessions', skills: ['Web Security'] },
          { title: 'OWASP Top 10', description: 'Most critical web vulnerabilities', skills: ['OWASP'] },
          { title: 'Penetration Testing', description: 'Ethical hacking methodology', skills: ['PenTest'] },
          { title: 'Security Tools', description: 'Burp Suite, Nmap, Wireshark', skills: ['Tools'] },
          { title: 'CTF Challenges', description: 'Capture the flag competitions', skills: ['CTF'] },
        ],
      },
      devops: {
        title: 'DevOps Engineer Roadmap',
        nodes: [
          { title: 'Linux & Shell Scripting', description: 'Command line mastery', skills: ['Linux'] },
          { title: 'Git & Version Control', description: 'Code management with Git', skills: ['Git'] },
          { title: 'Docker & Containers', description: 'Containerize applications', skills: ['Docker'] },
          { title: 'Kubernetes Basics', description: 'Container orchestration', skills: ['Kubernetes'] },
          { title: 'AWS Core Services', description: 'EC2, S3, RDS, Lambda', skills: ['AWS'] },
          { title: 'CI/CD Pipelines', description: 'Automate build and deploy', skills: ['CI/CD'] },
          { title: 'Infrastructure as Code', description: 'Terraform and Ansible', skills: ['Terraform'] },
          { title: 'Monitoring & Logging', description: 'Grafana, Prometheus, ELK', skills: ['Monitoring'] },
        ],
      },
      android: {
        title: 'Android Developer Roadmap',
        nodes: [
          { title: 'Kotlin Fundamentals', description: 'Learn Kotlin programming', skills: ['Kotlin'] },
          { title: 'Android UI Basics', description: 'Views, layouts, XML', skills: ['Android'] },
          { title: 'Jetpack Compose', description: 'Modern declarative UI', skills: ['Compose'] },
          { title: 'Activities & Navigation', description: 'App navigation and flow', skills: ['Navigation'] },
          { title: 'Networking & APIs', description: 'Retrofit, OkHttp', skills: ['Retrofit'] },
          { title: 'Firebase Integration', description: 'Auth, Firestore, Storage', skills: ['Firebase'] },
          { title: 'Local Storage', description: 'Room database, SharedPrefs', skills: ['Room'] },
          { title: 'Publish to Play Store', description: 'Release your first app', skills: ['Play Store'] },
        ],
      },
    };
    return roadmaps[domain] || roadmaps['fullstack'];
  };

  const createRoadmap = async (studentProfile) => {
    try {
      const { data: oldRoadmaps } = await supabase
        .from('roadmaps').select('id').eq('student_id', studentProfile.id);
      if (oldRoadmaps?.length > 0) {
        const ids = oldRoadmaps.map(r => r.id);
        await supabase.from('roadmap_nodes').delete().in('roadmap_id', ids);
        await supabase.from('roadmaps').delete().eq('student_id', studentProfile.id);
      }

      toast.loading('Generating your roadmap...', { id: 'roadmap' });

      let roadmapData;
      try {
        roadmapData = await generateRoadmap(form);
      } catch (e) {
        console.error('Claude failed, using default roadmap');
        roadmapData = getDefaultRoadmap(studentProfile);
      }

      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
          student_id: studentProfile.id,
          title: roadmapData.title || `${studentProfile.target_role || 'Software Developer'} Roadmap`,
          domain: studentProfile.domain_id || 'fullstack',
          status: 'active',
          total_nodes: roadmapData.nodes?.length || 8,
        })
        .select()
        .single();

      if (roadmapError) {
        console.error('Roadmap creation error:', roadmapError);
        toast.error('Failed to create roadmap', { id: 'roadmap' });
        return;
      }

      const nodes = roadmapData.nodes || getDefaultRoadmap(studentProfile).nodes;
      const nodesToInsert = nodes.map((node, i) => ({
        roadmap_id: roadmap.id,
        title: node.title || node,
        description: node.description || `Master ${node.title || node} skills`,
        order_index: i,
        status: i === 0 ? 'unlocked' : 'locked',
        skills: node.skills || [],
        estimated_days: 7,
      }));

      const { error: nodesError } = await supabase.from('roadmap_nodes').insert(nodesToInsert);
      if (nodesError) {
        console.error('Nodes creation error:', nodesError);
        toast.error('Failed to create roadmap nodes', { id: 'roadmap' });
        return;
      }

      toast.success('Roadmap created! 🗺️', { id: 'roadmap' });
      return roadmap;
    } catch (err) {
      console.error('createRoadmap error:', err);
      toast.error('Roadmap generation failed', { id: 'roadmap' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('assessments').insert({
        student_id: profile.id,
        responses: form,
        domain: form.domains[0] || 'web',
        target_role: form.target_role,
      });
      if (error) throw error;

      const mappedDomain = domainMap[form.domains[0]] || 'fullstack';
      await createRoadmap({
        ...profile,
        domain_id: mappedDomain,
        target_role: form.target_role,
      });

      navigate('/student/roadmap');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const steps = [
    { num: 1, label: 'About You' },
    { num: 2, label: 'Interests' },
    { num: 3, label: 'Goals' },
    { num: 4, label: 'Skills' },
    { num: 5, label: 'Style' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Zap size={12} className="text-primary" />
            <span className="text-xs text-primary font-medium">Career Assessment</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">
            Let's build your personalized roadmap
          </h1>
          <p className="text-gray-400 text-sm mt-2">5 minutes. Completely honest answers only.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step === s.num
                  ? 'bg-primary text-dark-900'
                  : step > s.num
                  ? 'bg-primary/20 text-primary'
                  : 'bg-dark-700 text-gray-500'
              }`}>
                <span>{s.num}</span>
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-6 ${step > s.num ? 'bg-primary' : 'bg-dark-600'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <AnimatePresence mode="wait">

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-white font-heading">
                  Let's understand where you are 📍
                </h2>

                <div>
                  <label className="text-sm text-gray-300 mb-3 block">
                    How confident are you in coding right now?
                    <span className="text-primary ml-2 font-semibold">{form.confidence}/10</span>
                  </label>
                  <input type="range" min="1" max="10" value={form.confidence}
                    onChange={e => update('confidence', parseInt(e.target.value))}
                    className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Complete beginner</span>
                    <span>Pretty confident</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-3 block">
                    Have you built any projects before?
                  </label>
                  <div className="flex gap-3">
                    {['Yes','No','Started but not finished'].map(opt => (
                      <button key={opt} onClick={() => update('has_projects', opt)}
                        className={`flex-1 py-2.5 text-xs rounded-lg border transition-all ${
                          form.has_projects === opt
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-500 text-gray-400 hover:border-dark-400'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Hours you can realistically give per day
                    <span className="text-primary ml-2 font-semibold">{form.hours_per_day}h</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-3">Be honest. 2 real hours beats 8 fake hours.</p>
                  <input type="range" min="1" max="8" value={form.hours_per_day}
                    onChange={e => update('hours_per_day', parseInt(e.target.value))}
                    className="w-full accent-primary" />
                </div>

                <button onClick={() => setStep(2)} disabled={!form.has_projects}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-dark-900 font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 text-sm">
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-white font-heading">
                  What excites you? 🚀
                </h2>
                <p className="text-xs text-gray-500 -mt-4">Don't know yet? Pick what sounds interesting. We'll figure it out together.</p>

                <div className="grid grid-cols-2 gap-3">
                  {DOMAINS.map(d => (
                    <button key={d.id} onClick={() => toggleDomain(d.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        form.domains.includes(d.id)
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-dark-500 text-gray-400 hover:border-dark-400'
                      }`}>
                      <span className="text-xl">{d.icon}</span>
                      <span className="text-xs font-medium">{d.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex items-center gap-1 px-4 py-3 border border-dark-500 text-gray-400 rounded-xl hover:border-gray-400 transition-all text-sm">
                    <ArrowLeft size={14} />
                  </button>
                  <button onClick={() => setStep(3)} disabled={form.domains.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-dark-900 font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 text-sm">
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div key="step3"
                initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="flex flex-col gap-5">
                <h2 className="text-lg font-semibold text-white font-heading">
                  Where do you want to go? 🎯
                </h2>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Target Role</label>
                  <select value={form.target_role} onChange={e => update('target_role', e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-primary transition-colors">
                    <option value="">Select a role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Dream Company
                    <span className="text-gray-600 ml-1">(optional)</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Even if it feels impossible right now</p>
                  <input placeholder="e.g. Google, Razorpay, any startup..." value={form.dream_company}
                    onChange={e => update('dream_company', e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-3 block">Timeline to get a job</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['3','6','9','12'].map(t => (
                      <button key={t} onClick={() => update('timeline', t)}
                        className={`py-2.5 text-xs rounded-lg border transition-all ${
                          form.timeline === t
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-500 text-gray-400 hover:border-dark-400'
                        }`}>
                        {t} months
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    What's your biggest fear about placements?
                    <span className="text-gray-600 ml-1">(optional)</span>
                  </label>
                  <textarea placeholder="Be honest — this helps us build the right system for you"
                    value={form.biggest_fear} onChange={e => update('biggest_fear', e.target.value)}
                    rows={2}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)}
                    className="flex items-center gap-1 px-4 py-3 border border-dark-500 text-gray-400 rounded-xl hover:border-gray-400 transition-all text-sm">
                    <ArrowLeft size={14} />
                  </button>
                  <button onClick={() => setStep(4)} disabled={!form.target_role}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-dark-900 font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 text-sm">
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <motion.div key="step4"
                initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-white font-heading">
                  What do you already know? 🧠
                </h2>
                <p className="text-xs text-gray-500 -mt-4">Be honest here. We calibrate tasks to YOUR level, not IIT level.</p>

                <div className="grid grid-cols-2 gap-2">
                  {SKILLS.map(skill => (
                    <button key={skill} onClick={() => toggleSkill(skill)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        form.known_skills.includes(skill)
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-dark-500 text-gray-400 hover:border-dark-400'
                      }`}>
                      <span className="text-xs font-medium">{skill}</span>
                      {form.known_skills.includes(skill) && (
                        <span className="text-primary text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)}
                    className="flex items-center gap-1 px-4 py-3 border border-dark-500 text-gray-400 rounded-xl hover:border-gray-400 transition-all text-sm">
                    <ArrowLeft size={14} />
                  </button>
                  <button onClick={() => setStep(5)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-dark-900 font-bold rounded-xl hover:bg-opacity-90 transition-all text-sm">
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <motion.div key="step5"
                initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                className="flex flex-col gap-5">
                <h2 className="text-lg font-semibold text-white font-heading">
                  How do you learn best? ⚡
                </h2>

                <div>
                  <label className="text-sm text-gray-300 mb-3 block">Preferred learning style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {id:'videos',   label:'📹 Videos'},
                      {id:'reading',  label:'📖 Reading'},
                      {id:'projects', label:'💻 Building'},
                    ].map(s => (
                      <button key={s.id} onClick={() => update('learning_style', s.id)}
                        className={`py-3 text-xs rounded-lg border transition-all ${
                          form.learning_style === s.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-500 text-gray-400 hover:border-dark-400'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-3 block">Best time to study</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {id:'morning',   label:'🌅 Morning'},
                      {id:'afternoon', label:'☀️ Afternoon'},
                      {id:'evening',   label:'🌆 Evening'},
                      {id:'night',     label:'🌙 2AM 😅'},
                    ].map(t => (
                      <button key={t.id} onClick={() => update('best_time', t.id)}
                        className={`py-2.5 text-xs rounded-lg border transition-all ${
                          form.best_time === t.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-500 text-gray-400 hover:border-dark-400'
                        }`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    One thing you wish someone told you about coding
                    <span className="text-gray-600 ml-1">(optional)</span>
                  </label>
                  <textarea placeholder="Your honest answer..."
                    value={form.one_thing} onChange={e => update('one_thing', e.target.value)}
                    rows={2}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(4)}
                    className="flex items-center gap-1 px-4 py-3 border border-dark-500 text-gray-400 rounded-xl hover:border-gray-400 transition-all text-sm">
                    <ArrowLeft size={14} />
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-dark-900 font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 text-sm">
                    {loading
                      ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                      : <span>Generate My Roadmap 🚀</span>
                    }
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
