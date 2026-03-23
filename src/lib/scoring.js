export const calculateDetailedScore = async (studentId, supabase) => {
  const [taskRes, testRes, projectRes, nodeRes, streakRes] =
    await Promise.all([
      supabase.from('tasks').select('*')
        .eq('student_id', studentId)
        .eq('status', 'completed'),
      supabase.from('test_attempts').select('*')
        .eq('student_id', studentId),
      supabase.from('projects').select('*')
        .eq('student_id', studentId),
      supabase.from('roadmap_nodes')
        .select('*, roadmaps!inner(student_id)')
        .eq('roadmaps.student_id', studentId),
      supabase.from('profiles').select('streak_count, last_active_date')
        .eq('id', studentId).single(),
    ]);

  const completedTasks = (taskRes.data || []).length;
  const tests = testRes.data || [];
  const projects = projectRes.data || [];
  const nodes = nodeRes.data || [];
  const streak = streakRes.data?.streak_count || 0;

  const completedNodes = nodes.filter(n => n.status === 'completed').length;
  const totalNodes = nodes.length || 1;
  const passedTests = tests.filter(t => t.passed).length;
  const avgTestScore = tests.length > 0
    ? tests.reduce((a, t) => a + (t.percentage || 0), 0) / tests.length
    : 0;
  const verifiedProjects = projects.filter(p => p.verified).length;
  const totalProjects = projects.length;

  // TASK SCORE (30%) — max 300
  const taskScore = Math.min(300,
    (completedTasks * 8) + (completedNodes * 15)
  );

  // TEST SCORE (25%) — max 250
  const testScore = Math.min(250,
    Math.round((avgTestScore / 100) * 200) + (passedTests * 10)
  );

  // PROJECT SCORE (30%) — max 300
  const projectScore = Math.min(300,
    (verifiedProjects * 80) + (totalProjects * 20)
  );

  // ACTIVITY/STREAK SCORE (15%) — max 150
  const streakScore = Math.min(150,
    (streak * 5) + (completedNodes > 0 ? 20 : 0)
  );

  const total = Math.min(1000, Math.round(
    taskScore + testScore + projectScore + streakScore
  ));

  return {
    total,
    breakdown: {
      tasks: {
        score: taskScore, max: 300, weight: '30%',
        details: `${completedTasks} tasks · ${completedNodes}/${totalNodes} nodes`,
        color: '#00FF94',
      },
      tests: {
        score: testScore, max: 250, weight: '25%',
        details: `${passedTests} passed · ${Math.round(avgTestScore)}% avg`,
        color: '#4A9EFF',
      },
      projects: {
        score: projectScore, max: 300, weight: '30%',
        details: `${verifiedProjects} verified · ${totalProjects} total`,
        color: '#7B61FF',
      },
      activity: {
        score: streakScore, max: 150, weight: '15%',
        details: `${streak} day streak`,
        color: '#FFB347',
      },
    },
    raw: {
      completedTasks, completedNodes, totalNodes,
      passedTests, totalTests: tests.length, avgTestScore,
      verifiedProjects, totalProjects, streak,
    },
  };
};

export const detectWeaknesses = (tests, skills, tasks) => {
  const weakAreas = [];
  const strongAreas = [];

  if (tests.length > 0) {
    const failRate = tests.filter(t => !t.passed).length / tests.length;
    if (failRate > 0.5) {
      weakAreas.push({
        area: 'Test Performance',
        severity: 'high',
        advice: 'Review explanations after each failed test. Retake failed tests.',
        icon: '📝',
      });
    }
    const avgScore = tests.reduce((a, t) => a + (t.percentage || 0), 0) / tests.length;
    if (avgScore < 50) {
      weakAreas.push({
        area: 'Core Concepts',
        severity: 'high',
        advice: 'Focus on fundamentals. Read notes before attempting tests.',
        icon: '🧠',
      });
    }
  }

  skills.forEach(skill => {
    if ((skill.score || 0) < 30) {
      weakAreas.push({
        area: skill.skill_name,
        severity: 'medium',
        advice: `Practice ${skill.skill_name} daily for 15 mins.`,
        icon: '⚡',
      });
    } else if ((skill.score || 0) > 70) {
      strongAreas.push({ area: skill.skill_name, strength: 'high' });
    }
  });

  const skipped = (tasks || []).filter(t =>
    t.status === 'pending' &&
    t.due_date < new Date().toISOString().split('T')[0]
  ).length;

  if (skipped > 3) {
    weakAreas.push({
      area: 'Task Consistency',
      severity: 'medium',
      advice: `${skipped} tasks skipped. Complete at least 1 task per day.`,
      icon: '📋',
    });
  }

  return {
    weakAreas: weakAreas.slice(0, 3),
    strongAreas: strongAreas.slice(0, 3),
  };
};

