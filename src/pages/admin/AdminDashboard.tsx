
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminProfile } from '@/components/admin/AdminProfile';
import { AdminBilling } from '@/components/admin/AdminBilling';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminSettings } from '@/components/admin/AdminSettings';

export const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/billing" element={<AdminBilling />} />
        <Route path="/users" element={<AdminUsersTab />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};
