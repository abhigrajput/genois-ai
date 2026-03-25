import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const DOMAINS = [
  { id:'fullstack',      name:'Full Stack Dev',        icon:'🌐', color:'#00FF94', desc:'React, Node.js, MongoDB, REST APIs' },
  { id:'dsa',            name:'DSA & Algorithms',      icon:'🧠', color:'#7B61FF', desc:'Arrays, Trees, DP, Graphs, LeetCode' },
  { id:'aiml',           name:'AI & Machine Learning', icon:'🤖', color:'#4A9EFF', desc:'Python, PyTorch, NLP, LLMs, RAG' },
  { id:'cybersecurity',  name:'Cybersecurity',         icon:'🔐', color:'#FF6B6B', desc:'PenTest, OWASP, CTF, Bug Bounty' },
  { id:'devops',         name:'DevOps & Cloud',        icon:'☁️', color:'#FFB347', desc:'Docker, K8s, AWS, CI/CD, Terraform' },
  { id:'android',        name:'Android Dev',           icon:'📱', color:'#00D68F', desc:'Kotlin, Jetpack Compose, Firebase' },
  { id:'datascience',    name:'Data Science',          icon:'📊', color:'#FF6EFF', desc:'Pandas, SQL, Visualization, Stats' },
  { id:'blockchain',     name:'Blockchain & Web3',     icon:'⛓️', color:'#F7931A', desc:'Solidity, Smart Contracts, DeFi' },
  { id:'gamedev',        name:'Game Development',      icon:'🎮', color:'#00CFFF', desc:'Unity, C#, 3D, Physics, Publishing' },
  { id:'iot',            name:'IoT & Embedded',        icon:'🔌', color:'#AAFF00', desc:'Arduino, Raspberry Pi, MQTT, C++' },
];

const TIMELINES = [
  { id:'daily',   label:'Daily Plan',   desc:'1 topic per day, 1-2 hours',  icon:'📅' },
  { id:'weekly',  label:'Weekly Plan',  desc:'7 topics per week, structured',icon:'🗓️' },
  { id:'monthly', label:'Monthly Plan', desc:'Complete domain in 30 days',   icon:'📆' },
];

