import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock,
         Zap, Trophy, RotateCcw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const QUESTION_BANKS = {
  fullstack: [
    { q:'What does HTML stand for?', opts:['Hyper Text Markup Language','High Tech Modern Language','Hyper Transfer Markup Language','Home Tool Markup Language'], ans:0, exp:'HTML = Hyper Text Markup Language. It structures web pages.' },
    { q:'Which CSS property controls text size?', opts:['font-weight','text-size','font-size','text-style'], ans:2, exp:'font-size controls the size of text in CSS.' },
    { q:'What is the correct way to declare a JavaScript variable?', opts:['variable x = 5','v x = 5','let x = 5','x = let 5'], ans:2, exp:'let, const, and var are used to declare variables in JavaScript.' },
    { q:'Which method adds an element to the end of an array?', opts:['push()','pop()','shift()','unshift()'], ans:0, exp:'push() adds one or more elements to the end of an array.' },
    { q:'What does API stand for?', opts:['Application Programming Interface','App Protocol Integration','Automated Program Interface','Application Process Integration'], ans:0, exp:'API = Application Programming Interface, allows apps to communicate.' },
    { q:'What is React?', opts:['A database','A JavaScript library for building UIs','A CSS framework','A backend language'], ans:1, exp:'React is a JavaScript library for building user interfaces.' },
    { q:'What hook is used for state in React?', opts:['useEffect','useState','useRef','useContext'], ans:1, exp:'useState is the hook for managing state in React functional components.' },
    { q:'What does useEffect do in React?', opts:['Manages state','Handles side effects','Creates components','Styles components'], ans:1, exp:'useEffect handles side effects like API calls and subscriptions.' },
    { q:'What is Node.js?', opts:['A browser','A JavaScript runtime environment','A database','A CSS preprocessor'], ans:1, exp:'Node.js is a JavaScript runtime built on Chrome V8 engine.' },
    { q:'Which HTTP method is used to create data?', opts:['GET','PUT','POST','DELETE'], ans:2, exp:'POST is used to create new resources in REST APIs.' },
    { q:'What is MongoDB?', opts:['SQL database','NoSQL document database','Graph database','In-memory cache'], ans:1, exp:'MongoDB is a NoSQL database that stores data in JSON-like documents.' },
    { q:'What does JWT stand for?', opts:['Java Web Token','JSON Web Token','JavaScript Web Transfer','JSON Web Transfer'], ans:1, exp:'JWT = JSON Web Token, used for authentication.' },
    { q:'What is npm?', opts:['Node Package Manager','New Programming Method','Node Process Manager','Network Protocol Manager'], ans:0, exp:'npm is the Node Package Manager for installing JavaScript packages.' },
    { q:'What is the purpose of async/await?', opts:['To style pages','To handle asynchronous code cleanly','To declare variables','To create loops'], ans:1, exp:'async/await makes asynchronous code readable like synchronous code.' },
    { q:'What is a REST API?', opts:['A database type','An architectural style for APIs using HTTP','A JavaScript framework','A CSS methodology'], ans:1, exp:'REST is an architectural style that uses HTTP methods for APIs.' },
    { q:'What does DOM stand for?', opts:['Document Object Model','Data Object Method','Dynamic Output Model','Document Oriented Model'], ans:0, exp:'DOM = Document Object Model, the browser representation of HTML.' },
    { q:'Which symbol is used for template literals in JS?', opts:['Single quote','Double quote','Backtick','Hash'], ans:2, exp:'Template literals use backticks and allow embedded expressions.' },
    { q:'What is Flexbox used for?', opts:['Database queries','One-dimensional layouts','3D animations','Backend routing'], ans:1, exp:'Flexbox is a CSS layout model for one-dimensional layouts.' },
    { q:'What does CORS stand for?', opts:['Cross Origin Resource Sharing','Client Oriented Response System','Cross Object Reference Scheme','Content Origin Response Standard'], ans:0, exp:'CORS = Cross Origin Resource Sharing, controls cross-domain requests.' },
    { q:'Which tag is used for the largest heading in HTML?', opts:['<h6>','<head>','<h1>','<title>'], ans:2, exp:'<h1> is the largest heading tag in HTML.' },
  ],
  cybersecurity: [
    { q:'What does SQL Injection do?', opts:['Speeds up database','Injects malicious SQL into queries','Encrypts data','Validates input'], ans:1, exp:'SQL Injection inserts malicious SQL code into queries to manipulate databases.' },
    { q:'What is XSS?', opts:['Extra Style Sheet','Cross Site Scripting','Cross Server Security','Extreme Security System'], ans:1, exp:'XSS = Cross Site Scripting, injects malicious scripts into web pages.' },
    { q:'What does HTTPS use for encryption?', opts:['MD5','SHA-1','TLS/SSL','Base64'], ans:2, exp:'HTTPS uses TLS/SSL to encrypt data between browser and server.' },
    { q:'What is a firewall?', opts:['A hardware device only','Software or hardware that monitors network traffic','A type of malware','An encryption algorithm'], ans:1, exp:'Firewalls monitor and control incoming and outgoing network traffic.' },
    { q:'What is phishing?', opts:['A fishing technique','Fraudulent attempt to steal credentials','A network protocol','An encryption method'], ans:1, exp:'Phishing tricks users into revealing sensitive information via fake emails or sites.' },
    { q:'What does nmap do?', opts:['Encrypts files','Scans networks and open ports','Manages passwords','Monitors logs'], ans:1, exp:'Nmap is a network scanner that discovers hosts and open ports.' },
    { q:'What is a zero-day vulnerability?', opts:['A bug fixed immediately','An unknown vulnerability with no patch','A common known bug','A firewall rule'], ans:1, exp:'Zero-day vulnerabilities are unknown to vendors and have no patch available.' },
    { q:'What is the OWASP Top 10?', opts:['Top 10 programming languages','Top 10 web security risks','Top 10 hacking tools','Top 10 databases'], ans:1, exp:'OWASP Top 10 lists the most critical web application security risks.' },
    { q:'What does AES stand for?', opts:['Advanced Encryption Standard','Automated Encoding System','Advanced Exchange Server','Application Encryption Standard'], ans:0, exp:'AES = Advanced Encryption Standard, a symmetric encryption algorithm.' },
    { q:'What is a VPN?', opts:['Virtual Private Network','Very Protected Node','Virtual Protocol Network','Verified Private Node'], ans:0, exp:'VPN creates an encrypted tunnel for secure internet connections.' },
    { q:'What is social engineering?', opts:['Building social media','Manipulating people to reveal information','Writing social code','Engineering social apps'], ans:1, exp:'Social engineering exploits human psychology rather than technical vulnerabilities.' },
    { q:'What tool is used for packet analysis?', opts:['Metasploit','Burp Suite','Wireshark','Nessus'], ans:2, exp:'Wireshark is a network protocol analyzer used to capture packets.' },
    { q:'What is a brute force attack?', opts:['A physical attack','Trying all possible passwords systematically','A social engineering method','A SQL injection type'], ans:1, exp:'Brute force attacks systematically try all possible combinations.' },
    { q:'What is penetration testing?', opts:['Testing hardware speed','Authorized simulated cyberattack','Testing network bandwidth','Database performance testing'], ans:1, exp:'Penetration testing is authorized testing to find security vulnerabilities.' },
    { q:'What does CIA stand for in security?', opts:['Central Intelligence Agency','Confidentiality Integrity Availability','Coded Information Access','Cyber Intrusion Analysis'], ans:1, exp:'CIA Triad = Confidentiality, Integrity, Availability — core security principles.' },
    { q:'What is ransomware?', opts:['Security software','Malware that encrypts files for ransom','A firewall type','An antivirus tool'], ans:1, exp:'Ransomware encrypts victim files and demands payment for decryption.' },
    { q:'What is a CSRF attack?', opts:['Cross Site Request Forgery','Client Server Response Failure','Coded Security Response Filter','Cross System Resource Fetch'], ans:0, exp:'CSRF tricks authenticated users into submitting unwanted requests.' },
    { q:'What is Burp Suite used for?', opts:['Network scanning','Web application security testing','Password management','Disk encryption'], ans:1, exp:'Burp Suite is a web application security testing platform.' },
    { q:'What is a honeypot?', opts:['A sweet database','A decoy system to detect attackers','A type of firewall','An encryption method'], ans:1, exp:'Honeypots are decoy systems designed to detect and study attackers.' },
    { q:'What does IDS stand for?', opts:['Internet Data Service','Intrusion Detection System','Internal Domain Security','Integrated Defense System'], ans:1, exp:'IDS = Intrusion Detection System, monitors for malicious activity.' },
  ],
  dsa: [
    { q:'What is the time complexity of binary search?', opts:['O(n)','O(n²)','O(log n)','O(1)'], ans:2, exp:'Binary search halves the search space each time, giving O(log n).' },
    { q:'Which data structure uses LIFO?', opts:['Queue','Stack','Linked List','Tree'], ans:1, exp:'Stack uses Last In First Out (LIFO) order.' },
    { q:'What is the time complexity of bubble sort?', opts:['O(n log n)','O(n)','O(n²)','O(log n)'], ans:2, exp:'Bubble sort has O(n²) average and worst case time complexity.' },
    { q:'What is a binary search tree?', opts:['A tree where nodes have at most 2 children with ordering property','A balanced tree','A tree with only leaf nodes','A graph'], ans:0, exp:'BST: left child < parent < right child for every node.' },
    { q:'What does DFS stand for?', opts:['Data File System','Depth First Search','Distributed File Storage','Dynamic Function Search'], ans:1, exp:'DFS = Depth First Search, explores as far as possible before backtracking.' },
    { q:'What is dynamic programming?', opts:['Programming with dynamic variables','Optimization by storing subproblem results','A sorting algorithm','A graph traversal method'], ans:1, exp:'DP solves complex problems by breaking them into subproblems and storing results.' },
    { q:'What is the space complexity of merge sort?', opts:['O(1)','O(log n)','O(n)','O(n²)'], ans:2, exp:'Merge sort requires O(n) extra space for the temporary arrays.' },
    { q:'Which algorithm is used for shortest path?', opts:['DFS','BFS','Dijkstra','Bubble Sort'], ans:2, exp:'Dijkstra finds shortest path from source to all vertices in weighted graphs.' },
    { q:'What is a hash table?', opts:['A sorted array','Data structure with key-value pairs using hash function','A linked list variant','A type of tree'], ans:1, exp:'Hash tables use a hash function to map keys to array indices.' },
    { q:'What is recursion?', opts:['A loop','A function calling itself','A sorting technique','A data structure'], ans:1, exp:'Recursion is when a function calls itself with a base case to stop.' },
    { q:'What is Big O notation?', opts:['Exact runtime measurement','Upper bound of algorithm time complexity','Lower bound of complexity','Average case complexity'], ans:1, exp:"Big O describes the upper bound (worst case) of an algorithm's complexity." },
    { q:'What is a queue?', opts:['LIFO data structure','FIFO data structure','Random access structure','Hierarchical structure'], ans:1, exp:'Queue uses First In First Out (FIFO) — first added is first removed.' },
    { q:'What is memoization?', opts:['Memory management','Caching results of function calls','A sorting technique','Garbage collection'], ans:1, exp:'Memoization stores results of expensive function calls for reuse.' },
    { q:'What is the time complexity of quicksort average case?', opts:['O(n²)','O(n)','O(n log n)','O(log n)'], ans:2, exp:'Quicksort averages O(n log n) with good pivot selection.' },
    { q:'What is a graph?', opts:['A chart','A data structure with nodes and edges','A sorted array','A type of tree'], ans:1, exp:'A graph consists of vertices (nodes) connected by edges.' },
    { q:'What does BFS stand for?', opts:['Binary File Search','Breadth First Search','Basic Function Syntax','Binary Format Storage'], ans:1, exp:'BFS = Breadth First Search, explores level by level.' },
    { q:'What is a linked list?', opts:['An array with indices','A sequence of nodes where each points to the next','A type of hash table','A balanced tree'], ans:1, exp:'Linked list nodes store data and a pointer to the next node.' },
    { q:'What is the best case complexity of insertion sort?', opts:['O(n²)','O(n log n)','O(n)','O(1)'], ans:2, exp:'Insertion sort is O(n) when array is already sorted.' },
    { q:'What is a heap?', opts:['Memory storage','A complete binary tree with heap property','A sorting algorithm','A graph type'], ans:1, exp:'A heap is a complete binary tree where parent is always greater (or lesser) than children.' },
    { q:'What is two pointer technique?', opts:['Using two variables','Using two pointers to solve array problems efficiently','A memory management technique','A graph algorithm'], ans:1, exp:'Two pointers move from both ends toward center to solve problems in O(n).' },
  ],
};

