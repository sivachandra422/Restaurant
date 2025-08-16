'use client';

import React, { useState } from 'react';
import ModernAdminLayout from '@/components/admin/ModernAdminLayout';
import ModernDashboard from '@/components/admin/ModernDashboard';
import ModernOrderManager from '@/components/admin/ModernOrderManager';
import ModernMenuManager from '@/components/admin/ModernMenuManager';
import ModernAnalytics from '@/components/admin/ModernAnalytics';
import ModernCustomerFeedback from '@/components/admin/ModernCustomerFeedback';
import ModernSettings from '@/components/admin/ModernSettings';

export default function ModernAdminPage() {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <ModernDashboard onSectionChange={setCurrentSection} />;
      case 'orders':
        return <ModernOrderManager />;
      case 'menu':
        return <ModernMenuManager />;
      case 'analytics':
        return <ModernAnalytics />;
      case 'feedback':
        return <ModernCustomerFeedback />;
      case 'settings':
        return <ModernSettings />;
      default:
        return <ModernDashboard onSectionChange={setCurrentSection} />;
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
