const VIDEO_RESOURCES = {
  'HTML': { url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg', title: 'HTML Full Course for Beginners', channel: 'freeCodeCamp', duration: '2 hours', description: 'Complete HTML tutorial covering all tags, forms, semantic HTML.', youtubeId: 'pQN-pnXPaVg' },
  'CSS': { url: 'https://www.youtube.com/watch?v=OXGznpKZ_sA', title: 'CSS Full Course for Beginners', channel: 'freeCodeCamp', duration: '2 hours', description: 'Complete CSS tutorial covering selectors, flexbox, grid.', youtubeId: 'OXGznpKZ_sA' },
  'JavaScript': { url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', title: 'JavaScript Full Course', channel: 'freeCodeCamp', duration: '3 hours', description: 'Learn JavaScript from scratch.', youtubeId: 'PkZNo7MFNFg' },
  'React': { url: 'https://www.youtube.com/watch?v=CgkZ7MvWUAA', title: 'React JS Full Course 2024', channel: 'freeCodeCamp', duration: '4 hours', description: 'Complete React tutorial with hooks and projects.', youtubeId: 'CgkZ7MvWUAA' },
  'Node': { url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', title: 'Node.js Crash Course', channel: 'Traversy Media', duration: '1.5 hours', description: 'Learn Node.js basics and building servers.', youtubeId: 'fBNz5xF-Kx4' },
  'Express': { url: 'https://www.youtube.com/watch?v=SccSCuHhOw0', title: 'Express JS Crash Course', channel: 'Traversy Media', duration: '1 hour', description: 'Build REST APIs with Express.js.', youtubeId: 'SccSCuHhOw0' },
  'MongoDB': { url: 'https://www.youtube.com/watch?v=-56x56UppqQ', title: 'MongoDB Crash Course', channel: 'Traversy Media', duration: '1.5 hours', description: 'Learn MongoDB CRUD operations.', youtubeId: '-56x56UppqQ' },
  'SQL': { url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', title: 'SQL Full Course', channel: 'freeCodeCamp', duration: '4 hours', description: 'Complete SQL tutorial.', youtubeId: 'HXV3zeQKqGY' },
  'Arrays': { url: 'https://www.youtube.com/watch?v=3OamzN90kPg', title: 'Arrays & Problem Solving', channel: 'NeetCode', duration: '3 hours', description: 'Master array techniques.', youtubeId: '3OamzN90kPg' },
  'Linked': { url: 'https://www.youtube.com/watch?v=Ast5sKgXXtg', title: 'Linked Lists Full Tutorial', channel: 'Abdul Bari', duration: '2 hours', description: 'Complete linked list tutorial.', youtubeId: 'Ast5sKgXXtg' },
  'Tree': { url: 'https://www.youtube.com/watch?v=_ANrF3FJm7I', title: 'Binary Trees & BST', channel: 'Striver', duration: '5 hours', description: 'Master trees and traversals.', youtubeId: '_ANrF3FJm7I' },
  'Dynamic': { url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk', title: 'Dynamic Programming Beginner to Advanced', channel: 'NeetCode', duration: '5 hours', description: 'Learn DP from scratch.', youtubeId: 'oBt53YbR9Kk' },
  'Python': { url: 'https://www.youtube.com/watch?v=eWRfhZUzrAc', title: 'Python Full Course', channel: 'freeCodeCamp', duration: '4.5 hours', description: 'Complete Python tutorial.', youtubeId: 'eWRfhZUzrAc' },
  'Docker': { url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', title: 'Docker Tutorial for Beginners', channel: 'freeCodeCamp', duration: '2 hours', description: 'Learn Docker containers.', youtubeId: 'fqMOX6JJhGo' },
  'Kotlin': { url: 'https://www.youtube.com/watch?v=F9UC9DY-vIU', title: 'Kotlin Full Course', channel: 'freeCodeCamp', duration: '2.5 hours', description: 'Learn Kotlin for Android.', youtubeId: 'F9UC9DY-vIU' },
  'Graph': { url: 'https://www.youtube.com/watch?v=YTtpfjkUrvE', title: 'Graph Algorithms Full Course', channel: 'Striver', duration: '8 hours', description: 'Master graph algorithms.', youtubeId: 'YTtpfjkUrvE' },
  'default': { url: 'https://www.youtube.com/watch?v=zOjov-2OZ0E', title: 'Programming Tutorial', channel: 'freeCodeCamp', duration: '1-2 hours', description: 'Watch this to understand the concept.', youtubeId: 'zOjov-2OZ0E' },
};

const getVideoForTopic = (topic) => {
  const t = (topic || '').toLowerCase();
  for (const [key, video] of Object.entries(VIDEO_RESOURCES)) {
    if (t.includes(key.toLowerCase())) return video;
  }
  return VIDEO_RESOURCES['default'];
};

const getDefaultQuiz = (topic) => [
  { question: `What is the primary purpose of ${topic}?`, options: { A: 'To style pages', B: 'Core functionality of this topic', C: 'Database management', D: 'Networking only' }, correct: 'B', explanation: `${topic} is used for its core domain purpose.` },
  { question: 'What does DRY stand for in programming?', options: { A: "Don't Repeat Yourself", B: 'Do Repeat Yourself', C: 'Dynamic Runtime Yield', D: 'Default Render Yes' }, correct: 'A', explanation: 'DRY prevents code duplication.' },
  { question: 'Which leads to better code quality?', options: { A: 'All code in one file', B: 'Never add comments', C: 'Clean modular tested code', D: 'Avoid version control' }, correct: 'C', explanation: 'Clean modular code is maintainable.' },
  { question: 'What is time complexity of linear search?', options: { A: 'O(1)', B: 'O(log n)', C: 'O(n)', D: 'O(n²)' }, correct: 'C', explanation: 'Linear search checks each element once.' },
  { question: 'Best practice for error handling?', options: { A: 'Ignore errors', B: 'Use try-catch and handle gracefully', C: 'Crash the app', D: 'Log and forget' }, correct: 'B', explanation: 'Proper error handling makes apps robust.' },
];

const getDefaultCoding = (topic) => ({
  title: `Apply ${topic} Concepts`,
  description: `Write a function demonstrating your understanding of ${topic}. Solve a practical problem using what you learned today.`,
  starterCode: `// ${topic} Challenge\nfunction solution(input) {\n  // Write your code here\n  \n  return result;\n}\n\nconsole.log(solution("test"));`,
  expectedOutput: `A working implementation demonstrating ${topic} concepts`,
  hint: `Think about the core concepts of ${topic} and apply them practically.`,
});

export const generateAIResources = async (topic, level = 'beginner', nodeTitle = '') => {
  const video = getVideoForTopic(nodeTitle || topic);
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Generate learning resources for an engineering student.
Topic: ${nodeTitle || topic}
Level: ${level}

Return ONLY valid JSON, no extra text:
{
  "notes": "5-8 line explanation with real example",
  "keyPoints": ["point1","point2","point3","point4","point5"],
  "quiz": [
    {
      "question": "specific question about ${nodeTitle || topic}",
      "options": {"A":"option","B":"option","C":"option","D":"option"},
      "correct": "A",
      "explanation": "why correct"
    }
  ],
  "codingChallenge": {
    "title": "challenge title",
    "description": "what to build",
    "starterCode": "function solution() {\\n  // code here\\n}",
    "expectedOutput": "what it should do",
    "hint": "helpful hint"
  }
}
Generate exactly 5 quiz questions specific to ${nodeTitle || topic}.`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      video,
      notes: parsed.notes || '',
      keyPoints: parsed.keyPoints || [],
      quiz: parsed.quiz?.length >= 5 ? parsed.quiz : getDefaultQuiz(nodeTitle || topic),
      codingChallenge: parsed.codingChallenge || getDefaultCoding(nodeTitle || topic),
    };
  } catch {
    return {
      video,
      notes: `Study ${nodeTitle || topic} thoroughly. Focus on core concepts before practice.`,
      keyPoints: [`Understand ${nodeTitle || topic} fundamentals`, 'Practice with examples', 'Build a mini project', 'Review interview questions', 'Connect to prior knowledge'],
      quiz: getDefaultQuiz(nodeTitle || topic),
      codingChallenge: getDefaultCoding(nodeTitle || topic),
    };
  }
};
