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
     * Authenticates via Supabase. Reads canonical role & member code from members table.
     */
    const login = async (email, password) => {
        setAuthError('');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setAuthError(error.message);
            return { ok: false, error: error.message };
        }
        // Fetch member record for canonical role and member code
        const { data: memberData } = await supabase
            .from('members').select('*').eq('auth_id', data.user.id).single();
        const role = memberData?.role || data.user.user_metadata?.role || 'student';
        const displayName = memberData?.name || data.user.user_metadata?.name || email.split('@')[0];
        const u = {
            id: data.user.id,
            email: data.user.email,
            name: displayName,
            role,
            avatarLetter: displayName[0].toUpperCase(),
            memberCode: memberData?.id || null,
        };
        setUser(u);
        sessionStorage.setItem('tec_user', JSON.stringify(u));
        return { ok: true, user: u };
    };

    /**
     * register(email, password, name, referralCode)
     * Validates the single-use referral code, registers via Supabase as 'student',
     * creates a members row with a TEC member code, then marks the referral as used.
     */
    const register = async (email, password, name, referralCode, extra = {}) => {
        setAuthError('');

        // 1. Validate referral code
        const normalized = (referralCode || '').trim().toUpperCase();
        if (!normalized) return { ok: false, error: 'A referral code is required to register.' };

        const { data: refData, error: refError } = await supabase
            .from('referral_codes')
            .select('id, used_by_auth_id')
            .eq('code', normalized)
            .single();

        if (refError || !refData) return { ok: false, error: 'Invalid referral code. Check with the admin.' };
        if (refData.used_by_auth_id) return { ok: false, error: 'This referral code has already been used.' };

        // 2. Create auth user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role: 'student' } },
        });
        if (error) {
            setAuthError(error.message);
            return { ok: false, error: error.message };
        }

        // 3. Complete registration atomically via RPC (SECURITY DEFINER — works
        //    even when no session exists yet, e.g. email confirmation is ON)
        const memberCode = 'TEC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const { error: regError } = await supabase.rpc('complete_registration', {
            p_auth_id: data.user.id,
            p_ref_id: refData.id,
            p_member_code: memberCode,
            p_name: name,
            p_email: email,
            p_sap_id: extra.sap_id || null,
            p_batch: extra.batch || null,
            p_course: extra.course || null, p_college_email: extra.college_email || null,
            p_phone: extra.phone || null,
        });

        if (regError) {
            return { ok: false, error: 'Profile setup failed: ' + regError.message };
        }

        return { ok: true, data, memberCode };
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
