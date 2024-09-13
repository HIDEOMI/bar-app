import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';

import Materials from './Materials';
import Products from './Products';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1>管理者ダッシュボード</h1>
      <Routes>
        <Route path="/" element={
          <ul>
            <li><Link to="materials">材料管理</Link></li>
            <li><Link to="products">商品管理</Link></li>
            <li><Link to="orders">注文確認</Link></li>
          </ul>
        } />
        <Route path="materials" element={<Materials />} />
        {/* 他の管理者ページのルートも追加 */}
      </Routes>
    </div>
  );
};

export default AdminDashboard;
