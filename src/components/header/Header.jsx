import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLORS = {
    admin: '#FF6E84', moderator: '#FF95A0', builder: '#CC97FF', student: '#53DDFC',
};

const NAV = [
    { icon: 'storefront', label: 'Marketplace', to: '/assignments' },
    { icon: 'explore', label: 'Explore', to: '/' },
    { icon: 'campaign', label: 'Feed', to: '/feed' },
    { icon: 'sell', label: 'Deals', to: '/discounts' },
    { icon: 'location_city', label: 'Listings', to: '/listings' },
    { icon: 'how_to_vote', label: 'Pulse', to: '/poll' },
    { icon: 'info', label: 'About', to: '/about' },
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
    const [theme, setTheme] = useState(() => localStorage.getItem('tec-theme') || 'dark');

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('tec-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
    const [form, setForm] = useState({ name: '', sapId: '', personalEmail: '', collegeEmail: '', batch: '', year: '', course: '' });
    const [memberId, setMemberId] = useState('');
    const [success, setSuccess] = useState(false);

    const handleClose = () => {
        setShowModal(false);
        setForm({ name: '', sapId: '', personalEmail: '', collegeEmail: '', batch: '', year: '', course: '' });
        setMemberId(''); setSuccess(false);
    };

    const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

    return (
        <>
            {/* ── Fonts ── */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&family=Bebas+Neue&family=Barlow+Condensed:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
            <style>{`
                .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; user-select:none; }

                /* ── Nav link ── */
                .tec-nav-link {
                    display: flex; align-items: center; gap: 7px;
                    padding: 0 15px; height: 100%;
                    position: relative; text-decoration: none;
                    font-family: 'Bebas Neue', 'Barlow Condensed', sans-serif;
                    font-size: 15px; letter-spacing: 0.09em;
                    color: rgba(255,255,255,0.38);
                    transition: color 0.14s;
                    white-space: nowrap;
                }
                .tec-nav-link::after {
                    content: ''; position: absolute; bottom: 0; left: 15px; right: 15px;
                    height: 2px; border-radius: 2px 2px 0 0;
                    background: #CC97FF;
                    transform: scaleX(0); transform-origin: center;
                    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
                }
                .tec-nav-link:hover { color: rgba(255,255,255,0.8); }
                .tec-nav-link.tec-active {
                    color: #CC97FF;
                    text-shadow: 0 0 18px rgba(204,151,255,0.6);
                }
                .tec-nav-link.tec-active::after { transform: scaleX(1); box-shadow: 0 0 8px rgba(204,151,255,0.7); }
                .tec-nav-link .tec-nav-icon { font-size: 15px; }

                /* ── Mobile nav link ── */
                .tec-mob-link {
                    display: flex; align-items: center; gap: 14px;
                    padding: 11px 14px; border-radius: 10px; margin-bottom: 2px;
                    text-decoration: none;
                    font-family: 'Bebas Neue', sans-serif; font-size: 17px; letter-spacing: 0.1em;
                    color: rgba(255,255,255,0.4); transition: all 0.14s;
                }
                .tec-mob-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.04); }
                .tec-mob-link.tec-active { color: #CC97FF; background: rgba(204,151,255,0.08); }

                /* ── Right side user ── */
                .tec-user-name {
                    font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700;
                    letter-spacing: 0.03em; color: rgba(255,255,255,0.82);
                    max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .tec-role-pill {
                    font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 800;
                    letter-spacing: 0.12em; text-transform: uppercase;
                    padding: 2px 8px; border-radius: 5px; border: 1px solid;
                }
                .tec-signout {
                    cursor: pointer; background: transparent;
                    border: 1px solid rgba(255,110,132,0.3); color: #FF6E84;
                    font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 800;
                    letter-spacing: 0.12em; text-transform: uppercase;
                    padding: 6px 14px; border-radius: 7px; transition: background 0.14s;
                }
                .tec-signout:hover { background: rgba(255,110,132,0.08); }
                .tec-join-btn {
                    cursor: pointer;
                    font-family: 'Bebas Neue', sans-serif !important;
                    font-size: 15px !important; letter-spacing: 0.1em !important;
                    padding: 7px 20px; border-radius: 8px; border: none;
                    background: linear-gradient(135deg, #9C48EA, #CC97FF);
                    color: #fff; transition: opacity 0.14s, transform 0.14s;
                }
                .tec-join-btn:hover { opacity: 0.85; transform: translateY(-1px); }
                .tec-signin-link {
                    font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.14s;
                    padding: 6px 10px;
                }
                .tec-signin-link:hover { color: #fff; }

                /* ── Responsive ── */
                .tec-desktop-nav { display: flex; }
                .tec-topbar-right { display: flex; }
                .tec-hamburger { display: none; }
                @media (max-width: 1023px) {
                    .tec-desktop-nav { display: none !important; }
                    .tec-topbar-right { display: none !important; }
                    .tec-hamburger { display: flex !important; }
                }
            `}</style>

            {/* ══════════════ TOP NAV ══════════════ */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 68,
                display: 'flex', alignItems: 'stretch',
                background: 'rgba(8,8,9,0.95)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 2px 40px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(204,151,255,0.04)',
                padding: '0 24px',
            }}>

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: 'none', marginRight: 28, flexShrink: 0, gap: 0 }}>
                    <span style={{
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, fontStyle: 'italic',
                        color: '#CC97FF', letterSpacing: '0.03em', lineHeight: 1,
                        textShadow: '0 0 28px rgba(204,151,255,0.55), 0 0 64px rgba(204,151,255,0.18)',
                    }}>TEC</span>
                    <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 7.5, fontWeight: 700,
                        letterSpacing: '0.28em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase',
                        marginTop: -1,
                    }}>The Echo Community</span>
                </Link>

                {/* Divider */}
                <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', margin: '16px 4px', flexShrink: 0 }} />

                {/* Desktop nav */}
                <div className="tec-desktop-nav" style={{ flex: 1, alignItems: 'stretch', gap: 0, overflow: 'hidden' }}>
                    {NAV.map(({ icon, label, to }) => (
                        <Link key={to} to={to} className={`tec-nav-link${isActive(to) ? ' tec-active' : ''}`}>
                            <span className="material-symbols-outlined tec-nav-icon">{icon}</span>
                            {label}
                        </Link>
                    ))}
                    {user?.role === 'admin' && (
                        <Link to="/admin" className={`tec-nav-link${isActive('/admin') ? ' tec-active' : ''}`}
                            style={{ color: isActive('/admin') ? '#FF6E84' : undefined }}>
                            <span className="material-symbols-outlined tec-nav-icon">admin_panel_settings</span>
                            Admin
                        </Link>
                    )}
                </div>

                {/* Right: user / auth */}
                <div className="tec-topbar-right" style={{ alignItems: 'center', gap: 10, marginLeft: 'auto', flexShrink: 0 }}>
                    {user ? (
                        <>
                            <button onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} style={{
                                width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                                transition: 'all 0.15s', flexShrink: 0,
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>
                            <span className="tec-role-pill" style={{
                                color: ROLE_COLORS[user.role] || '#CC97FF',
                                borderColor: `${ROLE_COLORS[user.role] || '#CC97FF'}45`,
                                background: `${ROLE_COLORS[user.role] || '#CC97FF'}12`,
                            }}>{user.role}</span>
                            <div style={{
                                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                background: 'rgba(204,151,255,0.1)', border: '1.5px solid rgba(204,151,255,0.28)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#CC97FF',
                            }}>{(user.avatarLetter || user.name?.[0] || 'U').toUpperCase()}</div>
                            <span className="tec-user-name">{user.name}</span>
                            <button className="tec-signout" onClick={logout}>Sign out</button>
                        </>
                    ) : (
                        <>
                            <button onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} style={{
                                width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                                transition: 'all 0.15s', flexShrink: 0,
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>
                            <Link to="/login" className="tec-signin-link">Sign in</Link>
                            <button onClick={() => setShowModal(true)} className="tec-join-btn">Join TEC</button>
                        </>
                    )}
                </div>

                {/* Hamburger */}
                <button onClick={() => setMobileOpen(o => !o)} className="tec-hamburger" style={{
                    flexDirection: 'column', gap: 5, background: 'transparent', border: 'none',
                    cursor: 'pointer', padding: 8, marginLeft: 'auto', alignSelf: 'center',
                }}>
                    <span style={{ display: 'block', width: 22, height: 2, background: 'rgba(255,255,255,0.65)', borderRadius: 2 }} />
                    <span style={{ display: 'block', width: 16, height: 2, background: 'rgba(255,255,255,0.65)', borderRadius: 2 }} />
                    <span style={{ display: 'block', width: 22, height: 2, background: 'rgba(255,255,255,0.65)', borderRadius: 2 }} />
                </button>
            </nav>

            {/* ══════════════ MOBILE DRAWER ══════════════ */}
            {mobileOpen && (
                <div onClick={() => setMobileOpen(false)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
                    zIndex: 300, backdropFilter: 'blur(8px)',
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 272,
                        background: 'rgba(10,10,11,0.98)', backdropFilter: 'blur(24px)',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        padding: '92px 12px 28px', overflowY: 'auto',
                        display: 'flex', flexDirection: 'column',
                    }}>
                        {/* Mobile logo */}
                        <div style={{
                            position: 'absolute', top: 20, left: 20,
                            fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, fontStyle: 'italic',
                            color: '#CC97FF', letterSpacing: '0.03em', lineHeight: 1,
                            textShadow: '0 0 20px rgba(204,151,255,0.5)',
                        }}>TEC</div>

                        {NAV.map(({ icon, label, to }) => (
                            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                                className={`tec-mob-link${isActive(to) ? ' tec-active' : ''}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: 19 }}>{icon}</span>
                                {label}
                            </Link>
                        ))}
                        {user?.role === 'admin' && (
                            <Link to="/admin" onClick={() => setMobileOpen(false)}
                                className={`tec-mob-link${isActive('/admin') ? ' tec-active' : ''}`}
                                style={{ color: isActive('/admin') ? '#FF6E84' : undefined }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 19 }}>admin_panel_settings</span>
                                Admin
                            </Link>
                        )}

                        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {user ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(204,151,255,0.1)', border: '1.5px solid rgba(204,151,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#CC97FF' }}>
                                            {(user.avatarLetter || user.name?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff' }}>{user.name}</div>
                                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: ROLE_COLORS[user.role] || '#CC97FF' }}>{user.role}</div>
                                        </div>
                                    </div>
                                    <button onClick={toggleTheme} style={{
                                        width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                                        color: 'rgba(255,255,255,0.7)', fontFamily: "'Bebas Neue', sans-serif",
                                        fontSize: 15, letterSpacing: '0.1em', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        marginBottom: 8,
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                        </span>
                                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    </button>
                                    <button onClick={() => { logout(); setMobileOpen(false); }} style={{
                                        width: '100%', padding: '11px', background: 'transparent',
                                        border: '1px solid rgba(255,110,132,0.25)', borderRadius: 10,
                                        color: '#FF6E84', fontFamily: "'Bebas Neue', sans-serif",
                                        fontSize: 15, letterSpacing: '0.1em', cursor: 'pointer',
                                    }}>Disconnect</button>
                                </>
                            ) : (
                                <button onClick={() => { setShowModal(true); setMobileOpen(false); }} style={{
                                    width: '100%', padding: '12px', background: 'linear-gradient(135deg, #9C48EA, #CC97FF)',
                                    border: 'none', borderRadius: 10, color: '#fff',
                                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.1em', cursor: 'pointer',
                                }}>Join TEC</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ JOIN MODAL ══════════════ */}
            {showModal && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        {!success ? (
                            <form onSubmit={e => { e.preventDefault(); setMemberId(generateMemberId()); setSuccess(true); }}>
                                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.06em', marginBottom: 6 }}>
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
                                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.06em', marginBottom: 8 }}>Welcome, <span className="accent-primary">{form.name}</span></h2>
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
