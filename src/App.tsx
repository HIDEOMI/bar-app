import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import Dashboard from './Dashboard';

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
    <div className="App">
      {user ? <h1>Welcome, {user.displayName}</h1> : <Login />}
    </div>
    // <Router>
    //   <Routes>
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/dashboard" element={<Dashboard />} />
    //     <Route path="/" element={<Navigate to="/login" />} />
    //   </Routes>
    // </Router>
  );
};

export default App;