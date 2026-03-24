import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, X, Clock,
         TrendingUp, Briefcase, Star,
         ChevronRight, BarChart2 } from 'lucide-react';
import DOMAINS, { TIMELINES } from '../data/domains';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const DomainExplorer = () => {
  const { profile, setProfile } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState('explore');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [compareDomains, setCompareDomains] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState('6months');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');

  const toggleCompare = (domain) => {
    if (compareDomains.find(d => d.id === domain.id)) {
      setCompareDomains(compareDomains.filter(d => d.id !== domain.id));
    } else if (compareDomains.length < 3) {
      setCompareDomains([...compareDomains, domain]);
    } else {
      toast.error('Compare max 3 domains at once');
    }
  };

  const DOMAIN_ROADMAPS = {
    fullstack: [
      { title: 'HTML & CSS Foundations',      description: 'Build semantic HTML pages and style with CSS flexbox and grid.', skills: ['HTML5','CSS3','Flexbox'], day: 1,  project_brief: 'Build a personal landing page', resources: 'MDN Web Docs, freeCodeCamp HTML/CSS' },
      { title: 'JavaScript Fundamentals',     description: 'Variables, functions, loops, arrays, objects, DOM manipulation.', skills: ['JavaScript','DOM','ES6'], day: 2,  project_brief: 'Build an interactive quiz app', resources: 'javascript.info, Eloquent JavaScript' },
      { title: 'JavaScript Advanced',         description: 'Promises, async/await, fetch API, closures, prototypes.', skills: ['Async JS','Fetch','Closures'], day: 3,  project_brief: 'Weather app using Open-Meteo API', resources: 'javascript.info advanced, Kyle Simpson YDKJS' },
      { title: 'React Basics',                description: 'Components, JSX, props, state, event handling.', skills: ['React','JSX','useState'], day: 4,  project_brief: 'Todo app with React', resources: 'React official docs, Scrimba React course' },
      { title: 'React Hooks & State Mgmt',    description: 'useEffect, useContext, custom hooks, Zustand basics.', skills: ['useEffect','useContext','Zustand'], day: 5,  project_brief: 'Notes app with context', resources: 'React hooks docs, Zustand GitHub' },
      { title: 'Tailwind CSS & UI Design',    description: 'Utility-first CSS, responsive design, dark mode, animations.', skills: ['Tailwind','Responsive Design'], day: 6,  project_brief: 'Redesign your landing page with Tailwind', resources: 'Tailwind docs, Tailwind UI examples' },
      { title: 'Node.js & Express',           description: 'Backend basics: HTTP, REST APIs, middleware, routing.', skills: ['Node.js','Express','REST'], day: 7,  project_brief: 'REST API for a blog with CRUD', resources: 'Node.js docs, Express docs' },
      { title: 'Databases: SQL & PostgreSQL', description: 'Tables, queries, joins, indexes, basic schema design.', skills: ['SQL','PostgreSQL','Joins'], day: 8,  project_brief: 'Schema design for a social app', resources: 'PostgreSQL tutorial, Mode SQL tutorial' },
      { title: 'Supabase & Auth',             description: 'User auth, row-level security, real-time subscriptions.', skills: ['Supabase','Auth','RLS'], day: 9,  project_brief: 'Add auth to your blog API', resources: 'Supabase docs, Supabase YouTube' },
      { title: 'Full-Stack Project',          description: 'Combine React frontend + Node/Supabase backend into one app.', skills: ['Full-Stack','Deploy','Vite'], day: 10, project_brief: 'Job board with auth, post, apply', resources: 'Vercel deploy guide, Railway.app' },
      { title: 'Git & GitHub Workflow',       description: 'Branching, pull requests, GitHub Actions basics, code review.', skills: ['Git','GitHub','CI/CD'], day: 11, project_brief: 'Add GitHub Actions to your project', resources: 'Pro Git book, GitHub Actions docs' },
      { title: 'Testing Basics',              description: 'Unit tests with Vitest, integration tests, TDD mindset.', skills: ['Vitest','Testing','TDD'], day: 12, project_brief: 'Write tests for your API', resources: 'Vitest docs, Kent C Dodds blog' },
      { title: 'Performance & SEO',           description: 'Core Web Vitals, lazy loading, code splitting, meta tags.', skills: ['Performance','SEO','Lighthouse'], day: 13, project_brief: 'Audit and optimize your app', resources: 'web.dev, Lighthouse docs' },
      { title: 'TypeScript Fundamentals',     description: 'Types, interfaces, generics, migrating a JS project.', skills: ['TypeScript','Interfaces','Generics'], day: 14, project_brief: 'Migrate todo app to TypeScript', resources: 'TypeScript handbook' },
      { title: 'Deploy & Go Live',            description: 'Vercel, Railway, env vars, custom domain, production checklist.', skills: ['Vercel','Railway','DevOps'], day: 15, project_brief: 'Deploy full-stack app to production', resources: 'Vercel docs, Railway docs' },
    ],
    cybersecurity: [
      { title: 'Networking & Protocols',      description: 'TCP/IP, DNS, HTTP/S, OSI model, Wireshark basics.', skills: ['Networking','TCP/IP','Wireshark'], day: 1, project_brief: 'Capture and analyze HTTP traffic', resources: 'Professor Messer, TryHackMe Networking' },
      { title: 'Linux Fundamentals',          description: 'Shell commands, file permissions, processes, scripting basics.', skills: ['Linux','Bash','Permissions'], day: 2, project_brief: 'Write a bash script to audit users', resources: 'OverTheWire Bandit, Linux Journey' },
      { title: 'Web Security Basics',         description: 'OWASP Top 10, XSS, SQL injection, CSRF, Burp Suite intro.', skills: ['OWASP','XSS','SQLi'], day: 3, project_brief: 'Find and exploit DVWA vulnerabilities', resources: 'OWASP Testing Guide, PortSwigger Web Academy' },
      { title: 'Cryptography',               description: 'Symmetric, asymmetric, hashing, TLS, PKI, practical crypto.', skills: ['AES','RSA','TLS','Hashing'], day: 4, project_brief: 'Implement AES encrypt/decrypt in Python', resources: 'CryptoHack, Cryptopals challenges' },
      { title: 'Ethical Hacking & CTF',      description: 'Enumeration, scanning, exploitation, privilege escalation.', skills: ['Nmap','Metasploit','CTF'], day: 5, project_brief: 'Root a TryHackMe Easy box', resources: 'TryHackMe, HackTheBox, IppSec YouTube' },
      { title: 'Security Tools & Reporting', description: 'Nessus/OpenVAS, pentest reports, responsible disclosure.', skills: ['Nessus','Reporting','CVSS'], day: 6, project_brief: 'Write a vulnerability assessment report', resources: 'PTES standard, CVE database' },
      { title: 'Incident Response & Blue Team', description: 'SIEM, log analysis, threat hunting, IR playbooks.', skills: ['SIEM','Splunk','IR'], day: 7, project_brief: 'Analyze a simulated breach log', resources: 'Splunk BOTS, BlueTeamLabs' },
    ],
    dsa: [
      { title: 'Arrays & Strings',            description: 'Two pointers, sliding window, prefix sums, string manipulation.', skills: ['Arrays','Two Pointers','Strings'], day: 1,  project_brief: 'Solve 5 LeetCode easy array problems', resources: 'NeetCode, LeetCode study plan' },
      { title: 'Linked Lists',                description: 'Singly, doubly, fast-slow pointers, reversal, cycle detection.', skills: ['LinkedList','Pointers'], day: 2,  project_brief: 'Implement linked list from scratch', resources: 'Striver DSA, NeetCode' },
      { title: 'Stacks & Queues',             description: 'Monotonic stack, deque, LRU cache, valid parentheses.', skills: ['Stack','Queue','Monotonic'], day: 3,  project_brief: 'Implement a browser back/forward history', resources: 'NeetCode, Abdul Bari' },
      { title: 'Trees & BST',                 description: 'DFS, BFS, inorder/preorder/postorder, BST operations.', skills: ['Trees','DFS','BFS','BST'], day: 4,  project_brief: 'Implement BST with insert/search/delete', resources: 'Striver Tree series, NeetCode Trees' },
      { title: 'Graphs',                      description: 'Adjacency list, BFS, DFS, connected components, topological sort.', skills: ['Graph','BFS','DFS','Topo'], day: 5,  project_brief: 'Solve number of islands problem', resources: 'NeetCode Graphs, William Fiset' },
      { title: 'Heaps & Priority Queues',     description: 'Min/max heap, heap sort, K-closest, median finder.', skills: ['Heap','PriorityQueue'], day: 6,  project_brief: 'Implement heap sort', resources: 'NeetCode Heap, GFG Heap' },
      { title: 'Dynamic Programming I',       description: 'Memoization, tabulation, 1D DP: fibonacci, coin change, climbing stairs.', skills: ['DP','Memoization'], day: 7,  project_brief: 'Solve 3 classic 1D DP problems', resources: 'Striver DP series, NeetCode DP' },
      { title: 'Dynamic Programming II',      description: '2D DP: grid paths, subset sum, LCS, knapsack.', skills: ['2D DP','Knapsack','LCS'], day: 8,  project_brief: 'Solve longest common subsequence', resources: 'Striver DP, Aditya Verma DP' },
      { title: 'Sorting & Searching',         description: 'QuickSort, MergeSort, binary search on answer, search in rotated.', skills: ['Sorting','Binary Search'], day: 9,  project_brief: 'Implement merge sort, solve binary search variants', resources: 'Striver Sorting, NeetCode Binary Search' },
      { title: 'Advanced Topics & Mock',      description: 'Tries, segment trees, disjoint sets, system design basics, mock interview.', skills: ['Trie','DSU','System Design'], day: 10, project_brief: 'Mock interview: 2 medium problems in 45 min', resources: 'Striver SDE Sheet, LeetCode Mock' },
    ],
    aiml: [
      { title: 'Python for ML',               description: 'NumPy, Pandas, Matplotlib, data cleaning, EDA.', skills: ['Python','NumPy','Pandas'], day: 1,  project_brief: 'EDA on Titanic dataset', resources: 'Kaggle Python course, CS50 Python' },
      { title: 'Statistics & Probability',    description: 'Mean/variance, distributions, hypothesis testing, correlation.', skills: ['Statistics','Probability'], day: 2,  project_brief: 'Statistical analysis on IPL dataset', resources: 'StatQuest, Khan Academy Stats' },
      { title: 'ML Fundamentals',             description: 'Supervised/unsupervised learning, bias-variance, train-test split.', skills: ['ML','Scikit-learn','Evaluation'], day: 3,  project_brief: 'Predict house prices with linear regression', resources: 'Andrew Ng ML course, Scikit-learn docs' },
      { title: 'Classification Algorithms',   description: 'Logistic regression, decision trees, random forests, SVM, KNN.', skills: ['Classification','RandomForest','SVM'], day: 4,  project_brief: 'Spam email classifier', resources: 'Scikit-learn docs, StatQuest' },
      { title: 'Deep Learning Basics',        description: 'Neural networks, backprop, activation functions, PyTorch/Keras intro.', skills: ['Deep Learning','PyTorch','Keras'], day: 5,  project_brief: 'MNIST digit classifier', resources: 'fast.ai, 3Blue1Brown Neural Networks' },
      { title: 'NLP Fundamentals',            description: 'Text preprocessing, TF-IDF, word embeddings, sentiment analysis.', skills: ['NLP','NLTK','Embeddings'], day: 6,  project_brief: 'Twitter sentiment analysis', resources: 'Hugging Face NLP course, NLTK book' },
      { title: 'CNNs & Image Classification', description: 'Convolutional layers, pooling, transfer learning, data augmentation.', skills: ['CNN','Transfer Learning','OpenCV'], day: 7,  project_brief: 'Classify cats vs dogs with transfer learning', resources: 'fast.ai vision, PyTorch CNN tutorial' },
      { title: 'Model Evaluation & Tuning',   description: 'Cross-validation, GridSearch, learning curves, feature importance.', skills: ['Tuning','CrossVal','MLflow'], day: 8,  project_brief: 'Hyperparameter tune your best model', resources: 'Scikit-learn model selection, MLflow docs' },
      { title: 'LLMs & Generative AI',        description: 'Transformers architecture, prompt engineering, RAG basics, LangChain intro.', skills: ['LLM','Transformers','LangChain'], day: 9,  project_brief: 'Build a Q&A bot with LangChain', resources: 'Hugging Face course, LangChain docs' },
      { title: 'ML Project End-to-End',       description: 'Problem framing, data pipeline, model, API, deployment on Streamlit/FastAPI.', skills: ['MLOps','FastAPI','Streamlit'], day: 10, project_brief: 'Deploy a sentiment analysis API', resources: 'Streamlit docs, FastAPI docs' },
    ],
    devops: [
      { title: 'Linux & Shell Scripting',     description: 'Core Linux commands, bash scripting, cron jobs, permissions.', skills: ['Linux','Bash','Cron'], day: 1, project_brief: 'Write a bash monitoring script', resources: 'Linux Journey, The Linux Command Line book' },
      { title: 'Networking Basics',           description: 'IP, DNS, HTTP, load balancers, firewalls, VPCs.', skills: ['Networking','DNS','HTTP'], day: 2, project_brief: 'Set up a local DNS with /etc/hosts', resources: 'Professor Messer, AWS Networking docs' },
      { title: 'Docker & Containers',         description: 'Images, containers, Dockerfile, docker-compose, volumes, networking.', skills: ['Docker','Containers','Compose'], day: 3, project_brief: 'Containerize a Node.js + PostgreSQL app', resources: 'Docker docs, TechWorld with Nana' },
      { title: 'Kubernetes Basics',           description: 'Pods, services, deployments, namespaces, ConfigMaps, Helm basics.', skills: ['Kubernetes','kubectl','Helm'], day: 4, project_brief: 'Deploy containerized app on Minikube', resources: 'Kubernetes docs, KodeKloud K8s' },
      { title: 'CI/CD with GitHub Actions',   description: 'Pipelines, actions, secrets, build-test-deploy workflows.', skills: ['CI/CD','GitHub Actions','YAML'], day: 5, project_brief: 'Full CI/CD pipeline for a Node app', resources: 'GitHub Actions docs, TechWorld with Nana' },
      { title: 'Cloud Basics (AWS/GCP)',      description: 'EC2, S3, IAM, VPC, serverless with Lambda/Cloud Functions.', skills: ['AWS','EC2','S3','Lambda'], day: 6, project_brief: 'Deploy app on EC2 with S3 storage', resources: 'AWS free tier, ACloudGuru basics' },
      { title: 'Monitoring & Observability',  description: 'Prometheus, Grafana, log aggregation, alerting, SLOs.', skills: ['Prometheus','Grafana','Logging'], day: 7, project_brief: 'Set up Prometheus + Grafana for your app', resources: 'Prometheus docs, Grafana tutorials' },
    ],
    android: [
      { title: 'Kotlin Fundamentals',         description: 'Syntax, null safety, data classes, coroutines, extension functions.', skills: ['Kotlin','Coroutines','Null Safety'], day: 1, project_brief: 'Kotlin console app: student grade calculator', resources: 'Kotlin docs, Kotlin Koans' },
      { title: 'Android Studio & Layouts',    description: 'Activity, fragments, XML layouts, ConstraintLayout, RecyclerView.', skills: ['Android Studio','XML Layouts','RecyclerView'], day: 2, project_brief: 'Build a contact list app', resources: 'Android developer docs, Philipp Lackner YouTube' },
      { title: 'Jetpack Compose',             description: 'Composables, state, theming, navigation, side effects.', skills: ['Jetpack Compose','State','Navigation'], day: 3, project_brief: 'Rebuild contact list in Compose', resources: 'Compose docs, Google Compose codelab' },
      { title: 'ViewModel & LiveData',        description: 'MVVM architecture, ViewModel, LiveData, StateFlow, data binding.', skills: ['ViewModel','MVVM','StateFlow'], day: 4, project_brief: 'Notes app with ViewModel', resources: 'Android architecture guide, Philipp Lackner' },
      { title: 'Room Database',               description: 'Entities, DAOs, migrations, flows from Room.', skills: ['Room','SQLite','DAO'], day: 5, project_brief: 'Persist notes to Room database', resources: 'Room docs, Android codelab' },
      { title: 'Networking with Retrofit',    description: 'REST calls, OkHttp, Coroutines, JSON parsing, error handling.', skills: ['Retrofit','OkHttp','REST'], day: 6, project_brief: 'News reader app from NewsAPI', resources: 'Retrofit docs, Philipp Lackner Retrofit' },
      { title: 'Publish & Play Store',        description: 'Signing APK, Play Console, store listing, in-app review, crashlytics.', skills: ['Play Store','Firebase','APK'], day: 7, project_brief: 'Publish your notes app to Play Store', resources: 'Play Console help, Firebase Crashlytics' },
    ],
  };

  const saveDomainAndTimeline = async () => {
    if (!selectedDomain) {
      toast.error('Select a domain first!');
      return;
    }
    setSaving(true);
    toast.loading('Setting up your roadmap...', { id: 'save' });

    try {
      // Step 1: Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          domain_id: selectedDomain.id,
          timeline: selectedTimeline || '6months',
          target_role: selectedDomain.jobRoles?.[0] || '',
          onboarding_done: true,
        })
        .eq('id', profile.id);

      if (profileError) console.error('Profile update error:', profileError);

      // Step 2: Get old roadmaps
      const { data: oldRoadmaps } = await supabase
        .from('roadmaps')
        .select('id')
        .eq('student_id', profile.id);

      // Step 3: Delete children first then parents
      if (oldRoadmaps && oldRoadmaps.length > 0) {
        const oldRoadmapIds = oldRoadmaps.map(r => r.id);

        // Get node IDs for these roadmaps
        const { data: oldNodes } = await supabase
          .from('roadmap_nodes')
          .select('id')
          .in('roadmap_id', oldRoadmapIds);

        // Delete learning_progress by NODE ID (not roadmap_id)
        if (oldNodes && oldNodes.length > 0) {
          const oldNodeIds = oldNodes.map(n => n.id);
          await supabase
            .from('learning_progress')
            .delete()
            .in('node_id', oldNodeIds);
        }

        // Delete nodes
        const { error: nodesDeleteError } = await supabase
          .from('roadmap_nodes')
          .delete()
          .in('roadmap_id', oldRoadmapIds);
        if (nodesDeleteError) console.error('Nodes delete error:', nodesDeleteError);

        // Wait for deletes
        await new Promise(r => setTimeout(r, 600));

        // Delete roadmaps
        const { error: rmDeleteError } = await supabase
          .from('roadmaps')
          .delete()
          .eq('student_id', profile.id);
        if (rmDeleteError) console.error('Roadmap delete error:', rmDeleteError);

        // Wait again
        await new Promise(r => setTimeout(r, 400));
      }

      // Step 4: Delete old tasks
      await supabase.from('tasks').delete().eq('student_id', profile.id);

      // Step 5: Roadmap data per domain
      const domain = selectedDomain.id;

      const ROADMAPS = {
        fullstack: [
          { day:1,  title:'HTML Fundamentals',        skills:['HTML5','Semantic HTML','Forms'],             mini_project:'Build a personal bio page',           project_brief:null, resources:[{title:'HTML Full Course - freeCodeCamp',url:'https://www.youtube.com/watch?v=pQN-pnXPaVg',type:'video',duration:'2h'}] },
          { day:2,  title:'CSS and Flexbox',           skills:['CSS3','Flexbox','Selectors'],                mini_project:'Style your bio page with CSS',        project_brief:null, resources:[{title:'CSS Full Course - freeCodeCamp',url:'https://www.youtube.com/watch?v=OXGznpKZ_sA',type:'video',duration:'2h'}] },
          { day:3,  title:'CSS Grid and Responsive',   skills:['Grid','Media Queries','Responsive'],         mini_project:'Make bio page mobile responsive',     project_brief:null, resources:[{title:'CSS Grid Tutorial',url:'https://www.youtube.com/watch?v=EiNiSFIPIQE',type:'video',duration:'1h'}] },
          { day:4,  title:'JavaScript Basics',         skills:['Variables','Functions','DOM'],               mini_project:'Add interactivity to bio page',       project_brief:null, resources:[{title:'JavaScript Full Course - freeCodeCamp',url:'https://www.youtube.com/watch?v=PkZNo7MFNFg',type:'video',duration:'3h'}] },
          { day:5,  title:'JS Arrays and Objects',     skills:['Arrays','Objects','Methods'],                mini_project:'Build a contact list app',            project_brief:null, resources:[{title:'JS Arrays and Objects',url:'https://www.youtube.com/watch?v=7W4pQQ20nJg',type:'video',duration:'1h'}] },
          { day:6,  title:'DOM Manipulation',          skills:['DOM','Events','querySelector'],              mini_project:'Build todo list with DOM',            project_brief:null, resources:[{title:'DOM Manipulation Crash Course',url:'https://www.youtube.com/watch?v=0ik6X4DJKCc',type:'video',duration:'1h'}] },
          { day:7,  title:'Async JS and Fetch API',    skills:['Promises','async/await','fetch'],            mini_project:'Fetch weather from OpenWeather API',  project_brief:'PROJECT 1: Weather App using OpenWeather API. Show city temperature and humidity. Deploy on Vercel. Push to GitHub.', resources:[{title:'Async JavaScript Crash Course',url:'https://www.youtube.com/watch?v=PoRJizFvM7s',type:'video',duration:'1h'}] },
          { day:8,  title:'React Introduction',        skills:['React','JSX','Components'],                  mini_project:'Create first React component',        project_brief:null, resources:[{title:'React JS Full Course 2024',url:'https://www.youtube.com/watch?v=CgkZ7MvWUAA',type:'video',duration:'4h'}] },
          { day:9,  title:'React Hooks useState',      skills:['useState','State','Re-renders'],             mini_project:'Build counter app with useState',     project_brief:null, resources:[{title:'React Hooks Tutorial',url:'https://www.youtube.com/watch?v=cF2lQ_gZeA8',type:'video',duration:'2h'}] },
          { day:10, title:'React useEffect and APIs',  skills:['useEffect','API calls','Lifecycle'],         mini_project:'Build GitHub profile finder app',     project_brief:'PROJECT 2: GitHub Finder App. Search any GitHub user, show repos and followers. React plus GitHub API. Deploy on Vercel.', resources:[{title:'useEffect Hook Tutorial',url:'https://www.youtube.com/watch?v=gv9ugDJ1ynU',type:'video',duration:'1h'}] },
          { day:11, title:'Node.js Fundamentals',      skills:['Node.js','Modules','File System','NPM'],     mini_project:'Build a CLI calculator tool',         project_brief:null, resources:[{title:'Node.js Crash Course',url:'https://www.youtube.com/watch?v=fBNz5xF-Kx4',type:'video',duration:'1.5h'}] },
          { day:12, title:'Express.js REST APIs',      skills:['Express','REST','Routes','Middleware'],      mini_project:'Build Notes CRUD REST API',           project_brief:null, resources:[{title:'Express.js Crash Course',url:'https://www.youtube.com/watch?v=SccSCuHhOw0',type:'video',duration:'1h'}] },
          { day:13, title:'MongoDB and Mongoose',      skills:['MongoDB','Mongoose','CRUD','Schema'],        mini_project:'Connect Notes API to MongoDB',        project_brief:null, resources:[{title:'MongoDB Crash Course',url:'https://www.youtube.com/watch?v=-56x56UppqQ',type:'video',duration:'1.5h'}] },
          { day:14, title:'JWT Authentication',        skills:['JWT','Auth','bcrypt','Sessions'],            mini_project:'Add login and register to Notes app', project_brief:null, resources:[{title:'JWT Auth Tutorial',url:'https://www.youtube.com/watch?v=mbsmsi7l3r4',type:'video',duration:'1h'}] },
          { day:15, title:'Deploy Full Stack App',     skills:['Vercel','Railway','CI/CD'],                  mini_project:'Deploy your full stack app live',     project_brief:'PROJECT 3: Job Board App. Companies post jobs and students apply. Full CRUD plus auth plus search. Your main portfolio project. Deploy and share link.', resources:[{title:'Deploy Node.js to Railway',url:'https://www.youtube.com/watch?v=MusIvEKjqsc',type:'video',duration:'30min'}] },
        ],
        cybersecurity: [
          { day:1, title:'Networking Fundamentals',  skills:['TCP/IP','DNS','HTTP','OSI Model'],           mini_project:'Analyze packets with Wireshark',          project_brief:null, resources:[{title:'Networking Fundamentals Full Course',url:'https://www.youtube.com/watch?v=IPvYjXCsTg8',type:'video',duration:'2h'}] },
          { day:2, title:'Linux Command Line',        skills:['Linux','Bash','File System','Permissions'],  mini_project:'Complete OverTheWire Bandit Level 1 to 5',project_brief:null, resources:[{title:'Linux Command Line Full Course',url:'https://www.youtube.com/watch?v=sWbUDq4S6Y8',type:'video',duration:'2h'}] },
          { day:3, title:'Python for Security',       skills:['Python','Scripting','Socket','Automation'],  mini_project:'Build a port scanner in Python',          project_brief:null, resources:[{title:'Python for Ethical Hacking',url:'https://www.youtube.com/watch?v=FD0A9KxeJMQ',type:'video',duration:'2h'}] },
          { day:4, title:'Web Security and OWASP',    skills:['OWASP Top 10','XSS','CSRF','SQLi'],          mini_project:'Test DVWA and find 3 vulnerabilities',    project_brief:'PROJECT 1: Vulnerability Scanner. Python script that scans for OWASP Top 10 issues. Document all findings in professional security report.', resources:[{title:'OWASP Top 10 Explained',url:'https://www.youtube.com/watch?v=KAOcMeMoQ64',type:'video',duration:'2h'}] },
          { day:5, title:'Penetration Testing',       skills:['Nmap','Metasploit','Burp Suite','Recon'],    mini_project:'Complete a HackTheBox easy machine',      project_brief:null, resources:[{title:'Penetration Testing Full Course',url:'https://www.youtube.com/watch?v=3Kq1MIfTWCE',type:'video',duration:'3h'}] },
          { day:6, title:'Cryptography Basics',       skills:['AES','RSA','Hashing','TLS SSL'],             mini_project:'Implement AES encryption in Python',      project_brief:null, resources:[{title:'Cryptography for Beginners',url:'https://www.youtube.com/watch?v=AQDCe585Lnc',type:'video',duration:'2h'}] },
          { day:7, title:'CTF and Bug Bounty',        skills:['CTF','Bug Bounty','Report Writing'],         mini_project:'Solve 3 CTF challenges on PicoCTF',       project_brief:'PROJECT 2: Security Audit Report. Pen test DVWA or VulnHub machine. Write professional report with all vulnerabilities found and recommended fixes.', resources:[{title:'CTF Guide for Beginners',url:'https://www.youtube.com/watch?v=8ev9ZX9J45A',type:'video',duration:'1h'}] },
        ],
        dsa: [
          { day:1,  title:'Arrays and Time Complexity', skills:['Arrays','Big O','Space Complexity'],        mini_project:'Solve 5 LeetCode Easy array problems',    project_brief:null, resources:[{title:'Arrays - NeetCode',url:'https://www.youtube.com/watch?v=3OamzN90kPg',type:'video',duration:'2h'}] },
          { day:2,  title:'Two Pointer Technique',      skills:['Two Pointer','Opposite Ends','Fast Slow'], mini_project:'Solve Two Sum and Valid Palindrome',       project_brief:null, resources:[{title:'Two Pointer Technique',url:'https://www.youtube.com/watch?v=0l2nePjDFuA',type:'video',duration:'1h'}] },
          { day:3,  title:'Sliding Window',             skills:['Sliding Window','Subarray','Max Sum'],      mini_project:'Max Subarray and Best Time to Buy Stock',  project_brief:null, resources:[{title:'Sliding Window Technique',url:'https://www.youtube.com/watch?v=EHCGAZBbB88',type:'video',duration:'1h'}] },
          { day:4,  title:'HashMap and HashSet',        skills:['HashMap','HashSet','Frequency Count'],      mini_project:'Group Anagrams and Valid Anagram',         project_brief:'PROJECT 1: Algorithm Visualizer. Animate bubble sort and merge sort step by step. React plus CSS animations.', resources:[{title:'HashMap Problems',url:'https://www.youtube.com/watch?v=UrZ3LvdtL_k',type:'video',duration:'1h'}] },
          { day:5,  title:'Linked Lists',               skills:['Linked List','Reversal','Floyd Cycle'],     mini_project:'Implement LinkedList from scratch',        project_brief:null, resources:[{title:'Linked Lists Full Course',url:'https://www.youtube.com/watch?v=Ast5sKgXXtg',type:'video',duration:'2h'}] },
          { day:6,  title:'Stacks and Queues',          skills:['Stack','Queue','Monotonic Stack'],          mini_project:'Solve Valid Parentheses and Min Stack',    project_brief:null, resources:[{title:'Stacks and Queues',url:'https://www.youtube.com/watch?v=GYptUgnIM_I',type:'video',duration:'1.5h'}] },
          { day:7,  title:'Binary Trees',               skills:['Binary Tree','DFS','BFS','Traversal'],      mini_project:'Implement all tree traversals',            project_brief:'PROJECT 2: DSA Visualizer. Visualize BST insert delete search with animations.', resources:[{title:'Binary Trees - Striver',url:'https://www.youtube.com/watch?v=_ANrF3FJm7I',type:'video',duration:'3h'}] },
          { day:8,  title:'Graphs BFS and DFS',         skills:['Graph','BFS','DFS','Adjacency List'],       mini_project:'Solve Number of Islands',                 project_brief:null, resources:[{title:'Graph Algorithms - Striver',url:'https://www.youtube.com/watch?v=YTtpfjkUrvE',type:'video',duration:'4h'}] },
          { day:9,  title:'Dynamic Programming',        skills:['DP','Memoization','Tabulation'],            mini_project:'Climbing Stairs, House Robber, Coin Change',project_brief:null, resources:[{title:'DP for Beginners - NeetCode',url:'https://www.youtube.com/watch?v=oBt53YbR9Kk',type:'video',duration:'3h'}] },
          { day:10, title:'Mock Interview Practice',    skills:['Problem Solving','Communication'],          mini_project:'Solve 3 medium problems in 90 minutes',   project_brief:'PROJECT 3: LeetCode Progress Tracker. Track solved problems by difficulty, streak, weekly goals dashboard.', resources:[{title:'Mock Interview Tips',url:'https://www.youtube.com/watch?v=qc1owf2-ovU',type:'video',duration:'30min'}] },
        ],
        aiml: [
          { day:1,  title:'Python for Data Science',    skills:['Python','NumPy','Pandas'],                  mini_project:'Analyze a student dataset with Pandas',    project_brief:null, resources:[{title:'Python Full Course - freeCodeCamp',url:'https://www.youtube.com/watch?v=eWRfhZUzrAc',type:'video',duration:'4h'}] },
          { day:2,  title:'Statistics and Probability', skills:['Mean','Variance','Distributions'],          mini_project:'Statistical analysis on a real dataset',   project_brief:null, resources:[{title:'Statistics for Machine Learning',url:'https://www.youtube.com/watch?v=xxpc-HPKN28',type:'video',duration:'2h'}] },
          { day:3,  title:'Data Visualization',         skills:['Matplotlib','Seaborn','Plotly'],            mini_project:'Visualize sales data with 5 chart types',  project_brief:null, resources:[{title:'Matplotlib Full Tutorial',url:'https://www.youtube.com/watch?v=UO98lJQ3QGI',type:'video',duration:'1h'}] },
          { day:4,  title:'ML Fundamentals',            skills:['Supervised','Unsupervised','Features'],     mini_project:'Train first ML model on Titanic dataset',  project_brief:'PROJECT 1: Grade Predictor App. Predict student grades from attendance and marks. Streamlit. Deploy on HuggingFace.', resources:[{title:'ML Crash Course',url:'https://www.youtube.com/watch?v=GwIo3gDZCVQ',type:'video',duration:'2h'}] },
          { day:5,  title:'Regression and Classification', skills:['Linear Regression','Logistic','Sklearn'],mini_project:'Predict house prices with Linear Regression',project_brief:null, resources:[{title:'Sklearn Tutorial',url:'https://www.youtube.com/watch?v=0Lt9w-BxKFQ',type:'video',duration:'2h'}] },
          { day:6,  title:'Neural Networks',            skills:['Perceptron','Layers','Backprop'],           mini_project:'Build XOR solver neural network',          project_brief:null, resources:[{title:'Neural Networks from Scratch',url:'https://www.youtube.com/watch?v=aircAruvnKk',type:'video',duration:'2h'}] },
          { day:7,  title:'Deep Learning PyTorch',      skills:['PyTorch','Tensors','Training Loop'],        mini_project:'Train MNIST digit classifier',             project_brief:'PROJECT 2: Image Classifier Web App. Upload image and AI identifies it. Pre-trained ResNet. Deploy on HuggingFace Spaces.', resources:[{title:'PyTorch Full Course',url:'https://www.youtube.com/watch?v=c36lUUr864M',type:'video',duration:'3h'}] },
          { day:8,  title:'NLP and Transformers',       skills:['NLP','BERT','HuggingFace','Tokenization'],  mini_project:'Build tweet sentiment analyzer',           project_brief:null, resources:[{title:'NLP with Python Tutorial',url:'https://www.youtube.com/watch?v=X2vAabgKiuM',type:'video',duration:'2h'}] },
          { day:9,  title:'LLMs and RAG Systems',       skills:['RAG','Vector DB','LangChain'],              mini_project:'Build PDF question answering chatbot',     project_brief:'PROJECT 3: AI Study Assistant. Upload PDF notes then ask questions and AI answers. RAG plus Gemini API.', resources:[{title:'RAG Tutorial - LangChain',url:'https://www.youtube.com/watch?v=sVcwVQRHIc8',type:'video',duration:'2h'}] },
          { day:10, title:'MLOps and Deployment',       skills:['FastAPI','Docker','Model Serving'],         mini_project:'Deploy ML model as REST API with FastAPI', project_brief:null, resources:[{title:'FastAPI for ML Models',url:'https://www.youtube.com/watch?v=GN5T_5rE1jo',type:'video',duration:'1h'}] },
        ],
        devops: [
          { day:1, title:'Linux and Shell Scripting',  skills:['Linux','Bash','Shell','Cron'],               mini_project:'Write 5 automation bash scripts',          project_brief:null, resources:[{title:'Linux Full Course',url:'https://www.youtube.com/watch?v=sWbUDq4S6Y8',type:'video',duration:'2h'}] },
          { day:2, title:'Git and GitHub',             skills:['Git','Branching','Merge','Pull Request'],    mini_project:'Setup proper git workflow for a project',  project_brief:null, resources:[{title:'Git Full Course',url:'https://www.youtube.com/watch?v=RGOj5yH7evk',type:'video',duration:'2h'}] },
          { day:3, title:'Docker and Containers',      skills:['Docker','Images','Volumes','Networking'],    mini_project:'Dockerize a Node.js application',          project_brief:null, resources:[{title:'Docker Tutorial for Beginners',url:'https://www.youtube.com/watch?v=fqMOX6JJhGo',type:'video',duration:'2h'}] },
          { day:4, title:'Kubernetes',                 skills:['K8s','Pods','Services','Deployments'],       mini_project:'Deploy app on local K8s cluster',          project_brief:'PROJECT 1: Dockerized Microservices. 3 services frontend backend database with Docker Compose. Push to DockerHub.', resources:[{title:'Kubernetes Full Course',url:'https://www.youtube.com/watch?v=X48VuDVv0do',type:'video',duration:'4h'}] },
          { day:5, title:'AWS Core Services',          skills:['EC2','S3','RDS','Lambda','IAM'],             mini_project:'Host static site on S3 with CloudFront',   project_brief:null, resources:[{title:'AWS Full Course',url:'https://www.youtube.com/watch?v=NhDYbskXRgc',type:'video',duration:'3h'}] },
          { day:6, title:'CI CD Pipelines',            skills:['GitHub Actions','Jenkins','YAML'],           mini_project:'Setup auto-deploy with GitHub Actions',    project_brief:null, resources:[{title:'GitHub Actions Tutorial',url:'https://www.youtube.com/watch?v=R8_veQiYBjI',type:'video',duration:'1h'}] },
          { day:7, title:'Infrastructure as Code',     skills:['Terraform','Ansible','IaC'],                 mini_project:'Provision AWS infra with Terraform',       project_brief:'PROJECT 2: Full DevOps Pipeline. Code push triggers Actions builds Docker image and deploys to AWS. Production grade.', resources:[{title:'Terraform Tutorial',url:'https://www.youtube.com/watch?v=SLB_c_ayRMo',type:'video',duration:'2h'}] },
        ],
        android: [
          { day:1, title:'Kotlin Fundamentals',         skills:['Kotlin','Null Safety','Data Classes'],      mini_project:'Build a working Kotlin calculator',        project_brief:null, resources:[{title:'Kotlin Full Course',url:'https://www.youtube.com/watch?v=F9UC9DY-vIU',type:'video',duration:'2.5h'}] },
          { day:2, title:'Android UI with Compose',     skills:['Jetpack Compose','State','Composables'],    mini_project:'Build counter app in Jetpack Compose',     project_brief:null, resources:[{title:'Jetpack Compose Tutorial',url:'https://www.youtube.com/watch?v=cDabx3SjuOY',type:'video',duration:'2h'}] },
          { day:3, title:'Navigation and Architecture', skills:['Navigation','MVVM','ViewModel'],            mini_project:'Build multi-screen app with navigation',   project_brief:null, resources:[{title:'Android Navigation Tutorial',url:'https://www.youtube.com/watch?v=IEO2X5IM1cI',type:'video',duration:'1.5h'}] },
          { day:4, title:'Room Database',               skills:['Room','SQLite','DAO','Entity'],             mini_project:'Build notes app with Room database',       project_brief:'PROJECT 1: Notes App. Create edit delete notes. Room DB. Material Design. Publish to Play Store internal testing.', resources:[{title:'Room Database Tutorial',url:'https://www.youtube.com/watch?v=bOd3wO0uFr8',type:'video',duration:'1.5h'}] },
          { day:5, title:'Networking with Retrofit',    skills:['Retrofit','OkHttp','Coroutines'],           mini_project:'Build a live news reader app with API',    project_brief:null, resources:[{title:'Retrofit Tutorial',url:'https://www.youtube.com/watch?v=k2N3EoZI3eU',type:'video',duration:'1.5h'}] },
          { day:6, title:'Firebase Integration',        skills:['Firebase Auth','Firestore','Storage'],      mini_project:'Add Firebase auth and real-time database',  project_brief:null, resources:[{title:'Firebase Android Tutorial',url:'https://www.youtube.com/watch?v=jbHfJpoOzkI',type:'video',duration:'2h'}] },
          { day:7, title:'Publish to Play Store',       skills:['APK Signing','Play Console','Release'],     mini_project:'Publish your first app to Play Store',     project_brief:'PROJECT 2: Social App. Users post like and comment. Firebase real-time backend. Your main Android portfolio app.', resources:[{title:'Play Store Publishing Guide',url:'https://www.youtube.com/watch?v=3E_FOJLLMGM',type:'video',duration:'1h'}] },
        ],
      };

      const nodes = ROADMAPS[domain] || ROADMAPS['fullstack'];

      // Step 6: Insert new roadmap
      const { data: newRoadmap, error: rmError } = await supabase
        .from('roadmaps')
        .insert({
          student_id: profile.id,
          title: `${selectedDomain.name} — Day by Day Roadmap`,
          domain: domain,
          status: 'active',
          total_nodes: nodes.length,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (rmError) {
        console.error('Roadmap create error:', rmError);
        toast.error('Error creating roadmap: ' + rmError.message, { id: 'save' });
        setSaving(false);
        return;
      }

      // Step 7: Insert nodes ONE BY ONE
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const { error: nodeError } = await supabase
          .from('roadmap_nodes')
          .insert({
            roadmap_id: newRoadmap.id,
            title: n.title,
            description: `Day ${n.day}: ${n.mini_project || n.title}`,
            order_index: i,
            day_number: n.day,
            type: n.project_brief ? 'project' : 'topic',
            status: i === 0 ? 'unlocked' : 'locked',
            skills: Array.isArray(n.skills) ? n.skills : [],
            resources: Array.isArray(n.resources) ? n.resources : [],
            estimated_days: 1,
            created_at: new Date().toISOString(),
            ...(n.mini_project ? { mini_project: n.mini_project } : {}),
            ...(n.project_brief ? { project_brief: n.project_brief } : {}),
          });

        if (nodeError) {
          console.error(`Node ${i} error:`, nodeError);
        }
      }

      // Step 8: Refresh profile in store
      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();

      if (freshProfile && setProfile) setProfile(freshProfile);

      toast.success(
        `${selectedDomain.name} roadmap ready! ${nodes.length} days`,
        { id: 'save' }
      );

      await new Promise(r => setTimeout(r, 800));
      navigate('/student/roadmap');

    } catch(err) {
      console.error('saveDomainAndTimeline error:', err);
      toast.error('Failed: ' + err.message, { id: 'save' });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 p-5 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-3">
            Find Your <span className="text-primary">Domain</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Not sure what to learn? Explore all domains, compare them side by side,
            and pick the one that fits your goals. Then set your timeline.
          </p>
        </motion.div>

        {/* Step tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { id: 'explore',  label: '1. Explore Domains' },
            { id: 'compare',  label: '2. Compare' },
            { id: 'timeline', label: '3. Set Timeline' },
          ].map((s) => (
            <button key={s.id}
              onClick={() => s.id === 'compare'
                ? compareDomains.length > 0 && setStep(s.id)
                : setStep(s.id)
              }
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                step === s.id
                  ? 'bg-primary text-dark-900'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* EXPLORE STEP */}
        {step === 'explore' && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DOMAINS.map((domain, i) => (
                <motion.div key={domain.id}
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.07 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  style={{
                    background: selectedDomain?.id === domain.id
                      ? `linear-gradient(135deg, ${domain.color}15, rgba(18,18,26,0.95))`
                      : 'rgba(18,18,26,0.8)',
                    border: `1px solid ${selectedDomain?.id === domain.id ? domain.color + '40' : 'rgba(34,34,51,0.8)'}`,
                  }}>

                  {/* Compare toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCompare(domain); }}
                    className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all z-10 ${
                      compareDomains.find(d => d.id === domain.id)
                        ? 'bg-primary text-dark-900'
                        : 'bg-dark-600 text-gray-500 hover:bg-dark-500'
                    }`}>
                    {compareDomains.find(d => d.id === domain.id) ? '✓' : '+'}
                  </button>

                  <div className="p-5" onClick={() => {
                    setSelectedDomain(domain);
                    setStep('explore');
                  }}>
                    {/* Domain header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{domain.emoji}</span>
                      <div>
                        <h3 className="font-bold text-white font-heading text-sm">{domain.name}</h3>
                        <p className="text-xs" style={{ color: domain.color }}>{domain.tagline}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      {domain.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: '💰', label: 'Fresher', value: domain.avgSalary.fresher },
                        { icon: '📈', label: 'Demand',  value: domain.demand },
                        { icon: '⏱️', label: 'Time',    value: domain.timeToJob },
                      ].map((stat, j) => (
                        <div key={j} className="text-center p-2 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="text-sm mb-0.5">{stat.icon}</div>
                          <div className="text-xs font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Skills preview */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {domain.skills.slice(0, 4).map((skill, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-md text-xs"
                          style={{ background: `${domain.color}15`, color: domain.color, border: `1px solid ${domain.color}25` }}>
                          {skill}
                        </span>
                      ))}
                      {domain.skills.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md text-xs text-gray-600">
                          +{domain.skills.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Companies */}
                    <p className="text-xs text-gray-600 mb-3">
                      🏢 {domain.companies.slice(0, 3).join(' · ')}
                    </p>

                    {/* Select button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedDomain(domain); setStep('timeline'); }}
                      className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: `${domain.color}20`,
                        color: domain.color,
                        border: `1px solid ${domain.color}30`,
                      }}>
                      Choose This Domain →
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {selectedDomain?.id === domain.id && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="border-t px-5 pb-5"
                      style={{ borderColor: `${domain.color}20` }}>

                      {/* Tabs */}
                      <div className="flex gap-2 mt-4 mb-3">
                        {['roadmap', 'projects', 'fit'].map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                              activeTab === tab ? 'bg-primary text-dark-900' : 'text-gray-500 hover:text-white'
                            }`}>
                            {tab}
                          </button>
                        ))}
                      </div>

                      {activeTab === 'roadmap' && (
                        <div className="space-y-1">
                          {domain.roadmapPreview.map((node, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs text-gray-400">
                              <div className="w-1 h-1 rounded-full flex-shrink-0"
                                style={{ background: domain.color }} />
                              {node}
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'projects' && (
                        <div className="space-y-2">
                          {domain.projects.map((proj, j) => (
                            <div key={j} className="flex items-center justify-between p-2 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <div>
                                <p className="text-xs font-medium text-white">{proj.name}</p>
                                <p className="text-xs text-gray-600 capitalize">{proj.difficulty}</p>
                              </div>
                              <span className="text-xs text-gray-500">{proj.weeks}w</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'fit' && (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-success mb-1">✅ Good for you if:</p>
                            {domain.forYouIf.map((item, j) => (
                              <p key={j} className="text-xs text-gray-400">• {item}</p>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-danger mb-1">❌ Not ideal if:</p>
                            {domain.notForYouIf.map((item, j) => (
                              <p key={j} className="text-xs text-gray-400">• {item}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {compareDomains.length > 0 && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
                  style={{ background: '#1A1A27', border: '1px solid rgba(0,255,148,0.3)' }}>
                  <div className="flex gap-2">
                    {compareDomains.map(d => (
                      <span key={d.id} className="text-sm px-2 py-1 rounded-lg"
                        style={{ background: `${d.color}20`, color: d.color }}>
                        {d.emoji} {d.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => setStep('compare')}
                    className="px-4 py-2 bg-primary text-dark-900 font-bold rounded-xl text-xs">
                    Compare {compareDomains.length} →
                  </button>
                  <button onClick={() => setCompareDomains([])}
                    className="text-gray-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* COMPARE STEP */}
        {step === 'compare' && compareDomains.length > 0 && (
          <div>
            <h2 className="font-bold text-white font-heading text-center mb-6">
              Domain Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-500 w-32">Feature</th>
                    {compareDomains.map(d => (
                      <th key={d.id} className="p-3 text-center">
                        <div className="text-2xl mb-1">{d.emoji}</div>
                        <div className="font-bold text-sm font-heading" style={{ color: d.color }}>
                          {d.name.split(' ')[0]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {[
                    { label: 'Fresher Salary', key: 'salary' },
                    { label: 'Demand',         key: 'demand' },
                    { label: 'Difficulty',     key: 'difficulty' },
                    { label: 'Time to Job',    key: 'timeToJob' },
                    { label: 'Top Companies',  key: 'companies' },
                    { label: 'Key Skills',     key: 'skills' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-dark-800">
                      <td className="p-3 text-xs text-gray-500">{row.label}</td>
                      {compareDomains.map(d => (
                        <td key={d.id} className="p-3 text-center text-xs text-gray-300">
                          {row.key === 'salary'    && d.avgSalary.fresher}
                          {row.key === 'demand'    && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: `${d.color}15`, color: d.color }}>
                              {d.demand}
                            </span>
                          )}
                          {row.key === 'difficulty' && d.difficulty}
                          {row.key === 'timeToJob'  && d.timeToJob}
                          {row.key === 'companies'  && d.companies.slice(0, 2).join(', ')}
                          {row.key === 'skills'     && d.skills.slice(0, 3).join(', ')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => setStep('explore')}
                className="px-5 py-2.5 bg-dark-700 border border-dark-500 text-white rounded-xl text-sm font-semibold">
                ← Back
              </button>
              {compareDomains.map(d => (
                <button key={d.id}
                  onClick={() => { setSelectedDomain(d); setStep('timeline'); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: d.color, color: '#0A0A0F' }}>
                  Choose {d.name.split(' ')[0]} →
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE STEP */}
        {step === 'timeline' && selectedDomain && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-4xl">{selectedDomain.emoji}</span>
              <h2 className="text-xl font-bold font-heading text-white mt-2">
                {selectedDomain.name}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Now choose how fast you want to become job-ready
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {Object.values(TIMELINES).map((timeline, i) => (
                <motion.div key={timeline.id}
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedTimeline(timeline.id)}
                  className="p-5 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: selectedTimeline === timeline.id
                      ? `linear-gradient(135deg, ${timeline.color}15, rgba(18,18,26,0.95))`
                      : 'rgba(18,18,26,0.8)',
                    border: `1px solid ${selectedTimeline === timeline.id ? timeline.color + '40' : 'rgba(34,34,51,0.8)'}`,
                    boxShadow: selectedTimeline === timeline.id ? `0 0 20px ${timeline.color}15` : 'none',
                  }}>
                  <div className="text-3xl mb-2">{timeline.emoji}</div>
                  <h3 className="font-bold text-white font-heading mb-0.5">{timeline.label}</h3>
                  <p className="text-xs mb-4" style={{ color: timeline.color }}>
                    {timeline.tagline}
                  </p>

                  <div className="space-y-2 mb-4">
                    {[
                      { label: 'Tasks/day',     value: timeline.tasksPerDay },
                      { label: 'Tests/day',     value: timeline.testsPerDay },
                      { label: 'Project every', value: `${timeline.projectFrequencyWeeks} weeks` },
                      { label: 'Hours/day',     value: `${timeline.hoursPerDay}h` },
                    ].map((item, j) => (
                      <div key={j} className="flex justify-between text-xs">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-bold" style={{ color: timeline.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    {timeline.forYouIf.map((item, j) => (
                      <p key={j} className="text-xs text-gray-500">✓ {item}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Project roadmap preview */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-white font-heading text-sm mb-4">
                📅 Your Project Timeline
              </h3>
              <div className="space-y-3">
                {selectedDomain.projects.map((proj, i) => {
                  const tl = TIMELINES[selectedTimeline];
                  const startWeek = i * tl.projectFrequencyWeeks + 1;
                  const endWeek   = startWeek + proj.weeks - 1;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,34,51,0.5)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: `${selectedDomain.color}20`, color: selectedDomain.color }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white">{proj.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{proj.difficulty} · {proj.weeks} weeks to build</p>
                      </div>
                      <span className="text-xs text-gray-600">Week {startWeek}-{endWeek}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('explore')}
                className="px-5 py-3 bg-dark-700 border border-dark-500 text-white rounded-xl text-sm font-semibold">
                ← Change Domain
              </button>
              <button onClick={saveDomainAndTimeline} disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: selectedDomain.color, color: '#0A0A0F' }}>
                {saving && (
                  <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                )}
                Start My {TIMELINES[selectedTimeline].label} Journey →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainExplorer;
