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

export const generateRoadmap = async (profile) => {
  const domain = profile.domain_id || 'fullstack';
  const timeline = profile.timeline || '6months';
  const targetRole = profile.target_role || 'Software Developer';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Generate a personalized learning roadmap for an engineering student.

Domain: ${domain}
Target Role: ${targetRole}
Timeline: ${timeline}
College: ${profile.college || 'Engineering College'}

Return ONLY this exact JSON, no other text:
{
  "title": "string",
  "nodes": [
    {
      "title": "string",
      "description": "string - 2 sentences explaining what student will learn",
      "skills": ["skill1", "skill2", "skill3"],
      "resources": [
        {
          "title": "resource name",
          "url": "https://...",
          "type": "video|article|docs|practice",
          "duration": "20 min"
        }
      ],
      "mini_project": "Build something small: description of project",
      "estimated_days": 7
    }
  ]
}

Rules:
- Generate exactly 8 nodes
- Each node must have 3-4 real resources with working URLs
- Use YouTube, MDN, freeCodeCamp, GeeksForGeeks, LeetCode
- Resources must be FREE and accessible in India
- mini_project must be specific and buildable in 1-2 days
- Make it specific to ${domain} domain`,
      }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    return getDefaultRoadmapWithResources(domain);
  }
};

const getDefaultRoadmapWithResources = (domain) => {
  const roadmaps = {
    fullstack: {
      title: 'Full Stack Developer Roadmap',
      nodes: [
        {
          title: 'HTML & CSS Fundamentals',
          description: 'Learn the building blocks of web pages. Master HTML structure and CSS styling.',
          skills: ['HTML5', 'CSS3', 'Flexbox', 'Grid'],
          resources: [
            { title: 'HTML Full Course - freeCodeCamp', url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg', type: 'video', duration: '2 hours' },
            { title: 'CSS Full Course - freeCodeCamp', url: 'https://www.youtube.com/watch?v=OXGznpKZ_sA', type: 'video', duration: '2 hours' },
            { title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'docs', duration: '3 hours' },
            { title: 'CSS Flexbox Practice', url: 'https://flexboxfroggy.com', type: 'practice', duration: '1 hour' },
          ],
          mini_project: 'Build a personal portfolio page with HTML and CSS',
          estimated_days: 7,
        },
        {
          title: 'JavaScript Fundamentals',
          description: 'Master core JavaScript concepts including variables, functions, and DOM manipulation.',
          skills: ['JavaScript', 'DOM', 'Events', 'ES6'],
          resources: [
            { title: 'JavaScript Full Course - freeCodeCamp', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', type: 'video', duration: '3 hours' },
            { title: 'JavaScript.info - Modern JS Tutorial', url: 'https://javascript.info', type: 'article', duration: '5 hours' },
            { title: 'JS DOM Manipulation - Traversy Media', url: 'https://www.youtube.com/watch?v=0ik6X4DJKCc', type: 'video', duration: '1 hour' },
            { title: 'JavaScript 30 - Wes Bos', url: 'https://javascript30.com', type: 'practice', duration: '10 hours' },
          ],
          mini_project: 'Build an interactive To-Do list with localStorage',
          estimated_days: 10,
        },
        {
          title: 'JavaScript Advanced',
          description: 'Deep dive into closures, promises, async/await and modern ES6+ features.',
          skills: ['Promises', 'Async/Await', 'Closures', 'Modules'],
          resources: [
            { title: 'Async JS Crash Course - Traversy', url: 'https://www.youtube.com/watch?v=PoRJizFvM7s', type: 'video', duration: '1 hour' },
            { title: 'ES6 Features - GeeksForGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-es6/', type: 'article', duration: '2 hours' },
            { title: 'Promise Practice - javascript.info', url: 'https://javascript.info/async', type: 'practice', duration: '2 hours' },
          ],
          mini_project: 'Build a weather app using fetch API and async/await',
          estimated_days: 7,
        },
        {
          title: 'React Frontend',
          description: 'Build modern interactive UIs with React, hooks, and component architecture.',
          skills: ['React', 'Hooks', 'State', 'Props', 'JSX'],
          resources: [
            { title: 'React Full Course 2024 - freeCodeCamp', url: 'https://www.youtube.com/watch?v=CgkZ7MvWUAA', type: 'video', duration: '4 hours' },
            { title: 'React Official Docs', url: 'https://react.dev/learn', type: 'docs', duration: '3 hours' },
            { title: 'React Hooks Tutorial - Codevolution', url: 'https://www.youtube.com/watch?v=cF2lQ_gZeA8', type: 'video', duration: '2 hours' },
          ],
          mini_project: 'Build a GitHub profile finder using React and GitHub API',
          estimated_days: 14,
        },
        {
          title: 'Node.js & Express Backend',
          description: 'Build server-side applications with Node.js and create REST APIs with Express.',
          skills: ['Node.js', 'Express', 'REST API', 'Middleware'],
          resources: [
            { title: 'Node.js Crash Course - Traversy', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', type: 'video', duration: '1.5 hours' },
            { title: 'Express.js Crash Course', url: 'https://www.youtube.com/watch?v=SccSCuHhOw0', type: 'video', duration: '1 hour' },
            { title: 'REST API with Node - freeCodeCamp', url: 'https://www.youtube.com/watch?v=l8WPWK9mS5M', type: 'practice', duration: '2 hours' },
          ],
          mini_project: 'Build a REST API for a notes app with CRUD operations',
          estimated_days: 10,
        },
        {
          title: 'Databases - SQL & NoSQL',
          description: 'Master relational databases with PostgreSQL and document databases with MongoDB.',
          skills: ['PostgreSQL', 'MongoDB', 'SQL', 'Mongoose'],
          resources: [
            { title: 'SQL Full Course - freeCodeCamp', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'video', duration: '4 hours' },
            { title: 'MongoDB Crash Course - Traversy', url: 'https://www.youtube.com/watch?v=-56x56UppqQ', type: 'video', duration: '1.5 hours' },
            { title: 'SQL Practice - HackerRank', url: 'https://www.hackerrank.com/domains/sql', type: 'practice', duration: '5 hours' },
          ],
          mini_project: 'Build a student management system with PostgreSQL',
          estimated_days: 10,
        },
        {
          title: 'Authentication & Security',
          description: 'Implement JWT authentication, OAuth, and secure your web applications.',
          skills: ['JWT', 'OAuth', 'bcrypt', 'Sessions'],
          resources: [
            { title: 'JWT Auth Tutorial - Traversy', url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4', type: 'video', duration: '1 hour' },
            { title: 'Node.js Auth - freeCodeCamp', url: 'https://www.youtube.com/watch?v=Ud5xKCYQTjM', type: 'video', duration: '2 hours' },
            { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'article', duration: '2 hours' },
          ],
          mini_project: 'Add JWT login/register to your REST API',
          estimated_days: 7,
        },
        {
          title: 'Deploy Full Stack App',
          description: 'Deploy your complete application to cloud platforms and set up CI/CD.',
          skills: ['Vercel', 'Railway', 'Docker', 'CI/CD'],
          resources: [
            { title: 'Deploy Node.js to Railway', url: 'https://www.youtube.com/watch?v=MusIvEKjqsc', type: 'video', duration: '30 min' },
            { title: 'Vercel Deployment Guide', url: 'https://vercel.com/docs', type: 'docs', duration: '1 hour' },
            { title: 'Docker for Beginners - freeCodeCamp', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', type: 'video', duration: '2 hours' },
          ],
          mini_project: 'Deploy your full stack notes app with frontend + backend + database',
          estimated_days: 5,
        },
      ],
    },
    dsa: {
      title: 'DSA & Problem Solving Roadmap',
      nodes: [
        {
          title: 'Arrays & Strings',
          description: 'Master the most fundamental data structures used in 70% of interview problems.',
          skills: ['Arrays', 'Two Pointer', 'Sliding Window'],
          resources: [
            { title: 'Arrays - Striver DSA Sheet', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', type: 'practice', duration: '5 hours' },
            { title: 'Array Problems - NeetCode', url: 'https://www.youtube.com/watch?v=3OamzN90kPg', type: 'video', duration: '3 hours' },
            { title: 'LeetCode Arrays', url: 'https://leetcode.com/tag/array/', type: 'practice', duration: '5 hours' },
          ],
          mini_project: 'Solve 20 array problems on LeetCode (easy + medium)',
          estimated_days: 10,
        },
        {
          title: 'Linked Lists',
          description: 'Understand pointer manipulation and linked list operations used in system design.',
          skills: ['Linked List', 'Pointers', 'Fast Slow Pointer'],
          resources: [
            { title: 'Linked List - Abdul Bari', url: 'https://www.youtube.com/watch?v=Ast5sKgXXtg', type: 'video', duration: '2 hours' },
            { title: 'Linked List - Striver', url: 'https://takeuforward.org/linked-list/striver-linked-list-series/', type: 'video', duration: '3 hours' },
            { title: 'Linked List Problems - LeetCode', url: 'https://leetcode.com/tag/linked-list/', type: 'practice', duration: '4 hours' },
          ],
          mini_project: 'Implement a linked list from scratch with all operations',
          estimated_days: 7,
        },
        {
          title: 'Stacks & Queues',
          description: 'Master LIFO and FIFO structures and their applications in real problems.',
          skills: ['Stack', 'Queue', 'Monotonic Stack'],
          resources: [
            { title: 'Stack and Queue - Striver', url: 'https://www.youtube.com/watch?v=GYptUgnIM_I', type: 'video', duration: '2 hours' },
            { title: 'Stack LeetCode Problems', url: 'https://leetcode.com/tag/stack/', type: 'practice', duration: '3 hours' },
            { title: 'Monotonic Stack Guide', url: 'https://www.geeksforgeeks.org/introduction-to-monotonic-stack-2/', type: 'article', duration: '1 hour' },
          ],
          mini_project: 'Build a browser history system using stacks',
          estimated_days: 5,
        },
        {
          title: 'Trees & Binary Search',
          description: 'Understand hierarchical data and master tree traversal algorithms.',
          skills: ['Binary Tree', 'BST', 'DFS', 'BFS', 'Recursion'],
          resources: [
            { title: 'Trees - Striver Full Series', url: 'https://www.youtube.com/watch?v=_ANrF3FJm7I', type: 'video', duration: '5 hours' },
            { title: 'Binary Search - NeetCode', url: 'https://www.youtube.com/watch?v=s4DPM8ct1pI', type: 'video', duration: '2 hours' },
            { title: 'Tree Problems - LeetCode', url: 'https://leetcode.com/tag/binary-tree/', type: 'practice', duration: '5 hours' },
          ],
          mini_project: 'Implement a BST with insert, delete, search operations',
          estimated_days: 10,
        },
        {
          title: 'Graphs & Algorithms',
          description: 'Master graph traversal, shortest path, and connectivity algorithms.',
          skills: ['BFS', 'DFS', 'Dijkstra', 'Union Find'],
          resources: [
            { title: 'Graph Series - Striver', url: 'https://www.youtube.com/watch?v=YTtpfjkUrvE', type: 'video', duration: '8 hours' },
            { title: 'Graph LeetCode', url: 'https://leetcode.com/tag/graph/', type: 'practice', duration: '5 hours' },
            { title: 'Graphs - GeeksForGeeks', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/', type: 'article', duration: '2 hours' },
          ],
          mini_project: 'Implement BFS to find shortest path in a maze',
          estimated_days: 10,
        },
        {
          title: 'Dynamic Programming',
          description: 'Solve complex optimization problems with memoization and tabulation.',
          skills: ['Memoization', 'Tabulation', 'Knapsack', 'LCS'],
          resources: [
            { title: 'DP Series - Striver', url: 'https://www.youtube.com/watch?v=FfXoiwwnxFw', type: 'video', duration: '10 hours' },
            { title: 'DP for Beginners - NeetCode', url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk', type: 'video', duration: '5 hours' },
            { title: 'DP Problems - LeetCode', url: 'https://leetcode.com/tag/dynamic-programming/', type: 'practice', duration: '10 hours' },
          ],
          mini_project: 'Solve 10 DP problems from LeetCode medium list',
          estimated_days: 14,
        },
        {
          title: 'System Design Basics',
          description: 'Learn to design scalable systems used in senior engineer interviews.',
          skills: ['Scalability', 'Load Balancing', 'Caching', 'Databases'],
          resources: [
            { title: 'System Design for Beginners - Gaurav Sen', url: 'https://www.youtube.com/watch?v=xpDnVSmNFX0', type: 'video', duration: '3 hours' },
            { title: 'System Design Primer - GitHub', url: 'https://github.com/donnemartin/system-design-primer', type: 'docs', duration: '5 hours' },
            { title: 'Design Twitter - NeetCode', url: 'https://www.youtube.com/watch?v=o5n85GRKuzk', type: 'practice', duration: '1 hour' },
          ],
          mini_project: 'Design a URL shortener system on paper with all components',
          estimated_days: 7,
        },
        {
          title: 'Mock Interviews & Practice',
          description: 'Practice real interview problems under time pressure to build confidence.',
          skills: ['Problem Solving', 'Time Management', 'Communication'],
          resources: [
            { title: 'LeetCode Top 150 Interview Questions', url: 'https://leetcode.com/studyplan/top-interview-150/', type: 'practice', duration: '20 hours' },
            { title: 'Striver SDE Sheet', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', type: 'practice', duration: '20 hours' },
            { title: 'Pramp Free Mock Interviews', url: 'https://www.pramp.com', type: 'practice', duration: '5 hours' },
          ],
          mini_project: 'Do 3 mock interviews on Pramp or with a friend',
          estimated_days: 14,
        },
      ],
    },
  };

  return roadmaps[domain] || roadmaps['fullstack'];
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
