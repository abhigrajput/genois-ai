import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, X, Clock,
         TrendingUp, Briefcase, Star,
         ChevronRight, BarChart2 } from 'lucide-react';
import DOMAINS, { TIMELINES } from '../data/domains';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const DomainExplorer = () => {
  const { profile, setProfile } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState('explore');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [compareDomains, setCompareDomains] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState('6months');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');

  const toggleCompare = (domain) => {
    if (compareDomains.find(d => d.id === domain.id)) {
      setCompareDomains(compareDomains.filter(d => d.id !== domain.id));
    } else if (compareDomains.length < 3) {
      setCompareDomains([...compareDomains, domain]);
    } else {
      toast.error('Compare max 3 domains at once');
    }
  };

  const saveDomainAndTimeline = async () => {
    if (!selectedDomain || !selectedTimeline) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        domain_id: selectedDomain.id,
        timeline: selectedTimeline,
        timeline_start_date: new Date().toISOString(),
        target_role: selectedDomain.jobRoles[0],
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to save: ' + error.message);
      setSaving(false);
      return;
    }

    if (data) setProfile(data);

    // Delete old roadmap and generate new one for this domain
    const { data: oldRoadmaps } = await supabase
      .from('roadmaps')
      .select('id')
      .eq('student_id', profile.id);

    if (oldRoadmaps?.length > 0) {
      const roadmapIds = oldRoadmaps.map(r => r.id);
      await supabase.from('roadmap_nodes').delete().in('roadmap_id', roadmapIds);
      await supabase.from('roadmaps').delete().eq('student_id', profile.id);
    }

    // Create new roadmap for selected domain
    const { data: newRoadmap } = await supabase
      .from('roadmaps')
      .insert({
        student_id: profile.id,
        title: `${selectedDomain.name} Roadmap`,
        domain: selectedDomain.id,
        status: 'active',
      })
      .select()
      .single();

    if (newRoadmap) {
      const nodes = selectedDomain.roadmapPreview.map((title, i) => ({
        roadmap_id: newRoadmap.id,
        title,
        description: `Master ${title} as part of your ${selectedDomain.name} journey`,
        order_index: i,
        status: i === 0 ? 'unlocked' : 'locked',
        skills: selectedDomain.skills.slice(0, 3),
        estimated_days: TIMELINES[selectedTimeline].nodeUnlockDays,
      }));
      await supabase.from('roadmap_nodes').insert(nodes);
    }

    toast.success(`${selectedDomain.name} roadmap generated! 🚀`);
    setSaving(false);
    navigate('/student/roadmap');
  };

  return (
    <div className="min-h-screen bg-dark-900 p-5 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-3">
            Find Your <span className="text-primary">Domain</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Not sure what to learn? Explore all domains, compare them side by side,
            and pick the one that fits your goals. Then set your timeline.
          </p>
        </motion.div>

        {/* Step tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { id: 'explore',  label: '1. Explore Domains' },
            { id: 'compare',  label: '2. Compare' },
            { id: 'timeline', label: '3. Set Timeline' },
          ].map((s) => (
            <button key={s.id}
              onClick={() => s.id === 'compare'
                ? compareDomains.length > 0 && setStep(s.id)
                : setStep(s.id)
              }
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                step === s.id
                  ? 'bg-primary text-dark-900'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* EXPLORE STEP */}
        {step === 'explore' && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DOMAINS.map((domain, i) => (
                <motion.div key={domain.id}
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.07 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  style={{
                    background: selectedDomain?.id === domain.id
                      ? `linear-gradient(135deg, ${domain.color}15, rgba(18,18,26,0.95))`
                      : 'rgba(18,18,26,0.8)',
                    border: `1px solid ${selectedDomain?.id === domain.id ? domain.color + '40' : 'rgba(34,34,51,0.8)'}`,
                  }}>

                  {/* Compare toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCompare(domain); }}
                    className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all z-10 ${
                      compareDomains.find(d => d.id === domain.id)
                        ? 'bg-primary text-dark-900'
                        : 'bg-dark-600 text-gray-500 hover:bg-dark-500'
                    }`}>
                    {compareDomains.find(d => d.id === domain.id) ? '✓' : '+'}
                  </button>

                  <div className="p-5" onClick={() => {
                    setSelectedDomain(domain);
                    setStep('explore');
                  }}>
                    {/* Domain header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{domain.emoji}</span>
                      <div>
                        <h3 className="font-bold text-white font-heading text-sm">{domain.name}</h3>
                        <p className="text-xs" style={{ color: domain.color }}>{domain.tagline}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      {domain.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: '💰', label: 'Fresher', value: domain.avgSalary.fresher },
                        { icon: '📈', label: 'Demand',  value: domain.demand },
                        { icon: '⏱️', label: 'Time',    value: domain.timeToJob },
                      ].map((stat, j) => (
                        <div key={j} className="text-center p-2 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="text-sm mb-0.5">{stat.icon}</div>
                          <div className="text-xs font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Skills preview */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {domain.skills.slice(0, 4).map((skill, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-md text-xs"
                          style={{ background: `${domain.color}15`, color: domain.color, border: `1px solid ${domain.color}25` }}>
                          {skill}
                        </span>
                      ))}
                      {domain.skills.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md text-xs text-gray-600">
                          +{domain.skills.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Companies */}
                    <p className="text-xs text-gray-600 mb-3">
                      🏢 {domain.companies.slice(0, 3).join(' · ')}
                    </p>

                    {/* Select button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedDomain(domain); setStep('timeline'); }}
                      className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: `${domain.color}20`,
                        color: domain.color,
                        border: `1px solid ${domain.color}30`,
                      }}>
                      Choose This Domain →
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {selectedDomain?.id === domain.id && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="border-t px-5 pb-5"
                      style={{ borderColor: `${domain.color}20` }}>

                      {/* Tabs */}
                      <div className="flex gap-2 mt-4 mb-3">
                        {['roadmap', 'projects', 'fit'].map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                              activeTab === tab ? 'bg-primary text-dark-900' : 'text-gray-500 hover:text-white'
                            }`}>
                            {tab}
                          </button>
                        ))}
                      </div>

                      {activeTab === 'roadmap' && (
                        <div className="space-y-1">
                          {domain.roadmapPreview.map((node, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs text-gray-400">
                              <div className="w-1 h-1 rounded-full flex-shrink-0"
                                style={{ background: domain.color }} />
                              {node}
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'projects' && (
                        <div className="space-y-2">
                          {domain.projects.map((proj, j) => (
                            <div key={j} className="flex items-center justify-between p-2 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <div>
                                <p className="text-xs font-medium text-white">{proj.name}</p>
                                <p className="text-xs text-gray-600 capitalize">{proj.difficulty}</p>
                              </div>
                              <span className="text-xs text-gray-500">{proj.weeks}w</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'fit' && (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-success mb-1">✅ Good for you if:</p>
                            {domain.forYouIf.map((item, j) => (
                              <p key={j} className="text-xs text-gray-400">• {item}</p>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-danger mb-1">❌ Not ideal if:</p>
                            {domain.notForYouIf.map((item, j) => (
                              <p key={j} className="text-xs text-gray-400">• {item}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {compareDomains.length > 0 && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
                  style={{ background: '#1A1A27', border: '1px solid rgba(0,255,148,0.3)' }}>
                  <div className="flex gap-2">
                    {compareDomains.map(d => (
                      <span key={d.id} className="text-sm px-2 py-1 rounded-lg"
                        style={{ background: `${d.color}20`, color: d.color }}>
                        {d.emoji} {d.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => setStep('compare')}
                    className="px-4 py-2 bg-primary text-dark-900 font-bold rounded-xl text-xs">
                    Compare {compareDomains.length} →
                  </button>
                  <button onClick={() => setCompareDomains([])}
                    className="text-gray-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* COMPARE STEP */}
        {step === 'compare' && compareDomains.length > 0 && (
          <div>
            <h2 className="font-bold text-white font-heading text-center mb-6">
              Domain Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-500 w-32">Feature</th>
                    {compareDomains.map(d => (
                      <th key={d.id} className="p-3 text-center">
                        <div className="text-2xl mb-1">{d.emoji}</div>
                        <div className="font-bold text-sm font-heading" style={{ color: d.color }}>
                          {d.name.split(' ')[0]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {[
                    { label: 'Fresher Salary', key: 'salary' },
                    { label: 'Demand',         key: 'demand' },
                    { label: 'Difficulty',     key: 'difficulty' },
                    { label: 'Time to Job',    key: 'timeToJob' },
                    { label: 'Top Companies',  key: 'companies' },
                    { label: 'Key Skills',     key: 'skills' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-dark-800">
                      <td className="p-3 text-xs text-gray-500">{row.label}</td>
                      {compareDomains.map(d => (
                        <td key={d.id} className="p-3 text-center text-xs text-gray-300">
                          {row.key === 'salary'    && d.avgSalary.fresher}
                          {row.key === 'demand'    && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: `${d.color}15`, color: d.color }}>
                              {d.demand}
                            </span>
                          )}
                          {row.key === 'difficulty' && d.difficulty}
                          {row.key === 'timeToJob'  && d.timeToJob}
                          {row.key === 'companies'  && d.companies.slice(0, 2).join(', ')}
                          {row.key === 'skills'     && d.skills.slice(0, 3).join(', ')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => setStep('explore')}
                className="px-5 py-2.5 bg-dark-700 border border-dark-500 text-white rounded-xl text-sm font-semibold">
                ← Back
              </button>
              {compareDomains.map(d => (
                <button key={d.id}
                  onClick={() => { setSelectedDomain(d); setStep('timeline'); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: d.color, color: '#0A0A0F' }}>
                  Choose {d.name.split(' ')[0]} →
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE STEP */}
        {step === 'timeline' && selectedDomain && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-4xl">{selectedDomain.emoji}</span>
              <h2 className="text-xl font-bold font-heading text-white mt-2">
                {selectedDomain.name}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Now choose how fast you want to become job-ready
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {Object.values(TIMELINES).map((timeline, i) => (
                <motion.div key={timeline.id}
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedTimeline(timeline.id)}
                  className="p-5 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: selectedTimeline === timeline.id
                      ? `linear-gradient(135deg, ${timeline.color}15, rgba(18,18,26,0.95))`
                      : 'rgba(18,18,26,0.8)',
                    border: `1px solid ${selectedTimeline === timeline.id ? timeline.color + '40' : 'rgba(34,34,51,0.8)'}`,
                    boxShadow: selectedTimeline === timeline.id ? `0 0 20px ${timeline.color}15` : 'none',
                  }}>
                  <div className="text-3xl mb-2">{timeline.emoji}</div>
                  <h3 className="font-bold text-white font-heading mb-0.5">{timeline.label}</h3>
                  <p className="text-xs mb-4" style={{ color: timeline.color }}>
                    {timeline.tagline}
                  </p>

                  <div className="space-y-2 mb-4">
                    {[
                      { label: 'Tasks/day',     value: timeline.tasksPerDay },
                      { label: 'Tests/day',     value: timeline.testsPerDay },
                      { label: 'Project every', value: `${timeline.projectFrequencyWeeks} weeks` },
                      { label: 'Hours/day',     value: `${timeline.hoursPerDay}h` },
                    ].map((item, j) => (
                      <div key={j} className="flex justify-between text-xs">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-bold" style={{ color: timeline.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    {timeline.forYouIf.map((item, j) => (
                      <p key={j} className="text-xs text-gray-500">✓ {item}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Project roadmap preview */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-white font-heading text-sm mb-4">
                📅 Your Project Timeline
              </h3>
              <div className="space-y-3">
                {selectedDomain.projects.map((proj, i) => {
                  const tl = TIMELINES[selectedTimeline];
                  const startWeek = i * tl.projectFrequencyWeeks + 1;
                  const endWeek   = startWeek + proj.weeks - 1;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,34,51,0.5)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: `${selectedDomain.color}20`, color: selectedDomain.color }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white">{proj.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{proj.difficulty} · {proj.weeks} weeks to build</p>
                      </div>
                      <span className="text-xs text-gray-600">Week {startWeek}-{endWeek}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('explore')}
                className="px-5 py-3 bg-dark-700 border border-dark-500 text-white rounded-xl text-sm font-semibold">
                ← Change Domain
              </button>
              <button onClick={saveDomainAndTimeline} disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: selectedDomain.color, color: '#0A0A0F' }}>
                {saving && (
                  <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                )}
                Start My {TIMELINES[selectedTimeline].label} Journey →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainExplorer;
