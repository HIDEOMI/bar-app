import React from 'react';
import Navbar from './Navbar';

// children を明示的に型定義
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
