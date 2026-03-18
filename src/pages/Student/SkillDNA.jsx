import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Target, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { generateSkillDNA } from '../../lib/claude';
import useStore from '../../store/useStore';
import usePlan from '../../hooks/usePlan';
import UpgradePrompt from '../../components/ui/UpgradePrompt';
import toast from 'react-hot-toast';

const SkillDNA = () => {
  const { profile } = useStore();
  const { can } = usePlan();
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [skills, setSkills] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    const [skillRes, attemptRes, nodeRes] = await Promise.all([
      supabase.from('skill_scores').select('*').eq('student_id', profile.id),
      supabase.from('test_attempts').select('*').eq('student_id', profile.id),
      supabase.from('roadmap_nodes').select('*, roadmaps!inner(student_id)')
        .eq('roadmaps.student_id', profile.id),
    ]);
    setSkills(skillRes.data || []);
    setAttempts(attemptRes.data || []);
    setNodes(nodeRes.data || []);
  };

  const generateDNA = async () => {
    setLoading(true);
    toast.loading('Analyzing your skill DNA...', { id: 'dna' });

    const completedNodes = nodes.filter(n => n.status === 'completed').length;
    const passedTests = attempts.filter(a => a.passed).length;
    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((a, t) => a + (t.percentage || 0), 0) / attempts.length)
      : 0;

    try {
      const studentData = {
        name: profile.full_name,
        score: profile.skill_score || 0,
        skills: skills.map(s => ({ name: s.skill_name, level: s.level, score: s.score })),
        completedNodes,
        passedTests,
        avgTestScore: avgScore,
        targetRole: profile.target_role,
        college: profile.college,
      };

      let report;
      try {
        report = await generateSkillDNA(studentData);
      } catch {
        report = `🧬 SKILL DNA REPORT — ${profile.full_name}

📊 LEARNING FINGERPRINT
Your strongest skill: ${skills[0]?.skill_name || 'Building (getting started)'}
Nodes completed: ${completedNodes}
Tests passed: ${passedTests}
Average test score: ${avgScore}%
Current Genois Score: ${Math.round(profile.skill_score || 0)}/1000

💪 STRENGTH MAP
${skills.length > 0 ? skills.slice(0,3).map(s => `• ${s.skill_name} — Level ${s.level}`).join('\n') : '• Keep completing nodes to reveal your strengths'}

⚠️ AREAS TO IMPROVE
${completedNodes < 3 ? '• Complete more roadmap nodes to unlock your full potential' : '• Focus on your weakest test scores to boost your Genois Score'}
${passedTests === 0 ? '• Take your first test to start building verified proof' : '• Maintain consistency — streak builds compound progress'}

📈 GROWTH ANALYSIS
At your current pace, you are building real verified skills.
${profile.skill_score > 200 ? `Your ${Math.round(profile.skill_score)} score puts you in the Developing tier.` : 'Complete your first 3 nodes to unlock your score.'}

🎯 THIS WEEK'S MISSION
${skills.length === 0
  ? 'Start your roadmap and complete your first 2 nodes. One task per day is enough.'
  : `Deep dive into ${skills[0]?.skill_name || 'your current topic'} — master it completely before moving on.`}

Keep going. Every day you show up is a day most students didn't.`;
      }

      setDna(report);
      setGenerated(true);
      toast.success('Skill DNA generated! 🧬', { id: 'dna' });
    } catch (err) {
      toast.error('Failed to generate', { id: 'dna' });
    }
    setLoading(false);
  };

  const score = Math.round(profile?.skill_score || 0);
  const completedNodes = nodes.filter(n => n.status === 'completed').length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">

        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Skill DNA 🧬</h1>
          <p className="text-gray-500 text-sm mt-1">
            Deep AI analysis of your learning patterns and skill profile
          </p>
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Zap,        label: 'Genois Score',    value: score,          color: '#00FF94' },
            { icon: Target,     label: 'Nodes Done',      value: completedNodes, color: '#7B61FF' },
            { icon: TrendingUp, label: 'Skills Verified', value: skills.length,  color: '#4A9EFF' },
          ].map((stat, i) => (
            <div key={i} className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
              <stat.icon size={16} className="mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-xl font-bold font-heading" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {!can('skillDNA') ? (
          <UpgradePrompt feature="Skill DNA Report" requiredPlan="identity" />
        ) : !generated ? (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🧬</div>
            <h2 className="text-lg font-bold text-white font-heading mb-2">
              Generate Your Skill DNA Report
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              AI analyzes your learning patterns, test scores, skill levels, and activity to create a deep personal report.
            </p>
            <button onClick={generateDNA} disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-dark-900 font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all disabled:opacity-50 mx-auto">
              {loading ? (
                <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Brain size={16} />
              )}
              {loading ? 'Analyzing...' : 'Generate My Skill DNA'}
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="bg-dark-800 border border-primary/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white font-heading flex items-center gap-2">
                <Brain size={16} className="text-primary" /> Your Skill DNA Report
              </h2>
              <button onClick={() => { setGenerated(false); setDna(null); }}
                className="text-xs text-gray-500 hover:text-white transition-colors">
                Regenerate
              </button>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-mono bg-dark-700 rounded-xl p-5">
              {dna}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
              <Clock size={11} />
              <span>Generated on {new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SkillDNA;