const getQuestionsForDomain = (domain, count) => {
  const bank = QUESTION_BANKS[domain] || QUESTION_BANKS['fullstack'];
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const Tests = () => {
  const { profile } = useStore();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (profile?.id) fetchTests();
  }, [profile?.id]);

  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            if (!submitted) handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const { data: testData } = await supabase
        .from('tests').select('*, test_questions(*)')
        .order('created_at', { ascending: false })
        .limit(10);
      setTests(testData || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const generateTest = async (testType) => {
    setGenerating(true);
    const domain = profile?.domain_id || 'fullstack';
    const today = new Date().toISOString().split('T')[0];
    const week = Math.ceil(new Date().getDate() / 7);

    const questionCount = testType === 'daily' ? 15
      : testType === 'weekly' ? 20 : 30;
    const timeLimit = testType === 'daily' ? 15
      : testType === 'weekly' ? 25 : 40;

    const title = testType === 'daily'
      ? `Daily Test — ${today}`
      : testType === 'weekly'
      ? `Weekly Test — Week ${week}`
      : `Monthly Test — ${new Date().toLocaleDateString('en-IN',{month:'long'})}`;

    try {
      const questions = getQuestionsForDomain(domain, questionCount);
      const totalMarks = questions.length;
      const passingMarks = Math.ceil(totalMarks * 0.5);

      const { data: testRow, error: testErr } = await supabase
        .from('tests')
        .insert({
          title,
          total_marks: totalMarks,
          passing_marks: passingMarks,
          time_limit_minutes: timeLimit,
          week_number: week,
          test_type: testType,
          created_at: new Date().toISOString(),
        })
        .select().single();

      if (testErr) throw testErr;

      const { error: qErr } = await supabase
        .from('test_questions')
        .insert(
          questions.map((q, i) => ({
            test_id: testRow.id,
            question: q.q,
            options: q.opts,
            correct_answer: q.opts[q.ans],
            explanation: q.exp,
            difficulty: i < 5 ? 'easy' : i < 12 ? 'medium' : 'hard',
            marks: 1,
          }))
        );

      if (qErr) throw qErr;

      toast.success(`${title} ready! 🎯`);
      fetchTests();
    } catch(e) {
      console.error(e);
      toast.error('Failed: ' + e.message);
    }
    setGenerating(false);
  };

  const startTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    const seconds = (test.time_limit_minutes || 15) * 60;
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const handleSubmit = async () => {
    if (!activeTest) return;
    setTimerActive(false);
    setSubmitted(true);

    const questions = activeTest.test_questions || [];
    let correct = 0;
    questions.forEach((q, i) => {
      const userAns = answers[i];
      const correctAns = getOptions(q.options).indexOf(q.correct_answer);
      if (userAns === correctAns) correct++;
    });

    const score = correct;
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 50;

    setResult({ score, total, pct, passed, correct });

    try {
      await supabase.from('test_attempts').insert({
        test_id: activeTest.id,
        student_id: profile.id,
        score,
        total_marks: total,
        percentage: pct,
        passed,
        attempted_at: new Date().toISOString(),
      });

      const pts = passed ? 10 : 3;
      await supabase.from('profiles').update({
        skill_score: Math.min(1000, (profile.skill_score||0) + pts),
      }).eq('id', profile.id);

      if (!passed) {
        const weak = profile?.weak_topics || [];
        await supabase.from('profiles').update({
          weak_topics: [...new Set([...weak, profile.domain_id || 'general'])],
        }).eq('id', profile.id);
      } else {
        const strong = profile?.strong_topics || [];
        await supabase.from('profiles').update({
          strong_topics: [...new Set([...strong, profile.domain_id || 'general'])],
        }).eq('id', profile.id);
      }
    } catch(e) { console.error(e); }
  };

  const getOptions = (opts) => {
    if (!opts) return [];
    if (Array.isArray(opts)) return opts;
    if (typeof opts === 'string') {
      try { return JSON.parse(opts); } catch { return []; }
    }
    if (typeof opts === 'object') return Object.values(opts);
    return [];
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs/60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  };

  const testTypeConfig = {
    daily:   { color:'#00FF94', bg:'rgba(0,255,148,0.08)',  icon:'⚡', label:'Daily',   qs:15, time:'15 min' },
    weekly:  { color:'#7B61FF', bg:'rgba(123,97,255,0.08)', icon:'📅', label:'Weekly',  qs:20, time:'25 min' },
    monthly: { color:'#FFB347', bg:'rgba(255,179,71,0.08)', icon:'📆', label:'Monthly', qs:30, time:'40 min' },
  };

  // Active test view
  if (activeTest && !submitted) {
    const questions = activeTest.test_questions || [];
    const answered = Object.keys(answers).length;
    const urgent = timeLeft < 120;

    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">

          {/* Test header */}
          <div className="flex items-center justify-between mb-5 p-4 rounded-2xl"
            style={{ background:'rgba(10,10,18,0.95)', border:'1px solid rgba(0,255,148,0.15)' }}>
            <div>
              <h2 className="font-bold text-white font-heading text-sm">
                {activeTest.title}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {answered}/{questions.length} answered
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold font-heading font-mono ${urgent ? 'text-danger' : 'text-primary'}`}
                style={{ textShadow: urgent ? '0 0 10px rgba(255,107,107,0.6)' : '0 0 10px rgba(0,255,148,0.4)' }}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-gray-600">remaining</p>
            </div>
          </div>

          {/* Progress */}
          <div className="h-1 bg-dark-600 rounded-full mb-5 overflow-hidden">
            <motion.div
              animate={{ width:`${(answered/questions.length)*100}%` }}
              className="h-full rounded-full"
              style={{ background:'linear-gradient(90deg,#00FF94,#7B61FF)' }}
            />
          </div>

          {/* Questions */}
          <div className="space-y-4 mb-5">
            {questions.map((q, qi) => (
              <motion.div key={qi}
                initial={{ opacity:0, y:5 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:qi*0.03 }}
                className="p-4 rounded-2xl"
                style={{ background:'rgba(10,10,18,0.9)', border:'1px solid rgba(34,34,51,0.6)' }}>
                <p className="text-sm font-medium text-white mb-3">
                  <span className="text-primary font-bold mr-2">{qi+1}.</span>
                  {q.question}
                </p>
                <div className="grid gap-2">
                  {getOptions(q.options).map((opt, oi) => (
                    <button key={oi}
                      onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                      className="flex items-center gap-3 p-3 rounded-xl text-left text-xs transition-all"
                      style={{
                        background: answers[qi] === oi
                          ? 'rgba(0,255,148,0.12)'
                          : 'rgba(18,18,26,0.8)',
                        border: `1px solid ${answers[qi] === oi
                          ? 'rgba(0,255,148,0.4)'
                          : 'rgba(34,34,51,0.5)'}`,
                        boxShadow: answers[qi] === oi
                          ? '0 0 10px rgba(0,255,148,0.1)'
                          : 'none',
                      }}>
                      <span className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                        answers[qi] === oi
                          ? 'bg-primary text-dark-900'
                          : 'bg-dark-600 text-gray-500'
                      }`}>
                        {['A','B','C','D'][oi]}
                      </span>
                      <span className={answers[qi] === oi ? 'text-white' : 'text-gray-400'}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={answered < questions.length}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-40"
            style={{
              background: answered === questions.length
                ? 'linear-gradient(135deg,#00FF94,#7B61FF)'
                : 'rgba(0,255,148,0.05)',
              color:'#050508',
              boxShadow: answered === questions.length
                ? '0 0 25px rgba(0,255,148,0.35)'
                : 'none',
            }}>
            {answered < questions.length
              ? `Answer all questions (${questions.length - answered} remaining)`
              : 'Submit Test 🎯'}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Results view
  if (submitted && result) {
    const questions = activeTest.test_questions || [];
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity:0, scale:0.95 }}
            animate={{ opacity:1, scale:1 }}
            className="p-8 rounded-2xl text-center mb-5"
            style={{
              background: result.passed
                ? 'rgba(0,255,148,0.05)'
                : 'rgba(255,107,107,0.05)',
              border: `1px solid ${result.passed
                ? 'rgba(0,255,148,0.25)'
                : 'rgba(255,107,107,0.25)'}`,
            }}>
            <div className="text-5xl mb-3">
              {result.passed ? '🏆' : '😅'}
            </div>
            <div className={`text-4xl font-bold font-heading mb-1 ${
              result.passed ? 'text-primary' : 'text-danger'
            }`}
              style={{ textShadow: result.passed
                ? '0 0 20px rgba(0,255,148,0.5)'
                : '0 0 20px rgba(255,107,107,0.5)' }}>
              {result.pct}%
            </div>
            <p className={`text-sm font-bold mb-1 ${result.passed ? 'text-primary' : 'text-danger'}`}>
              {result.passed ? '✅ Passed!' : '❌ Failed — Review and retry'}
            </p>
            <p className="text-xs text-gray-500">
              {result.correct} correct out of {result.total}
              {result.passed ? ' · +10 Genois Score' : ' · +3 Genois Score'}
            </p>
          </motion.div>

          {/* Answer review */}
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
            Answer Review
          </h3>
          <div className="space-y-3 mb-5">
            {questions.map((q, qi) => {
              const userIdx = answers[qi];
              const correctIdx = getOptions(q.options).indexOf(q.correct_answer);
              const isCorrect = userIdx === correctIdx;
              return (
                <div key={qi} className="p-3 rounded-xl"
                  style={{
                    background: isCorrect
                      ? 'rgba(0,255,148,0.04)'
                      : 'rgba(255,107,107,0.04)',
                    border: `1px solid ${isCorrect
                      ? 'rgba(0,255,148,0.15)'
                      : 'rgba(255,107,107,0.15)'}`,
                  }}>
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-bold mt-0.5 flex-shrink-0 ${
                      isCorrect ? 'text-primary' : 'text-danger'
                    }`}>
                      {isCorrect ? '✓' : '✕'}
                    </span>
                    <div>
                      <p className="text-xs text-white mb-1">{q.question}</p>
                      {!isCorrect && (
                        <p className="text-xs text-gray-500 mb-0.5">
                          Your answer:
                          <span className="text-danger ml-1">
                            {getOptions(q.options)[userIdx] || 'Not answered'}
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Correct:
                        <span className="text-primary ml-1">{q.correct_answer}</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">💡 {q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setActiveTest(null); setSubmitted(false); setResult(null); }}
              className="flex-1 py-3 rounded-xl font-bold text-sm"
              style={{ background:'rgba(18,18,26,0.8)', color:'#666', border:'1px solid rgba(34,34,51,0.5)' }}>
              ← Back to Tests
            </button>
            {!result.passed && (
              <button onClick={() => startTest(activeTest)}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background:'rgba(255,179,71,0.12)', color:'#FFB347', border:'1px solid rgba(255,179,71,0.3)' }}>
                <RotateCcw size={13}/> Retry Test
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Test list view
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white"
              style={{ textShadow:'0 0 15px rgba(0,255,148,0.3)' }}>
              📝 Tests
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily · Weekly · Monthly — all in one place
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['daily','weekly','monthly'].map(type => {
              const tc = testTypeConfig[type];
              return (
                <button key={type}
                  onClick={() => generateTest(type)}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  style={{ background:tc.bg, color:tc.color, border:`1px solid ${tc.color}30` }}>
                  {tc.icon} {tc.label} Test
                </button>
              );
            })}
          </div>
        </div>

        {/* Test type cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {Object.entries(testTypeConfig).map(([type, tc]) => (
            <div key={type} className="p-4 rounded-2xl text-center"
              style={{ background:tc.bg, border:`1px solid ${tc.color}20` }}>
              <div className="text-2xl mb-1">{tc.icon}</div>
              <p className="text-xs font-bold text-white">{tc.label} Test</p>
              <p className="text-xs text-gray-500 mt-0.5">{tc.qs} questions</p>
              <p className="text-xs text-gray-600">{tc.time}</p>
            </div>
          ))}
        </div>

        {/* Tests list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-dark-700 rounded-xl animate-pulse"/>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-lg font-bold text-white font-heading mb-2">
              No tests yet
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Generate your first test to start practicing
            </p>
            <button onClick={() => generateTest('daily')} disabled={generating}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-dark-900"
              style={{ background:'#00FF94', boxShadow:'0 0 15px rgba(0,255,148,0.3)' }}>
              Generate Daily Test ⚡
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test, i) => {
              const tc = testTypeConfig[test.test_type] || testTypeConfig['daily'];
              const qCount = test.test_questions?.length || 0;
              return (
                <motion.div key={test.id}
                  initial={{ opacity:0, y:5 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.04 }}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:opacity-90"
                  style={{
                    background:'rgba(10,10,18,0.9)',
                    border:'1px solid rgba(34,34,51,0.6)',
                  }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background:tc.bg, border:`1px solid ${tc.color}20` }}>
                    {tc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{test.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium capitalize"
                        style={{ background:tc.bg, color:tc.color }}>
                        {test.test_type}
                      </span>
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock size={10}/> {test.time_limit_minutes} min
                      </span>
                      <span className="text-xs text-gray-600">
                        {qCount} questions
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startTest(test)}
                    disabled={qCount === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 flex-shrink-0"
                    style={{
                      background:'linear-gradient(135deg,#00FF94,#7B61FF)',
                      color:'#050508',
                      boxShadow:'0 0 12px rgba(0,255,148,0.25)',
                    }}>
                    <Zap size={12}/> Start
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tests;
