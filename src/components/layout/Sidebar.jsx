import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, CheckSquare, FileText,
  Zap, User, FileEdit, BarChart2, Brain,
  MessageCircle, Search, Star, TrendingUp,
  Users, Shield, X, Menu, Building, BookOpen
} from 'lucide-react';
import useStore from '../../store/useStore';

const studentNav = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/student/dashboard' },
  { icon: Map,             label: 'Roadmap',    path: '/student/roadmap'   },
  { icon: CheckSquare,     label: 'Tasks',      path: '/student/tasks'     },
  { icon: FileText,        label: 'Tests',      path: '/student/tests'     },
  { icon: Zap,             label: 'Skills',     path: '/student/skills'    },
  { icon: User,            label: 'Profile',    path: '/student/profile'   },
  { icon: FileEdit,        label: 'Resume',     path: '/student/resume'    },
  { icon: BarChart2,       label: 'Analytics',  path: '/student/analytics' },
  { icon: Brain,           label: 'Skill DNA',   path: '/student/skill-dna' },
  { icon: TrendingUp,      label: 'Score Intel', path: '/student/score'     },
  { icon: BookOpen,        label: 'Notes',       path: '/student/notes'     },
  { icon: MessageCircle,   label: '2AM Chat',    path: '/student/chat'      },
];

const companyNav = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/company/dashboard' },
  { icon: Search,          label: 'Find Talent', path: '/company/search'    },
  { icon: Star,            label: 'Shortlist',   path: '/company/shortlist' },
  { icon: BarChart2,       label: 'Analytics',   path: '/company/analytics' },
];

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin/dashboard' },
  { icon: Users,           label: 'Students',   path: '/admin/students'  },
  { icon: BarChart2,       label: 'Analytics',  path: '/admin/analytics' },
  { icon: Building,        label: 'Companies',  path: '/admin/companies' },
];

const Sidebar = () => {
  const { profile } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems =
    profile?.role === 'company' ? companyNav :
    profile?.role === 'admin'   ? adminNav :
    studentNav;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink key={path} to={path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
              text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
              }
            `}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
                )}
                <Icon size={15} />
                <span>{label}</span>
                {label === '2AM Chat' && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono">
                    AI
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {profile && (
        <div className="p-3 m-2 rounded-xl bg-dark-700 border border-dark-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-white">
              {profile.full_name?.charAt(0)?.toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{profile.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.college || profile.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-52 bg-dark-800 border-r border-dark-600 fixed top-14 left-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      <button onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-5 left-5 z-40 bg-primary text-dark-900 p-3 rounded-xl shadow-lg shadow-primary/25">
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -256 }} animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-dark-800 border-r border-dark-600 z-50">
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <span className="text-primary font-bold font-heading">GENOIS AI</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
