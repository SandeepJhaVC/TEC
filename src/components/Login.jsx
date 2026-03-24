import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ROLE_META = {
    admin: { label: 'Admin', color: '#f85149', bg: 'rgba(248,81,73,0.12)', border: 'rgba(248,81,73,0.3)' },
    moderator: { label: 'Moderator', color: '#e3b341', bg: 'rgba(227,179,65,0.12)', border: 'rgba(227,179,65,0.3)' },
    builder: { label: 'Builder', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
    student: { label: 'Student', color: '#3fb950', bg: 'rgba(63,185,80,0.12)', border: 'rgba(63,185,80,0.3)' },
};

const TABS = [
    { id: 'login', label: 'Sign In' },
    { id: 'register', label: 'Register' },
];

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function Input({ label, type = 'text', value, onChange, placeholder, required }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: '0.05em', marginBottom: 6 }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="gh-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
            />
        </div>
    );
}

export default function Login() {
    const { login, register, authError, DEMO_USERS } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const [tab, setTab] = useState('login');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');
    const [showDemo, setShowDemo] = useState(false);

    // Sign in state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [regRole, setRegRole] = useState('student');
    const [regSuccess, setRegSuccess] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSubmitting(true);
        const { ok, error } = await login(email, password);
        setSubmitting(false);
        if (!ok) {
            setLocalError(error || 'Invalid credentials.');
            return;
        }
        navigate(from, { replace: true });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (regPassword !== regConfirm) {
            setLocalError('Passwords do not match.');
            return;
        }
        if (regPassword.length < 8) {
            setLocalError('Password must be at least 8 characters.');
            return;
        }
        setSubmitting(true);
        const { ok, error } = await register(regEmail, regPassword, regName, regRole);
        setSubmitting(false);
        if (!ok) {
            setLocalError(error || 'Registration failed. Try again.');
            return;
        }
        setRegSuccess(true);
    };

    const fillDemo = (u) => {
        setEmail(u.email);
        setPassword(u.password);
        setTab('login');
        setShowDemo(false);
    };

    const err = localError || authError;

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <style>{`
        .tab-btn { transition: all 0.15s; cursor: pointer; }
        .role-chip { transition: all 0.15s; cursor: pointer; }
        .role-chip:hover { opacity: 0.85; }
      `}</style>

            <motion.div initial="hidden" animate="show" variants={fade} transition={{ duration: 0.35 }}
                style={{ width: '100%', maxWidth: 420 }}>

                {/* Logo + title */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <img src="/download.jpeg" alt="TEC" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#e6edf3', fontFamily: '"Mona Sans", var(--font)', letterSpacing: '-0.02em' }}>TEC</span>
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', marginBottom: 6, letterSpacing: '-0.02em' }}>
                        {tab === 'login' ? 'Sign in to your account' : 'Join The Echo Community'}
                    </h1>
                    <p style={{ fontSize: 13, color: '#8b949e' }}>
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setLocalError(''); }}
                            style={{ background: 'none', border: 'none', color: '#58a6ff', fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                            {tab === 'login' ? 'Register' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Card */}
                <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

                    {/* Tab strip */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #30363d' }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => { setTab(t.id); setLocalError(''); }} className="tab-btn"
                                style={{
                                    flex: 1, padding: '13px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', border: 'none',
                                    background: tab === t.id ? '#161b22' : '#0d1117',
                                    color: tab === t.id ? '#e6edf3' : '#8b949e',
                                    borderBottom: tab === t.id ? '2px solid #f09433' : '2px solid transparent',
                                }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '24px 24px 20px' }}>
                        <AnimatePresence mode="wait">

                            {/* ── SIGN IN ── */}
                            {tab === 'login' && (
                                <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.18 }} onSubmit={handleLogin}>
                                    <Input label="EMAIL" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                                    <Input label="PASSWORD" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />

                                    {err && (
                                        <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#f85149', marginBottom: 16 }}>
                                            {err}
                                        </div>
                                    )}

                                    <button type="submit" disabled={submitting}
                                        style={{ width: '100%', padding: '10px', borderRadius: 6, background: '#238636', border: '1px solid rgba(240,246,252,0.1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
                                        {submitting ? 'Signing in…' : 'Sign in'}
                                    </button>
                                </motion.form>
                            )}

                            {/* ── REGISTER ── */}
                            {tab === 'register' && !regSuccess && (
                                <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.18 }} onSubmit={handleRegister}>
                                    <Input label="FULL NAME" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Your name" required />
                                    <Input label="EMAIL" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" required />
                                    <Input label="PASSWORD" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 8 characters" required />
                                    <Input label="CONFIRM PASSWORD" type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repeat password" required />

                                    {/* Role picker */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: '0.05em', marginBottom: 8 }}>I AM A</label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {(['student', 'builder']).map(r => {
                                                const m = ROLE_META[r];
                                                return (
                                                    <button key={r} type="button" className="role-chip" onClick={() => setRegRole(r)} style={{
                                                        flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${regRole === r ? m.border : '#30363d'}`,
                                                        background: regRole === r ? m.bg : 'transparent',
                                                        color: regRole === r ? m.color : '#8b949e',
                                                    }}>
                                                        {m.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p style={{ fontSize: 11, color: '#484f58', marginTop: 6 }}>
                                            {regRole === 'builder' ? 'Builder role gives you a verified badge on your project listings.' : 'Student role gives access to all community features.'}
                                        </p>
                                    </div>

                                    {err && (
                                        <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#f85149', marginBottom: 16 }}>
                                            {err}
                                        </div>
                                    )}

                                    <button type="submit" disabled={submitting}
                                        style={{ width: '100%', padding: '10px', borderRadius: 6, background: '#238636', border: '1px solid rgba(240,246,252,0.1)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
                                        {submitting ? 'Creating account…' : 'Create account'}
                                    </button>
                                </motion.form>
                            )}

                            {/* ── REGISTER SUCCESS ── */}
                            {tab === 'register' && regSuccess && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                                    style={{ textAlign: 'center', padding: '16px 0' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(63,185,80,0.12)', border: '2px solid #3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22, color: '#3fb950', fontWeight: 900 }}>✓</div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>Check your email</h3>
                                    <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.6 }}>
                                        We sent a confirmation link to <strong style={{ color: '#e6edf3' }}>{regEmail}</strong>. Click it to activate your account.
                                    </p>
                                    <button onClick={() => setTab('login')} style={{ marginTop: 20, background: 'none', border: '1px solid #30363d', borderRadius: 6, color: '#58a6ff', fontSize: 13, fontWeight: 600, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Back to Sign In
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Demo credentials panel */}
                <div style={{ marginTop: 20 }}>
                    <button onClick={() => setShowDemo(v => !v)} style={{ width: '100%', background: 'transparent', border: '1px solid #21262d', borderRadius: 6, color: '#8b949e', fontSize: 12, fontWeight: 600, padding: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {showDemo ? 'Hide demo credentials' : 'Show demo credentials'}
                    </button>

                    <AnimatePresence>
                        {showDemo && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden' }}>
                                <div style={{ marginTop: 10, background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
                                    <div style={{ padding: '10px 14px', borderBottom: '1px solid #30363d', fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: '0.05em' }}>DEMO ACCOUNTS — click to fill</div>
                                    {DEMO_USERS.map(u => {
                                        const m = ROLE_META[u.role];
                                        return (
                                            <button key={u.id} onClick={() => fillDemo(u)}
                                                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid #21262d', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.bg, border: `1px solid ${m.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: m.color }}>
                                                    {u.name[0]}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{u.name}</span>
                                                        <span style={{ fontSize: 10, fontWeight: 800, color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 4, padding: '1px 7px', letterSpacing: '0.06em' }}>{u.role.toUpperCase()}</span>
                                                    </div>
                                                    <span style={{ fontSize: 11, color: '#484f58', fontFamily: 'var(--font-mono)' }}>{u.email}</span>
                                                </div>
                                                <span style={{ fontSize: 11, color: '#484f58', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{u.password}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#484f58', marginTop: 20 }}>
                    <Link to="/" style={{ color: '#484f58', textDecoration: 'none' }}>Back to TEC home</Link>
                </p>
            </motion.div>
        </div>
    );
}
