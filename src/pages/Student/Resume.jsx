import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, AlertTriangle, Github,
         ExternalLink, Shield, Zap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const Resume = () => {
  const { profile } = useStore();
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('builder');

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    const [skillRes, projectRes, nodeRes] = await Promise.all([
      supabase.from('skill_scores').select('*').eq('student_id', profile.id),
      supabase.from('projects').select('*').eq('student_id', profile.id),
      supabase.from('roadmap_nodes')
        .select('*, roadmaps!inner(student_id)')
        .eq('roadmaps.student_id', profile.id)
        .eq('status', 'completed'),
    ]);
    setSkills(skillRes.data || []);
    setProjects(projectRes.data || []);
    setNodes(nodeRes.data || []);
    setLoading(false);
  };

  const score = Math.round(profile?.skill_score || 0);

  const getTierColor = (s) => {
    if (s >= 801) return '#FFD700';
    if (s >= 601) return '#7B61FF';
    if (s >= 401) return '#00FF94';
    if (s >= 201) return '#4A9EFF';
    return '#666';
  };

  const getTierLabel = (s) => {
    if (s >= 801) return 'Elite';
    if (s >= 601) return 'Advanced';
    if (s >= 401) return 'Proficient';
    if (s >= 201) return 'Developing';
    return 'Beginner';
  };

  const handlePrint = () => {
    const content = document.getElementById('resume-content');
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>${profile?.full_name} — Resume</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #111; }
            h1 { font-size: 24px; margin: 0 0 4px; }
            h2 { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin: 16px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            p { font-size: 13px; margin: 4px 0; color: #444; }
            .skill-tag { display: inline-block; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin: 2px; }
            .score-bar { height: 6px; background: #eee; border-radius: 3px; margin-top: 4px; }
            .score-fill { height: 100%; background: #00b894; border-radius: 3px; }
            .project { margin-bottom: 12px; }
            .meta { font-size: 11px; color: #888; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
    toast.success('Opening print dialog!');
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-primary rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">
              Resume 📄
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Auto-generated from your Genois verified profile
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'builder' && (
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all">
                <Download size={14} /> Export PDF
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'builder', label: '📄 Resume Builder' },
            { id: 'destroyer', label: '💣 Resume Destroyer' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-dark-900'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* RESUME BUILDER */}
        {activeTab === 'builder' && (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
            <div id="resume-content"
              style={{
                background: 'white',
                color: '#111',
                padding: '40px',
                minHeight: '600px',
                fontFamily: 'Arial, sans-serif',
              }}>

              {/* Name + Role */}
              <div style={{ borderBottom: '2px solid #eee', paddingBottom: '16px', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 4px', color: '#111' }}>
                  {profile?.full_name || 'Your Name'}
                </h1>
                <p style={{ fontSize: '14px', color: '#555', margin: '0 0 8px' }}>
                  {profile?.target_role || 'Software Developer'}
                </p>
                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                  {[
                    profile?.email,
                    profile?.github_username && `github.com/${profile.github_username}`,
                    profile?.college,
                    profile?.graduation_year && `Class of ${profile.graduation_year}`,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>

              {/* Genois Score */}
              <div style={{ background: '#f8f8f8', border: '1px solid #eee', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#333', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Genois Score™ — Verified Skill Identity
                    </p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                      genois-ai.vercel.app/u/{profile?.id?.substring(0, 8)} · Built from real daily activity
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: getTierColor(score) }}>
                      {score}/1000
                    </p>
                    <p style={{ fontSize: '11px', color: getTierColor(score), margin: 0 }}>
                      {getTierLabel(score)}
                    </p>
                  </div>
                </div>
                <div style={{ height: '4px', background: '#eee', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{ height: '100%', width: `${(score / 1000) * 100}%`, background: getTierColor(score), borderRadius: '2px' }} />
                </div>
              </div>

              {/* Summary */}
              {profile?.bio && (
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    Summary
                  </h2>
                  <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    Verified Skills
                  </h2>
                  <div>
                    {skills.map((skill, i) => (
                      <span key={i} style={{ display: 'inline-block', background: '#f0f0f0', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', margin: '2px', color: '#333' }}>
                        {skill.skill_name} (L{skill.level || 1})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    Projects
                  </h2>
                  {projects.map((project, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', margin: 0 }}>
                            {project.title}
                          </p>
                          {project.verified && (
                            <span style={{ fontSize: '11px', color: '#00b894', fontWeight: 'bold' }}>✅ GitHub Verified</span>
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                          {[project.github_url && 'GitHub ↗', project.live_url && 'Live ↗'].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      {project.description && (
                        <p style={{ fontSize: '12px', color: '#555', margin: '4px 0', lineHeight: '1.5' }}>
                          {project.description}
                        </p>
                      )}
                      {project.tech_stack?.length > 0 && (
                        <p style={{ fontSize: '11px', color: '#888', margin: '4px 0' }}>
                          Tech: {project.tech_stack.join(', ')}
                        </p>
                      )}
                      {project.metadata?.commit_count && (
                        <p style={{ fontSize: '11px', color: '#00b894', margin: '2px 0' }}>
                          {project.metadata.commit_count} GitHub commits · {project.metadata.language}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  Education
                </h2>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', margin: '0 0 2px' }}>
                  {profile?.college || 'Your College'}
                </p>
                <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>
                  {profile?.branch || 'Computer Science Engineering'}
                  {profile?.graduation_year && ` · Class of ${profile.graduation_year}`}
                </p>
              </div>

              {/* Completed nodes */}
              {nodes.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    Verified Learning Milestones (Genois)
                  </h2>
                  {nodes.slice(0, 6).map((node, i) => (
                    <p key={i} style={{ fontSize: '12px', color: '#444', margin: '3px 0' }}>
                      ✓ {node.title}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESUME DESTROYER */}
        {activeTab === 'destroyer' && (
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl"
              style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(255,107,107,0.15)' }}>
                  💣
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-white font-heading text-lg">
                      Resume Destroyer
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Upload your resume → AI destroys it → You rebuild it better
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-5">
                Upload any resume and our AI will find every weakness, gap, and red flag
                that recruiters see in the first 6 seconds. Then it shows you exactly how
                to fix each one using your Genois verified data.
              </p>

              <div className="grid md:grid-cols-2 gap-3 mb-5">
                {[
                  { icon: '🔍', title: 'ATS Score Check', desc: "Does your resume pass Applicant Tracking Systems? Most don't." },
                  { icon: '💣', title: 'Weakness Finder', desc: 'AI finds every vague statement, gap, and red flag recruiters see' },
                  { icon: '✅', title: 'Line-by-line Fixes', desc: 'Specific rewrites using YOUR Genois verified activity data' },
                  { icon: '📊', title: 'Job Match Score', desc: 'Paste any job description — see how well your resume matches' },
                  { icon: '🎯', title: 'Role Fit Analysis', desc: 'Which roles you actually qualify for right now vs aspire to' },
                  { icon: '🚀', title: 'One-click Rebuild', desc: 'Instantly rebuild using your verified Genois profile data' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-700">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-dark-700 border border-dark-500 text-center">
                <p className="text-sm font-semibold text-white mb-1">
                  🔔 Launching with Identity Plan
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Join the waitlist to get early access + 20% launch discount
                </p>
                <a href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-dark-900 transition-all hover:opacity-90"
                  style={{ background: '#FF6B6B' }}>
                  Join Waitlist →
                </a>
              </div>
            </motion.div>

            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
              <h3 className="font-bold text-white font-heading text-sm mb-4">
                💀 Why 90% of Engineering Resumes Get Rejected
              </h3>
              <div className="space-y-2.5">
                {[
                  { issue: 'Generic project descriptions', fix: 'Add numbers, impact, specific tech used' },
                  { issue: 'Skills listed without proof', fix: 'Link to GitHub + Genois verified score' },
                  { issue: 'No quantifiable impact', fix: 'Add metrics: users, performance, time saved' },
                  { issue: 'ATS-incompatible formatting', fix: 'Simple layout, no tables, standard fonts' },
                  { issue: 'CGPA hiding actual skills', fix: 'Lead with projects and verified skills' },
                  { issue: 'Same resume for every job', fix: 'Tailor to each job description keywords' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-dark-700">
                    <span className="text-danger text-xs mt-0.5 flex-shrink-0 font-bold">✕</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{item.issue}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Fix: {item.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Resume;
