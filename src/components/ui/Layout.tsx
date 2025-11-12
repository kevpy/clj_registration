import React from 'react';

interface LayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};

export default Layout;