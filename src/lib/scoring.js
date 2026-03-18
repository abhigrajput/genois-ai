export const calculateDetailedScore = async (studentId, supabase) => {
  const [taskRes, testRes, projectRes, nodeRes, logRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('student_id', studentId),
    supabase.from('test_attempts').select('*').eq('student_id', studentId),
    supabase.from('projects').select('*').eq('student_id', studentId),
    supabase.from('roadmap_nodes').select('*, roadmaps!inner(student_id)').eq('roadmaps.student_id', studentId),
    supabase.from('time_logs').select('*').eq('student_id', studentId),
  ]);

  const tasks    = taskRes.data    || [];
  const tests    = testRes.data    || [];
  const projects = projectRes.data || [];
  const nodes    = nodeRes.data    || [];
  const logs     = logRes.data     || [];

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const passedTests    = tests.filter(t => t.passed).length;
  const totalTests     = tests.length;
  const avgTestScore   = totalTests > 0
    ? tests.reduce((a, t) => a + (t.percentage || 0), 0) / totalTests : 0;
  const completedNodes = nodes.filter(n => n.status === 'completed').length;
  const totalMinutes   = logs.reduce((a, l) => a + (l.duration_minutes || 0), 0);
  const projectCount   = projects.length;
  const streakDays     = Math.min(30, Math.floor(totalMinutes / 25));

  const performanceScore = Math.min(400, Math.round((avgTestScore / 100) * 400));
  const consistencyScore = Math.min(300, Math.round(
    (completedTasks * 8) + (streakDays * 5) + (completedNodes * 15)
  ));
  const buildScore = Math.min(200, Math.round(
    (projectCount * 40) + (completedNodes * 10)
  ));
  const growthScore = Math.min(100, Math.round(
    (passedTests * 15) + (totalMinutes / 60 * 5)
  ));

  const totalScore = Math.min(1000, performanceScore + consistencyScore + buildScore + growthScore);

  return {
    total: Math.round(totalScore),
    breakdown: {
      performance: { score: performanceScore, max: 400, weight: '40%',
        details: `${passedTests} tests passed · ${Math.round(avgTestScore)}% avg score` },
      consistency: { score: consistencyScore, max: 300, weight: '30%',
        details: `${completedTasks} tasks · ${completedNodes} nodes · ${streakDays} active days` },
      build:       { score: buildScore,       max: 200, weight: '20%',
        details: `${projectCount} projects · ${completedNodes} nodes completed` },
      growth:      { score: growthScore,      max: 100, weight: '10%',
        details: `${passedTests} tests passed · ${Math.round(totalMinutes/60)}h studied` },
    },
    raw: { completedTasks, passedTests, totalTests, avgTestScore,
           completedNodes, totalNodes: nodes.length, projectCount,
           totalMinutes, streakDays }
  };
};

export const detectWeaknesses = (tests, skills) => {
  const weakAreas   = [];
  const strongAreas = [];

  if (tests.length > 0) {
    const passRate = (tests.filter(t => t.passed).length / tests.length) * 100;
    if (passRate < 60) weakAreas.push({
      area: 'Test Performance', severity: 'high',
      advice: 'Retake failed tests and review explanations'
    });
  }

  skills.forEach(skill => {
    if ((skill.score || 0) < 30)
      weakAreas.push({ area: skill.skill_name, severity: 'medium', advice: `Practice more ${skill.skill_name} exercises` });
    else if ((skill.score || 0) > 70)
      strongAreas.push({ area: skill.skill_name, strength: 'high' });
  });

  return { weakAreas, strongAreas };
};

export const getJobReadiness = (scoreData) => {
  if (!scoreData) return { percentage: 0, status: 'Not Started', color: '#666' };
  const { raw } = scoreData;

  let readiness = 0;
  if (raw.completedNodes >= 3)  readiness += 20;
  if (raw.completedNodes >= 6)  readiness += 15;
  if (raw.passedTests >= 1)     readiness += 15;
  if (raw.passedTests >= 3)     readiness += 10;
  if (raw.projectCount >= 1)    readiness += 15;
  if (raw.projectCount >= 2)    readiness += 10;
  if (raw.completedTasks >= 10) readiness += 10;
  if (raw.streakDays >= 7)      readiness += 5;

  readiness = Math.min(100, readiness);

  let status, color;
  if (readiness >= 80)      { status = 'Job Ready ✅';    color = '#00FF94'; }
  else if (readiness >= 60) { status = 'Almost Ready 🔥'; color = '#FFB347'; }
  else if (readiness >= 40) { status = 'Developing 📈';   color = '#4A9EFF'; }
  else if (readiness >= 20) { status = 'Just Started 🌱'; color = '#7B61FF'; }
  else                      { status = 'Not Started';     color = '#666';    }

  return { percentage: readiness, status, color };
};