const ROADMAP_DATA = {
  fullstack: [
    { day:1,  title:'HTML Fundamentals',      type:'topic',   skills:['HTML5','Semantic HTML','Forms'],      mini_project:'Build a personal bio page',         project_brief:null, resources:[{title:'HTML Full Course - freeCodeCamp',url:'https://www.youtube.com/watch?v=pQN-pnXPaVg',type:'video',duration:'2h'}] },
    { day:2,  title:'CSS and Flexbox',         type:'topic',   skills:['CSS3','Flexbox','Selectors'],         mini_project:'Style bio page with CSS',           project_brief:null, resources:[{title:'CSS Full Course - freeCodeCamp',url:'https://www.youtube.com/watch?v=OXGznpKZ_sA',type:'video',duration:'2h'}] },
    { day:3,  title:'CSS Grid and Responsive', type:'topic',   skills:['Grid','Media Queries','Mobile'],      mini_project:'Make bio page responsive',          project_brief:null, resources:[{title:'CSS Grid Tutorial',url:'https://www.youtube.com/watch?v=EiNiSFIPIQE',type:'video',duration:'1h'}] },
    { day:4,  title:'JavaScript Basics',       type:'topic',   skills:['Variables','Functions','DOM'],        mini_project:'Add interactivity to bio page',     project_brief:null, resources:[{title:'JavaScript Full Course',url:'https://www.youtube.com/watch?v=PkZNo7MFNFg',type:'video',duration:'3h'}] },
    { day:5,  title:'JS Arrays and Objects',   type:'topic',   skills:['Arrays','Objects','Methods'],         mini_project:'Build a contact list app',          project_brief:null, resources:[{title:'JS Arrays and Objects',url:'https://www.youtube.com/watch?v=7W4pQQ20nJg',type:'video',duration:'1h'}] },
    { day:6,  title:'DOM Manipulation',        type:'topic',   skills:['DOM','Events','querySelector'],       mini_project:'Build todo list with DOM',          project_brief:null, resources:[{title:'DOM Crash Course',url:'https://www.youtube.com/watch?v=0ik6X4DJKCc',type:'video',duration:'1h'}] },
    { day:7,  title:'Async JS and Fetch API',  type:'project', skills:['Promises','async/await','fetch'],     mini_project:'Fetch weather from API',            project_brief:'PROJECT 1: Weather App. Use OpenWeather API. Show temperature and humidity. Deploy on Vercel. Push to GitHub.', resources:[{title:'Async JavaScript',url:'https://www.youtube.com/watch?v=PoRJizFvM7s',type:'video',duration:'1h'}] },
    { day:8,  title:'React Introduction',      type:'topic',   skills:['React','JSX','Components'],          mini_project:'Create first React component',      project_brief:null, resources:[{title:'React Full Course',url:'https://www.youtube.com/watch?v=CgkZ7MvWUAA',type:'video',duration:'4h'}] },
    { day:9,  title:'React Hooks useState',    type:'topic',   skills:['useState','State','Props'],           mini_project:'Build counter with useState',        project_brief:null, resources:[{title:'React Hooks Tutorial',url:'https://www.youtube.com/watch?v=cF2lQ_gZeA8',type:'video',duration:'2h'}] },
    { day:10, title:'React useEffect APIs',    type:'project', skills:['useEffect','API','Lifecycle'],        mini_project:'Build GitHub profile finder',       project_brief:'PROJECT 2: GitHub Finder. Search user, show repos and followers. React plus API. Deploy on Vercel.', resources:[{title:'useEffect Tutorial',url:'https://www.youtube.com/watch?v=gv9ugDJ1ynU',type:'video',duration:'1h'}] },
    { day:11, title:'Node.js Fundamentals',    type:'topic',   skills:['Node.js','NPM','Modules'],           mini_project:'Build a CLI calculator',            project_brief:null, resources:[{title:'Node.js Crash Course',url:'https://www.youtube.com/watch?v=fBNz5xF-Kx4',type:'video',duration:'1.5h'}] },
    { day:12, title:'Express REST APIs',       type:'topic',   skills:['Express','REST','Routes'],           mini_project:'Build Notes CRUD API',              project_brief:null, resources:[{title:'Express Crash Course',url:'https://www.youtube.com/watch?v=SccSCuHhOw0',type:'video',duration:'1h'}] },
    { day:13, title:'MongoDB and Mongoose',    type:'topic',   skills:['MongoDB','Mongoose','CRUD'],         mini_project:'Connect Notes API to MongoDB',      project_brief:null, resources:[{title:'MongoDB Crash Course',url:'https://www.youtube.com/watch?v=-56x56UppqQ',type:'video',duration:'1.5h'}] },
    { day:14, title:'JWT Authentication',      type:'topic',   skills:['JWT','Auth','bcrypt'],               mini_project:'Add login to Notes app',            project_brief:null, resources:[{title:'JWT Auth Tutorial',url:'https://www.youtube.com/watch?v=mbsmsi7l3r4',type:'video',duration:'1h'}] },
    { day:15, title:'Deploy Full Stack App',   type:'project', skills:['Vercel','Railway','CI/CD'],          mini_project:'Deploy full stack app live',        project_brief:'PROJECT 3: Job Board App. Post jobs, apply with auth. Full CRUD. Your main portfolio project. Deploy and share.', resources:[{title:'Deploy to Railway',url:'https://www.youtube.com/watch?v=MusIvEKjqsc',type:'video',duration:'30min'}] },
  ],
  cybersecurity: [
    { day:1,  title:'Networking Fundamentals', type:'topic',   skills:['TCP/IP','DNS','HTTP','OSI'],         mini_project:'Analyze packets with Wireshark',    project_brief:null, resources:[{title:'Networking Full Course',url:'https://www.youtube.com/watch?v=IPvYjXCsTg8',type:'video',duration:'2h'}] },
    { day:2,  title:'Linux Command Line',      type:'topic',   skills:['Linux','Bash','Permissions'],        mini_project:'Complete OverTheWire Bandit 1-5',   project_brief:null, resources:[{title:'Linux Full Course',url:'https://www.youtube.com/watch?v=sWbUDq4S6Y8',type:'video',duration:'2h'}] },
    { day:3,  title:'Python for Security',     type:'topic',   skills:['Python','Scripting','Socket'],       mini_project:'Build a port scanner in Python',    project_brief:null, resources:[{title:'Python for Hacking',url:'https://www.youtube.com/watch?v=FD0A9KxeJMQ',type:'video',duration:'2h'}] },
    { day:4,  title:'Web Security OWASP',      type:'project', skills:['OWASP','XSS','CSRF','SQLi'],        mini_project:'Find 3 vulnerabilities in DVWA',    project_brief:'PROJECT 1: Vulnerability Scanner. Python script for OWASP Top 10. Write professional security report.', resources:[{title:'OWASP Top 10',url:'https://www.youtube.com/watch?v=KAOcMeMoQ64',type:'video',duration:'2h'}] },
    { day:5,  title:'Penetration Testing',     type:'topic',   skills:['Nmap','Burp Suite','Metasploit'],   mini_project:'Complete HackTheBox easy machine',  project_brief:null, resources:[{title:'PenTest Course',url:'https://www.youtube.com/watch?v=3Kq1MIfTWCE',type:'video',duration:'3h'}] },
    { day:6,  title:'Cryptography Basics',     type:'topic',   skills:['AES','RSA','Hashing','TLS'],        mini_project:'Implement AES encryption in Python',project_brief:null, resources:[{title:'Cryptography Course',url:'https://www.youtube.com/watch?v=AQDCe585Lnc',type:'video',duration:'2h'}] },
    { day:7,  title:'CTF and Bug Bounty',      type:'project', skills:['CTF','Bug Bounty','Reports'],       mini_project:'Solve 3 CTF challenges on PicoCTF', project_brief:'PROJECT 2: Security Audit Report. Pen test DVWA. Write professional report with all vulnerabilities and fixes.', resources:[{title:'CTF Guide',url:'https://www.youtube.com/watch?v=8ev9ZX9J45A',type:'video',duration:'1h'}] },
  ],
  dsa: [
    { day:1,  title:'Arrays and Complexity',   type:'topic',   skills:['Arrays','Big O','Space'],           mini_project:'Solve 5 LeetCode Easy arrays',      project_brief:null, resources:[{title:'Arrays NeetCode',url:'https://www.youtube.com/watch?v=3OamzN90kPg',type:'video',duration:'2h'}] },
    { day:2,  title:'Two Pointer Technique',   type:'topic',   skills:['Two Pointer','Fast Slow'],          mini_project:'Two Sum and Valid Palindrome',       project_brief:null, resources:[{title:'Two Pointer',url:'https://www.youtube.com/watch?v=0l2nePjDFuA',type:'video',duration:'1h'}] },
    { day:3,  title:'Sliding Window',          type:'topic',   skills:['Sliding Window','Subarray'],        mini_project:'Max Subarray, Buy Sell Stock',       project_brief:null, resources:[{title:'Sliding Window',url:'https://www.youtube.com/watch?v=EHCGAZBbB88',type:'video',duration:'1h'}] },
    { day:4,  title:'HashMap and HashSet',     type:'project', skills:['HashMap','HashSet'],                mini_project:'Group Anagrams, Valid Anagram',      project_brief:'PROJECT 1: Algorithm Visualizer. Animate bubble sort and merge sort. React plus CSS animations.', resources:[{title:'HashMap Problems',url:'https://www.youtube.com/watch?v=UrZ3LvdtL_k',type:'video',duration:'1h'}] },
    { day:5,  title:'Linked Lists',            type:'topic',   skills:['Linked List','Reversal'],           mini_project:'Implement LinkedList from scratch',  project_brief:null, resources:[{title:'Linked Lists',url:'https://www.youtube.com/watch?v=Ast5sKgXXtg',type:'video',duration:'2h'}] },
    { day:6,  title:'Stacks and Queues',       type:'topic',   skills:['Stack','Queue','Monotonic'],        mini_project:'Valid Parentheses and Min Stack',    project_brief:null, resources:[{title:'Stacks Queues',url:'https://www.youtube.com/watch?v=GYptUgnIM_I',type:'video',duration:'1.5h'}] },
    { day:7,  title:'Binary Trees',            type:'project', skills:['Binary Tree','DFS','BFS'],         mini_project:'All tree traversals plus max depth', project_brief:'PROJECT 2: DSA Visualizer. Visualize BST insert delete search with animations.', resources:[{title:'Binary Trees',url:'https://www.youtube.com/watch?v=_ANrF3FJm7I',type:'video',duration:'3h'}] },
    { day:8,  title:'Graphs BFS and DFS',      type:'topic',   skills:['Graph','BFS','DFS'],               mini_project:'Number of Islands, Clone Graph',    project_brief:null, resources:[{title:'Graph Algorithms',url:'https://www.youtube.com/watch?v=YTtpfjkUrvE',type:'video',duration:'4h'}] },
    { day:9,  title:'Dynamic Programming',     type:'topic',   skills:['DP','Memoization','Tabulation'],   mini_project:'Climbing Stairs, House Robber',      project_brief:null, resources:[{title:'DP NeetCode',url:'https://www.youtube.com/watch?v=oBt53YbR9Kk',type:'video',duration:'3h'}] },
    { day:10, title:'Mock Interview Practice', type:'project', skills:['Problem Solving','Time Mgmt'],     mini_project:'Solve 3 mediums in 90 minutes',      project_brief:'PROJECT 3: LeetCode Tracker. Track problems by difficulty, streak, weekly goals.', resources:[{title:'Interview Tips',url:'https://www.youtube.com/watch?v=qc1owf2-ovU',type:'video',duration:'30min'}] },
  ],
  aiml: [
    { day:1,  title:'Python for Data Science', type:'topic',   skills:['Python','NumPy','Pandas'],          mini_project:'Analyze student dataset',           project_brief:null, resources:[{title:'Python Full Course',url:'https://www.youtube.com/watch?v=eWRfhZUzrAc',type:'video',duration:'4h'}] },
    { day:2,  title:'Statistics',              type:'topic',   skills:['Mean','Variance','Distributions'],  mini_project:'Statistical analysis on dataset',   project_brief:null, resources:[{title:'Stats for ML',url:'https://www.youtube.com/watch?v=xxpc-HPKN28',type:'video',duration:'2h'}] },
    { day:3,  title:'Data Visualization',      type:'topic',   skills:['Matplotlib','Seaborn'],            mini_project:'Visualize sales data charts',        project_brief:null, resources:[{title:'Matplotlib Tutorial',url:'https://www.youtube.com/watch?v=UO98lJQ3QGI',type:'video',duration:'1h'}] },
    { day:4,  title:'ML Fundamentals',         type:'project', skills:['Supervised','Features','Split'],   mini_project:'Train first ML model on Titanic',   project_brief:'PROJECT 1: Grade Predictor. Predict grades from attendance. Streamlit. Deploy on HuggingFace.', resources:[{title:'ML Crash Course',url:'https://www.youtube.com/watch?v=GwIo3gDZCVQ',type:'video',duration:'2h'}] },
    { day:5,  title:'Regression Classification',type:'topic',  skills:['Linear Reg','Logistic','Sklearn'], mini_project:'Predict house prices',              project_brief:null, resources:[{title:'Sklearn Tutorial',url:'https://www.youtube.com/watch?v=0Lt9w-BxKFQ',type:'video',duration:'2h'}] },
    { day:6,  title:'Neural Networks',         type:'topic',   skills:['Layers','Backprop','Activation'],  mini_project:'Build XOR neural network',          project_brief:null, resources:[{title:'Neural Networks',url:'https://www.youtube.com/watch?v=aircAruvnKk',type:'video',duration:'2h'}] },
    { day:7,  title:'Deep Learning PyTorch',   type:'project', skills:['PyTorch','Tensors','Training'],    mini_project:'Train MNIST classifier',            project_brief:'PROJECT 2: Image Classifier. Upload image, AI identifies it. Pre-trained ResNet. Deploy on HuggingFace.', resources:[{title:'PyTorch Course',url:'https://www.youtube.com/watch?v=c36lUUr864M',type:'video',duration:'3h'}] },
    { day:8,  title:'NLP and Transformers',    type:'topic',   skills:['NLP','BERT','HuggingFace'],        mini_project:'Build sentiment analyzer',          project_brief:null, resources:[{title:'NLP Tutorial',url:'https://www.youtube.com/watch?v=X2vAabgKiuM',type:'video',duration:'2h'}] },
    { day:9,  title:'LLMs and RAG',            type:'project', skills:['RAG','LangChain','Vector DB'],     mini_project:'Build PDF chatbot',                 project_brief:'PROJECT 3: AI Study Assistant. Upload PDF, ask questions, AI answers. RAG plus Gemini API.', resources:[{title:'RAG Tutorial',url:'https://www.youtube.com/watch?v=sVcwVQRHIc8',type:'video',duration:'2h'}] },
    { day:10, title:'MLOps Deployment',        type:'topic',   skills:['FastAPI','Docker','Serving'],      mini_project:'Deploy ML model as REST API',       project_brief:null, resources:[{title:'FastAPI for ML',url:'https://www.youtube.com/watch?v=GN5T_5rE1jo',type:'video',duration:'1h'}] },
  ],
  devops: [
    { day:1,  title:'Linux and Shell',         type:'topic',   skills:['Linux','Bash','Cron'],             mini_project:'Write 5 automation scripts',        project_brief:null, resources:[{title:'Linux Course',url:'https://www.youtube.com/watch?v=sWbUDq4S6Y8',type:'video',duration:'2h'}] },
    { day:2,  title:'Git and GitHub',          type:'topic',   skills:['Git','Branching','PR'],            mini_project:'Setup git workflow',                project_brief:null, resources:[{title:'Git Course',url:'https://www.youtube.com/watch?v=RGOj5yH7evk',type:'video',duration:'2h'}] },
    { day:3,  title:'Docker',                  type:'topic',   skills:['Docker','Containers','Images'],    mini_project:'Dockerize a Node.js app',           project_brief:null, resources:[{title:'Docker Tutorial',url:'https://www.youtube.com/watch?v=fqMOX6JJhGo',type:'video',duration:'2h'}] },
    { day:4,  title:'Kubernetes',              type:'project', skills:['K8s','Pods','Services'],           mini_project:'Deploy app on local K8s',           project_brief:'PROJECT 1: Dockerized Microservices. 3 services with Docker Compose. Push to DockerHub.', resources:[{title:'Kubernetes Course',url:'https://www.youtube.com/watch?v=X48VuDVv0do',type:'video',duration:'4h'}] },
    { day:5,  title:'AWS Core Services',       type:'topic',   skills:['EC2','S3','Lambda','IAM'],         mini_project:'Host static site on S3',            project_brief:null, resources:[{title:'AWS Course',url:'https://www.youtube.com/watch?v=NhDYbskXRgc',type:'video',duration:'3h'}] },
    { day:6,  title:'CI CD Pipelines',         type:'topic',   skills:['GitHub Actions','YAML','Jenkins'], mini_project:'Setup auto-deploy pipeline',        project_brief:null, resources:[{title:'GitHub Actions',url:'https://www.youtube.com/watch?v=R8_veQiYBjI',type:'video',duration:'1h'}] },
    { day:7,  title:'Infrastructure as Code',  type:'project', skills:['Terraform','Ansible','IaC'],       mini_project:'Provision AWS with Terraform',      project_brief:'PROJECT 2: Full DevOps Pipeline. Code push triggers Docker build and AWS deploy.', resources:[{title:'Terraform Tutorial',url:'https://www.youtube.com/watch?v=SLB_c_ayRMo',type:'video',duration:'2h'}] },
  ],
  android: [
    { day:1,  title:'Kotlin Fundamentals',     type:'topic',   skills:['Kotlin','Null Safety','Classes'],  mini_project:'Build Kotlin calculator',           project_brief:null, resources:[{title:'Kotlin Course',url:'https://www.youtube.com/watch?v=F9UC9DY-vIU',type:'video',duration:'2.5h'}] },
    { day:2,  title:'Jetpack Compose',         type:'topic',   skills:['Compose','State','Composables'],   mini_project:'Build counter in Compose',          project_brief:null, resources:[{title:'Compose Tutorial',url:'https://www.youtube.com/watch?v=cDabx3SjuOY',type:'video',duration:'2h'}] },
    { day:3,  title:'Navigation and MVVM',     type:'topic',   skills:['Navigation','ViewModel','MVVM'],   mini_project:'Multi-screen app',                  project_brief:null, resources:[{title:'Android Navigation',url:'https://www.youtube.com/watch?v=IEO2X5IM1cI',type:'video',duration:'1.5h'}] },
    { day:4,  title:'Room Database',           type:'project', skills:['Room','DAO','Entity','SQLite'],     mini_project:'Notes app with Room database',      project_brief:'PROJECT 1: Notes App. Create edit delete notes. Room DB. Material Design. Publish to Play Store.', resources:[{title:'Room Tutorial',url:'https://www.youtube.com/watch?v=bOd3wO0uFr8',type:'video',duration:'1.5h'}] },
    { day:5,  title:'Retrofit Networking',     type:'topic',   skills:['Retrofit','OkHttp','Coroutines'],  mini_project:'News reader app with API',          project_brief:null, resources:[{title:'Retrofit Tutorial',url:'https://www.youtube.com/watch?v=k2N3EoZI3eU',type:'video',duration:'1.5h'}] },
    { day:6,  title:'Firebase Integration',    type:'topic',   skills:['Firebase','Firestore','Auth'],     mini_project:'Add Firebase auth and realtime db', project_brief:null, resources:[{title:'Firebase Tutorial',url:'https://www.youtube.com/watch?v=jbHfJpoOzkI',type:'video',duration:'2h'}] },
    { day:7,  title:'Publish to Play Store',   type:'project', skills:['Play Console','APK','Release'],    mini_project:'Publish first app to Play Store',   project_brief:'PROJECT 2: Social App. Post like comment with Firebase realtime. Your main Android portfolio app.', resources:[{title:'Play Store Guide',url:'https://www.youtube.com/watch?v=3E_FOJLLMGM',type:'video',duration:'1h'}] },
  ],
  datascience: [
    { day:1,  title:'Python and Pandas',       type:'topic',   skills:['Python','Pandas','NumPy'],         mini_project:'Analyze COVID dataset',             project_brief:null, resources:[{title:'Pandas Tutorial',url:'https://www.youtube.com/watch?v=vmEHCJofslg',type:'video',duration:'2h'}] },
    { day:2,  title:'SQL for Data Science',    type:'topic',   skills:['SQL','Joins','Aggregation'],       mini_project:'Query a sales database',            project_brief:null, resources:[{title:'SQL Full Course',url:'https://www.youtube.com/watch?v=HXV3zeQKqGY',type:'video',duration:'4h'}] },
    { day:3,  title:'Data Cleaning',           type:'topic',   skills:['Missing Data','Outliers','EDA'],   mini_project:'Clean messy real-world dataset',    project_brief:null, resources:[{title:'Data Cleaning Tutorial',url:'https://www.youtube.com/watch?v=KdmPHEnPJPs',type:'video',duration:'1h'}] },
    { day:4,  title:'Statistics and Probability',type:'project',skills:['Stats','Hypothesis','A/B Test'], mini_project:'Run A/B test on website data',      project_brief:'PROJECT 1: Sales Dashboard. Interactive dashboard with filters, charts, KPIs. Use Streamlit or React.', resources:[{title:'Stats for Data Science',url:'https://www.youtube.com/watch?v=xxpc-HPKN28',type:'video',duration:'2h'}] },
    { day:5,  title:'Data Visualization',      type:'topic',   skills:['Matplotlib','Seaborn','Plotly'],   mini_project:'Build 10 different chart types',    project_brief:null, resources:[{title:'Data Visualization',url:'https://www.youtube.com/watch?v=UO98lJQ3QGI',type:'video',duration:'1h'}] },
    { day:6,  title:'Machine Learning Basics', type:'topic',   skills:['Sklearn','Classification','Reg'],  mini_project:'Predict customer churn',            project_brief:null, resources:[{title:'ML for Data Science',url:'https://www.youtube.com/watch?v=GwIo3gDZCVQ',type:'video',duration:'2h'}] },
    { day:7,  title:'Business Intelligence',   type:'project', skills:['Tableau','Power BI','Reports'],    mini_project:'Build BI report for business data', project_brief:'PROJECT 2: End-to-End Data Pipeline. Scrape data, clean it, analyze, visualize, present insights report.', resources:[{title:'Power BI Tutorial',url:'https://www.youtube.com/watch?v=AGrl-H87pRU',type:'video',duration:'2h'}] },
  ],
  blockchain: [
    { day:1,  title:'Blockchain Fundamentals', type:'topic',   skills:['Blockchain','Crypto','Consensus'], mini_project:'Implement simple blockchain in Python', project_brief:null, resources:[{title:'Blockchain Full Course',url:'https://www.youtube.com/watch?v=SSo_EIwHSd4',type:'video',duration:'2h'}] },
    { day:2,  title:'Solidity Basics',         type:'topic',   skills:['Solidity','Smart Contracts','EVM'],mini_project:'Write first smart contract',        project_brief:null, resources:[{title:'Solidity Tutorial',url:'https://www.youtube.com/watch?v=ipwxYa-F1uY',type:'video',duration:'2h'}] },
    { day:3,  title:'Hardhat and Testing',     type:'topic',   skills:['Hardhat','Ethers.js','Testing'],   mini_project:'Deploy contract on testnet',        project_brief:null, resources:[{title:'Hardhat Tutorial',url:'https://www.youtube.com/watch?v=9Qpi80dQsGU',type:'video',duration:'1.5h'}] },
    { day:4,  title:'DeFi and Tokens',         type:'project', skills:['ERC20','DeFi','Uniswap'],          mini_project:'Create ERC20 token',                project_brief:'PROJECT 1: DeFi Token. Create and deploy ERC20 token. Build simple swap interface. Deploy on testnet.', resources:[{title:'DeFi Development',url:'https://www.youtube.com/watch?v=M576WGiDBdQ',type:'video',duration:'2h'}] },
    { day:5,  title:'Web3 Frontend',           type:'topic',   skills:['ethers.js','wagmi','MetaMask'],    mini_project:'Connect wallet to dApp',            project_brief:null, resources:[{title:'Web3 React Tutorial',url:'https://www.youtube.com/watch?v=a0osIaAOFSE',type:'video',duration:'1.5h'}] },
    { day:6,  title:'NFT Development',         type:'project', skills:['ERC721','IPFS','OpenSea'],         mini_project:'Create and mint NFT collection',    project_brief:'PROJECT 2: NFT Marketplace. Create NFT collection, build mint page, list on OpenSea testnet. Full Web3 dApp.', resources:[{title:'NFT Development',url:'https://www.youtube.com/watch?v=meTpMP0J5E8',type:'video',duration:'2h'}] },
  ],
  gamedev: [
    { day:1,  title:'Unity Fundamentals',      type:'topic',   skills:['Unity','C#','GameObject'],        mini_project:'Build a rolling ball game',         project_brief:null, resources:[{title:'Unity Beginner Tutorial',url:'https://www.youtube.com/watch?v=gB1F9G0JXOo',type:'video',duration:'2h'}] },
    { day:2,  title:'C# for Unity',            type:'topic',   skills:['C#','OOP','MonoBehaviour'],       mini_project:'Create player movement script',     project_brief:null, resources:[{title:'C# for Unity',url:'https://www.youtube.com/watch?v=IufhNn4K18A',type:'video',duration:'2h'}] },
    { day:3,  title:'Physics and Collision',   type:'topic',   skills:['Rigidbody','Collider','Physics'],  mini_project:'Build a simple platformer',         project_brief:null, resources:[{title:'Unity Physics',url:'https://www.youtube.com/watch?v=XtQMytORBmM',type:'video',duration:'1h'}] },
    { day:4,  title:'UI and Menus',            type:'project', skills:['Canvas','UI','Buttons','Scenes'],  mini_project:'Build main menu and HUD',           project_brief:'PROJECT 1: 2D Platformer. Player movement, enemies, coins, score, multiple levels. Publish to itch.io.', resources:[{title:'Unity UI Tutorial',url:'https://www.youtube.com/watch?v=_RIsfVOqTaE',type:'video',duration:'1h'}] },
    { day:5,  title:'Audio and Effects',       type:'topic',   skills:['AudioSource','Particle','VFX'],   mini_project:'Add sound and particles to game',   project_brief:null, resources:[{title:'Unity Audio',url:'https://www.youtube.com/watch?v=6OT43pvUyfY',type:'video',duration:'1h'}] },
    { day:6,  title:'3D Game Development',     type:'topic',   skills:['3D','Lighting','Camera','Shader'],mini_project:'Build a simple 3D game scene',      project_brief:null, resources:[{title:'Unity 3D Tutorial',url:'https://www.youtube.com/watch?v=j48LtUkZRjU',type:'video',duration:'2h'}] },
    { day:7,  title:'Publish Your Game',       type:'project', skills:['Build','WebGL','Publishing'],     mini_project:'Publish game to itch.io or Play Store', project_brief:'PROJECT 2: 3D Endless Runner. Procedural terrain, obstacles, powerups, leaderboard. Publish to web.', resources:[{title:'Unity Build and Publish',url:'https://www.youtube.com/watch?v=7nxKAtxGSn8',type:'video',duration:'1h'}] },
  ],
  iot: [
    { day:1,  title:'Arduino Fundamentals',    type:'topic',   skills:['Arduino','C++','GPIO'],            mini_project:'Blink LED and read sensor',         project_brief:null, resources:[{title:'Arduino Full Course',url:'https://www.youtube.com/watch?v=BtLwoNJ6klE',type:'video',duration:'2h'}] },
    { day:2,  title:'Sensors and Actuators',   type:'topic',   skills:['DHT11','Servo','Ultrasonic'],      mini_project:'Build temperature monitor',         project_brief:null, resources:[{title:'Arduino Sensors',url:'https://www.youtube.com/watch?v=vz6SbBi4JBs',type:'video',duration:'1h'}] },
    { day:3,  title:'Raspberry Pi Basics',     type:'topic',   skills:['Raspberry Pi','Python','GPIO'],    mini_project:'Run Python script on Pi',           project_brief:null, resources:[{title:'Raspberry Pi Tutorial',url:'https://www.youtube.com/watch?v=aI-8LvRlAQU',type:'video',duration:'2h'}] },
    { day:4,  title:'MQTT and IoT Protocol',   type:'project', skills:['MQTT','Node-RED','Broker'],        mini_project:'Send sensor data via MQTT',         project_brief:'PROJECT 1: Smart Home Dashboard. Raspberry Pi reads sensors, sends via MQTT, dashboard shows realtime data.', resources:[{title:'MQTT Tutorial',url:'https://www.youtube.com/watch?v=EIxdz-2rhLs',type:'video',duration:'1h'}] },
    { day:5,  title:'Cloud IoT Integration',   type:'topic',   skills:['AWS IoT','Firebase','REST'],       mini_project:'Send data to AWS IoT or Firebase',  project_brief:null, resources:[{title:'AWS IoT Tutorial',url:'https://www.youtube.com/watch?v=hgQ6sVBBHDo',type:'video',duration:'1h'}] },
    { day:6,  title:'IoT Security',            type:'topic',   skills:['TLS','Auth','Encryption'],         mini_project:'Secure your IoT device',            project_brief:null, resources:[{title:'IoT Security',url:'https://www.youtube.com/watch?v=aWFHJvJSxis',type:'video',duration:'1h'}] },
    { day:7,  title:'Full IoT Project',        type:'project', skills:['End to End','Deploy','Monitor'],   mini_project:'Deploy complete IoT solution',      project_brief:'PROJECT 2: Smart Agriculture System. Monitor soil, temperature, humidity. Auto irrigation. Cloud dashboard.', resources:[{title:'IoT Project Tutorial',url:'https://www.youtube.com/watch?v=DjDAzFfJPRs',type:'video',duration:'2h'}] },
  ],
};

