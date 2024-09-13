import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1>管理者ダッシュボード</h1>
      <ul>
        <li><Link to="/admin/materials">材料管理</Link></li>
        <li><Link to="/admin/products">商品管理</Link></li>
        <li><Link to="/admin/orders">注文確認</Link></li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
