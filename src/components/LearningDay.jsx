import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Code, ChevronRight,
         RotateCcw, Youtube, BookOpen,
         Zap, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateAIResources } from '../lib/aiResources';
import { generateQuiz, generateCodingTest,
         saveQuizResult, saveCodingResult,
         getStudentLevel } from '../lib/testGenerator';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const LearningDay = ({ node, onComplete, onScoreUpdate }) => {
  const { profile } = useStore();
  const [progress, setProgress] = useState(null);
  const [resources, setResources] = useState(null);
  const [step, setStep] = useState('video');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  useEffect(() => {
    if (node?.id && profile?.id) fetchProgress();
  }, [node?.id, profile?.id]);

  const fetchProgress = async () => {
    setLoading(true);
    const { data: prog } = await supabase
      .from('learning_progress').select('*')
      .eq('student_id', profile.id)
      .eq('node_id', node.id).single();

    if (prog) {
      setProgress(prog);
      setVideoWatched(prog.video_watched);
      setQuizAttempts(prog.quiz_attempts || 0);
      if (prog.coding_done) setStep('complete');
      else if (prog.quiz_passed) setStep('coding');
      else if (prog.video_watched) setStep('quiz');
    }

    if (node.quiz_questions?.length > 0 && node.video_resource?.title) {
      const res = {
        video: node.video_resource,
        notes: node.description || '',
        keyPoints: node.skills || [],
        quiz: node.quiz_questions,
        codingChallenge: node.coding_challenge || {},
      };
      setResources(res);
      if (res.codingChallenge?.starterCode) setCodeAnswer(res.codingChallenge.starterCode);
    } else {
      await loadAIResources();
    }
    setLoading(false);
  };

  const loadAIResources = async () => {
    setGenerating(true);
    toast.loading('AI generating resources...', { id: 'res' });
    try {
      const [baseRes, quizResult, codingResult] = await Promise.all([
        generateAIResources('beginner', 'beginner', node.title),
        generateQuiz({
          topic: node.title,
          level: getStudentLevel(profile),
          learningSpeed: profile?.learning_speed || 'normal',
          weakTopics: profile?.weak_topics || [],
          strongTopics: profile?.strong_topics || [],
          nodeTitle: node.title,
        }),
        generateCodingTest({
          topic: node.title,
          level: getStudentLevel(profile),
          learningSpeed: profile?.learning_speed || 'normal',
          weakTopics: profile?.weak_topics || [],
          strongTopics: profile?.strong_topics || [],
          nodeTitle: node.title,
        }),
      ]);
      const res = {
        ...baseRes,
        quiz: quizResult.questions,
        codingChallenge: codingResult.challenge,
        quizDifficulty: quizResult.difficulty,
      };
      setResources(res);
      if (res.codingChallenge?.starterCode) setCodeAnswer(res.codingChallenge.starterCode);
      await supabase.from('roadmap_nodes').update({
        video_resource: res.video,
        quiz_questions: res.quiz,
        coding_challenge: res.codingChallenge,
      }).eq('id', node.id);
      toast.success('Resources ready!', { id: 'res' });
    } catch {
      toast.error('Using default resources', { id: 'res' });
    }
    setGenerating(false);
  };

  const updateScore = async (points) => {
    const newScore = Math.min(1000, (profile.skill_score || 0) + points);
    await supabase.from('profiles')
      .update({ skill_score: newScore }).eq('id', profile.id);
    if (onScoreUpdate) onScoreUpdate(points);
  };

  const markVideoWatched = async () => {
    setVideoWatched(true);
    await supabase.from('learning_progress').upsert({
      student_id: profile.id, node_id: node.id,
      video_watched: true,
      video_watched_at: new Date().toISOString(),
    }, { onConflict: 'student_id,node_id' });
    await updateScore(2);
    toast.success('+2 points! Continue to quiz 🎥');
    setTimeout(() => setStep('quiz'), 300);
  };

  const submitQuiz = async () => {
    const quiz = resources?.quiz || [];
    if (Object.keys(quizAnswers).length < quiz.length) {
      toast.error('Answer all questions!'); return;
    }
    let correct = 0;
    quiz.forEach((q, i) => { if (quizAnswers[i] === (q.answer || q.correct)) correct++; });
    const score = Math.round((correct / quiz.length) * 100);
    const passed = score >= 50;
    const newAttempts = quizAttempts + 1;
    setQuizScore(score);
    setQuizSubmitted(true);
    setQuizAttempts(newAttempts);

    const { passed: quizPassed } = await saveQuizResult(
      profile.id, node.id, node.title, score, quizAnswers, quiz, supabase
    );

    if (quizPassed) {
      toast.success(`Passed! ${score}% — +5 points!`);
      await supabase.from('learning_progress').upsert({
        student_id: profile.id, node_id: node.id,
        video_watched: true, quiz_passed: true,
        quiz_score: score, quiz_attempts: newAttempts,
      }, { onConflict: 'student_id,node_id' });
      await updateScore(5);
      setTimeout(() => setStep('coding'), 800);
    } else {
      toast.error(`${score}% — Need 50% to pass. Try again!`);
    }
  };

  const submitCoding = async () => {
    if (!codeAnswer || codeAnswer.includes('Write your code here')) {
      toast.error('Write your solution first!'); return;
    }
    if (codeAnswer.trim().length < 50) {
      toast.error('Solution too short!'); return;
    }
    setCodeSubmitted(true);
    toast.success('+10 points! Day complete!');
    await saveCodingResult(profile.id, node.id, node.title, codeAnswer, supabase);
    await supabase.from('learning_progress').upsert({
      student_id: profile.id, node_id: node.id,
      video_watched: true, quiz_passed: true,
      coding_done: true,
      coding_submitted_at: new Date().toISOString(),
      score_earned: 17,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'student_id,node_id' });
    await supabase.from('roadmap_nodes')
      .update({ status: 'completed' }).eq('id', node.id);
    await updateScore(10);
    if (onComplete) onComplete(node);
    setStep('complete');
  };

  if (loading || generating) return (
    <div className="p-6 text-center">
      <div className="w-6 h-6 border-2 border-dark-600 border-t-primary rounded-full animate-spin mx-auto mb-2" />
      <p className="text-xs text-gray-500">
        {generating ? 'AI generating resources...' : 'Loading...'}
      </p>
    </div>
  );

  if (!resources) return null;

  const video = resources.video || {};
  const quiz = resources.quiz || [];
  const coding = resources.codingChallenge || {};

  return (
    <div className="space-y-4 mt-4">

      {/* Progress bar */}
      <div className="flex items-center gap-1.5">
        {[
          { id: 'video', icon: '🎥', label: 'Watch', done: videoWatched },
          { id: 'quiz', icon: '📝', label: 'Quiz', done: progress?.quiz_passed },
          { id: 'coding', icon: '💻', label: 'Code', done: progress?.coding_done },
          { id: 'complete', icon: '✅', label: 'Done', done: progress?.coding_done },
        ].map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              step === s.id ? 'bg-primary text-dark-900' :
              s.done ? 'bg-success/20 text-success' :
              'bg-dark-700 text-gray-500'
            }`}>
              <span>{s.done ? '✓' : s.icon}</span>
              <span className="hidden md:inline">{s.label}</span>
            </div>
            {i < 3 && (
              <div className={`flex-1 h-0.5 ${s.done ? 'bg-success' : 'bg-dark-600'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* VIDEO STEP */}
      {step === 'video' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-dark-700 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-dark-600">
            <div className="flex items-center gap-2 mb-1">
              <Youtube size={14} className="text-danger" />
              <span className="text-xs font-bold text-white">Step 1: Watch Video</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">+2 pts</span>
            </div>
            <p className="text-xs text-gray-500">Watch then mark as watched to continue</p>
          </div>

          {video.youtubeId ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                title={video.title} allowFullScreen />
            </div>
          ) : (
            <div className="p-4">
              <a href={video.url || '#'} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)' }}>
                <Youtube size={20} className="text-danger" />
                <div>
                  <p className="text-xs font-semibold text-white">{video.title}</p>
                  <p className="text-xs text-gray-500">{video.channel} · {video.duration}</p>
                </div>
                <ChevronRight size={14} className="text-gray-500 ml-auto" />
              </a>
            </div>
          )}

          <div className="p-4">
            {resources.keyPoints?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <BookOpen size={11} /> Key Points
                </p>
                {resources.keyPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1">
                    <span className="text-primary text-xs">•</span>
                    <span className="text-xs text-gray-300">{pt}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={markVideoWatched}
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              style={{ background: 'rgba(0,255,148,0.15)', color: '#00FF94', border: '1px solid rgba(0,255,148,0.3)' }}>
              <CheckCircle size={13} />
              Watched — Go to Quiz →
            </button>
          </div>
        </motion.div>
      )}

      {/* QUIZ STEP */}
      {step === 'quiz' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-dark-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">📝</span>
            <span className="text-xs font-bold text-white">Step 2: Concept Quiz</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">+5 pts</span>
            {resources?.quizDifficulty && (
              <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                style={{
                  background: resources.quizDifficulty === 'hard'
                    ? 'rgba(255,107,107,0.1)'
                    : resources.quizDifficulty === 'medium'
                    ? 'rgba(255,179,71,0.1)'
                    : 'rgba(74,158,255,0.1)',
                  color: resources.quizDifficulty === 'hard'
                    ? '#FF6B6B'
                    : resources.quizDifficulty === 'medium'
                    ? '#FFB347'
                    : '#4A9EFF',
                }}>
                {resources.quizDifficulty}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4">
            5 questions · Need 50% · {quizAttempts > 0 ? `Attempt #${quizAttempts + 1}` : 'First attempt'}
          </p>

          {!quizSubmitted ? (
            <div className="space-y-3">
              {quiz.map((q, qi) => (
                <div key={qi} className="p-3 rounded-xl bg-dark-800">
                  <p className="text-xs font-medium text-white mb-2">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(q.options || {}).map(([key, val]) => (
                      <button key={key}
                        onClick={() => setQuizAnswers(a => ({ ...a, [qi]: key }))}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                          quizAnswers[qi] === key
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-dark-500 text-gray-400 hover:border-dark-300'
                        }`}>
                        <span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                          quizAnswers[qi] === key ? 'bg-primary text-dark-900' : 'bg-dark-600 text-gray-500'
                        }`}>{key}</span>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length < quiz.length}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-primary text-dark-900 disabled:opacity-40">
                Submit ({Object.keys(quizAnswers).length}/{quiz.length} answered)
              </button>
            </div>
          ) : (
            <div>
              <div className={`p-4 rounded-xl text-center mb-3 ${
                quizScore >= 50 ? 'bg-success/10 border border-success/30' : 'bg-danger/10 border border-danger/30'
              }`}>
                <div className="text-3xl mb-1">{quizScore >= 50 ? '🎉' : '😅'}</div>
                <div className={`text-xl font-bold font-heading ${quizScore >= 50 ? 'text-success' : 'text-danger'}`}>
                  {quizScore}%
                </div>
                <p className={`text-xs ${quizScore >= 50 ? 'text-success' : 'text-danger'}`}>
                  {quizScore >= 50 ? 'Passed! Moving to coding.' : 'Need 50%. Try again!'}
                </p>
              </div>
              <div className="space-y-2 mb-3">
                {quiz.map((q, qi) => {
                  const correct = quizAnswers[qi] === (q.answer || q.correct);
                  return (
                    <div key={qi} className={`p-2.5 rounded-lg border ${
                      correct ? 'border-success/20 bg-success/5' : 'border-danger/20 bg-danger/5'
                    }`}>
                      <div className="flex items-start gap-1.5">
                        <span className={`text-xs font-bold ${correct ? 'text-success' : 'text-danger'}`}>
                          {correct ? '✓' : '✕'}
                        </span>
                        <div>
                          <p className="text-xs text-white">{q.question}</p>
                          {!correct && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Correct: <span className="text-success">{q.answer || q.correct}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-0.5">💡 {q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {quizScore < 50 && (
                <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(0); }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,179,71,0.15)', color: '#FFB347', border: '1px solid rgba(255,179,71,0.3)' }}>
                  <RotateCcw size={12} /> Retry Quiz
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* CODING STEP */}
      {step === 'coding' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-dark-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Code size={14} className="text-secondary" />
            <span className="text-xs font-bold text-white">Step 3: Coding Challenge</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">+10 pts</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Complete this to unlock the next day</p>

          <div className="p-3 rounded-xl mb-3"
            style={{ background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)' }}>
            <p className="text-xs font-bold text-white mb-1">{coding.title}</p>
            <p className="text-xs text-gray-300 leading-relaxed mb-1">{coding.description}</p>
            {coding.hint && (
              <p className="text-xs text-gray-500">💡 {coding.hint}</p>
            )}
          </div>

          {/* Code editor */}
          <div>
            <div className="flex items-center justify-between px-3 py-2 rounded-t-xl"
              style={{ background: '#0A0A0F', border: '1px solid rgba(42,42,63,0.8)', borderBottom: 'none' }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-gray-500 font-mono">javascript</span>
            </div>
            <textarea
              value={codeAnswer}
              onChange={e => setCodeAnswer(e.target.value)}
              className="w-full h-48 px-4 py-3 text-xs font-mono text-gray-200 focus:outline-none resize-none rounded-b-xl"
              style={{ background: '#0A0A0F', border: '1px solid rgba(42,42,63,0.8)', tabSize: 2 }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const s = e.target.selectionStart;
                  const nv = codeAnswer.substring(0, s) + '  ' + codeAnswer.substring(e.target.selectionEnd);
                  setCodeAnswer(nv);
                  setTimeout(() => e.target.setSelectionRange(s + 2, s + 2), 0);
                }
              }}
              spellCheck={false}
            />
          </div>

          <p className="text-xs text-gray-600 my-2 flex items-center gap-1">
            <AlertCircle size={10} /> Write real solution (min 50 chars) · Tab = indent
          </p>

          <button onClick={submitCoding} disabled={codeSubmitted}
            className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #00FF94)', color: '#0A0A0F' }}>
            {codeSubmitted ? 'Submitted!' : <><Zap size={12} /> Submit — Unlock Next Day</>}
          </button>
        </motion.div>
      )}

      {/* COMPLETE */}
      {step === 'complete' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-800 border border-success/30 rounded-2xl p-6 text-center"
          style={{ background: 'rgba(0,214,143,0.05)' }}>
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-bold font-heading text-success mb-1">Day Complete!</h3>
          <p className="text-xs text-gray-400 mb-3">
            Video ✓ Quiz ✓ Coding ✓
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20">
            <Zap size={12} className="text-success" />
            <span className="text-success text-xs font-bold">+17 points earned!</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">Next day unlocked!</p>
        </motion.div>
      )}
    </div>
  );
};

export default LearningDay;
