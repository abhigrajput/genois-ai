import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminStudents = () => (
  <DashboardLayout>
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-white mb-2">Students 👥</h1>
      <p className="text-gray-500 text-sm mb-6">All registered students</p>
      <Link to="/admin/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-dark-900 font-bold rounded-xl text-sm">
        ← Back to Dashboard
      </Link>
    </div>
  </DashboardLayout>
);

export default AdminStudents;
