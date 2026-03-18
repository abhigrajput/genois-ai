import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, Code, BookOpen,
         Search, Trash2, X, Copy,
         FileText, Zap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const TOPICS = ['All','DSA','Web Dev','React',
  'JavaScript','Python','Node.js','Database',
  'Algorithms','System Design','Other'];

const TOPIC_COLORS = {
  'DSA': '#FF6B6B',
  'Web Dev': '#4A9EFF',
  'React': '#00FF94',
  'JavaScript': '#FFD700',
  'Python': '#7B61FF',
  'Node.js': '#00D68F',
  'Database': '#FFB347',
  'Algorithms': '#FF6B6B',
  'System Design': '#4A9EFF',
  'Other': '#666',
};

const STARTER_NOTES = [
  {
    type: 'theory',
    title: 'What is a Closure?',
    topic: 'JavaScript',
    content: 'A closure is a function that remembers variables from its outer scope even after the outer function has returned.',
    use_case: 'Used in callbacks, event handlers, factory functions.',
    code_snippet: null,
    is_pinned: true,
  },
  {
    type: 'code',
    title: 'Reverse a String',
    topic: 'DSA',
    content: 'Reverse string using split/reverse/join',
    use_case: null,
    code_snippet: `function reverse(str) {
  return str.split('').reverse().join('');
}
// reverse("hello") → "olleh"`,
    code_language: 'javascript',
    is_pinned: false,
  },
  {
    type: 'theory',
    title: 'Array vs Linked List',
    topic: 'DSA',
    content: 'Array: fixed size, fast access O(1). Linked List: dynamic size, slow access O(n) but fast insert/delete.',
    use_case: 'Use array when you need fast access. Use linked list when you need frequent insert/delete.',
    code_snippet: null,
    is_pinned: false,
  },
  {
    type: 'code',
    title: 'useEffect Hook',
    topic: 'React',
    content: 'Runs side effects after render',
    use_case: null,
    code_snippet: `useEffect(() => {
  // runs after render
  fetchData();
  return () => cleanup(); // optional
}, [dependency]); // runs when dep changes`,
    code_language: 'javascript',
    is_pinned: true,
  },
  {
    type: 'theory',
    title: 'Big O Notation',
    topic: 'Algorithms',
    content: 'Measures algorithm efficiency. O(1) constant, O(n) linear, O(n²) quadratic, O(log n) logarithmic.',
    use_case: 'Always aim for O(n) or better. Avoid O(n²) in large inputs.',
    code_snippet: null,
    is_pinned: false,
  },
  {
    type: 'code',
    title: 'Fetch API',
    topic: 'Web Dev',
    content: 'Make HTTP requests in JavaScript',
    use_case: null,
    code_snippet: `const res = await fetch('/api/data');
const data = await res.json();
console.log(data);`,
    code_language: 'javascript',
    is_pinned: false,
  },
];

