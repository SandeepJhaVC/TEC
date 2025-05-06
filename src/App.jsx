import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Header from './components/header/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <div>
          <h1>Intro to TEC placeholder</h1>
          <p>Basic ELement Placeholder</p>
          <a>CTA BUTTON</a>
        </div>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;