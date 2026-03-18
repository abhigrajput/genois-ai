import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const CompanyShortlist = () => (
  <DashboardLayout>
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-white mb-2">Shortlist ⭐</h1>
      <p className="text-gray-500 text-sm mb-6">Your saved candidates</p>
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3">⭐</div>
        <h2 className="font-bold text-white font-heading mb-2">No candidates shortlisted yet</h2>
        <p className="text-gray-500 text-sm mb-4">
          Go to Search and shortlist candidates you want to interview
        </p>
        <a href="/company/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-opacity-90 transition-all">
          Search Talent →
        </a>
      </div>
    </div>
  </DashboardLayout>
);

export default CompanyShortlist;