const Notes = () => {
  const { profile } = useStore();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('All');
  const [creating, setCreating] = useState(false);
  const [noteType, setNoteType] = useState('theory');
  const [editNote, setEditNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [form, setForm] = useState({
    title: '', content: '', use_case: '',
    code_snippet: '', code_language: 'javascript',
    topic: 'JavaScript', is_pinned: false,
  });

  useEffect(() => {
    if (profile?.id) fetchNotes();
  }, [profile]);

  useEffect(() => {
    if (profile?.id) fetchCurrentNode();
  }, [profile]);

  const fetchCurrentNode = async () => {
    const { data: roadmaps } = await supabase
      .from('roadmaps').select('id')
      .eq('student_id', profile.id).limit(1);
    if (!roadmaps?.length) return;
    const { data: nodes } = await supabase
      .from('roadmap_nodes').select('*')
      .eq('roadmap_id', roadmaps[0].id)
      .eq('status', 'unlocked')
      .limit(1);
    if (nodes?.length) setCurrentNode(nodes[0]);
  };

  const fetchNotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notes').select('*')
      .eq('student_id', profile.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      await seedStarterNotes();
    } else {
      setNotes(data);
    }
    setLoading(false);
  };

  const seedStarterNotes = async () => {
    const toInsert = STARTER_NOTES.map(n => ({
      ...n, student_id: profile.id,
    }));
    const { data } = await supabase
      .from('notes').insert(toInsert).select();
    setNotes(data || []);
    toast.success('Starter notes added! 📝');
  };

  const filtered = notes.filter(n => {
    const matchTopic = topic === 'All' || n.topic === topic;
    const matchSearch = !search ||
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase());
    return matchTopic && matchSearch;
  });

  const detectTopic = (nodeTitle) => {
    if (!nodeTitle) return 'Other';
    const title = nodeTitle.toLowerCase();
    if (title.includes('react') || title.includes('frontend')) return 'React';
    if (title.includes('node') || title.includes('backend') || title.includes('server')) return 'Node.js';
    if (title.includes('javascript') || title.includes('js')) return 'JavaScript';
    if (title.includes('python')) return 'Python';
    if (title.includes('database') || title.includes('sql') || title.includes('mongo')) return 'Database';
    if (title.includes('dsa') || title.includes('algorithm') || title.includes('array') || title.includes('tree')) return 'DSA';
    if (title.includes('system') || title.includes('design')) return 'System Design';
    return 'Web Dev';
  };

  const openCreate = (type = 'theory') => {
    setNoteType(type);
    setEditNote(null);
    setForm({
      title: '', content: '', use_case: '',
      code_snippet: type === 'code'
        ? 'function solution() {\n  // write here\n}'
        : '',
      code_language: 'javascript',
      topic: type === 'theory' && currentNode
        ? detectTopic(currentNode.title)
        : 'JavaScript',
      is_pinned: false,
    });
    setCreating(true);
  };

  const generateAINoteTemplate = async (topic, nodeTitle) => {
    setGeneratingTemplate(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Generate a micro study note template for an engineering student.
Topic: ${topic}
Domain/Node: ${nodeTitle || topic}

Return ONLY this exact format, no extra text:
TITLE: [specific concept title]
CONTENT:
🧠 Concept: [2-3 line simple explanation]

💡 Real Example: [one practical real world example]

⚡ Use Case: [when to use this]

📝 Key Points:
- [point 1]
- [point 2]
- [point 3]

🔥 Remember: [one line memory tip]

CODE:
[relevant code snippet - 5-10 lines max]
LANGUAGE: [javascript/python/java/cpp]`,
          }],
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || '';

      const titleMatch   = text.match(/TITLE:\s*(.+)/);
      const contentMatch = text.match(/CONTENT:\n([\s\S]*?)(?=CODE:|$)/);
      const codeMatch    = text.match(/CODE:\n([\s\S]*?)(?=LANGUAGE:|$)/);
      const langMatch    = text.match(/LANGUAGE:\s*(.+)/);

      setForm(f => ({
        ...f,
        title:         titleMatch?.[1]?.trim()   || `${topic} — Key Concepts`,
        content:       contentMatch?.[1]?.trim() || '',
        code_snippet:  codeMatch?.[1]?.trim()    || '',
        code_language: langMatch?.[1]?.trim()    || 'javascript',
        topic,
      }));
      if (codeMatch?.[1]?.trim()) setNoteType('code');
      toast.success('AI note template generated! ✨');
    } catch {
      toast.error('Failed to generate template');
      setForm(f => ({
        ...f,
        title: `${topic} — Key Concepts`,
        content: `🧠 Concept: Write what you learned about ${topic}\n\n💡 Real Example: Add a real example here\n\n⚡ Use Case: When would you use this?\n\n📝 Key Points:\n• Point 1\n• Point 2\n• Point 3\n\n🔥 Remember: Add your memory tip`,
        topic,
      }));
    }
    setGeneratingTemplate(false);
  };

  const openEdit = (note) => {
    setNoteType(note.type || 'theory');
    setEditNote(note);
    setForm({
      title: note.title || '',
      content: note.content || '',
      use_case: note.use_case || '',
      code_snippet: note.code_snippet || '',
      code_language: note.code_language || 'javascript',
      topic: note.topic || 'JavaScript',
      is_pinned: note.is_pinned || false,
    });
    setCreating(true);
  };

  const saveNote = async () => {
    if (!form.title.trim()) {
      toast.error('Add a title');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      type: noteType,
      student_id: profile.id,
      updated_at: new Date().toISOString(),
    };

    if (editNote) {
      await supabase.from('notes')
        .update(payload).eq('id', editNote.id);
      toast.success('Updated ✅');
    } else {
      await supabase.from('notes').insert(payload);
      toast.success('Note saved! 📝');
    }

    setSaving(false);
    setCreating(false);
    setEditNote(null);
    fetchNotes();
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    await supabase.from('notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Deleted');
  };

  const togglePin = async (note, e) => {
    e.stopPropagation();
    await supabase.from('notes')
      .update({ is_pinned: !note.is_pinned })
      .eq('id', note.id);
    fetchNotes();
  };

  const copyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success('Code copied! 📋');
  };

  const pinned = filtered.filter(n => n.is_pinned);
  const regular = filtered.filter(n => !n.is_pinned);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">
              Study Notes 📝
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {notes.length} micro notes · Theory + Code
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openCreate('theory')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF', border: '1px solid rgba(74,158,255,0.3)' }}>
              <BookOpen size={13} /> Theory
            </button>
            <button onClick={() => openCreate('code')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(0,255,148,0.1)', color: '#00FF94', border: '1px solid rgba(0,255,148,0.3)' }}>
              <Code size={13} /> Code
            </button>
          </div>
        </div>

        {/* Search + Topics */}
        <div className="space-y-3 mb-5">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: topic === t
                    ? `${TOPIC_COLORS[t] || '#00FF94'}20`
                    : 'rgba(18,18,26,0.8)',
                  color: topic === t
                    ? (TOPIC_COLORS[t] || '#00FF94')
                    : '#666',
                  border: `1px solid ${topic === t
                    ? (TOPIC_COLORS[t] || '#00FF94') + '40'
                    : 'rgba(34,34,51,0.8)'}`,
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
          {/* Notes Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-32 bg-dark-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">📝</div>
                <h2 className="font-bold text-white font-heading mb-2">No notes found</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Create your first micro note
                </p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => openCreate('theory')}
                    className="px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(74,158,255,0.15)', color: '#4A9EFF' }}>
                    + Theory Note
                  </button>
                  <button onClick={() => openCreate('code')}
                    className="px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(0,255,148,0.15)', color: '#00FF94' }}>
                    + Code Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {pinned.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                      <Pin size={10} /> Pinned
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {pinned.map(note => (
                        <NoteCard key={note.id} note={note}
                          onEdit={() => openEdit(note)}
                          onPin={(e) => togglePin(note, e)}
                          onDelete={(e) => deleteNote(note.id, e)}
                          onCopy={copyCode}
                          topicColors={TOPIC_COLORS} />
                      ))}
                    </div>
                  </div>
                )}
                {regular.length > 0 && (
                  <div>
                    {pinned.length > 0 && (
                      <p className="text-xs text-gray-600 mb-2">All Notes</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {regular.map(note => (
                        <NoteCard key={note.id} note={note}
                          onEdit={() => openEdit(note)}
                          onPin={(e) => togglePin(note, e)}
                          onDelete={(e) => deleteNote(note.id, e)}
                          onCopy={copyCode}
                          topicColors={TOPIC_COLORS} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Editor Panel */}
          <AnimatePresence>
            {creating && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-80 flex-shrink-0">
                <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 sticky top-20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {noteType === 'theory'
                        ? <BookOpen size={14} className="text-blue-400" />
                        : <Code size={14} className="text-primary" />}
                      <span className="font-bold text-white text-sm font-heading capitalize">
                        {noteType} Note
                      </span>
                    </div>
                    <button onClick={() => setCreating(false)}
                      className="text-gray-500 hover:text-white transition-colors">
                      <X size={15} />
                    </button>
                  </div>

                  {/* Type toggle */}
                  <div className="flex gap-2 mb-4">
                    {['theory','code'].map(t => (
                      <button key={t} onClick={() => setNoteType(t)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                        style={{
                          background: noteType === t
                            ? t === 'code' ? 'rgba(0,255,148,0.15)' : 'rgba(74,158,255,0.15)'
                            : 'rgba(34,34,51,0.5)',
                          color: noteType === t
                            ? t === 'code' ? '#00FF94' : '#4A9EFF'
                            : '#666',
                        }}>
                        {t === 'theory' ? '📖 Theory' : '💻 Code'}
                      </button>
                    ))}
                  </div>

                  {/* Topic */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 mb-1 block">Topic</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TOPICS.slice(1).map(t => (
                        <button key={t} onClick={() => setForm(f => ({ ...f, topic: t }))}
                          className="px-2 py-0.5 rounded text-xs transition-all"
                          style={{
                            background: form.topic === t
                              ? `${TOPIC_COLORS[t]}20` : 'rgba(34,34,51,0.5)',
                            color: form.topic === t ? TOPIC_COLORS[t] : '#555',
                            border: `1px solid ${form.topic === t ? TOPIC_COLORS[t] + '40' : 'transparent'}`,
                          }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <input value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={noteType === 'theory' ? 'e.g. What is a closure?' : 'e.g. Reverse a string'}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors mb-3 font-medium"
                  />

                  {/* AI Template Generator */}
                  <div className="mb-3 p-3 rounded-xl"
                    style={{ background: 'rgba(0,255,148,0.05)', border: '1px solid rgba(0,255,148,0.15)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary">✨ AI Generate Template</span>
                      {currentNode && (
                        <span className="text-xs text-gray-600 truncate ml-2 max-w-[110px]">
                          {currentNode.title.substring(0, 20)}...
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select value={form.topic}
                        onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                        className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none">
                        {TOPICS.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button onClick={() => generateAINoteTemplate(form.topic, currentNode?.title)}
                        disabled={generatingTemplate}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        style={{ background: 'rgba(0,255,148,0.15)', color: '#00FF94', border: '1px solid rgba(0,255,148,0.3)' }}>
                        {generatingTemplate
                          ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          : '✨'}
                        {generatingTemplate ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                    {currentNode && (
                      <p className="text-xs text-gray-600 mt-1.5">
                        From roadmap: <span className="text-gray-400">{currentNode.title}</span>
                      </p>
                    )}
                  </div>

                  {noteType === 'theory' ? (
                    <>
                      <textarea value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        placeholder="Short explanation (2-4 sentences max)"
                        rows={3}
                        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none mb-2"
                      />
                      <input value={form.use_case}
                        onChange={e => setForm(f => ({ ...f, use_case: e.target.value }))}
                        placeholder="Use case: When do you use this?"
                        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors mb-3"
                      />
                    </>
                  ) : (
                    <>
                      <input value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        placeholder="What does this code do? (1 line)"
                        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors mb-2"
                      />
                      <div className="mb-3">
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg"
                          style={{ background: '#0A0A0F', border: '1px solid rgba(42,42,63,0.8)', borderBottom:'none' }}>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-danger/60" />
                            <div className="w-2 h-2 rounded-full bg-warning/60" />
                            <div className="w-2 h-2 rounded-full bg-success/60" />
                          </div>
                          <select value={form.code_language}
                            onChange={e => setForm(f => ({ ...f, code_language: e.target.value }))}
                            className="bg-transparent text-xs text-gray-500 focus:outline-none">
                            {['javascript','python','java','cpp','html','css','sql','bash'].map(l => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                        </div>
                        <textarea value={form.code_snippet}
                          onChange={e => setForm(f => ({ ...f, code_snippet: e.target.value }))}
                          rows={5}
                          className="w-full px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none resize-none rounded-b-lg"
                          style={{ background: '#0A0A0F', border: '1px solid rgba(42,42,63,0.8)' }}
                          onKeyDown={e => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              const s = e.target.selectionStart;
                              const val = form.code_snippet;
                              setForm(f => ({ ...f, code_snippet: val.substring(0,s) + '  ' + val.substring(s) }));
                              setTimeout(() => e.target.setSelectionRange(s+2,s+2), 0);
                            }
                          }}
                          spellCheck={false}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setForm(f => ({ ...f, is_pinned: !f.is_pinned }))}
                      className={`flex items-center gap-1.5 text-xs transition-all ${
                        form.is_pinned ? 'text-warning' : 'text-gray-600 hover:text-gray-400'
                      }`}>
                      <Pin size={11} />
                      {form.is_pinned ? 'Pinned' : 'Pin note'}
                    </button>
                  </div>

                  <button onClick={saveNote} disabled={saving}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-dark-900"
                    style={{ background: noteType === 'code' ? '#00FF94' : '#4A9EFF' }}>
                    {saving
                      ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                      : <Zap size={14} />}
                    {editNote ? 'Update' : 'Save Note'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

const NoteCard = ({ note, onEdit, onPin, onDelete, onCopy, topicColors }) => {
  const isCode = note.type === 'code';
  const color = topicColors[note.topic] || '#666';

  return (
    <motion.div
      initial={{ opacity:0, scale:0.95 }}
      animate={{ opacity:1, scale:1 }}
      onClick={onEdit}
      className="relative p-4 rounded-xl border cursor-pointer transition-all group hover:border-dark-400"
      style={{ background: 'rgba(18,18,26,0.8)', border: '1px solid rgba(34,34,51,0.8)' }}>

      {/* Action buttons */}
      <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onPin}
          className={`p-1 rounded transition-all ${note.is_pinned ? 'text-warning' : 'text-gray-600 hover:text-warning'}`}>
          <Pin size={11} />
        </button>
        <button onClick={onDelete}
          className="p-1 rounded text-gray-600 hover:text-danger transition-all">
          <Trash2 size={11} />
        </button>
      </div>

      {/* Type + Topic badges */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
          isCode ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {isCode ? <Code size={9} /> : <BookOpen size={9} />}
          {isCode ? 'Code' : 'Theory'}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
          {note.topic}
        </span>
        {note.is_pinned && <Pin size={9} className="text-warning ml-auto" />}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-1.5 pr-12 leading-tight">
        {note.title}
      </h3>

      {/* Content */}
      {note.content && (
        <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
          {note.content}
        </p>
      )}

      {/* Use case */}
      {note.use_case && (
        <p className="text-xs text-gray-600 leading-relaxed mb-2">
          <span className="text-gray-500">Use: </span>{note.use_case}
        </p>
      )}

      {/* Code preview */}
      {isCode && note.code_snippet && (
        <div className="relative">
          <pre className="text-xs font-mono text-gray-400 bg-dark-900 rounded-lg px-3 py-2 overflow-hidden line-clamp-3"
            style={{ maxHeight: '70px', border: '1px solid rgba(42,42,63,0.6)' }}>
            {note.code_snippet.split('\n').slice(0,3).join('\n')}
          </pre>
          <button onClick={(e) => onCopy(note.code_snippet, e)}
            className="absolute top-1.5 right-1.5 p-1 rounded text-gray-600 hover:text-white transition-colors bg-dark-800">
            <Copy size={9} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Notes;
