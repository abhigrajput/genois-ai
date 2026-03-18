import React, { useState, useEffect } from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import { canAccess } from '../../lib/plans';
import UpgradePrompt from '../../components/ui/UpgradePrompt';
import toast from 'react-hot-toast';

const Resume = () => {
  const { profile } = useStore();
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('builder');
  const plan = profile?.plan || 'free';
  const canUseResume = canAccess(plan, 'resumeBuilder');

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    const [skillRes, projectRes, nodeRes] = await Promise.all([
      supabase.from('skill_scores').select('*').eq('student_id', profile.id),
      supabase.from('projects').select('*').eq('student_id', profile.id),
      supabase
        .from('roadmap_nodes')
        .select('*, roadmaps!inner(student_id)')
        .eq('roadmaps.student_id', profile.id)
        .eq('status', 'completed'),
    ]);
    setSkills(skillRes.data || []);
    setProjects(projectRes.data || []);
    setNodes(nodeRes.data || []);
    setLoading(false);
  };

  const getTierColor = (score) => {
    if (score >= 801) return '#FFD700';
    if (score >= 601) return '#7B61FF';
    if (score >= 401) return '#00FF94';
    if (score >= 201) return '#4A9EFF';
    return '#666';
  };

  const score = Math.round(profile?.skill_score || 0);

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">
              Resume Builder 📄
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Auto-generated from your verified Genois profile
            </p>
          </div>
          {canUseResume && (
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-dark-900 font-bold rounded-xl text-sm">
              <Download size={14} /> Export PDF
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'builder', label: '📄 Resume Builder' },
            { id: 'destroyer', label: '💣 Resume Destroyer' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-dark-900'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* RESUME BUILDER TAB */}
        {activeTab === 'builder' && (
          !canUseResume ? (
            <UpgradePrompt
              requiredPlan="starter"
              title="Resume Builder — Starter Plan"
              description="Auto-generate a professional resume from your verified Genois profile"
            />
          ) : (
            <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
              <div id="resume-content" className="p-8 bg-white text-gray-900 min-h-screen">

                {/* Header */}
                <div className="border-b-2 border-gray-200 pb-4 mb-5">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.full_name || 'Your Name'}
                  </h1>
                  <p className="text-gray-600 text-sm mt-0.5">
                    {profile?.target_role || 'Software Developer'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span>{profile?.email}</span>
                    {profile?.github_username && (
                      <span>github.com/{profile.github_username}</span>
                    )}
                    {profile?.college && <span>{profile.college}</span>}
                    {profile?.graduation_year && <span>Class of {profile.graduation_year}</span>}
                  </div>
                </div>

                {/* Genois Score */}
                <div className="mb-5 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        GENOIS SCORE™ — {score}/1000
                      </p>
                      <p className="text-xs text-gray-500">
                        Verified skill score based on real performance ·
                        genois-ai.vercel.app/u/{profile?.id?.substring(0, 8)}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-lg font-bold" style={{ color: getTierColor(score) }}>
                        {score >= 801 ? 'Elite' : score >= 601 ? 'Advanced' : score >= 401 ? 'Proficient' : score >= 201 ? 'Developing' : 'Beginner'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full rounded-full"
                      style={{ width: `${(score / 1000) * 100}%`, background: getTierColor(score) }} />
                  </div>
                </div>

                {/* Summary */}
                {profile?.bio && (
                  <div className="mb-5">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Summary</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="mb-5">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Verified Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          {skill.skill_name} (L{skill.level || 1})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                  <div className="mb-5">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Projects</h2>
                    <div className="space-y-3">
                      {projects.map((project, i) => (
                        <div key={i}>
                          <div className="flex items-start justify-between">
                            <h3 className="text-sm font-bold text-gray-800">{project.title}</h3>
                            <div className="flex gap-2 text-xs text-gray-400">
                              {project.github_url && <span>GitHub ↗</span>}
                              {project.live_url && <span>Live ↗</span>}
                            </div>
                          </div>
                          {project.description && (
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{project.description}</p>
                          )}
                          {project.tech_stack?.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">Tech: {project.tech_stack.join(', ')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                <div className="mb-5">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Education</h2>
                  <p className="text-sm font-bold text-gray-800">{profile?.college || 'Your College'}</p>
                  <p className="text-xs text-gray-600">
                    {profile?.branch || 'Computer Science'}
                    {profile?.graduation_year ? ` · Class of ${profile.graduation_year}` : ''}
                  </p>
                </div>

                {/* Completed Nodes */}
                {nodes.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Certifications & Courses (Genois Verified)
                    </h2>
                    <div className="space-y-1">
                      {nodes.slice(0, 5).map((node, i) => (
                        <p key={i} className="text-xs text-gray-600">✓ {node.title}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* RESUME DESTROYER TAB */}
        {activeTab === 'destroyer' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl"
              style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={20} className="text-danger" />
                <h2 className="font-bold text-white font-heading">Resume Destroyer</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-danger/20 text-danger">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Upload your resume and our AI will destroy it — pointing out every
                weakness, gap, and red flag that recruiters see. Then it tells you
                exactly how to fix it using your Genois verified profile.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: '🔍', title: 'ATS Score Analysis', desc: 'Check if your resume passes Applicant Tracking Systems' },
                  { icon: '💣', title: 'Weakness Detection', desc: 'AI finds every gap, vague statement, and red flag' },
                  { icon: '✅', title: 'Fix Suggestions', desc: 'Specific rewrites using your Genois verified data' },
                  { icon: '📊', title: 'Comparison Mode', desc: 'See how your resume stacks up against job description' },
                  { icon: '🎯', title: 'Role Matching', desc: 'Which roles your resume qualifies for right now' },
                  { icon: '🚀', title: 'Instant Rebuild', desc: 'One-click rebuild using your verified Genois profile' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-700">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-dark-700 border border-dark-500">
                <p className="text-xs text-gray-400 text-center">
                  🔔 Resume Destroyer is launching with the Identity plan.
                  <a href="/pricing" className="text-primary ml-1 hover:underline">Join waitlist →</a>
                </p>
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
              <h3 className="font-bold text-white font-heading text-sm mb-4">
                💀 Why 90% of Engineering Resumes Fail
              </h3>
              <div className="space-y-3">
                {[
                  { issue: 'Generic project descriptions', fix: 'Add numbers, impact, and specific tech used' },
                  { issue: 'Skills listed without proof', fix: 'Link to GitHub, projects, or Genois verified score' },
                  { issue: 'No quantifiable achievements', fix: 'Add metrics: users, performance, time saved' },
                  { issue: 'ATS unfriendly formatting', fix: 'Simple layout, no tables, standard fonts' },
                  { issue: 'CGPA hiding skills', fix: 'Lead with projects and verified skills, not CGPA' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-dark-700">
                    <span className="text-danger text-xs mt-0.5 flex-shrink-0">✕</span>
                    <div>
                      <p className="text-xs font-medium text-white">{item.issue}</p>
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
