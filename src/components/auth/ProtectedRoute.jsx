import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute
 * 
 * Props:
 *   minRole  — minimum role required: 'student' | 'builder' | 'moderator' | 'admin'
 *              defaults to 'student' (just needs to be logged in)
 *   children — content to render if authorized
 *
 * Redirects to /login with `from` state if not authenticated.
 * Shows an access-denied screen if authenticated but insufficient role.
 */
export default function ProtectedRoute({ minRole = 'student', children }) {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, border: '2px solid #30363d', borderTopColor: '#58a6ff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                    <span style={{ fontSize: 13, color: '#8b949e' }}>Checking access…</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (!hasRole(minRole)) {
        return <AccessDenied required={minRole} current={user.role} />;
    }

    return children;
}

const ROLE_LABELS = { admin: 'Admin', moderator: 'Moderator', builder: 'Builder', student: 'Student' };
const ROLE_COLORS = { admin: '#f85149', moderator: '#e3b341', builder: '#a78bfa', student: '#3fb950' };

function AccessDenied({ required, current }) {
    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#30363d', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>403</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>Access denied</h2>
                <p style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.6, marginBottom: 24 }}>
                    This page requires{' '}
                    <span style={{ color: ROLE_COLORS[required] || '#58a6ff', fontWeight: 700 }}>{ROLE_LABELS[required] || required}</span>{' '}
                    access. Your current role is{' '}
                    <span style={{ color: ROLE_COLORS[current] || '#8b949e', fontWeight: 700 }}>{ROLE_LABELS[current] || current}</span>.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <a href="/" style={{ padding: '8px 20px', borderRadius: 6, background: '#238636', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Go home</a>
                    <a href="/login" style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #30363d', background: 'transparent', color: '#8b949e', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Sign in differently</a>
                </div>
            </div>
        </div>
    );
}
