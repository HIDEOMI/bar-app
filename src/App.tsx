import React from 'react';
import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";

import Login from "./pages/Login";
import MainMenu from "./pages/MainMenu";
import OrderHistory from "./pages/OrderHistory";
import Payment from "./pages/Payment";



const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<RequireAuth><MainMenuPage /></RequireAuth>} /> */}
          <Route path="/" element={<MainMenu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order_history" element={<OrderHistory />} />  {/* 注文履歴のルートを追加 */}
          <Route path="/payment" element={<Payment />} />  {/* 支払いページのルート */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// 認証が必要なコンポーネントをラップする
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
};

export default App;