import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './App.css';

import MenuPage from './pages/MenuPage';
import AddProductPage from './pages/AddProductPage';
import InventoryManagementPage from './pages/InventoryManagementPage';

// import logo from './logo.svg';
import Login from './pages/LoginPage';
// import Dashboard from './Dashboard';
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // toastify のスタイルシート


const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <nav>
        <a href="/menu">Menu</a>
        <a href="/add-product">Add Product</a>
        <a href="/inventory">Inventory Management</a>
      </nav>
      <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/inventory" element={<InventoryManagementPage />} />
      </Routes>
    </Router>
  );
};

export default App;