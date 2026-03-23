const DIFFICULTY_MAP = {
  slow: 'easy',
  normal: 'medium',
  fast: 'hard',
};

const getDifficulty = (learningSpeed, isWeakTopic, isStrongTopic) => {
  if (isWeakTopic) return 'easy';
  if (isStrongTopic) return 'hard';
  return DIFFICULTY_MAP[learningSpeed] || 'medium';
};

const getDefaultQuiz = (topic, difficulty) => {
  const easyQuestions = [
    {
      question: `What is the basic definition of ${topic}?`,
      options: { A: `A core concept in ${topic}`, B: 'A database tool', C: 'A styling method', D: 'A network protocol' },
      answer: 'A',
      explanation: `${topic} is a fundamental concept every developer must know.`,
      difficulty: 'easy',
    },
    {
      question: 'What does DRY stand for in programming?',
      options: { A: "Don't Repeat Yourself", B: 'Do Repeat Yourself', C: 'Dynamic Runtime Yield', D: 'Default Render Yes' },
      answer: 'A',
      explanation: 'DRY prevents code duplication and improves maintainability.',
      difficulty: 'easy',
    },
    {
      question: 'Which is a best practice in software development?',
      options: { A: 'Write all code in one file', B: 'Never test code', C: 'Write clean modular code', D: 'Avoid version control' },
      answer: 'C',
      explanation: 'Clean modular code is readable, testable, and maintainable.',
      difficulty: 'easy',
    },
    {
      question: 'What is time complexity of linear search?',
      options: { A: 'O(1)', B: 'O(log n)', C: 'O(n)', D: 'O(n²)' },
      answer: 'C',
      explanation: 'Linear search checks each element once giving O(n).',
      difficulty: 'easy',
    },
    {
      question: 'What is the best way to handle errors in code?',
      options: { A: 'Ignore them', B: 'Use try-catch blocks', C: 'Crash the app', D: 'Delete the code' },
      answer: 'B',
      explanation: 'try-catch handles errors gracefully without crashing.',
      difficulty: 'easy',
    },
  ];

  const mediumQuestions = [
    {
      question: `Which pattern is commonly used in ${topic}?`,
      options: { A: 'Singleton', B: 'Observer', C: 'The most relevant design pattern', D: 'Factory' },
      answer: 'C',
      explanation: `Design patterns help structure ${topic} code effectively.`,
      difficulty: 'medium',
    },
    {
      question: 'What is the difference between == and === in JavaScript?',
      options: { A: 'No difference', B: '=== checks type too', C: '== is faster', D: '=== is only for strings' },
      answer: 'B',
      explanation: '=== checks both value and type (strict equality).',
      difficulty: 'medium',
    },
    {
      question: 'What is a closure in JavaScript?',
      options: { A: 'A way to close browser tabs', B: 'Function accessing outer scope variables', C: 'A CSS property', D: 'A database term' },
      answer: 'B',
      explanation: 'Closures allow inner functions to access outer scope.',
      difficulty: 'medium',
    },
    {
      question: 'What is the purpose of async/await?',
      options: { A: 'To make code slower', B: 'To handle asynchronous operations cleanly', C: 'To declare variables', D: 'To style elements' },
      answer: 'B',
      explanation: 'async/await makes async code readable like synchronous code.',
      difficulty: 'medium',
    },
    {
      question: 'Which HTTP method is used to create a resource?',
      options: { A: 'GET', B: 'DELETE', C: 'PUT', D: 'POST' },
      answer: 'D',
      explanation: 'POST creates new resources in REST APIs.',
      difficulty: 'medium',
    },
  ];

  const hardQuestions = [
    {
      question: `What is the advanced use case of ${topic} in production systems?`,
      options: { A: 'Basic CRUD only', B: 'Microservices architecture integration', C: 'Simple loops', D: 'Local storage only' },
      answer: 'B',
      explanation: `${topic} integrates with microservices in real production systems.`,
      difficulty: 'hard',
    },
    {
      question: 'What is event loop in Node.js?',
      options: { A: 'A CSS animation', B: 'Mechanism handling async callbacks in single thread', C: 'A database query', D: 'A React hook' },
      answer: 'B',
      explanation: 'Event loop handles async operations in Node.js single thread.',
      difficulty: 'hard',
    },
    {
      question: 'What is memoization in dynamic programming?',
      options: { A: 'Memorizing formulas', B: 'Caching results to avoid recomputation', C: 'A CSS trick', D: 'Database indexing' },
      answer: 'B',
      explanation: 'Memoization stores computed results for reuse, optimizing recursion.',
      difficulty: 'hard',
    },
    {
      question: 'What is the CAP theorem in distributed systems?',
      options: { A: 'CSS Animation Protocol', B: 'Consistency Availability Partition tolerance trade-off', C: 'Code Audit Process', D: 'Client API Pattern' },
      answer: 'B',
      explanation: 'CAP theorem says distributed systems can only guarantee 2 of 3 properties.',
      difficulty: 'hard',
    },
    {
      question: 'What is the time complexity of quicksort average case?',
      options: { A: 'O(n²)', B: 'O(n)', C: 'O(n log n)', D: 'O(log n)' },
      answer: 'C',
      explanation: 'Quicksort averages O(n log n) with good pivot selection.',
      difficulty: 'hard',
    },
  ];

  if (difficulty === 'easy') return easyQuestions;
  if (difficulty === 'hard') return hardQuestions;
  return mediumQuestions;
};

