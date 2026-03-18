export const checkAndAwardBadges = async (studentId, scoreData, supabase) => {
  if (!scoreData) return;
  const { raw, total } = scoreData;

  const conditions = [
    { condition: raw.completedTasks >= 1,    type: 'tasks_completed',   value: 1   },
    { condition: raw.streak >= 7,            type: 'streak_days',       value: 7   },
    { condition: raw.streak >= 14,           type: 'streak_days',       value: 14  },
    { condition: raw.streak >= 30,           type: 'streak_days',       value: 30  },
    { condition: raw.passedTests >= 1,       type: 'tests_passed',      value: 1   },
    { condition: raw.passedTests >= 5,       type: 'tests_passed',      value: 5   },
    { condition: raw.totalProjects >= 1,     type: 'projects_added',    value: 1   },
    { condition: raw.verifiedProjects >= 1,  type: 'projects_verified', value: 1   },
    { condition: raw.completedNodes >= 3,    type: 'nodes_completed',   value: 3   },
    { condition: raw.completedNodes >= 10,   type: 'nodes_completed',   value: 10  },
    { condition: total >= 500,               type: 'score_reached',     value: 500 },
    { condition: total >= 800,               type: 'score_reached',     value: 800 },
  ];

  const { data: existingBadges } = await supabase
    .from('student_badges')
    .select('badge_id, badges(condition_type, condition_value)')
    .eq('student_id', studentId);

  const earned = new Set(
    (existingBadges || []).map(b =>
      `${b.badges?.condition_type}_${b.badges?.condition_value}`
    )
  );

  for (const cond of conditions) {
    if (!cond.condition) continue;
    const key = `${cond.type}_${cond.value}`;
    if (earned.has(key)) continue;

    const { data: badge } = await supabase
      .from('badges')
      .select('id')
      .eq('condition_type', cond.type)
      .eq('condition_value', cond.value)
      .single();

    if (badge) {
      await supabase.from('student_badges').insert({
        student_id: studentId,
        badge_id: badge.id,
        earned_at: new Date().toISOString(),
      });
    }
  }
};
