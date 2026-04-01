import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    const type = searchParams.get('type');

    useEffect(() => {
        if (type !== 'recovery') {
            navigate('/', { replace: true });
            return;
        }

        // Supabase fires PASSWORD_RECOVERY when it detects the recovery token in the URL hash.
        // Wait for that event to confirm the session is established before showing the form.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                setReady(true);
            }
        });

        // Also check if session already exists (e.g. page refresh)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setReady(true);
        });

        return () => subscription.unsubscribe();
    }, [type, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setSuccess(true);
        setTimeout(() => navigate('/login', { replace: true }), 2500);
    };

    if (!ready) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <p style={styles.sub}>Verifying reset link…</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <motion.div
                style={styles.card}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {success ? (
                    <>
                        <h2 style={styles.title}>Password Updated</h2>
                        <p style={styles.sub}>Your password has been changed. Redirecting to login…</p>
                    </>
                ) : (
                    <>
                        <h2 style={styles.title}>Set New Password</h2>
                        <p style={styles.sub}>Choose a new password for your TEC account.</p>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <input
                                style={styles.input}
                                type="password"
                                placeholder="New password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <input
                                style={styles.input}
                                type="password"
                                placeholder="Confirm new password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                            />
                            {error && <p style={styles.error}>{error}</p>}
                            <button style={styles.button} type="submit" disabled={loading}>
                                {loading ? 'Saving…' : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0a0e27',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        background: '#1a1f3a',
        borderRadius: '10px',
        padding: '40px 32px',
        width: '100%',
        maxWidth: '420px',
    },
    title: {
        color: '#CC97FF',
        margin: '0 0 8px',
        fontSize: '22px',
        fontWeight: 600,
    },
    sub: {
        color: '#aaa',
        margin: '0 0 24px',
        fontSize: '14px',
        lineHeight: 1.6,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    input: {
        background: '#0f1428',
        border: '1px solid #333',
        borderRadius: '6px',
        padding: '12px 14px',
        color: '#e0e0e0',
        fontSize: '15px',
        outline: 'none',
    },
    error: {
        color: '#ff6e84',
        fontSize: '13px',
        margin: '0',
    },
    button: {
        background: '#CC97FF',
        color: '#1a1f3a',
        border: 'none',
        borderRadius: '6px',
        padding: '13px',
        fontWeight: 600,
        fontSize: '15px',
        cursor: 'pointer',
        marginTop: '8px',
    },
};
