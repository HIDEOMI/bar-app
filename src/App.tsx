import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuth } from './hooks/useAuth';
import { AuthProvider}from "./components/AuthProvider";
import Layout from './components/Layout';
import Login from "./pages/Login";
import MainMenu from './pages/MainMenu';
import MyOrders from "./pages/MyOrders";
import Payment from "./pages/Payment";
import AdminDashboard from './pages/admin/AdminDashboard';


/** 認証が必要なコンポーネントをラップする */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isFriend } = useAuth();
    if (!user) {
        return <Login />;
    } else if (!isFriend) {
        return <p>認可が必要です！承認されるまでもうしばらくお待ちくださいmm</p>;
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
                <RequireAuth>
                    <Layout>
                        <Routes>
                            <Route path="/*" element={<MainMenu />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/myOrders" element={<MyOrders />} />
                            <Route path="/payment" element={<Payment />} />
                            {/* 管理者専用ルート */}
                            <Route path="/admin/*" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                        </Routes>
                    </Layout>
                </RequireAuth>
            </Router>
        </AuthProvider>
    );
};

export default App;
