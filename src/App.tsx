import React from 'react';
import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Layout from './components/Layout';

import MainMenu from './pages/MainMenu';
import Login from "./pages/Login";
import OrderHistory from "./pages/OrderHistory";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Products from './pages/admin/Products';
import Materials from './pages/admin/Materials';
import Orders from './pages/admin/Orders';

/** 認証が必 要なコンポーネントをラップする */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Login />;
    }
    return <>{children}</>;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAdmin } = useAuth();
    if (!user || !isAdmin) {
        return <p>管理者権限が必要です。</p>;
    }
    return <>{children}</>;
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<RequireAuth><MainMenu /></RequireAuth>} />
                        {/* <Route path="/" element={<MainMenu />} /> */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/order_history" element={<OrderHistory />} />  {/* 注文履歴のルートを追加 */}
                        <Route path="/payment" element={<Payment />} />  {/* 支払いページのルート */}
                        {/* 管理者専用ルート */}
                        <Route path="/admin/*" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                        <Route path="/admin/products" element={<Products />} />
                        <Route path="/admin/materials" element={<Materials />} />
                        <Route path="/admin/orders" element={<Orders />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
};


export default App;