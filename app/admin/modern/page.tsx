'use client';

import React, { useState } from 'react';
import ModernAdminLayout from '@/components/admin/ModernAdminLayout';
import ModernDashboard from '@/components/admin/ModernDashboard';
import ModernOrderManager from '@/components/admin/ModernOrderManager';

export default function ModernAdminPage() {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <ModernDashboard />;
      case 'orders':
        return <ModernOrderManager />;
      case 'menu':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Menu Management</h2>
            <p className="text-slate-600">Modern menu management coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics</h2>
            <p className="text-slate-600">Modern analytics dashboard coming soon...</p>
          </div>
        );
      case 'feedback':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Customer Feedback</h2>
            <p className="text-slate-600">Modern feedback system coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Settings</h2>
            <p className="text-slate-600">Modern settings panel coming soon...</p>
          </div>
        );
      default:
        return <ModernDashboard />;
    }
  };

  return (
    <ModernAdminLayout 
      currentSection={currentSection} 
      onSectionChange={setCurrentSection}
    >
      {renderSection()}
    </ModernAdminLayout>
  );
}
