import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useStore from '../../store/useStore';

const DashboardLayout = ({ children }) => {
  const { profile } = useStore();

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className="md:ml-52 pt-14 pb-20 md:pb-0 min-h-screen">
        <div className="p-3 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
