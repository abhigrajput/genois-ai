import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, FileText,
         Shield, Activity, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
         XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0, totalCompanies: 0,
    totalTests: 0, avgScore: 0,
    activeToday: 0, totalRoadmaps: 0,
  });
  const [students, setStudents] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [studentRes, companyRes, testRes, roadmapRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'student'),
      supabase.from('profiles').select('*').eq('role', 'company'),
      supabase.from('test_attempts').select('*'),
      supabase.from('roadmaps').select('*'),
    ]);

    const studentData = studentRes.data || [];
    const avgScore = studentData.length > 0
      ? Math.round(studentData.reduce((a, s) => a + (s.skill_score || 0), 0) / studentData.length)
      : 0;

    const distribution = [
      { label: 'Beginner',   range: '0-200',   count: studentData.filter(s => (s.skill_score||0) <= 200).length,                                              color: '#666'    },
      { label: 'Developing', range: '201-400',  count: studentData.filter(s => (s.skill_score||0) > 200 && (s.skill_score||0) <= 400).length,                 color: '#4A9EFF' },
      { label: 'Proficient', range: '401-600',  count: studentData.filter(s => (s.skill_score||0) > 400 && (s.skill_score||0) <= 600).length,                 color: '#00FF94' },
      { label: 'Advanced',   range: '601-800',  count: studentData.filter(s => (s.skill_score||0) > 600 && (s.skill_score||0) <= 800).length,                 color: '#7B61FF' },
      { label: 'Elite',      range: '801+',     count: studentData.filter(s => (s.skill_score||0) > 800).length,                                              color: '#FFD700' },
    ];

    setStats({
      totalStudents: studentData.length,
      totalCompanies: (companyRes.data || []).length,
      totalTests: (testRes.data || []).length,
      avgScore,
      totalRoadmaps: (roadmapRes.data || []).length,
      activeToday: studentData.length,
    });
    setStudents(studentData.sort((a,b) => (b.skill_score||0) - (a.skill_score||0)));
    setScoreDistribution(distribution);
    setLoading(false);
  };

  const getTierColor = (score) => {
    if (score >= 801) return '#FFD700';
    if (score >= 601) return '#7B61FF';
    if (score >= 401) return '#00FF94';
    if (score >= 201) return '#4A9EFF';
    return '#666';
  };

  const kpis = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users,      color: '#00FF94' },
    { label: 'Companies',      value: stats.totalCompanies, icon: Shield,     color: '#7B61FF' },
    { label: 'Tests Taken',    value: stats.totalTests,     icon: FileText,   color: '#4A9EFF' },
    { label: 'Avg Score',      value: stats.avgScore,       icon: TrendingUp, color: '#FFB347' },
    { label: 'Roadmaps',       value: stats.totalRoadmaps,  icon: Activity,   color: '#FF6B6B' },
    { label: 'Active Users',   value: stats.activeToday,    icon: Star,       color: '#00D68F' },
  ];

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-primary rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Platform overview · Genois AI
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                style={{ background: `${kpi.color}15` }}>
                <kpi.icon size={13} style={{ color: kpi.color }} />
              </div>
              <div className="text-xl font-bold font-heading" style={{ color: kpi.color }}>
                {kpi.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Score Distribution Bar Chart */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-4">
              Score Distribution
            </h2>
            {scoreDistribution.every(d => d.count === 0) ? (
              <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={scoreDistribution}>
                  <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1A1A27', border: '1px solid #2A2A3F', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#E8E8F0' }}
                  />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {scoreDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Score Pie Chart */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <h2 className="font-bold text-white font-heading text-sm mb-4">
              Tier Breakdown
            </h2>
            {scoreDistribution.every(d => d.count === 0) ? (
              <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                No data yet
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={160}>
                  <PieChart>
                    <Pie data={scoreDistribution.filter(d => d.count > 0)}
                      dataKey="count" nameKey="label"
                      cx="50%" cy="50%" outerRadius={65} innerRadius={40}>
                      {scoreDistribution.filter(d => d.count > 0).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1A1A27', border: '1px solid #2A2A3F', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2">
                  {scoreDistribution.filter(d => d.count > 0).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className="text-xs font-bold" style={{ color: item.color }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white font-heading text-sm">
              All Students ({students.length})
            </h2>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No students registered yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    {['Student','College','Score','Tier','Target Role'].map(h => (
                      <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {students.map((student, i) => {
                    const color = getTierColor(student.skill_score || 0);
                    const tier = color === '#FFD700' ? 'Elite' : color === '#7B61FF' ? 'Advanced' : color === '#00FF94' ? 'Proficient' : color === '#4A9EFF' ? 'Developing' : 'Beginner';
                    return (
                      <motion.tr key={student.id}
                        initial={{ opacity:0 }}
                        animate={{ opacity:1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-dark-700 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: `${color}20` }}>
                              {student.full_name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-white">
                                {student.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-600">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-400">
                          {student.college || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm font-bold font-heading" style={{ color }}>
                            {Math.round(student.skill_score || 0)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                            {tier}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">
                          {student.target_role || '—'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
