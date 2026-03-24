import './Header.css';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { label: 'Map', to: '/map' },
    { label: 'Deals', to: '/discounts' },
    { label: 'Listings', to: '/listings' },
    { label: 'Board', to: '/assignments' },
    { label: 'Builds', to: '/builds' },
    { label: 'Poll', to: '/poll' },
    { label: 'Events', to: '/events' },
    { label: 'About', to: '/about' },
    { label: 'Members', to: '/member' },
];

function generateMemberId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
}

function getCurrentDateString() {
    const now = new Date();
    return `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
}

export default function Header() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', sapId: '', personalEmail: '', collegeEmail: '', batch: '', year: '', course: '', phone: '' });
    const [memberId, setMemberId] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setMemberId(generateMemberId());
        setSuccess(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setForm({ name: '', sapId: '', personalEmail: '', collegeEmail: '', batch: '', year: '', course: '', phone: '' });
        setMemberId('');
        setSuccess(false);
    };

    return (
        <>
            <div className="main header">
                {/* Logo */}
                <Link to="/" className="logo" onClick={() => setMobileOpen(false)}>
                    <img src="/download.jpeg" alt="TEC Logo" />
                    <span className="logo-text">TEC</span>
                </Link>

                {/* Desktop nav */}
                <nav className="navlinks">
                    {navLinks.map(link => (
                        <Link key={link.to} to={link.to} className={location.pathname === link.to ? 'active' : ''}>{link.label}</Link>
                    ))}
                </nav>

                {/* CTA + hamburger */}
                <div className="cta">
                    <a href="#" onClick={e => { e.preventDefault(); setShowModal(true); }}>Join Us</a>
                    <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                        <span /><span /><span />
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
                <Link to="/" onClick={() => setMobileOpen(false)} style={{ color: '#f1f5f9', fontWeight: 700 }}>Home</Link>
                {navLinks.map(link => (
                    <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={location.pathname === link.to ? 'active' : ''}>{link.label}</Link>
                ))}
                <a href="#" style={{ color: '#58a6ff', marginTop: 8 }} onClick={e => { e.preventDefault(); setShowModal(true); setMobileOpen(false); }}>+ Join TEC</a>
            </div>

            {/* Join Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24, backdropFilter: 'blur(4px)' }}
                    onClick={handleClose}>
                    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 28, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
                        onClick={e => e.stopPropagation()}>
                        {!success ? (
                            <form onSubmit={handleSubmit}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#e6edf3' }}>Join The Echo Community</h3>
                                <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 20 }}>Create your member profile to get full access.</p>
                                {[
                                    { name: 'name', placeholder: 'Full Name', type: 'text' },
                                    { name: 'sapId', placeholder: 'College SAP ID', type: 'text' },
                                    { name: 'personalEmail', placeholder: 'Personal Email', type: 'email' },
                                    { name: 'collegeEmail', placeholder: 'College Email (.edu)', type: 'email' },
                                    { name: 'batch', placeholder: 'Batch (e.g. 2022–2026)', type: 'text' },
                                    { name: 'year', placeholder: 'Current Year (1/2/3/4)', type: 'text' },
                                    { name: 'course', placeholder: 'Course (e.g. B.Tech CSE)', type: 'text' },
                                    { name: 'phone', placeholder: 'Phone Number', type: 'tel' },
                                ].map(field => (
                                    <div key={field.name} style={{ marginBottom: 10 }}>
                                        <input name={field.name} placeholder={field.placeholder} type={field.type} value={form[field.name]} onChange={handleInputChange} required
                                            className="gh-input" style={{ width: '100%' }} />
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Join TEC</button>
                                    <button type="button" className="btn-secondary" onClick={handleClose} style={{ padding: '10px 20px' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#e6edf3' }}>Welcome, {form.name}!</h3>
                                <p style={{ color: '#8b949e', marginBottom: 16, fontSize: 13 }}>Your Member ID</p>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 800, color: '#3fb950', background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '14px 24px', letterSpacing: 5, margin: '0 auto 16px', display: 'inline-block' }}>{memberId}</div>
                                <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 20 }}>Save this ID to access your profile and certificates.</p>
                                <div style={{ fontSize: 13, color: '#8b949e', textAlign: 'left', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, padding: 14, marginBottom: 20 }}>
                                    <div style={{ marginBottom: 4 }}><span style={{ color: '#58a6ff' }}>Course:</span> {form.course} · {form.year} Year</div>
                                    <div style={{ marginBottom: 4 }}><span style={{ color: '#58a6ff' }}>Batch:</span> {form.batch}</div>
                                    <div><span style={{ color: '#58a6ff' }}>Joined:</span> {getCurrentDateString()} · Active Member</div>
                                </div>
                                <button onClick={handleClose} className="btn-primary" style={{ padding: '10px 36px' }}>Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}


