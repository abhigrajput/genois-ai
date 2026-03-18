const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

const callClaude = async (systemPrompt, userPrompt, maxTokens = 2000) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Claude API error:', errorData);
    throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();

  if (!data.content || !data.content[0]) {
    console.error('Unexpected Claude response:', data);
    throw new Error('Invalid response from Claude API');
  }

  return data.content[0].text;
};

export const generateRoadmap = async (assessmentData) => {
  const system = `You are a compassionate career advisor for Tier 3 engineering students in India.
These students face anxiety, comparison pressure, and poor guidance.
Generate roadmaps that start at their ACTUAL level — not assumed IIT level.
Always respond with ONLY valid JSON, no markdown, no explanation.`;

  const user = `Generate a personalized learning roadmap based on this student assessment:
${JSON.stringify(assessmentData, null, 2)}

Return ONLY this exact JSON structure:
{
  "title": "string",
  "domain": "string",
  "target_role": "string",
  "duration_weeks": number,
  "encouragement": "string (warm personal message for this student)",
  "nodes": [
    {
      "title": "string",
      "type": "topic|project|test",
      "description": "string",
      "why_this_matters": "string",
      "week_number": number,
      "order_index": number,
      "difficulty": number,
      "estimated_hours": number,
      "resources": [{"title": "string", "url": "string", "type": "video|docs|article"}],
Only use these verified working URLs for resources (no other URLs):
https://javascript.info
https://react.dev/learn
https://nodejs.org/en/docs
https://www.freecodecamp.org/learn
https://developer.mozilla.org
https://www.w3schools.com
https://css-tricks.com
https://fullstackopen.com/en/
https://git-scm.com/doc
https://www.postgresql.org/docs/
https://tailwindcss.com/docs
https://vitejs.dev/guide/
      "skills": ["string"]
    }
  ]
}

Rules:
- Generate exactly 8 nodes
- Start VERY easy based on student confidence level
- week_number goes from 1 to duration_weeks
- First node status should be unlocked, rest locked
- Make it encouraging and achievable
- Resources should be real, free resources`;

  const text = await callClaude(system, user, 4000);
  const clean = text.replace(/```json|```/g, '').trim();
  // Find the JSON object in the response
  const jsonStart = clean.indexOf('{');
  const jsonEnd = clean.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No valid JSON found in response');
  }
  const jsonStr = clean.substring(jsonStart, jsonEnd + 1);
  return JSON.parse(jsonStr);
};

export const generateDailyTasks = async (nodeData, anxietyLevel) => {
  const system = `You are a helpful study planner for engineering students.
Generate practical daily tasks. Always respond with ONLY valid JSON.`;

  const user = `Generate 3 daily tasks for this learning node:
Node: ${nodeData.title}
Description: ${nodeData.description}
Anxiety Level: ${anxietyLevel} (high anxiety = simpler tasks)

Return ONLY this JSON:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "type": "video|reading|coding|project",
      "estimated_minutes": number
    }
  ]
}`;

  const text = await callClaude(system, user, 800);
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

export const generateTest = async (nodeTitle, skills) => {
  const system = `You are a technical assessment creator for engineering students in India.
Generate challenging but fair MCQ and coding questions.
Questions MUST be specific to the exact topic provided.
Return ONLY valid JSON. No markdown, no explanation.`;

  const user = `Generate a weekly technical assessment.
Topic: ${nodeTitle}
Domain: ${skills?.join(', ')}
Week: ${new Date().toISOString().split('T')[0]}

IMPORTANT: Questions must be 100% specific to "${nodeTitle}".
Not generic programming questions.
Mix of conceptual and practical.

Return ONLY this JSON:
{
  "title": "${nodeTitle} — Week Assessment",
  "questions": [
    {
      "type": "mcq",
      "question": "specific question about ${nodeTitle}",
      "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "correct_answer": "A",
      "explanation": "why this is correct",
      "difficulty": "easy|medium|hard",
      "marks": 1
    }
  ]
}

Generate 8 MCQ + 2 coding questions specific to ${nodeTitle}.
For coding questions use this format:
{
  "type": "code",
  "question": "specific coding challenge about ${nodeTitle}",
  "code_language": "javascript",
  "code_prompt": "Write a function that ...",
  "starter_code": "function solution() {\\n  // write your code here\\n}",
  "expected_output": "what the code should do",
  "test_cases": ["input1 → output1", "input2 → output2"],
  "explanation": "explanation",
  "difficulty": "medium|hard",
  "marks": 2
}`;

  const text = await callClaude(system, user, 3000);
  const clean = text.replace(/```json|```/g, '').trim();
  const jsonStart = clean.indexOf('{');
  const jsonEnd = clean.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('No valid JSON in test response');
  return JSON.parse(clean.substring(jsonStart, jsonEnd + 1));
};

export const generateHinglishExplanation = async (concept, level) => {
  const system = `You are a friendly senior engineering student explaining concepts in Hinglish.
Be warm, use simple analogies, never condescending.`;

  const user = `Explain "${concept}" in Hinglish for a student at level ${level}/10.
Use a simple real-life analogy. Keep it under 100 words. Be encouraging.`;

  return await callClaude(system, user, 300);
};

export const generateWeeklyRecap = async (studentData) => {
  const system = `You are a caring mentor writing a weekly recap for an engineering student.
Be a senior friend, not a corporate tool. Emotion first, data second.
Use Hinglish naturally when appropriate.`;

  const user = `Write a personal weekly recap for this student:
${JSON.stringify(studentData)}

Rules:
- Under 80 words
- Acknowledge if it was a bad week honestly
- End with ONE specific thing for next week
- Warm, not fake-positive
- Feels like a message from a friend who knows them`;

  return await callClaude(system, user, 300);
};

export const generateAnxietyResponse = async (message, timeOfDay) => {
  const system = `You are Genois — a caring senior who deeply understands Tier 3 engineering student anxiety in India.
You know about placement pressure, family expectations, comparison culture.

Rules:
- Never be clinical or therapeutic
- Speak like a caring senior friend
- Use Hinglish naturally when appropriate
- Validate feelings before giving advice
- Never dismiss anxiety
- End with one small actionable thing they can do RIGHT NOW
- Max 5 sentences
- If student mentions self-harm, gently suggest speaking to someone trusted`;

  const user = `Student message (sent at ${timeOfDay}): "${message}"
Respond as Genois would.`;

  return await callClaude(system, user, 400);
};

export const generateSkillDNA = async (studentData) => {
  const system = `You are a skill analyst for engineering students in India.
Generate a deep, honest, personal skill DNA report.
Be direct, warm, and specific. Use emojis naturally.
Max 300 words. Plain text only, no markdown headers.`;

  const user = `Generate a Skill DNA report for this student:
${JSON.stringify(studentData, null, 2)}

Structure the report with these sections:
🧬 SKILL DNA REPORT — [name]

📊 LEARNING FINGERPRINT
[2-3 lines summarizing their actual data: nodes, tests, score]

💪 STRENGTH MAP
[bullet their top skills or what the data shows they're good at]

⚠️ AREAS TO IMPROVE
[2 specific, honest improvement points based on their data]

📈 GROWTH ANALYSIS
[1-2 lines on their trajectory and what tier they're heading toward]

🎯 THIS WEEK'S MISSION
[One very specific actionable thing based on their current state]

End with one short encouraging line.`;

  return await callClaude(system, user, 600);
};
