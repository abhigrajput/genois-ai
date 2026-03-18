import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Github, ExternalLink, Zap, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  calculateDetailedScore,
  getJobReadiness,
  generateCompanyTrustSummary,
} from '../../lib/scoring';

const PublicProfile = () => {
  const { username: id } = useParams();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [badges, setBadges] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    if (id) fetchPublicProfile();
  }, [id]);

  const fetchPublicProfile = async () => {
    setLoading(true);
    const [profileRes, skillRes, projectRes, badgeRes, nodeRes] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('skill_scores').select('*').eq('student_id', id),
        supabase.from('projects').select('*').eq('student_id', id),
        supabase.from('student_badges').select('*, badges(*)').eq('student_id', id),
        supabase.from('roadmap_nodes')
          .select('*, roadmaps!inner(student_id)')
          .eq('roadmaps.student_id', id),
      ]);

    const profileData = profileRes.data;
    if (!profileData) { setLoading(false); return; }

    setProfile(profileData);
    setSkills(skillRes.data || []);
    setProjects(projectRes.data || []);
    setBadges(badgeRes.data || []);
    setNodes(nodeRes.data || []);

    const detailed = await calculateDetailedScore(id, supabase);
    setScoreData(detailed);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-dark-600 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-white font-heading font-bold">Profile not found</p>
        <p className="text-gray-500 text-sm mt-1">Check the link and try again</p>
      </div>
    </div>
  );

  const score = Math.round(profile.skill_score || 0);
  const jobReadiness = getJobReadiness(scoreData, profile);
  const trustSummary = generateCompanyTrustSummary(scoreData, profile, skills, projects);
  const completedNodes = nodes.filter(n => n.status === 'completed').length;
  const verifiedProjects = projects.filter(p => p.verified).length;

  const getTierConfig = (s) => {
    if (s >= 801) return { label: 'Elite',      color: '#FFD700' };
    if (s >= 601) return { label: 'Advanced',   color: '#7B61FF' };
    if (s >= 401) return { label: 'Proficient', color: '#00FF94' };
    if (s >= 201) return { label: 'Developing', color: '#4A9EFF' };
    return              { label: 'Beginner',   color: '#666'    };
  };

  const tier = getTierConfig(score);

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Powered by badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-primary">
            <Zap size={10} /> Verified by Genois AI
          </span>
        </div>

        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{
            background: `linear-gradient(135deg, ${tier.color}10, rgba(18,18,26,0.95))`,
            border: `1px solid ${tier.color}25`,
          }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${tier.color}30, ${tier.color}60)` }}>
                {profile.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading text-white">
                  {profile.full_name}
                </h1>
                <p className="text-sm text-gray-400">{profile.target_role}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {profile.college && (
                    <span className="text-xs text-gray-500">🎓 {profile.college}</span>
                  )}
                  {profile.graduation_year && (
                    <span className="text-xs text-gray-500">
                      <Calendar size={10} className="inline mr-1" />
                      Class of {profile.graduation_year}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="text-3xl font-bold font-heading" style={{ color: tier.color }}>
                {score}
              </div>
              <div className="text-xs font-semibold" style={{ color: tier.color }}>
                {tier.label}
              </div>
              <div className="text-xs text-gray-600">Genois Score™</div>
            </div>
          </div>

          {/* Verified + GitHub */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.2)' }}>
              <Shield size={11} className="text-primary" />
              <span className="text-xs text-primary font-bold">VERIFIED BY GENOIS AI</span>
            </div>
            {profile.github_username && (
              <a href={`https://github.com/${profile.github_username}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-gray-300 hover:text-white text-xs transition-all">
                <Github size={11} /> {profile.github_username}
              </a>
            )}
          </div>
        </motion.div>

        {/* AI Trust Summary */}
        <div className="p-4 rounded-xl"
          style={{ background: 'rgba(0,255,148,0.05)', border: '1px solid rgba(0,255,148,0.15)' }}>
          <p className="text-xs font-semibold text-primary mb-1">
            🤖 AI Trust Summary (for recruiters)
          </p>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            "{trustSummary}"
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Nodes Done',    value: completedNodes,               icon: '🗺️' },
            { label: 'Tests Passed',  value: scoreData?.raw.passedTests || 0, icon: '📝' },
            { label: 'Projects',      value: projects.length,               icon: '💻' },
            { label: 'Verified',      value: verifiedProjects,              icon: '✅' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-3 bg-dark-800 border border-dark-600 rounded-xl">
              <div className="text-lg">{stat.icon}</div>
              <div className="text-lg font-bold font-heading text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Job Readiness */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white font-heading">
              {jobReadiness.badge} Job Readiness
            </span>
            <span className="text-sm font-bold" style={{ color: jobReadiness.color }}>
              {jobReadiness.percentage}%
            </span>
          </div>
          <div className="h-2.5 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${jobReadiness.percentage}%` }}
              transition={{ duration: 1.5 }}
              className="h-full rounded-full"
              style={{ background: jobReadiness.color }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">{jobReadiness.status}</p>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <h2 className="font-bold text-white font-heading text-sm mb-3 flex items-center gap-2">
              <Zap size={13} className="text-primary" /> Verified Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => {
                const colors = ['#4A9EFF', '#00FF94', '#7B61FF', '#FFB347', '#FFD700'];
                const color = colors[Math.min((skill.level || 1) - 1, 4)];
                return (
                  <span key={i}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                    {skill.skill_name}
                    <span className="opacity-60">L{skill.level || 1}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <h2 className="font-bold text-white font-heading text-sm mb-3">💻 Projects</h2>
            <div className="space-y-3">
              {projects.map((project, i) => (
                <div key={i} className="p-3 rounded-xl bg-dark-700 border border-dark-500">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                      {project.verified && (
                        <span className="text-xs font-bold text-primary">✅ Verified</span>
                      )}
                      {project.metadata?.difficulty && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                          style={{
                            background: project.metadata.difficulty === 'advanced'
                              ? 'rgba(255,179,71,0.1)' : 'rgba(123,97,255,0.1)',
                            color: project.metadata.difficulty === 'advanced'
                              ? '#FFB347' : '#7B61FF',
                          }}>
                          {project.metadata.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noreferrer"
                          className="text-gray-400 hover:text-white transition-colors">
                          <Github size={13} />
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noreferrer"
                          className="text-gray-400 hover:text-white transition-colors">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-400 leading-relaxed">{project.description}</p>
                  )}
                  {project.metadata?.commit_count && (
                    <p className="text-xs text-gray-600 mt-1">
                      {project.metadata.commit_count} commits · {project.metadata.language}
                    </p>
                  )}
                  {project.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tech_stack.map((tech, j) => (
                        <span key={j}
                          className="text-xs px-1.5 py-0.5 bg-dark-600 text-gray-400 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <h2 className="font-bold text-white font-heading text-sm mb-3">🏆 Earned Badges</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((sb, i) => {
                const badge = sb.badges;
                const rarityColors = {
                  common: '#666', rare: '#4A9EFF',
                  epic: '#7B61FF', legendary: '#FFD700',
                };
                const color = rarityColors[badge?.rarity || 'common'];
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                    <span className="text-lg">{badge?.icon}</span>
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

        {/* Score breakdown */}
        {scoreData && (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <h2 className="font-bold text-white font-heading text-sm mb-3">
              🔍 Score Breakdown (Anti-Fake Verification)
            </h2>
            <div className="space-y-2.5">
              {Object.entries(scoreData.breakdown).map(([key, item]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 capitalize">{key} ({item.weight})</span>
                    <div className="flex gap-2">
                      <span className="text-gray-600">{item.details}</span>
                      <span className="font-bold font-mono" style={{ color: item.color }}>
                        {item.score}/{item.max}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.score / item.max) * 100}%`,
                        background: item.color,
                      }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              Score built from real daily activity. Cannot be faked.
              Verified at genois-ai.vercel.app
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-600">
            Powered by{' '}
            <span className="text-primary">Genois AI</span>
            {' '}— Verified Skill Identity for Engineers
          </p>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
