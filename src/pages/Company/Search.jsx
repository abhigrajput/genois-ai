import React, { useState, useEffect } from 'react';
import TrustPanel from '../../components/ui/TrustPanel';

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Zap,
         Github, ExternalLink, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const TIERS = ['All','Beginner','Developing','Proficient','Advanced','Elite'];

const getTierConfig = (score) => {
  if (score >= 801) return { label:'Elite',      color:'#FFD700' };
  if (score >= 601) return { label:'Advanced',   color:'#7B61FF' };
  if (score >= 401) return { label:'Proficient', color:'#00FF94' };
  if (score >= 201) return { label:'Developing', color:'#4A9EFF' };
  return               { label:'Beginner',   color:'#666'    };
};

const CompareModal = ({ students, onClose }) => (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-dark-800 border border-dark-600 rounded-2xl p-6 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-white font-heading">Compare Candidates</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {students.map((s, i) => {
          const tier = getTierConfig(s.skill_score || 0);
          return (
            <div key={i} className="p-4 rounded-xl border border-dark-500 bg-dark-700">
              <div className="text-center mb-3">
                <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: `${tier.color}30` }}>
                  {s.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <p className="font-bold text-white text-sm">{s.full_name}</p>
                <p className="text-xs text-gray-500">{s.target_role}</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Genois Score', value: Math.round(s.skill_score || 0), color: tier.color },
                  { label: 'College',      value: s.college || '—',               color: '#E8E8F0' },
                  { label: 'Tier',         value: tier.label,                     color: tier.color },
                  { label: 'Target Role',  value: s.target_role || '—',           color: '#E8E8F0' },
                ].map((item, j) => (
                  <div key={j} className="flex justify-between text-xs">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 rounded-xl bg-dark-700 border border-dark-600">
        <p className="text-xs text-gray-400 text-center">
          {students[0]?.skill_score > students[1]?.skill_score
            ? `${students[0]?.full_name} has a higher Genois Score by ${Math.abs(Math.round((students[0]?.skill_score||0) - (students[1]?.skill_score||0)))} points`
            : students[1]?.skill_score > students[0]?.skill_score
            ? `${students[1]?.full_name} has a higher Genois Score by ${Math.abs(Math.round((students[1]?.skill_score||0) - (students[0]?.skill_score||0)))} points`
            : 'Both candidates have equal Genois Scores'
          }
        </p>
      </div>
    </motion.div>
  </div>
);

const CompanySearch = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSkills, setStudentSkills] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    let result = students;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.college?.toLowerCase().includes(q) ||
        s.target_role?.toLowerCase().includes(q)
      );
    }
    if (minScore > 0) result = result.filter(s => (s.skill_score || 0) >= minScore);
    if (selectedTier !== 'All') {
      result = result.filter(s => getTierConfig(s.skill_score || 0).label === selectedTier);
    }
    setFiltered(result);
  }, [debouncedSearch, minScore, selectedTier, students]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('skill_score', { ascending: false });
    setStudents(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  const openProfile = async (student) => {
    setSelectedStudent(student);
    const [skillRes, projectRes] = await Promise.all([
      supabase.from('skill_scores').select('*').eq('student_id', student.id),
      supabase.from('projects').select('*').eq('student_id', student.id),
    ]);
    setStudentSkills(skillRes.data || []);
    setStudentProjects(projectRes.data || []);
  };

  const shortlist = (student) => {
    toast.success(`${student.full_name} shortlisted! ⭐`);
  };

  const toggleCompare = (e, student) => {
    e.stopPropagation();
    setCompareList(prev => {
      if (prev.find(s => s.id === student.id)) {
        return prev.filter(s => s.id !== student.id);
      }
      if (prev.length >= 2) {
        toast.error('You can only compare 2 candidates at a time');
        return prev;
      }
      const next = [...prev, student];
      if (next.length === 2) setShowCompare(true);
      return next;
    });
  };

  const isInCompare = (id) => compareList.some(s => s.id === id);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-white">Find Talent 🔍</h1>
              <p className="text-gray-500 text-sm mt-1">
                {filtered.length} verified students · Filter by skill score, not resume
              </p>
            </div>
            {compareList.length > 0 && (
              <button onClick={() => setShowCompare(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(123,97,255,0.15)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.3)' }}>
                ⚖️ Compare ({compareList.length}/2)
              </button>
            )}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, college, role..."
                className="w-full bg-dark-700 border border-dark-500 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}
                className="bg-dark-700 border border-dark-500 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-primary">
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-2 bg-dark-700 border border-dark-500 rounded-xl px-3 py-2">
                <Filter size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">Min Score:</span>
                <input type="number" value={minScore}
                  onChange={e => setMinScore(Number(e.target.value))}
                  className="w-16 bg-transparent text-sm text-gray-300 focus:outline-none"
                  min="0" max="1000" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Student List */}
          <div className="flex-1 space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-dark-700 rounded-xl animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-400">No students match your filters</p>
              </div>
            ) : (
              filtered.map((student, i) => {
                const tier = getTierConfig(student.skill_score || 0);
                const isSelected  = selectedStudent?.id === student.id;
                const inCompare   = isInCompare(student.id);
                return (
                  <motion.div key={student.id}
                    initial={{ opacity:0, y:10 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => openProfile(student)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? 'border-secondary bg-secondary/5' : 'border-dark-600 bg-dark-800 hover:border-dark-400'
                    }`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white font-heading flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}40)` }}>
                      {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{student.full_name || 'Student'}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {student.target_role || 'Engineering Student'} · {student.college || 'College'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-heading" style={{ color: tier.color }}>
                          {Math.round(student.skill_score || 0)}
                        </div>
                        <div className="text-xs" style={{ color: tier.color }}>{tier.label}</div>
                      </div>
                      <button
                        onClick={e => toggleCompare(e, student)}
                        title="Add to compare"
                        className={`p-1.5 rounded-lg transition-all text-xs font-bold ${
                          inCompare ? 'bg-secondary/30 text-secondary' : 'hover:bg-dark-600 text-gray-500'
                        }`}>
                        ⚖️
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); shortlist(student); }}
                        className="p-2 rounded-lg transition-all hover:bg-secondary/20"
                        style={{ color: '#7B61FF' }}>
                        <Star size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Student Detail Panel */}
          {selectedStudent && (
            <motion.div
              initial={{ opacity:0, x:20 }}
              animate={{ opacity:1, x:0 }}
              className="w-80 flex-shrink-0">
              <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white font-heading text-sm">Candidate Profile</h3>
                  <button onClick={() => setSelectedStudent(null)}
                    className="text-gray-500 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* Avatar + Score */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white font-heading mx-auto mb-3"
                    style={{ background: `linear-gradient(135deg, ${getTierConfig(selectedStudent.skill_score||0).color}30, ${getTierConfig(selectedStudent.skill_score||0).color}60)` }}>
                    {selectedStudent.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <h3 className="font-bold text-white font-heading">{selectedStudent.full_name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedStudent.target_role}</p>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full"
                    style={{
                      background: `${getTierConfig(selectedStudent.skill_score||0).color}15`,
                      border: `1px solid ${getTierConfig(selectedStudent.skill_score||0).color}30`,
                    }}>
                    <Zap size={10} style={{ color: getTierConfig(selectedStudent.skill_score||0).color }} />
                    <span className="text-sm font-bold font-heading"
                      style={{ color: getTierConfig(selectedStudent.skill_score||0).color }}>
                      {Math.round(selectedStudent.skill_score || 0)}
                    </span>
                    <span className="text-xs" style={{ color: getTierConfig(selectedStudent.skill_score||0).color }}>
                      {getTierConfig(selectedStudent.skill_score||0).label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4 text-xs text-gray-400">
                  {selectedStudent.college && <p>🎓 {selectedStudent.college}</p>}
                  {selectedStudent.branch && <p>📚 {selectedStudent.branch}</p>}
                  {selectedStudent.graduation_year && <p>📅 Class of {selectedStudent.graduation_year}</p>}
                  {selectedStudent.github_username && (
                    <a href={`https://github.com/${selectedStudent.github_username}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline">
                      <Github size={11} /> {selectedStudent.github_username}
                    </a>
                  )}
                </div>

                {/* Skills */}
                {studentSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Verified Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {studentSkills.slice(0, 6).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary border border-primary/20">
                          {skill.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Trust Summary */}
                <div className="mb-4 p-3 rounded-xl"
                  style={{ background: 'rgba(0,255,148,0.06)', border: '1px solid rgba(0,255,148,0.15)' }}>
                  <p className="text-xs font-semibold text-primary mb-2">🤖 AI Trust Summary</p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {(selectedStudent.skill_score || 0) > 600
                      ? `Strong performer with ${Math.round(selectedStudent.skill_score)} score. Consistent activity pattern. Recommended for ${selectedStudent.target_role || 'engineering'} roles.`
                      : (selectedStudent.skill_score || 0) > 400
                      ? `Developing engineer with solid foundation. Score of ${Math.round(selectedStudent.skill_score)} shows active learning. Good potential for junior ${selectedStudent.target_role || 'developer'} roles.`
                      : `Early stage student with ${Math.round(selectedStudent.skill_score || 0)} score. Building fundamentals. Consider for internship or trainee positions.`
                    }
                  </p>
                </div>

                {/* Projects */}
                {studentProjects.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Projects</p>
                    <div className="space-y-2">
                      {studentProjects.slice(0, 2).map((project, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-dark-700">
                          <span className="text-xs text-white truncate flex-1">{project.title}</span>
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noreferrer"
                              className="text-gray-400 hover:text-white ml-2">
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trust Engine Panel */}
                <TrustPanel
                  studentId={selectedStudent.id}
                  profile={selectedStudent}
                  skills={studentSkills}
                  projects={studentProjects}
                  compact={true}
                />

                {/* Actions */}
                <div className="space-y-2">
                  <button onClick={() => shortlist(selectedStudent)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'rgba(123,97,255,0.15)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.3)' }}>
                    ⭐ Shortlist Candidate
                  </button>
                  <button onClick={() => toggleCompare({ stopPropagation: () => {} }, selectedStudent)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isInCompare(selectedStudent.id)
                        ? 'bg-secondary/20 border border-secondary/40 text-secondary'
                        : 'bg-dark-700 border border-dark-500 text-gray-300 hover:text-white'
                    }`}>
                    ⚖️ {isInCompare(selectedStudent.id) ? 'Remove from Compare' : 'Add to Compare'}
                  </button>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/u/${selectedStudent.id}`);
                    toast.success('Profile link copied!');
                  }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-dark-700 border border-dark-500 text-gray-300 hover:text-white transition-all">
                    🔗 Copy Profile Link
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && compareList.length === 2 && (
          <CompareModal
            students={compareList}
            onClose={() => { setShowCompare(false); setCompareList([]); }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default CompanySearch;
