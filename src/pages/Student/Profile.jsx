import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, ExternalLink,
         Download, Edit, MapPin, GraduationCap,
         Shield, Star, Zap, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const TIER_CONFIG = {
  Elite:      { color: '#FFD700', bg: 'rgba(255,215,0,0.1)',   border: 'rgba(255,215,0,0.3)'   },
  Advanced:   { color: '#7B61FF', bg: 'rgba(123,97,255,0.1)', border: 'rgba(123,97,255,0.3)'  },
  Proficient: { color: '#00FF94', bg: 'rgba(0,255,148,0.1)',  border: 'rgba(0,255,148,0.3)'   },
  Developing: { color: '#4A9EFF', bg: 'rgba(74,158,255,0.1)', border: 'rgba(74,158,255,0.3)'  },
  Beginner:   { color: '#666',    bg: 'rgba(102,102,102,0.1)',border: 'rgba(102,102,102,0.3)' },
};

const getTier = (score) => {
  if (score >= 801) return 'Elite';
  if (score >= 601) return 'Advanced';
  if (score >= 401) return 'Proficient';
  if (score >= 201) return 'Developing';
  return 'Beginner';
};

const Profile = () => {
  const { profile, setProfile } = useStore();
  const [skills, setSkills] = useState([]);
  const [badges, setBadges] = useState([]);
  const [projects, setProjects] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    full_name: '', bio: '', github_username: '',
    linkedin_url: '', target_role: '', college: '',
    branch: '', graduation_year: '',
  });
  const [addingProject, setAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', tech_stack: '',
    github_url: '', live_url: '',
  });

  useEffect(() => {
    if (profile?.id) {
      fetchProfileData();
      setEditForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        github_username: profile.github_username || '',
        linkedin_url: profile.linkedin_url || '',
        target_role: profile.target_role || '',
        college: profile.college || '',
        branch: profile.branch || '',
        graduation_year: profile.graduation_year || '',
      });
    }
  }, [profile]);

  const fetchProfileData = async () => {
    setLoading(true);
    const [skillRes, badgeRes, projectRes, nodeRes, attemptRes] = await Promise.all([
      supabase.from('skill_scores').select('*').eq('student_id', profile.id),
      supabase.from('student_badges').select('*, badges(*)').eq('student_id', profile.id),
      supabase.from('projects').select('*').eq('student_id', profile.id),
      supabase.from('roadmap_nodes').select('*, roadmaps!inner(student_id)')
        .eq('roadmaps.student_id', profile.id),
      supabase.from('test_attempts').select('*').eq('student_id', profile.id),
    ]);
    setSkills(skillRes.data || []);
    setBadges(badgeRes.data || []);
    setProjects(projectRes.data || []);
    setNodes(nodeRes.data || []);
    setAttempts(attemptRes.data || []);
    setLoading(false);
  };

  const saveProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...editForm,
        graduation_year: editForm.graduation_year
          ? parseInt(editForm.graduation_year) : null,
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) { toast.error('Failed to save profile'); return; }
    setProfile(data);
    setEditing(false);
    toast.success('Profile updated! ✅');
  };

  const addProject = async () => {
    if (!projectForm.title) { toast.error('Project title is required'); return; }
    const techArray = projectForm.tech_stack
      .split(',').map(t => t.trim()).filter(Boolean);

    const { error } = await supabase.from('projects').insert({
      student_id: profile.id,
      title: projectForm.title,
      description: projectForm.description,
      tech_stack: techArray,
      github_url: projectForm.github_url,
      live_url: projectForm.live_url,
    });

    if (error) { toast.error('Failed to add project'); return; }
    toast.success('Project added! 🚀');
    setProjectForm({ title: '', description: '', tech_stack: '', github_url: '', live_url: '' });
    setAddingProject(false);
    fetchProfileData();
  };

  const score = Math.round(profile?.skill_score || 0);
  const tier = getTier(score);
  const t = TIER_CONFIG[tier];
  const completedNodes = nodes.filter(n => n.status === 'completed').length;
  const passedTests = attempts.filter(a => a.passed).length;
  const totalStudyHours = Math.round((completedNodes * 3) + (passedTests * 0.5));

  const SKILL_LEVEL_COLORS = ['', '#4A9EFF', '#00FF94', '#7B61FF', '#FFB347', '#FFD700'];

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-primary rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Profile Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #12121A 0%, #1A1A27 100%)', border: '1px solid rgba(34,34,51,0.8)' }}>

          {/* Banner */}
          <div className="h-24 w-full"
            style={{ background: `linear-gradient(135deg, ${t.bg}, rgba(18,18,26,0.5))` }} />

          <div className="px-6 pb-6">
            {/* Avatar + Edit row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white font-heading border-4 border-dark-800"
                  style={{ background: `linear-gradient(135deg, ${t.color}30, ${t.color}60)` }}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'G'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-dark-800" />
              </div>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(0,255,148,0.1)', color: '#00FF94', border: '1px solid rgba(0,255,148,0.3)' }}>
                  <Edit size={13} /> {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Edit form */}
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'full_name', label: 'Full Name', placeholder: 'Your name' },
                    { key: 'target_role', label: 'Target Role', placeholder: 'e.g. Full Stack Developer' },
                    { key: 'college', label: 'College', placeholder: 'Your college name' },
                    { key: 'branch', label: 'Branch', placeholder: 'e.g. Computer Science' },
                    { key: 'github_username', label: 'GitHub Username', placeholder: 'username only' },
                    { key: 'graduation_year', label: 'Graduation Year', placeholder: '2025' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
                      <input
                        value={editForm[field.key]}
                        onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell companies about yourself..."
                    rows={2}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
                <button onClick={saveProfile}
                  className="px-6 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all">
                  Save Profile ✅
                </button>
              </div>
            ) : (
              <>
                {/* Name + Role */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-xl font-bold text-white font-heading">
                      {profile?.full_name || 'Your Name'}
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {profile?.target_role || 'Add your target role'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {profile?.college && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <GraduationCap size={11} /> {profile.college}
                        </span>
                      )}
                      {profile?.branch && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={11} /> {profile.branch}
                        </span>
                      )}
                      {profile?.graduation_year && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={11} /> Class of {profile.graduation_year}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="text-center px-4 py-2 rounded-xl"
                    style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                    <div className="text-2xl font-bold font-heading" style={{ color: t.color }}>
                      {score}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: t.color }}>{tier}</div>
                    <div className="text-xs text-gray-600">Genois Score™</div>
                  </div>
                </div>

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-sm text-gray-400 mb-3 leading-relaxed">{profile.bio}</p>
                )}

                {/* Verified badge + GitHub */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.2)' }}>
                    <Shield size={11} className="text-primary" />
                    <span className="text-xs text-primary font-semibold">VERIFIED BY GENOIS AI</span>
                  </div>
                  {profile?.github_username && (
                    <a href={`https://github.com/${profile.github_username}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-gray-300 hover:text-white transition-all text-xs">
                      <Github size={11} /> {profile.github_username}
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '🗺️', label: 'Nodes Done',   value: completedNodes    },
            { icon: '📝', label: 'Tests Passed',  value: passedTests       },
            { icon: '⏱️', label: 'Study Hours',   value: totalStudyHours  },
            { icon: '🏆', label: 'Badges Earned', value: badges.length     },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-white font-heading">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading mb-4 flex items-center gap-2">
              <Zap size={15} className="text-primary" /> Verified Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <motion.span key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: `${SKILL_LEVEL_COLORS[Math.min(skill.level || 1, 5)]}15`,
                    color: SKILL_LEVEL_COLORS[Math.min(skill.level || 1, 5)],
                    border: `1px solid ${SKILL_LEVEL_COLORS[Math.min(skill.level || 1, 5)]}30`,
                  }}>
                  <span>{skill.skill_name}</span>
                  <span className="opacity-60">L{skill.level || 1}</span>
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white font-heading flex items-center gap-2">
              💻 Projects
              <span className="text-xs text-gray-500 font-normal">({projects.length})</span>
            </h2>
            <button onClick={() => setAddingProject(!addingProject)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(123,97,255,0.1)', color: '#7B61FF', border: '1px solid rgba(123,97,255,0.3)' }}>
              {addingProject ? 'Cancel' : '+ Add Project'}
            </button>
          </div>

          {/* Add project form */}
          {addingProject && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-dark-700 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Project Title *</label>
                  <input value={projectForm.title}
                    onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="My Awesome Project"
                    className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tech Stack (comma separated)</label>
                  <input value={projectForm.tech_stack}
                    onChange={e => setProjectForm(f => ({ ...f, tech_stack: e.target.value }))}
                    placeholder="React, Node.js, PostgreSQL"
                    className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea value={projectForm.description}
                  onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does this project do?"
                  rows={2}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">GitHub URL</label>
                  <input value={projectForm.github_url}
                    onChange={e => setProjectForm(f => ({ ...f, github_url: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Live URL</label>
                  <input value={projectForm.live_url}
                    onChange={e => setProjectForm(f => ({ ...f, live_url: e.target.value }))}
                    placeholder="https://myproject.vercel.app"
                    className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <button onClick={addProject}
                className="px-5 py-2 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all">
                Add Project 🚀
              </button>
            </motion.div>
          )}

          {projects.length === 0 && !addingProject ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">💻</div>
              <p className="text-gray-500 text-sm mb-3">No projects yet</p>
              <button onClick={() => setAddingProject(true)}
                className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-xl text-xs font-semibold">
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {projects.map((project, i) => (
                <motion.div key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-dark-500 bg-dark-700 hover:border-dark-300 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm">{project.title}</h3>
                    <div className="flex gap-1.5">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors">
                          <Github size={12} />
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {project.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech_stack.map((tech, j) => (
                        <span key={j} className="px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-md text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading mb-4 flex items-center gap-2">
              <Star size={15} className="text-warning" /> Earned Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              {badges.map((sb, i) => {
                const badge = sb.badges;
                const rarityColors = {
                  common:    '#666',
                  rare:      '#4A9EFF',
                  epic:      '#7B61FF',
                  legendary: '#FFD700',
                };
                const color = rarityColors[badge?.rarity || 'common'];
                return (
                  <div key={sb.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                    <span className="text-lg">{badge?.icon || '🏆'}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{badge?.name}</p>
                      <p className="text-xs capitalize" style={{ color }}>{badge?.rarity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Public profile link */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Your Public Profile</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Share this link with companies — no resume needed
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/u/${profile?.id}`);
              toast.success('Profile link copied! 🔗');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(0,255,148,0.1)', color: '#00FF94', border: '1px solid rgba(0,255,148,0.3)' }}>
            🔗 Copy Link
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;
