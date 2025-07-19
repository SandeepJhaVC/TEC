import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Header from './components/header/Header';
import Footer from './components/Footer';
import MemberPortal from './components/MemberPortal';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/member" element={<MemberPortal />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;