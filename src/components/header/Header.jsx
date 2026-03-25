import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLORS = {
    admin: '#FF6E84', moderator: '#FF95A0', builder: '#CC97FF', student: '#53DDFC',
};

const NAV = [
    { icon: 'storefront', label: 'Bazaar', to: '/assignments' },
    { icon: 'construction', label: 'Builds', to: '/builds' },
    { icon: 'explore', label: 'Explore', to: '/map' },
    { icon: 'campaign', label: 'Feed', to: '/' },
    { icon: 'sell', label: 'Deals', to: '/discounts' },
    { icon: 'location_city', label: 'Listings', to: '/listings' },
    { icon: 'how_to_vote', label: 'Pulse', to: '/poll' },
    { icon: 'event', label: 'Events', to: '/events' },
    { icon: 'info', label: 'About', to: '/about' },
    { icon: 'badge', label: 'Members', to: '/member' },
];

function generateMemberId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
}

export default function Header() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', sapId: '', personalEmail: '', collegeEmail: '', batch: '', year: '', course: '' });
    const [memberId, setMemberId] = useState('');
    const [success, setSuccess] = useState(false);

    const handleClose = () => {
        setShowModal(false);
        setForm({ name: '', sapId: '', personalEmail: '', collegeEmail: '', batch: '', year: '', course: '' });
        setMemberId(''); setSuccess(false);
    };

    /* ── Fake player stats (replace with real data when auth XP is wired) ── */
    const PLAYER_LEVEL = 7;
    const XP_PCT = 72;
    const CREDITS = 1240;
    const REP_STARS = 3;

    const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

    return (
        <>
            {/* ── Material Symbols icon font ── */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;user-select:none;}`}</style>

            {/* ── TOP NAV ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 64,
                background: 'rgba(14,14,14,0.85)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 0 20px rgba(204,151,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
            }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--primary)', letterSpacing: '-0.04em', fontStyle: 'italic' }}>TEC</span>
                </Link>

                {/* Desktop nav links — hidden on mobile */}
                <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {['/', '/map', '/assignments', '/builds'].map((to, i) => {
                        const labels = ['Feed', 'Explore', 'Bazaar', 'Builds'];
                        return (
                            <Link key={to} to={to} style={{
                                padding: '5px 12px', borderRadius: 8, fontFamily: 'var(--font-display)',
                                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                                color: isActive(to) ? 'var(--primary)' : 'var(--on-surface-var)',
                                background: isActive(to) ? 'rgba(204,151,255,0.08)' : 'transparent',
                                textDecoration: 'none', transition: 'all 0.14s',
                            }}>{labels[i]}</Link>
                        );
                    })}
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="topbar-role-text" style={{ fontSize: 10, fontWeight: 800, color: ROLE_COLORS[user.role] || 'var(--primary)', letterSpacing: '0.08em', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>{user.role}</span>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(204,151,255,0.12)', border: '1.5px solid rgba(204,151,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                                    {(user.avatarLetter || user.name?.[0] || 'U').toUpperCase()}
                                </div>
                                <span className="topbar-user-name" style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-body)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                            </div>
                            <button className="topbar-signout-btn" onClick={logout} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,110,132,0.25)', color: 'var(--error)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', transition: 'all 0.14s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,110,132,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className="topbar-signin-link" to="/login" style={{ padding: '6px 14px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-var)', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.14s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--on-surface)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-var)'}>
                                Sign in
                            </Link>
                            <button onClick={() => setShowModal(true)} className="btn-primary topbar-join-btn" style={{ padding: '7px 16px', fontSize: 11, letterSpacing: '0.08em' }}>
                                Join TEC
                            </button>
                        </>
                    )}
                    {/* Echo Credits — hidden on mobile */}
                    <div className="credits-display topbar-join-btn" style={{ cursor: 'default' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>toll</span>
                        {CREDITS.toLocaleString()} EC
                    </div>
                    {/* Rep stars — hidden on mobile */}
                    <div className="topbar-join-btn" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} className={`rep-star ${i <= REP_STARS ? 'filled' : 'empty'}`}>★</span>
                        ))}
                    </div>
                    {/* Hamburger */}
                    <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', flexDirection: 'column', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }} className="hamburger-btn">
                        {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 20, height: 2, background: 'var(--on-surface-var)', borderRadius: 2 }} />)}
                    </button>
                </div>
            </nav>

            {/* ── XP strip pinned under topnav ── */}
            <div className="topnav-xp-strip">
                <div style={{ height: '100%', width: `${XP_PCT}%`, background: 'linear-gradient(90deg, #9c48ea, #cc97ff)', opacity: 0.7, transition: 'width 1s ease' }} />
            </div>

            {/* ── SIDEBAR ── */}
            <aside style={{
                position: 'fixed', left: 0, top: 0, paddingTop: 72, paddingBottom: 24,
                display: 'flex', flexDirection: 'column', height: '100vh', width: 256,
                background: 'var(--bg)', borderRight: '1px solid rgba(255,255,255,0.04)', zIndex: 100,
                overflowY: 'auto',
            }} className="sidebar">

                {/* ── Player card ── */}
                <div className="player-card hud-bracket">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        {/* Avatar */}
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: 'linear-gradient(135deg, rgba(204,151,255,0.2), rgba(83,221,252,0.1))',
                            border: '1.5px solid rgba(204,151,255,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-display)',
                        }}>
                            {user ? (user.avatarLetter || user.name?.[0] || 'U').toUpperCase() : '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user ? user.name : 'GHOST'}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>LVL</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 1 }}>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} className={`rep-star ${i <= REP_STARS ? 'filled' : 'empty'}`} style={{ fontSize: 10 }}>★</span>
                                    ))}
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{PLAYER_LEVEL}</span>
                            </div>
                        </div>
                    </div>
                    {/* XP bar */}
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>XP</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{XP_PCT}/100</span>
                        </div>
                        <div className="stat-bar-track">
                            <div className="stat-bar-fill" style={{ width: `${XP_PCT}%`, background: 'linear-gradient(90deg, #9c48ea, #cc97ff)' }} />
                        </div>
                    </div>
                    {/* Credits */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Echo Credits</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: '#e3b341' }}>
                            <span style={{ fontSize: 9, marginRight: 2, opacity: 0.7 }}>$</span>{CREDITS.toLocaleString()}
                        </span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 8px' }}>
                    {NAV.map(({ icon, label, to }, idx) => {
                        const active = isActive(to);
                        return (
                            <Link key={to} to={to} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px',
                                borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                                fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                color: active ? 'var(--primary)' : 'var(--on-surface-var)',
                                background: active ? 'rgba(204,151,255,0.08)' : 'transparent',
                                borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
                                transition: 'all 0.14s',
                            }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-highest)'; e.currentTarget.style.color = 'var(--on-surface)'; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--on-surface-var)'; } }}>
                                {/* Mission number */}
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 8,
                                    color: active ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                                    width: 16, flexShrink: 0, textAlign: 'center',
                                }}>{String(idx + 1).padStart(2, '0')}</span>
                                <span className="material-symbols-outlined" style={{ fontSize: 17, flexShrink: 0, color: active ? 'var(--primary)' : 'inherit' }}>{icon}</span>
                                <span style={{ flex: 1 }}>{label}</span>
                                {active && (
                                    <span style={{
                                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                        background: 'var(--primary)',
                                        boxShadow: '0 0 6px var(--primary)',
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                    {user?.role === 'admin' && (
                        <Link to="/admin" style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px',
                            borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: isActive('/admin') ? 'var(--error)' : 'var(--on-surface-var)',
                            background: isActive('/admin') ? 'rgba(255,110,132,0.08)' : 'transparent',
                            borderRight: isActive('/admin') ? '2px solid var(--error)' : '2px solid transparent',
                            transition: 'all 0.14s',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>admin_panel_settings</span>
                            Admin
                        </Link>
                    )}
                </nav>

                {/* Bottom panel: status + join/profile */}
                <div style={{ padding: '0 12px', marginTop: 8 }}>
                    {/* Status strip */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: 6, marginBottom: 10,
                    }}>
                        {[
                            { label: 'HEALTH', pct: 88, color: '#4ade80' },
                            { label: 'ARMOR', pct: 55, color: '#53DDFC' },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>{s.label}</span>
                                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: s.color }}>{s.pct}%</span>
                                </div>
                                <div className="stat-bar-track">
                                    <div className="stat-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    {!user && (
                        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 11, letterSpacing: '0.1em' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>rocket_launch</span>
                            JOIN TEC
                        </button>
                    )}
                    {user && (
                        <button onClick={logout} style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid rgba(255,110,132,0.2)', borderRadius: 10, color: 'var(--error)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', transition: 'all 0.14s' }}>
                            DISCONNECT
                        </button>
                    )}
                </div>
            </aside>

            {/* ── MOBILE DRAWER ── */}
            {mobileOpen && (
                <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 150, backdropFilter: 'blur(4px)' }}>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 256, background: 'var(--surface-low)', padding: '80px 16px 24px', overflowY: 'auto' }}>
                        {NAV.map(({ icon, label, to }) => (
                            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive(to) ? 'var(--primary)' : 'var(--on-surface-var)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ── RESPONSIVE STYLES ── */}
            <style>{`
        .sidebar { display: flex !important; }
        .desktop-nav-links { display: flex !important; }
        .hamburger-btn { display: none !important; }
        @media (max-width: 1023px) {
          .sidebar { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .desktop-nav-links { display: none !important; }
        }
      `}</style>

            {/* ── JOIN MODAL ── */}
            {showModal && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        {!success ? (
                            <form onSubmit={e => { e.preventDefault(); setMemberId(generateMemberId()); setSuccess(true); }}>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
                                    Join <span className="accent-primary">TEC</span>
                                </h2>
                                <p style={{ color: 'var(--on-surface-var)', fontSize: 13, marginBottom: 24 }}>Create your campus profile.</p>
                                <div className="modal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                    {[
                                        { name: 'name', placeholder: 'Full Name' },
                                        { name: 'sapId', placeholder: 'SAP ID' },
                                        { name: 'course', placeholder: 'Course (e.g. B.Tech CSE)' },
                                        { name: 'batch', placeholder: 'Batch (e.g. 2022–2026)' },
                                        { name: 'year', placeholder: 'Current Year' },
                                    ].map(f => (
                                        <input key={f.name} className="neon-input" name={f.name} placeholder={f.placeholder} value={form[f.name] || ''} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required />
                                    ))}
                                    <input className="neon-input" type="email" name="personalEmail" placeholder="Personal Email" value={form.personalEmail} onChange={e => setForm({ ...form, personalEmail: e.target.value })} required />
                                    <input className="neon-input" type="email" name="collegeEmail" placeholder="College Email" value={form.collegeEmail} onChange={e => setForm({ ...form, collegeEmail: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: 12, fontSize: 12, letterSpacing: '0.08em' }}>Join TEC</button>
                                    <button type="button" className="btn-secondary" onClick={handleClose} style={{ padding: '12px 20px' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>Welcome, <span className="accent-primary">{form.name}</span></h2>
                                <p style={{ color: 'var(--on-surface-var)', fontSize: 13, marginBottom: 20 }}>Your member ID</p>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, color: 'var(--primary)', background: 'rgba(204,151,255,0.08)', border: '1px solid rgba(204,151,255,0.2)', borderRadius: 12, padding: '16px 28px', letterSpacing: 6, display: 'inline-block', marginBottom: 24, boxShadow: '0 0 24px rgba(204,151,255,0.15)' }}>{memberId}</div>
                                <p style={{ fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 20 }}>Save this to access your profile.</p>
                                <button onClick={handleClose} className="btn-primary" style={{ padding: '10px 36px', justifyContent: 'center' }}>Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
