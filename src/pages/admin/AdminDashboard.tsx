import { Routes, Route, Link } from 'react-router-dom';
import Materials from './Materials';
import Products from './Products';
import Orders from './Orders';
import Users from './Users';

const AdminDashboard: React.FC = () => {
    return (
        <>
            <h1>管理者ダッシュボード</h1>
            <Routes>
                <Route path="/" element={
                    <ul>
                        <li><Link to="materials">材料管理</Link></li>
                        <li><Link to="products">商品管理</Link></li>
                        <li><Link to="orders">注文確認</Link></li>
                        <li><Link to="users">ユーザ管理</Link></li>
                    </ul>
                } />
                <Route path="materials" element={<Materials />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="users" element={<Users />} />
            </Routes>
        </>
    );
};

export default AdminDashboard;