export const getJobReadiness = (scoreData, profile, extraData = {}) => {
  const raw = scoreData?.raw || {};

  // 30% — Skill Score component
  const scoreComponent = Math.min(30, ((profile?.skill_score || 0) / 1000) * 30);

  // 30% — Roadmap progress component
  const totalNodes = raw.totalNodes || extraData.totalNodes || 1;
  const completedNodes = raw.completedNodes || extraData.completedNodes || 0;
  const roadmapComponent = Math.min(30, (completedNodes / totalNodes) * 30);

  // 20% — Projects component
  const verifiedProjects = raw.verifiedProjects || extraData.verifiedProjects || 0;
  const totalProjects = raw.totalProjects || extraData.totalProjects || 0;
  const projectComponent = Math.min(20,
    (verifiedProjects * 8) + (totalProjects * 2)
  );

  // 20% — Tests component
  const totalTests = raw.totalTests || extraData.totalTests || 0;
  const passedTests = raw.passedTests || extraData.passedTests || 0;
  const avgTestScore = raw.avgTestScore || extraData.avgTestScore || 0;
  const testComponent = Math.min(20,
    totalTests > 0
      ? ((passedTests / totalTests) * 10) + ((avgTestScore / 100) * 10)
      : 0
  );

  const percentage = Math.min(100, Math.round(
    scoreComponent + roadmapComponent + projectComponent + testComponent
  ));

  let status, color, badge, description, nextStep;

  if (percentage >= 80) {
    status = 'Interview Ready 🏆';
    color = '#FFD700';
    badge = '🏆';
    description = 'You are ready for job interviews. Start applying now!';
    nextStep = 'Apply to companies on the platform';
  } else if (percentage >= 60) {
    status = 'Job Ready ✅';
    color = '#00FF94';
    badge = '✅';
    description = 'Strong profile. A few more projects will make you unstoppable.';
    nextStep = 'Add 1 more verified project to reach Interview Ready';
  } else if (percentage >= 30) {
    status = 'Learning 📈';
    color = '#4A9EFF';
    badge = '📈';
    description = 'Good progress. Keep completing roadmap nodes and taking tests.';
    nextStep = 'Complete 3 more roadmap nodes + pass 2 more tests';
  } else {
    status = 'Beginner 🌱';
    color = '#7B61FF';
    badge = '🌱';
    description = 'Just getting started. Complete your first 3 roadmap nodes.';
    nextStep = 'Complete first 3 roadmap nodes to level up';
  }

  const breakdown = {
    score:    { value: Math.round(scoreComponent),   max: 30, label: 'Skill Score',       color: '#00FF94' },
    roadmap:  { value: Math.round(roadmapComponent), max: 30, label: 'Roadmap Progress',  color: '#4A9EFF' },
    projects: { value: Math.round(projectComponent), max: 20, label: 'Projects',          color: '#7B61FF' },
    tests:    { value: Math.round(testComponent),    max: 20, label: 'Tests',             color: '#FFB347' },
  };

  return {
    percentage, status, color, badge, description, nextStep, breakdown,
    level: percentage >= 80 ? 'interview_ready'
      : percentage >= 60 ? 'job_ready'
      : percentage >= 30 ? 'learning'
      : 'beginner',
  };
};

export const saveScoreHistory = async (studentId, score, breakdown, supabase) => {
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('score_history').upsert({
    student_id: studentId,
    score: Math.round(score),
    recorded_at: today,
    breakdown,
  }, { onConflict: 'student_id,recorded_at' });
};

export const generateCompanyTrustSummary = (scoreData, profile, skills, projects) => {
  if (!scoreData) return 'Profile building in progress.';

  const { raw } = scoreData;
  const tier = scoreData.total >= 801 ? 'Elite'
    : scoreData.total >= 601 ? 'Advanced'
    : scoreData.total >= 401 ? 'Proficient'
    : scoreData.total >= 201 ? 'Developing'
    : 'Beginner';

  const topSkills = (skills || [])
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3)
    .map(s => s.skill_name);

  const verifiedCount = (projects || []).filter(p => p.verified).length;

  let summary = `${tier} engineer`;

  if (topSkills.length > 0) {
    summary += ` strong in ${topSkills.join(', ')}`;
  }

  if (raw.streak > 7) {
    summary += `, ${raw.streak}-day consistency streak`;
  }

  if (verifiedCount > 0) {
    summary += `, ${verifiedCount} GitHub-verified project${verifiedCount > 1 ? 's' : ''}`;
  }

  if (raw.passedTests > 0) {
    summary += `, ${raw.passedTests} tests passed`;
  }

  summary += '. Score built from real daily activity — not a certificate.';

  return summary;
};
