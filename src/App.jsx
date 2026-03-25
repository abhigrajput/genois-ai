import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/layout/ProtectedRoute';
import useStore from './store/useStore';

const RoleRedirect = () => {
  const { user, profile, loading } = useStore();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (profile?.role === 'company') return <Navigate to="/company/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

// Public pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const PublicProfile = lazy(() => import('./pages/Public/PublicProfile'));
const CompanyView = lazy(() => import('./pages/CompanyView'));
const Leaderboard = lazy(() => import('./pages/Public/Leaderboard'));
const Demo = lazy(() => import('./pages/Demo'));
const Pricing = lazy(() => import('./pages/Pricing'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/Student/Dashboard'));
const Assessment = lazy(() => import('./pages/Student/Assessment'));
const Roadmap = lazy(() => import('./pages/Student/Roadmap'));
const Tasks = lazy(() => import('./pages/Student/Tasks'));
const Tests = lazy(() => import('./pages/Student/Tests'));
const SkillGraph = lazy(() => import('./pages/Student/SkillGraph'));
const Profile = lazy(() => import('./pages/Student/Profile'));
const Resume = lazy(() => import('./pages/Student/Resume'));
const Analytics = lazy(() => import('./pages/Student/Analytics'));
const AnxietyChat = lazy(() => import('./pages/Student/AnxietyChat'));
const SkillDNA = lazy(() => import('./pages/Student/SkillDNA'));
const ScoreHistory = lazy(() => import('./pages/Student/ScoreHistory'));
const Notes = lazy(() => import('./pages/Student/Notes'));
const DomainExplorer = lazy(() => import('./pages/DomainExplorer'));

// Company pages
const CompanyDashboard = lazy(() => import('./pages/Company/Dashboard'));
const CompanySearch = lazy(() => import('./pages/Company/Search'));
const CompanyShortlist = lazy(() => import('./pages/Company/Shortlist'));
const CompanyAnalytics = lazy(() => import('./pages/Company/Analytics'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminStudents = lazy(() => import('./pages/Admin/Students'));
const AdminAnalytics = lazy(() => import('./pages/Admin/Analytics'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#0A0A0F'
  }}>
    <div style={{
      width: '40px', height: '40px',
      border: '3px solid #222233',
      borderTop: '3px solid #00FF94',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  useAuth();

  return (
    <BrowserRouter>
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% 0%,
              rgba(0,255,148,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%,
              rgba(123,97,255,0.04) 0%, transparent 60%)
          `,
        }}
      />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(8,8,14,0.95)',
            color: '#E2E2F0',
            border: '1px solid rgba(0,255,148,0.2)',
            boxShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 10px rgba(0,255,148,0.08)',
          },
          success: { iconTheme: { primary: '#00FF94', secondary: '#0A0A0F' } },
          error: { iconTheme: { primary: '#FF6B6B', secondary: '#0A0A0F' } },
        }}
      />
      <Suspense fallback={<LoadingFallback />}><div style={{ position:'relative', zIndex:1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/u/:username" element={<PublicProfile />} />
          <Route path="/company-view/:id" element={<CompanyView />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Student */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/assessment" element={
            <ProtectedRoute role="student"><Assessment /></ProtectedRoute>
          } />
          <Route path="/student/roadmap" element={
            <ProtectedRoute role="student"><Roadmap /></ProtectedRoute>
          } />
          <Route path="/student/tasks" element={
            <ProtectedRoute role="student"><Tasks /></ProtectedRoute>
          } />
          <Route path="/student/tests" element={
            <ProtectedRoute role="student"><Tests /></ProtectedRoute>
          } />
          <Route path="/student/skills" element={
            <ProtectedRoute role="student"><SkillGraph /></ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute role="student"><Profile /></ProtectedRoute>
          } />
          <Route path="/student/resume" element={
            <ProtectedRoute role="student"><Resume /></ProtectedRoute>
          } />
          <Route path="/student/analytics" element={
            <ProtectedRoute role="student"><Analytics /></ProtectedRoute>
          } />
          <Route path="/student/skill-dna" element={
            <ProtectedRoute role="student"><SkillDNA /></ProtectedRoute>
          } />
          <Route path="/student/score" element={
            <ProtectedRoute role="student"><ScoreHistory /></ProtectedRoute>
          } />
          <Route path="/student/notes" element={
            <ProtectedRoute role="student"><Notes /></ProtectedRoute>
          } />
          <Route path="/student/chat" element={
            <ProtectedRoute role="student"><AnxietyChat /></ProtectedRoute>
          } />
          <Route path="/student/domains" element={
            <ProtectedRoute role="student"><DomainExplorer /></ProtectedRoute>
          } />
          <Route path="/domains" element={<DomainExplorer />} />

          {/* Company */}
          <Route path="/company/dashboard" element={
            <ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>
          } />
          <Route path="/company/search" element={
            <ProtectedRoute role="company"><CompanySearch /></ProtectedRoute>
          } />
          <Route path="/company/shortlist" element={
            <ProtectedRoute role="company"><CompanyShortlist /></ProtectedRoute>
          } />
          <Route path="/company/analytics" element={
            <ProtectedRoute role="company"><CompanyAnalytics /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div></Suspense>
    </BrowserRouter>
  );
}

export default App;
