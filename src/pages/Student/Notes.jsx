import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, Code, FileText,
         Search, Trash2, Save, X,
         ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const LANGUAGES = [
  'javascript', 'python', 'java', 'cpp',
  'html', 'css', 'sql', 'bash', 'typescript'
];

const TOPICS = [
  'DSA', 'Web Dev', 'React', 'Node.js',
  'Python', 'Database', 'System Design',
  'Algorithms', 'Other'
];

const topicColors = {
  'DSA': '#FF6B6B', 'Web Dev': '#4A9EFF', 'React': '#00FF94',
  'Node.js': '#7B61FF', 'Python': '#FFB347', 'Database': '#00D68F',
  'System Design': '#FF9500', 'Algorithms': '#FF6B6B', 'Other': '#666',
};

const NoteCard = ({ note, isActive, onClick, onPin, onDelete }) => {
  const color = topicColors[note.topic] || '#666';
  return (
    <motion.div
      initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all group ${
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-dark-600 bg-dark-800 hover:border-dark-400'
      }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {note.is_pinned && <Pin size={10} className="text-warning flex-shrink-0" />}
            <h3 className="text-sm font-semibold text-white truncate">{note.title}</h3>
          </div>
          {note.content && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
              {note.content}
            </p>
          )}
          <div className="flex items-center gap-2">
            {note.topic && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                {note.topic}
              </span>
            )}
            {note.code_snippet && (
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Code size={10} /> has code
              </span>
            )}
            <span className="text-xs text-gray-700 ml-auto">
              {new Date(note.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onPin}
            className={`p-1.5 rounded-lg transition-all ${
              note.is_pinned ? 'text-warning' : 'text-gray-600 hover:text-warning'
            }`}>
            <Pin size={12} />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-600 hover:text-danger transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {note.code_snippet && (
        <div className="mt-2 px-3 py-2 rounded-lg text-xs font-mono text-gray-500 overflow-hidden"
          style={{ background: '#0A0A0F', border: '1px solid rgba(42,42,63,0.5)', maxHeight: '50px' }}>
          {note.code_snippet.split('\n').slice(0, 2).join('\n')}
          {note.code_snippet.split('\n').length > 2 && '...'}
        </div>
      )}
    </motion.div>
  );
};

