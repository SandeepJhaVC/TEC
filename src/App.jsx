import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Header from './components/header/Header';
import Footer from './components/Footer';
import MemberPortal from './components/MemberPortal';
import AdminPanel from './components/AdminPanel';
import EventsPage from './components/Events';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/member" element={<MemberPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/events" element={<EventsPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;