const getDefaultCoding = (topic, difficulty) => {
  const challenges = {
    easy: {
      title: `Basic ${topic} Implementation`,
      description: `Write a function that demonstrates basic understanding of ${topic}. Create a simple solution that works correctly.`,
      inputOutput: 'Input: A string or number\nOutput: Processed result based on the topic',
      starterCode: `// ${topic} - Easy Challenge\nfunction solution(input) {\n  // Your code here\n  \n  return result;\n}\n\n// Test\nconsole.log(solution("hello"));`,
      expectedOutput: 'A correct basic implementation',
      hint: 'Start with the simplest approach. Focus on getting it working first.',
      difficulty: 'easy',
    },
    medium: {
      title: `${topic} Problem Solving`,
      description: `Implement a solution using ${topic} concepts. Handle edge cases and write clean code.`,
      inputOutput: 'Input: Array or object with data\nOutput: Transformed or processed result',
      starterCode: `// ${topic} - Medium Challenge\nfunction solution(data) {\n  // Handle edge cases\n  if (!data) return null;\n  \n  // Your implementation\n  \n  return result;\n}\n\nconsole.log(solution([1, 2, 3]));`,
      expectedOutput: 'Working solution handling edge cases',
      hint: 'Think about time complexity. Can you solve it in O(n)?',
      difficulty: 'medium',
    },
    hard: {
      title: `Advanced ${topic} Challenge`,
      description: `Solve this complex problem using advanced ${topic} techniques. Optimize for performance.`,
      inputOutput: 'Input: Complex data structure\nOutput: Optimized result with O(n log n) or better',
      starterCode: `// ${topic} - Hard Challenge\nfunction solution(input) {\n  // Think about optimal approach\n  // Consider: time complexity, space complexity\n  \n  // Your optimized implementation\n  \n  return result;\n}\n\n// Test with edge cases\nconsole.log(solution([]));\nconsole.log(solution([1]));`,
      expectedOutput: 'Optimized solution with good time complexity',
      hint: 'Consider using a hash map or two-pointer technique.',
      difficulty: 'hard',
    },
  };
  return challenges[difficulty] || challenges['medium'];
};

export const generateQuiz = async ({
  topic,
  level = 'beginner',
  learningSpeed = 'normal',
  weakTopics = [],
  strongTopics = [],
  nodeTitle = '',
}) => {
  const isWeakTopic = weakTopics.some(w =>
    (nodeTitle || topic).toLowerCase().includes(w.toLowerCase())
  );
  const isStrongTopic = strongTopics.some(s =>
    (nodeTitle || topic).toLowerCase().includes(s.toLowerCase())
  );
  const difficulty = getDifficulty(learningSpeed, isWeakTopic, isStrongTopic);
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
          content: `Generate a quiz for an engineering student.

Topic: ${nodeTitle || topic}
Difficulty: ${difficulty}
Learning Speed: ${learningSpeed}
${isWeakTopic ? 'NOTE: This is a WEAK topic — make questions foundational and clear.' : ''}
${isStrongTopic ? 'NOTE: This is a STRONG topic — make questions challenging.' : ''}

Return ONLY valid JSON array of exactly 5 questions:
[
  {
    "question": "specific question about ${nodeTitle || topic}",
    "options": {
      "A": "option text",
      "B": "option text",
      "C": "option text",
      "D": "option text"
    },
    "answer": "A",
    "explanation": "clear explanation why this is correct",
    "difficulty": "${difficulty}"
  }
]

Rules:
- Questions MUST be specific to ${nodeTitle || topic}
- Difficulty: ${difficulty}
- No repeated questions
- Real practical questions a developer would face
- Explanations must be educational`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (Array.isArray(parsed) && parsed.length >= 5) {
      return { questions: parsed, difficulty, isWeakTopic, isStrongTopic };
    }
    throw new Error('Invalid response format');
  } catch (err) {
    console.error('Quiz generation failed, using defaults:', err);
    return {
      questions: getDefaultQuiz(nodeTitle || topic, difficulty),
      difficulty,
      isWeakTopic,
      isStrongTopic,
    };
  }
};

