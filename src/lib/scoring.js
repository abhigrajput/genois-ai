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

export const getJobReadiness = (scoreData, profile) => {
  if (!scoreData) return { percentage: 0, status: 'Not Started', color: '#666', badge: '⭕' };
  const { raw } = scoreData;

  const roadmapPct = raw.totalNodes > 0
    ? (raw.completedNodes / raw.totalNodes) * 30 : 0;

  const scorePct = (scoreData.total / 1000) * 30;

  const projectPct = Math.min(20,
    (raw.verifiedProjects * 8) + (raw.totalProjects * 2)
  );

  const testPct = Math.min(20,
    raw.totalTests > 0
      ? (raw.avgTestScore / 100) * 20 : 0
  );

  const readiness = Math.min(100, Math.round(
    roadmapPct + scorePct + projectPct + testPct
  ));

  let status, color, badge;
  if (readiness >= 80) {
    status = 'Job Ready ✅'; color = '#00FF94'; badge = '🏆';
  } else if (readiness >= 60) {
    status = 'Almost Ready 🔥'; color = '#FFB347'; badge = '🔥';
  } else if (readiness >= 40) {
    status = 'Improving 📈'; color = '#4A9EFF'; badge = '📈';
  } else if (readiness >= 20) {
    status = 'Just Started 🌱'; color = '#7B61FF'; badge = '🌱';
  } else {
    status = 'Not Started'; color = '#666'; badge = '⭕';
  }

  return { percentage: readiness, status, color, badge };
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
