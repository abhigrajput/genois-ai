export const generateTrustSummary = ({
  score,
  skills,
  passedTests,
  totalTests,
  completedTasks,
  verifiedProjects,
  totalProjects,
  streak,
  completedNodes,
  avgTestScore,
}) => {
  const points = [];
  const tier = score >= 801 ? 'Elite'
    : score >= 601 ? 'Advanced'
    : score >= 401 ? 'Proficient'
    : score >= 201 ? 'Developing'
    : 'Beginner';

  const topSkills = (skills || [])
    .sort((a,b) => (b.score||0)-(a.score||0))
    .slice(0,3)
    .map(s => s.skill_name);

  if (topSkills.length > 0) {
    points.push(`Strong in ${topSkills.join(', ')}`);
  }

  if (totalTests > 0) {
    const passRate = Math.round((passedTests / totalTests) * 100);
    if (passRate >= 80) points.push(`Excellent test performer (${passRate}% pass rate)`);
    else if (passRate >= 60) points.push(`Good test performer (${passRate}% pass rate)`);
    else points.push(`${passedTests} tests passed out of ${totalTests}`);
  }

  if (streak >= 30) points.push(`Exceptional consistency — ${streak} day streak`);
  else if (streak >= 14) points.push(`Consistent learner — ${streak} day streak`);
  else if (streak >= 7) points.push(`Building consistency — ${streak} day streak`);

  if (verifiedProjects >= 3) points.push(`${verifiedProjects} GitHub-verified projects`);
  else if (verifiedProjects >= 1) points.push(`${verifiedProjects} GitHub-verified project`);
  else if (totalProjects >= 1) points.push(`${totalProjects} project(s) added`);

  if (completedTasks >= 50) points.push(`Highly active — ${completedTasks} tasks completed`);
  else if (completedTasks >= 20) points.push(`${completedTasks} tasks completed`);

  if (completedNodes >= 6) points.push(`${completedNodes} roadmap nodes mastered`);
  else if (completedNodes >= 3) points.push(`${completedNodes} roadmap nodes completed`);

  const shortSummary = `${tier} engineer. ${points.slice(0,2).join('. ')}. Score built from real activity — not a certificate.`;
  const fullSummary = points.join('. ') + `. Genois Score ${score}/1000.`;

  return {
    tier,
    points,
    shortSummary,
    fullSummary,
    trustLevel: score >= 600 ? 'high'
      : score >= 300 ? 'medium'
      : 'building',
  };
};

export const calculateConsistencyScore = (streakDays, taskHistory) => {
  const streakScore = Math.min(40, streakDays * 2);
  const recentTasks = (taskHistory || []).filter(t => {
    const daysAgo = (Date.now() - new Date(t.completed_at)) / 86400000;
    return daysAgo <= 7;
  }).length;
  const activityScore = Math.min(60, recentTasks * 6);
  return Math.min(100, streakScore + activityScore);
};

export const saveHistories = async (studentId, data, supabase) => {
  const today = new Date().toISOString().split('T')[0];

  if (data.streak !== undefined) {
    await supabase.from('streak_history').upsert({
      student_id: studentId,
      streak_count: data.streak,
      recorded_at: today,
    }, { onConflict: 'student_id,recorded_at' });
  }

  if (data.score !== undefined) {
    await supabase.from('score_history').upsert({
      student_id: studentId,
      score: Math.round(data.score),
      recorded_at: today,
      breakdown: data.breakdown || {},
      total_tasks: data.totalTasks || 0,
      total_tests: data.totalTests || 0,
      total_projects: data.totalProjects || 0,
    }, { onConflict: 'student_id,recorded_at' });
  }
};

export const getTrustBadge = (score, streak, verifiedProjects) => {
  if (score >= 600 && streak >= 14 && verifiedProjects >= 2) {
    return { label: 'Highly Trusted', color: '#FFD700', icon: '⭐' };
  }
  if (score >= 400 && streak >= 7) {
    return { label: 'Trusted', color: '#00FF94', icon: '✅' };
  }
  if (score >= 200 || verifiedProjects >= 1) {
    return { label: 'Verified', color: '#4A9EFF', icon: '🔍' };
  }
  return { label: 'Building Trust', color: '#666', icon: '🌱' };
};
