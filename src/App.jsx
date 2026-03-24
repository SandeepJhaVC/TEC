import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/header/Header';
import Footer from './components/Footer';
import MemberPortal from './components/MemberPortal';
import AdminPanel from './components/AdminPanel';
import EventsPage from './components/Events';
import Discounts from './components/Discounts';
import Map from './components/Map';
import Assignments from './components/Assignments';
import Listings from './components/Listings';
import About from './components/About';
import Poll from './components/Poll';
import Builds from './components/Builds';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/map" element={<Map />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/about" element={<About />} />
            <Route path="/poll" element={<Poll />} />
            <Route path="/member" element={<MemberPortal />} />
            <Route path="/admin" element={<ProtectedRoute minRole="admin"><AdminPanel /></ProtectedRoute>} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/builds" element={<Builds />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;