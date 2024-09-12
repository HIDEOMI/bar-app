import React, { useState, useEffect } from 'react';
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ReactDOM from 'react-dom';

// ページについて
import './App.css';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import InventoryManagementPage from './pages/InventoryManagementPage';


import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import logo from './logo.svg';
import { Link } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // toastify のスタイルシート


const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebaseの認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Router>
      <h1>Welcome, {user.displayName}</h1>
      <button onClick={handleLogout}>Logout</button>
      <nav>
        <div>
          <a href="/menu">Menu</a>
        </div>
        <div>
          <a href="/add_product">Add Product</a>
        </div>
        <div>
          <a href="/inventory">Inventory Management</a>
        </div>
      </nav>
      <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/add_product" element={<AddProductPage />} />
        <Route path="/inventory" element={<InventoryManagementPage />} />
        <Route path="/edit_product/:id" element={<EditProductPage />} />
      </Routes>
    </Router>
  );
};

export default App;
