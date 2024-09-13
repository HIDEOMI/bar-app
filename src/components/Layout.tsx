import React from 'react';
import Navbar from './Navbar';

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
