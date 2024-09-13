import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav>
            <ul style={{ display: 'flex', listStyle: 'none', padding: 0 }}>
                <li style={{ marginRight: '20px' }}>
                    <Link to="/">メインメニュー</Link>
                </li>
                <li style={{ marginRight: '20px' }}>
                    <Link to="/admin/orders">注文確認</Link>
                </li>
                <li>
                    <Link to="/admin">管理者ダッシュボード</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
