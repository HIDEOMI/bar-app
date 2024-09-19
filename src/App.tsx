import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// import logo from './logo.svg';
// import './App.css';

import { AuthProvider, useAuth } from "./components/AuthProvider";
import Layout from './components/Layout';
import Login from "./pages/Login";
import MainMenu from './pages/MainMenu';
import OrderHistory from "./pages/OrderHistory";
import Payment from "./pages/Payment";
import AdminDashboard from './pages/admin/AdminDashboard';


/** 認証が必要なコンポーネントをラップする */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Login />;
    }
    return <>{children}</>;
};

/** Admin権限が必要なコンポーネントをラップする */
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAdmin } = useAuth();
    if (!user || !isAdmin) {
        return <p>管理者権限が必要です。ページを戻ってください</p>;
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
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
};

export default App;
