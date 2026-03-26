import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Roles:
 *  admin      — full access: member CRUD, moderation, analytics, role management
 *  moderator  — approve/reject content, flag posts; cannot manage members or roles
 *  builder    — verified student builder; extra badge on their builds
 *  student    — default registered member
 */

const ROLE_HIERARCHY = { admin: 4, moderator: 3, builder: 2, student: 1 };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);        // { id, email, name, role, avatarLetter }
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    // On mount — check Supabase session OR sessionStorage fallback
    useEffect(() => {
        const stored = sessionStorage.getItem('tec_user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch (_) { }
        }

        // Real Supabase session listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user && !stored) {
                const role = session.user.user_metadata?.role || 'student';
                const u = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                    role,
                    avatarLetter: (session.user.user_metadata?.name || session.user.email)[0].toUpperCase(),
                };
                setUser(u);
                sessionStorage.setItem('tec_user', JSON.stringify(u));
            }
        });

        setLoading(false);
        return () => subscription.unsubscribe();
    }, []);

    /**
     * login(email, password)
     * Authenticates via Supabase.
     */
    const login = async (email, password) => {
        setAuthError('');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setAuthError(error.message);
            return { ok: false, error: error.message };
        }
        const role = data.user.user_metadata?.role || 'student';
        const u = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0],
            role,
            avatarLetter: (data.user.user_metadata?.name || email)[0].toUpperCase(),
        };
        setUser(u);
        sessionStorage.setItem('tec_user', JSON.stringify(u));
        return { ok: true, user: u };
    };

    /**
     * register(email, password, name, role?)
     * Registers via Supabase, defaults to 'student' role.
     */
    const register = async (email, password, name, role = 'student') => {
        setAuthError('');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role } },
        });
        if (error) {
            setAuthError(error.message);
            return { ok: false, error: error.message };
        }
        return { ok: true, data };
    };

    const logout = async () => {
        sessionStorage.removeItem('tec_user');
        setUser(null);
        await supabase.auth.signOut();
    };

    /** Check if current user has at least the given role level */
    const hasRole = (minRole) => {
        if (!user) return false;
        return (ROLE_HIERARCHY[user.role] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
    };

    const isAdmin = () => hasRole('admin');
    const isModerator = () => hasRole('moderator');
    const isBuilder = () => hasRole('builder');

    return (
        <AuthContext.Provider value={{ user, loading, authError, login, register, logout, hasRole, isAdmin, isModerator, isBuilder }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

export default AuthContext;
