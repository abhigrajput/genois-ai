import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminAnalytics = () => (
  <DashboardLayout>
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-white mb-2">Analytics 📊</h1>
      <p className="text-gray-500 text-sm mb-4">Platform analytics</p>
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-gray-400 text-sm">
          Full analytics coming soon. Check Admin Dashboard for current stats.
        </p>
      </div>
    </div>
  </DashboardLayout>
);

export default AdminAnalytics;
