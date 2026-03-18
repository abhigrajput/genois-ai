import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, LogOut, User, Zap } from 'lucide-react';
import useStore from '../../store/useStore';
import useAuth from '../../hooks/useAuth';

const getScoreColor = (score) => {
  if (score >= 801) return '#FFD700';
  if (score >= 601) return '#7B61FF';
  if (score >= 401) return '#00FF94';
  if (score >= 201) return '#4A9EFF';
  return '#666';
};

const getTierLabel = (score) => {
  if (score >= 801) return 'Elite';
  if (score >= 601) return 'Advanced';
  if (score >= 401) return 'Proficient';
  if (score >= 201) return 'Developing';
  return 'Beginner';
};

const Navbar = () => {
  const { profile, notifications } = useStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-14 bg-dark-800 border-b border-dark-600 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40"
      style={{ backdropFilter: 'blur(12px)' }}>

      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-xl font-bold font-heading transition-all duration-300"
          style={{
            color: '#00FF94',
            textShadow: '0 0 20px rgba(0,255,148,0.4)',
          }}>
          GENOIS AI
        </span>
      </Link>

      <div className="flex items-center gap-2">

        {profile?.timeline && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-700 border border-dark-500">
            <span className="text-xs">
              {profile.timeline === '3months' ? '🔥' : profile.timeline === '6months' ? '⚡' : '🌱'}
            </span>
            <span className="text-xs text-gray-400">
              {profile.timeline === '3months' ? 'Intensive' : profile.timeline === '6months' ? 'Standard' : 'Deep'}
            </span>
          </div>
        )}

        {profile && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500">
            <Zap size={11} style={{ color: getScoreColor(profile.skill_score || 0) }} />
            <span className="text-xs font-bold font-heading"
              style={{ color: getScoreColor(profile.skill_score || 0) }}>
              {Math.round(profile.skill_score || 0)}
            </span>
            <span className="text-xs text-gray-500">
              {getTierLabel(profile.skill_score || 0)}
            </span>
          </div>
        )}

        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </button>

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-dark-700 transition-all">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'G'}
            </div>
            <span className="hidden md:block text-sm text-gray-300 max-w-20 truncate">
              {profile?.full_name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={12} className="text-gray-500" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-dark-700 border border-dark-500 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-600">
                  <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{profile?.email}</p>
                </div>
                <div className="p-1.5">
                  <button onClick={() => { navigate('/student/profile'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-white rounded-lg transition-all">
                    <User size={13} /> Profile
                  </button>
                  <button onClick={async () => { await logout(); navigate('/'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-dark-600 rounded-lg transition-all">
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