const Notes = () => {
  const { profile } = useStore();
  const [notes, setNotes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [activeNote, setActiveNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    code_snippet: '',
    code_language: 'javascript',
    topic: 'Other',
    is_pinned: false,
  });

  useEffect(() => {
    if (profile?.id) fetchNotes();
  }, [profile]);

  useEffect(() => {
    let result = notes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.topic?.toLowerCase().includes(q)
      );
    }
    if (selectedTopic !== 'All') {
      result = result.filter(n => n.topic === selectedTopic);
    }
    setFiltered(result);
  }, [search, selectedTopic, notes]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('student_id', profile.id)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    setNotes(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      title: '', content: '', code_snippet: '',
      code_language: 'javascript', topic: 'Other', is_pinned: false,
    });
    setShowCode(false);
  };

  const openCreate = () => {
    resetForm();
    setActiveNote(null);
    setIsCreating(true);
  };

  const openNote = (note) => {
    setActiveNote(note);
    setForm({
      title: note.title || '',
      content: note.content || '',
      code_snippet: note.code_snippet || '',
      code_language: note.code_language || 'javascript',
      topic: note.topic || 'Other',
      is_pinned: note.is_pinned || false,
    });
    setShowCode(!!note.code_snippet);
    setIsCreating(true);
  };

  const saveNote = async () => {
    if (!form.title.trim()) {
      toast.error('Add a title first');
      return;
    }
    setSaving(true);
    try {
      if (activeNote) {
        await supabase.from('notes')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', activeNote.id);
        toast.success('Note updated ✅');
      } else {
        await supabase.from('notes').insert({
          ...form,
          student_id: profile.id,
        });
        toast.success('Note saved! 📝');
      }
      setIsCreating(false);
      setActiveNote(null);
      resetForm();
      fetchNotes();
    } catch (err) {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  const deleteNote = async (noteId, e) => {
    e.stopPropagation();
    await supabase.from('notes').delete().eq('id', noteId);
    toast.success('Note deleted');
    if (activeNote?.id === noteId) {
      setIsCreating(false);
      setActiveNote(null);
    }
    fetchNotes();
  };

  const togglePin = async (note, e) => {
    e.stopPropagation();
    await supabase.from('notes')
      .update({ is_pinned: !note.is_pinned })
      .eq('id', note.id);
    fetchNotes();
  };

  const pinnedNotes  = filtered.filter(n => n.is_pinned);
  const regularNotes = filtered.filter(n => !n.is_pinned);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">Study Notes 📝</h1>
            <p className="text-gray-500 text-sm mt-1">
              {notes.length} notes · Code snippets + explanations
            </p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all">
            <Plus size={14} /> New Note
          </button>
        </div>

        <div className="flex gap-5">
          {/* Left — Note List */}
          <div className="flex-1 min-w-0">

            {/* Search + Filter */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-primary">
                <option value="All">All Topics</option>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-dark-700 rounded-xl animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="font-bold text-white font-heading mb-2">No notes yet</h2>
                <p className="text-gray-500 text-sm mb-5">
                  Create your first study note with code snippets
                </p>
                <button onClick={openCreate}
                  className="px-5 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm">
                  + Create First Note
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {pinnedNotes.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                      <Pin size={10} /> Pinned
                    </p>
                    <div className="space-y-2">
                      {pinnedNotes.map(note => (
                        <NoteCard key={note.id} note={note}
                          isActive={activeNote?.id === note.id}
                          onClick={() => openNote(note)}
                          onPin={(e) => togglePin(note, e)}
                          onDelete={(e) => deleteNote(note.id, e)} />
                      ))}
                    </div>
                  </div>
                )}
                {regularNotes.length > 0 && (
                  <div>
                    {pinnedNotes.length > 0 && (
                      <p className="text-xs text-gray-500 mb-2">All Notes</p>
                    )}
                    <div className="space-y-2">
                      {regularNotes.map(note => (
                        <NoteCard key={note.id} note={note}
                          isActive={activeNote?.id === note.id}
                          onClick={() => openNote(note)}
                          onPin={(e) => togglePin(note, e)}
                          onDelete={(e) => deleteNote(note.id, e)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — Editor */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-96 flex-shrink-0">
                <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 sticky top-20">

                  {/* Editor Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white font-heading text-sm">
                      {activeNote ? 'Edit Note' : 'New Note'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setForm(f => ({ ...f, is_pinned: !f.is_pinned }))}
                        className={`p-1.5 rounded-lg transition-all ${
                          form.is_pinned ? 'text-warning bg-warning/10' : 'text-gray-500 hover:text-white'
                        }`}>
                        <Pin size={14} />
                      </button>
                      <button onClick={() => { setIsCreating(false); setActiveNote(null); resetForm(); }}
                        className="text-gray-500 hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Note title..."
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors mb-3 font-semibold"
                  />

                  {/* Topic pills */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {TOPICS.slice(0, 6).map(topic => (
                      <button key={topic} onClick={() => setForm(f => ({ ...f, topic }))}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: form.topic === topic ? `${topicColors[topic]}20` : 'rgba(34,34,51,0.5)',
                          color: form.topic === topic ? topicColors[topic] : '#666',
                          border: `1px solid ${form.topic === topic ? topicColors[topic] + '40' : 'rgba(34,34,51,0.8)'}`,
                        }}>
                        {topic}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Write your notes here... What did you learn? What confused you? Key concepts?"
                    rows={6}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none mb-3"
                  />

                  {/* Code toggle */}
                  <button onClick={() => setShowCode(!showCode)}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors mb-3">
                    <Code size={12} />
                    {showCode ? 'Hide code snippet' : '+ Add code snippet'}
                    <ChevronDown size={12} className={`transition-transform ${showCode ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Code editor */}
                  <AnimatePresence>
                    {showCode && (
                      <motion.div
                        initial={{ opacity:0, height:0 }}
                        animate={{ opacity:1, height:'auto' }}
                        exit={{ opacity:0, height:0 }}
                        className="mb-3 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 rounded-t-xl"
                          style={{ background: '#0A0A0F', border: '1px solid rgba(42,42,63,0.8)', borderBottom: 'none' }}>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                              <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                              <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                            </div>
                            <select value={form.code_language}
                              onChange={e => setForm(f => ({ ...f, code_language: e.target.value }))}
                              className="bg-transparent text-xs text-gray-400 focus:outline-none">
                              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                          </div>
                        </div>
                        <textarea
                          value={form.code_snippet}
                          onChange={e => setForm(f => ({ ...f, code_snippet: e.target.value }))}
                          placeholder={`// Write your ${form.code_language} code here...\nfunction example() {\n  // your code\n}`}
                          rows={6}
                          className="w-full px-4 py-3 text-xs font-mono text-gray-300 placeholder-gray-600 focus:outline-none resize-none rounded-b-xl"
                          style={{
                            background: '#0A0A0F',
                            border: '1px solid rgba(42,42,63,0.8)',
                            tabSize: 2,
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              const start = e.target.selectionStart;
                              const val = form.code_snippet;
                              const newVal = val.substring(0, start) + '  ' + val.substring(e.target.selectionEnd);
                              setForm(f => ({ ...f, code_snippet: newVal }));
                              setTimeout(() => e.target.setSelectionRange(start + 2, start + 2), 0);
                            }
                          }}
                          spellCheck={false}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Save */}
                  <button onClick={saveNote} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all disabled:opacity-50">
                    {saving
                      ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                      : <Save size={14} />
                    }
                    {activeNote ? 'Update Note' : 'Save Note'}
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

export default Notes;