const DomainExplorer = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useStore();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedTimeline, setSelectedTimeline] = useState('daily');
  const [saving, setSaving] = useState(false);

  const saveDomainAndTimeline = async () => {
    if (!selectedDomain) {
      toast.error('Select a domain first!');
      return;
    }
    setSaving(true);
    toast.loading('Setting up your roadmap...', { id: 'save' });

    try {
      // Update profile
      await supabase.from('profiles').update({
        domain_id: selectedDomain.id,
        timeline: selectedTimeline,
        target_role: selectedDomain.name,
        onboarding_done: true,
      }).eq('id', profile.id);

      // CASCADE DELETE handles nodes and learning_progress automatically
      await supabase.from('roadmaps').delete().eq('student_id', profile.id);
      await supabase.from('tasks').delete().eq('student_id', profile.id);

      // Wait for deletes
      await new Promise(r => setTimeout(r, 800));

      // Get nodes for domain
      const baseNodes = ROADMAP_DATA[selectedDomain.id] || ROADMAP_DATA['fullstack'];

      // Build nodes based on timeline
      let finalNodes = [];
      if (selectedTimeline === 'daily') {
        finalNodes = baseNodes;
      } else if (selectedTimeline === 'weekly') {
        finalNodes = baseNodes.map((n, i) => ({
          ...n,
          title: `Week ${Math.floor(i/7)+1} Day ${(i%7)+1}: ${n.title}`,
        }));
      } else if (selectedTimeline === 'monthly') {
        finalNodes = baseNodes.map((n, i) => ({
          ...n,
          title: `Month Day ${i+1}: ${n.title}`,
        }));
      }

      // Create roadmap
      const { data: newRoadmap, error: rmError } = await supabase
        .from('roadmaps')
        .insert({
          student_id: profile.id,
          title: `${selectedDomain.name} — ${selectedTimeline} roadmap`,
          domain: selectedDomain.id,
          status: 'active',
          total_nodes: finalNodes.length,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (rmError) throw new Error('Roadmap create failed: ' + rmError.message);

      // Insert nodes one by one
      for (let i = 0; i < finalNodes.length; i++) {
        const n = finalNodes[i];
        const { error: nodeErr } = await supabase
          .from('roadmap_nodes')
          .insert({
            roadmap_id: newRoadmap.id,
            title: n.title,
            description: `Day ${n.day}: ${n.mini_project}`,
            order_index: i,
            day_number: n.day,
            type: n.type || 'topic',
            status: i === 0 ? 'unlocked' : 'locked',
            skills: Array.isArray(n.skills) ? n.skills : [],
            resources: Array.isArray(n.resources) ? n.resources : [],
            estimated_days: 1,
            mini_project: n.mini_project || '',
            project_brief: n.project_brief || null,
            created_at: new Date().toISOString(),
          });

        if (nodeErr) {
          console.error(`Node ${i+1} error:`, nodeErr.message);
        }
      }

      // Refresh profile
      const { data: fresh } = await supabase
        .from('profiles').select('*')
        .eq('id', profile.id).single();
      if (fresh && setProfile) setProfile(fresh);

      toast.success(
        `${selectedDomain.name} roadmap ready! ${finalNodes.length} days`,
        { id: 'save' }
      );

      await new Promise(r => setTimeout(r, 500));
      navigate('/student/roadmap');

    } catch(err) {
      console.error('Error:', err);
      toast.error(err.message, { id: 'save' });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen cyber-grid" style={{ background:'#050508' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2"
            style={{ color:'#00FF94', textShadow:'0 0 20px rgba(0,255,148,0.5)' }}>
            Choose Your Domain
          </h1>
          <p className="text-gray-400 text-sm">
            Select your CS domain and timeline. Your roadmap will be generated automatically.
          </p>
        </div>

        {/* Domain Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {DOMAINS.map(domain => (
            <motion.button
              key={domain.id}
              onClick={() => setSelectedDomain(domain)}
              whileHover={{ scale:1.03 }}
              whileTap={{ scale:0.97 }}
              className="p-4 rounded-2xl text-center transition-all"
              style={{
                background: selectedDomain?.id === domain.id
                  ? `${domain.color}15`
                  : 'rgba(12,12,20,0.8)',
                border: `1px solid ${selectedDomain?.id === domain.id
                  ? domain.color
                  : 'rgba(34,34,51,0.6)'}`,
                boxShadow: selectedDomain?.id === domain.id
                  ? `0 0 20px ${domain.color}30`
                  : 'none',
              }}>
              <div className="text-2xl mb-2">{domain.icon}</div>
              <p className="text-xs font-bold text-white leading-tight">
                {domain.name}
              </p>
              <p className="text-xs text-gray-600 mt-1 leading-tight hidden md:block">
                {domain.desc}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Timeline Selection */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
            Study Plan
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {TIMELINES.map(t => (
              <button key={t.id}
                onClick={() => setSelectedTimeline(t.id)}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: selectedTimeline === t.id
                    ? 'rgba(0,255,148,0.1)'
                    : 'rgba(12,12,20,0.8)',
                  border: `1px solid ${selectedTimeline === t.id
                    ? 'rgba(0,255,148,0.4)'
                    : 'rgba(34,34,51,0.6)'}`,
                }}>
                <div className="text-xl mb-1">{t.icon}</div>
                <p className="text-xs font-bold text-white">{t.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected info */}
        {selectedDomain && (
          <motion.div
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            className="p-4 rounded-xl mb-6"
            style={{
              background:`${selectedDomain.color}08`,
              border:`1px solid ${selectedDomain.color}30`,
            }}>
            <p className="text-sm font-bold" style={{ color:selectedDomain.color }}>
              {selectedDomain.icon} {selectedDomain.name}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {selectedDomain.desc} &middot;&nbsp;
              {(ROADMAP_DATA[selectedDomain.id] || ROADMAP_DATA['fullstack']).length} days &middot;&nbsp;
              {(ROADMAP_DATA[selectedDomain.id] || ROADMAP_DATA['fullstack']).filter(n => n.project_brief).length} projects
            </p>
          </motion.div>
        )}

        {/* Save Button */}
        <button
          onClick={saveDomainAndTimeline}
          disabled={!selectedDomain || saving}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-40"
          style={{
            background: saving || !selectedDomain
              ? 'rgba(0,255,148,0.1)'
              : 'linear-gradient(135deg, #00FF94, #7B61FF)',
            color: '#050508',
            boxShadow: selectedDomain && !saving
              ? '0 0 30px rgba(0,255,148,0.4)'
              : 'none',
          }}>
          {saving
            ? 'Generating roadmap...'
            : selectedDomain
            ? `Start ${selectedDomain.name} Journey`
            : 'Select a Domain First'}
        </button>

      </div>
    </div>
  );
};

export default DomainExplorer;
