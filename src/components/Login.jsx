import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin'); // Redirect to the admin panel
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#f5f5f5', borderRadius: 12 }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        </div>
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: '#1de9b6', border: 'none', color: '#222', fontWeight: 'bold' }}>Login</button>
      </form>
    </div>
  );
};

export default Login;