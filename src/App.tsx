import React from 'react';
import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";

import LoginPage from "./pages/Login";
import MainMenuPage from "./pages/MainMenu";
import OrderHistoryPage from "./pages/OrderHistory";



const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<RequireAuth><MainMenuPage /></RequireAuth>} /> */}
          <Route path="/" element={<MainMenuPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/order_history" element={<OrderHistoryPage />} />  {/* 注文履歴のルートを追加 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// 認証が必要なコンポーネントをラップする
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
};

export default App;