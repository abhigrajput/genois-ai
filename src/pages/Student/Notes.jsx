import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, Code, Search,
         Trash2, Save, X, BookOpen,
         Library } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const TOPICS = ['All', 'DSA', 'Web Dev', 'React', 'Node.js', 'Python', 'Database', 'System Design', 'Algorithms', 'Other'];

const DOMAIN_STUDY_NOTES = {
  fullstack: [
    {
      title: 'How the Web Works',
      theory: 'Browser sends HTTP request → Server responds with HTML/CSS/JS → Browser renders.\n\nHTTP is stateless. HTTPS = HTTP + SSL.\nStatus codes: 200 OK | 404 Not Found | 500 Error\n\nDNS resolves domain → IP address → TCP connection → Request → Response',
      code: 'fetch("https://api.example.com/users")\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// Modern async/await\nconst getUsers = async () => {\n  try {\n    const res = await fetch("/api/users");\n    const data = await res.json();\n    return data;\n  } catch (e) {\n    console.error(e);\n  }\n};',
      language: 'javascript', topic: 'Web Dev', pinned: true,
    },
    {
      title: 'JavaScript: var vs let vs const',
      theory: 'const = cannot reassign (use by default)\nlet = can reassign, block-scoped\nvar = function-scoped, hoisted (avoid!)\n\nconst object properties CAN be changed.\nconst array items CAN be pushed.\nOnly the binding is constant, not the value.',
      code: 'const API = "https://api.example.com";\nlet score = 0;\nscore = 10; // OK\n\nconst user = { name: "Abhi" };\nuser.name = "Abhishek"; // OK!\n// user = {}; // ERROR\n\nconst arr = [1, 2, 3];\narr.push(4); // OK!\n// arr = []; // ERROR',
      language: 'javascript', topic: 'Web Dev', pinned: true,
    },
    {
      title: 'React useState Hook',
      theory: 'useState lets components remember values between renders.\n\nRules:\n1. Only call at top level (not in loops)\n2. Setter is async — old value in same render\n3. Never mutate state directly\n4. Use functional update for prev state',
      code: 'import { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  );\n}\n\n// Object state\nconst [form, setForm] = useState({ name: "", email: "" });\n\nconst update = (field, value) => {\n  setForm(prev => ({ ...prev, [field]: value }));\n};',
      language: 'javascript', topic: 'React', pinned: false,
    },
    {
      title: 'REST API: CRUD with Express',
      theory: 'REST uses HTTP methods for CRUD:\nGET = Read (no body)\nPOST = Create (has body)\nPUT = Update (replace whole resource)\nPATCH = Update (partial)\nDELETE = Remove\n\nAlways return proper status codes.',
      code: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nlet todos = [];\n\napp.get("/todos", (req, res) => {\n  res.json(todos);\n});\n\napp.post("/todos", (req, res) => {\n  const todo = { id: Date.now(), ...req.body };\n  todos.push(todo);\n  res.status(201).json(todo);\n});\n\napp.delete("/todos/:id", (req, res) => {\n  todos = todos.filter(t => t.id != req.params.id);\n  res.json({ message: "Deleted" });\n});',
      language: 'javascript', topic: 'Node.js', pinned: false,
    },
    {
      title: 'SQL: Essential Queries',
      theory: 'SQL = Structured Query Language\nRelational DB stores data in tables.\n\nCRUD in SQL:\nSELECT = Read\nINSERT = Create\nUPDATE = Modify\nDELETE = Remove\n\nJOINs combine tables. Indexes speed up queries.',
      code: '-- Select with filter\nSELECT name, email FROM users WHERE active = true;\n\n-- Insert\nINSERT INTO users (name, email) VALUES ("Abhi", "a@b.com");\n\n-- Update\nUPDATE users SET score = 500 WHERE id = 1;\n\n-- Join\nSELECT u.name, p.score\nFROM users u\nJOIN profiles p ON u.id = p.user_id\nWHERE p.score > 200;',
      language: 'sql', topic: 'Database', pinned: false,
    },
  ],
  dsa: [
    {
      title: 'Two Pointer Technique',
      theory: 'Use 2 indices moving through array.\nReduces O(n²) → O(n).\n\nWhen to use:\n- Sorted array problems\n- Find pairs with target sum\n- Palindrome check\n- Remove duplicates\n\nLeft starts at 0, Right at end.\nMove based on comparison.',
      code: 'function twoSum(arr, target) {\n  let left = 0, right = arr.length - 1;\n\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [left, right];\n    else if (sum < target) left++;\n    else right--;\n  }\n  return [-1, -1];\n}\n\n// Palindrome check\nfunction isPalindrome(str) {\n  let l = 0, r = str.length - 1;\n  while (l < r) {\n    if (str[l] !== str[r]) return false;\n    l++; r--;\n  }\n  return true;\n}',
      language: 'javascript', topic: 'DSA', pinned: true,
    },
    {
      title: 'Binary Search Template',
      theory: 'Halves search space each step → O(log n)\nMUST be sorted array.\n\nTemplate:\nleft = 0, right = n-1\nwhile left <= right:\n  mid = left + (right-left)/2\n  if found: return mid\n  if too small: left = mid+1\n  if too big: right = mid-1',
      code: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n\n  while (left <= right) {\n    const mid = left + Math.floor((right - left) / 2);\n\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\n// First occurrence\nfunction firstOccurrence(arr, target) {\n  let lo = 0, hi = arr.length-1, res = -1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo+hi)/2);\n    if (arr[mid] === target) { res = mid; hi = mid-1; }\n    else if (arr[mid] < target) lo = mid+1;\n    else hi = mid-1;\n  }\n  return res;\n}',
      language: 'javascript', topic: 'Algorithms', pinned: true,
    },
    {
      title: 'Dynamic Programming: Memoization',
      theory: 'Store results of expensive calls.\nReturn cached result on same inputs.\n\nSteps:\n1. Identify overlapping subproblems\n2. Define state (what changes)\n3. Add memo/cache\n4. Base cases first\n\nTop-down = recursion + cache\nBottom-up = iteration (tabulation)',
      code: '// Without memoization - O(2^n)\nfunction fib(n) {\n  if (n <= 1) return n;\n  return fib(n-1) + fib(n-2);\n}\n\n// With memoization - O(n)\nfunction fibMemo(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo);\n  return memo[n];\n}\n\n// Tabulation - O(n) time O(1) space\nfunction fibTab(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}',
      language: 'javascript', topic: 'Algorithms', pinned: false,
    },
  ],
  aiml: [
    {
      title: 'Linear Regression from Scratch',
      theory: 'Finds best line y = mx + b through data.\nMinimizes Mean Squared Error (MSE).\n\nGradient Descent updates weights:\nm = m - α * dL/dm\nb = b - α * dL/db\n\nα = learning rate (0.01 typical)\nTrain/test split: 80/20',
      code: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n# Data\nX = np.array([[1],[2],[3],[4],[5]])\ny = np.array([2, 4, 6, 8, 10])\n\n# Train\nmodel = LinearRegression()\nmodel.fit(X, y)\n\n# Predict\nprint(model.predict([[6]]))\nprint(f"Score: {model.score(X, y):.2f}")\nprint(f"Slope: {model.coef_[0]:.2f}")',
      language: 'python', topic: 'Other', pinned: true,
    },
  ],
  cybersecurity: [
    {
      title: 'SQL Injection: Attack & Defense',
      theory: 'Input directly in SQL query = vulnerability.\nAttacker injects SQL code via form fields.\n\nExample attack:\nusername: admin\' OR 1=1 --\n→ Bypasses password!\n\nDefense:\n1. Parameterized queries\n2. Input validation\n3. ORM (auto-escapes)\n4. Least privilege DB user',
      code: '// VULNERABLE\nconst q = `SELECT * FROM users WHERE name="${req.body.name}"`;\n\n// SAFE - Parameterized\nconst q = "SELECT * FROM users WHERE name = $1";\nawait db.query(q, [req.body.name]);\n\n// SAFE - With Prisma ORM\nconst user = await prisma.user.findFirst({\n  where: { name: req.body.name } // Auto-escaped\n});\n\n// Test for SQLi: try these inputs\n// \' OR 1=1 --\n// "; DROP TABLE users; --',
      language: 'javascript', topic: 'Web Dev', pinned: true,
    },
  ],
  devops: [
    {
      title: 'Docker Essentials',
      theory: 'Docker packages app + dependencies → container.\nSame container runs everywhere.\n\nKey concepts:\nImage = blueprint (read-only)\nContainer = running image\nDockerfile = build instructions\ndocker-compose = multi-container apps\n\nData is lost when container stops!\nUse volumes for persistent data.',
      code: '# Dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n\n# Build + Run\n# docker build -t myapp .\n# docker run -p 3000:3000 myapp\n\n# docker-compose.yml\n# version: "3"\n# services:\n#   app:\n#     build: .\n#     ports: ["3000:3000"]\n#   db:\n#     image: postgres:14\n#     environment:\n#       POSTGRES_PASSWORD: secret',
      language: 'bash', topic: 'Other', pinned: true,
    },
  ],
};

const CodeBlock = ({ code, language }) => {
  const copy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Copied!');
  };
  return (
    <div className="mt-3 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: '#050508', borderBottom: '1px solid rgba(0,255,148,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF6B6B' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFB347' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00FF94' }} />
          </div>
          <span className="text-xs text-gray-500 font-mono">{language}</span>
        </div>
        <button onClick={copy} className="text-xs text-gray-500 hover:text-primary transition-colors">
          Copy
        </button>
      </div>
      <pre className="px-4 py-3 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed"
        style={{ background: '#050508', maxHeight: '240px' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Notes = () => {
  const { profile } = useStore();
  const [activeTab, setActiveTab] = useState('library');
  const [myNotes, setMyNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', content: '', code_snippet: '',
    code_language: 'javascript', topic: 'Other', is_pinned: false,
  });
  const [showCode, setShowCode] = useState(false);
  const [saving, setSaving] = useState(false);

  const domain = profile?.domain_id || 'fullstack';
  const studyNotes = DOMAIN_STUDY_NOTES[domain] || DOMAIN_STUDY_NOTES['fullstack'];

  const filteredStudy = studyNotes.filter(n => {
    const matchTopic = selectedTopic === 'All' || n.topic === selectedTopic;
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.theory.toLowerCase().includes(search.toLowerCase());
    return matchTopic && matchSearch;
  });

  useEffect(() => {
    if (profile?.id) fetchMyNotes();
  }, [profile]);

  const fetchMyNotes = async () => {
    setLoading(true);
    const { data } = await supabase.from('notes').select('*')
      .eq('student_id', profile.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    setMyNotes(data || []);
    setLoading(false);
  };

  const saveNote = async () => {
    if (!form.title.trim()) { toast.error('Add title'); return; }
    setSaving(true);
    const { error } = await supabase.from('notes').insert({
      title: form.title, content: form.content,
      code_snippet: form.code_snippet || null,
      code_language: form.code_language || 'javascript',
      topic: form.topic || 'Other',
      is_pinned: form.is_pinned,
      student_id: profile.id,
    });
    if (!error) {
      toast.success('Note saved!');
      setForm({ title: '', content: '', code_snippet: '', code_language: 'javascript', topic: 'Other', is_pinned: false });
      setIsCreating(false);
      setShowCode(false);
      fetchMyNotes();
    }
    setSaving(false);
  };

  const deleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id);
    fetchMyNotes();
    toast.success('Deleted');
  };

  const togglePin = async (note) => {
    await supabase.from('notes').update({ is_pinned: !note.is_pinned }).eq('id', note.id);
    fetchMyNotes();
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">Study Notes</h1>
            <p className="text-gray-500 text-sm mt-1">Theory + Code examples for your domain</p>
          </div>
          {activeTab === 'mynotes' && (
            <button onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-dark-900 font-bold rounded-xl text-sm">
              <Plus size={14} /> New Note
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'library', icon: <Library size={13} />, label: 'Study Library' },
            { id: 'mynotes', icon: <BookOpen size={13} />, label: 'My Notes' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-primary text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setSelectedTopic(t)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedTopic === t ? 'bg-primary text-dark-900' : 'bg-dark-700 text-gray-500 hover:text-white'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* STUDY LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            {filteredStudy.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-gray-400">No notes found for this filter</p>
              </div>
            ) : (
              filteredStudy.map((note, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-dark-800 border border-dark-600 rounded-2xl p-5 hover:border-dark-400 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {note.pinned && <Pin size={12} className="text-warning" />}
                      <h3 className="font-bold text-white font-heading text-sm">{note.title}</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,255,148,0.1)', color: '#00FF94', border: '1px solid rgba(0,255,148,0.2)' }}>
                      {note.topic}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line mb-1">
                    {note.theory}
                  </p>
                  {note.code && <CodeBlock code={note.code} language={note.language} />}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* MY NOTES TAB */}
        {activeTab === 'mynotes' && (
          <div className="flex gap-5">
            <div className="flex-1">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-dark-700 rounded-xl animate-pulse" />)}
                </div>
              ) : myNotes.length === 0 && !isCreating ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📝</div>
                  <h2 className="font-bold text-white font-heading mb-2">No notes yet</h2>
                  <p className="text-gray-500 text-sm mb-5">Create your first study note</p>
                  <button onClick={() => setIsCreating(true)}
                    className="px-5 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm">
                    + Create First Note
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNotes.filter(n =>
                    (selectedTopic === 'All' || n.topic === selectedTopic) &&
                    (!search || n.title?.toLowerCase().includes(search.toLowerCase()))
                  ).map((note) => (
                    <motion.div key={note.id}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-800 border border-dark-600 rounded-xl p-4 group hover:border-dark-400 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {note.is_pinned && <Pin size={10} className="text-warning" />}
                            <h3 className="text-sm font-semibold text-white truncate">{note.title}</h3>
                          </div>
                          {note.content && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                              {note.content}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {note.topic}
                            </span>
                            {note.code_snippet && (
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <Code size={10} /> code
                              </span>
                            )}
                          </div>
                          {note.code_snippet && <CodeBlock code={note.code_snippet} language={note.code_language} />}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button onClick={() => togglePin(note)}
                            className={`p-1.5 rounded-lg ${note.is_pinned ? 'text-warning' : 'text-gray-600 hover:text-warning'}`}>
                            <Pin size={12} />
                          </button>
                          <button onClick={() => deleteNote(note.id)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-danger">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Note Panel */}
            <AnimatePresence>
              {isCreating && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-80 flex-shrink-0">
                  <div className="bg-dark-800 border border-dark-600 rounded-2xl p-4 sticky top-20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white font-heading text-sm">New Note</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setForm(f => ({ ...f, is_pinned: !f.is_pinned }))}
                          className={`p-1.5 rounded-lg ${form.is_pinned ? 'text-warning' : 'text-gray-500'}`}>
                          <Pin size={13} />
                        </button>
                        <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white">
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Note title..."
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary mb-3" />
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {TOPICS.slice(1).map(t => (
                        <button key={t} onClick={() => setForm(f => ({ ...f, topic: t }))}
                          className={`px-2 py-1 rounded-lg text-xs transition-all ${
                            form.topic === t ? 'bg-primary text-dark-900 font-bold' : 'bg-dark-600 text-gray-500 hover:text-white'
                          }`}>{t}</button>
                      ))}
                    </div>
                    <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      placeholder="Theory, concepts, explanations..."
                      rows={5}
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary resize-none mb-3" />
                    <button onClick={() => setShowCode(!showCode)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary mb-2">
                      <Code size={11} /> {showCode ? 'Hide code' : '+ Add code snippet'}
                    </button>
                    {showCode && (
                      <div className="mb-3">
                        <select value={form.code_language} onChange={e => setForm(f => ({ ...f, code_language: e.target.value }))}
                          className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5 text-xs text-gray-300 mb-2 focus:outline-none">
                          {['javascript', 'python', 'java', 'cpp', 'sql', 'bash', 'typescript'].map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                        <textarea value={form.code_snippet} onChange={e => setForm(f => ({ ...f, code_snippet: e.target.value }))}
                          placeholder="// Your code here..."
                          rows={5}
                          className="w-full px-3 py-2.5 text-xs font-mono text-gray-300 placeholder-gray-600 focus:outline-none resize-none rounded-xl"
                          style={{ background: '#050508', border: '1px solid rgba(42,42,63,0.8)' }}
                          onKeyDown={e => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              const s = e.target.selectionStart;
                              const n = form.code_snippet.substring(0, s) + '  ' + form.code_snippet.substring(e.target.selectionEnd);
                              setForm(f => ({ ...f, code_snippet: n }));
                              setTimeout(() => e.target.setSelectionRange(s + 2, s + 2), 0);
                            }
                          }}
                          spellCheck={false} />
                      </div>
                    )}
                    <button onClick={saveNote} disabled={saving}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm disabled:opacity-50">
                      {saving ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
                      Save Note
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notes;