export const generateCodingTest = async ({
  topic,
  level = 'beginner',
  learningSpeed = 'normal',
  weakTopics = [],
  strongTopics = [],
  nodeTitle = '',
}) => {
  const isWeakTopic = weakTopics.some(w =>
    (nodeTitle || topic).toLowerCase().includes(w.toLowerCase())
  );
  const isStrongTopic = strongTopics.some(s =>
    (nodeTitle || topic).toLowerCase().includes(s.toLowerCase())
  );
  const difficulty = getDifficulty(learningSpeed, isWeakTopic, isStrongTopic);
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
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Generate a coding challenge for an engineering student.

Topic: ${nodeTitle || topic}
Difficulty: ${difficulty}
${isWeakTopic ? 'NOTE: WEAK topic — make it simple and foundational.' : ''}
${isStrongTopic ? 'NOTE: STRONG topic — make it challenging with optimization.' : ''}

Return ONLY valid JSON:
{
  "title": "challenge title",
  "description": "clear description of what to build",
  "inputOutput": "Input: description\\nOutput: description\\nExample: input → output",
  "starterCode": "function solution(input) {\\n  // Your code here\\n  \\n  return result;\\n}\\n\\nconsole.log(solution('test'));",
  "expectedOutput": "what the solution should do",
  "hint": "helpful hint without giving away the answer",
  "difficulty": "${difficulty}"
}

Rules:
- Must be solvable in 5-15 minutes
- Specific to ${nodeTitle || topic}
- Difficulty: ${difficulty}
- Starter code must be valid JavaScript
- Hint should guide without spoiling`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return { challenge: parsed, difficulty, isWeakTopic, isStrongTopic };
  } catch (err) {
    console.error('Coding test generation failed, using defaults:', err);
    return {
      challenge: getDefaultCoding(nodeTitle || topic, difficulty),
      difficulty,
      isWeakTopic,
      isStrongTopic,
    };
  }
};

export const saveQuizResult = async (studentId, nodeId, topic, score, answers, questions, supabase) => {
  const passed = score >= 50;

  const failedTopics = questions
    .filter((q, i) => answers[i] !== (q.answer || q.correct))
    .map(() => topic);

  const passedTopics = score >= 80 ? [topic] : [];

  await supabase.from('quiz_results').insert({
    student_id: studentId,
    node_id: nodeId,
    topic,
    score,
    passed,
    answers,
    weak_areas: failedTopics,
  });

  const { data: profile } = await supabase
    .from('profiles').select('weak_topics, strong_topics')
    .eq('id', studentId).single();

  const currentWeak = profile?.weak_topics || [];
  const currentStrong = profile?.strong_topics || [];

  const updates = {};

  if (!passed) {
    updates.weak_topics = [...new Set([...currentWeak, topic])];
    updates.strong_topics = currentStrong.filter(t => t !== topic);
  } else if (score >= 80) {
    updates.strong_topics = [...new Set([...currentStrong, topic])];
    updates.weak_topics = currentWeak.filter(t => t !== topic);
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from('profiles').update(updates).eq('id', studentId);
  }

  return { passed, failedTopics, passedTopics };
};

export const saveCodingResult = async (studentId, nodeId, topic, code, supabase) => {
  const passed = code && !code.includes('Write your code here') && code.trim().length >= 50;

  await supabase.from('coding_results').insert({
    student_id: studentId,
    node_id: nodeId,
    topic,
    code_submitted: code,
    passed,
  });

  return { passed };
};

export const getStudentLevel = (profile) => {
  const score = profile?.skill_score || 0;
  if (score >= 600) return 'advanced';
  if (score >= 300) return 'intermediate';
  return 'beginner';
};
