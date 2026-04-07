import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CAT_COLOR = {
    Food: 'var(--secondary)', Transport: 'var(--primary)', Shopping: '#e3b341',
    Health: 'var(--error)', Study: 'var(--tertiary)', Stay: '#a889ff',
};

const FALLBACK_DEALS = [
    { name: 'Campus Café', cat: 'Food', discount: '15% OFF', desc: 'Show your TEC student ID for a discount on all beverages and snacks.', loc: 'Block-A Canteen', validity: 'Valid this semester' },
    { name: 'PrintZone', cat: 'Study', discount: '₹2/page', desc: 'B&W printing at reduced rates exclusively for TEC members.', loc: 'Library Ground Floor', validity: 'Ongoing' },
    { name: 'Hostel Mart', cat: 'Shopping', discount: '10% OFF', desc: 'Essentials at discounted prices — flash your TEC ID at the counter.', loc: 'Hostel Block C', validity: 'All semester' },
];

export default function AdBanner({ variant = 'inline', offset = 0 }) {
    const [deal, setDeal] = useState(null);

    useEffect(() => {
        supabase.from('deals').select('*').limit(8)
            .then(({ data }) => {
                const pool = (data && data.length > 0) ? data : FALLBACK_DEALS;
                setDeal(pool[offset % pool.length]);
            });
    }, [offset]);

    if (!deal) return null;

    const accent = CAT_COLOR[deal.cat] || 'var(--primary)';
    const sponsoredLabel = (
        <span style={{
            fontSize: 8, fontFamily: 'var(--font-display)', letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.18)', fontWeight: 700,
        }}>SPONSORED</span>
    );

    /* ── Sidebar variant ── */
    if (variant === 'sidebar') {
        return (
            <Link to="/discounts" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="neon-card" style={{
                    padding: 18, borderTop: `2px solid ${accent}`,
                    background: `linear-gradient(140deg, ${accent}09 0%, transparent 70%)`,
                    transition: 'box-shadow 0.14s',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        {sponsoredLabel}
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: 700, color: accent, letterSpacing: '0.07em' }}>{(deal.cat || '').toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', flex: 1, marginRight: 8, color: 'var(--on-surface)' }}>{deal.name}</div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: accent, flexShrink: 0 }}>{deal.discount}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.5, marginBottom: 12 }}>
                        {deal.desc?.slice(0, 72)}{(deal.desc?.length || 0) > 72 ? '…' : ''}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{deal.loc}</span>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: accent, letterSpacing: '0.04em' }}>View Deal →</span>
                    </div>
                </div>
            </Link>
        );
    }

    /* ── Inline variant ── */
    if (variant === 'inline') {
        return (
            <Link to="/discounts" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="neon-card" style={{
                    padding: '12px 18px', borderLeft: `3px solid ${accent}`,
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: `${accent}05`,
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: `${accent}14`, border: `1px solid ${accent}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17, color: accent }}>sell</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            {sponsoredLabel}
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--on-surface)' }}>{deal.name}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--on-surface-var)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {deal.desc}
                        </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: accent }}>{deal.discount}</div>
                        <div style={{ fontSize: 10, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{deal.validity}</div>
                    </div>
                </div>
            </Link>
        );
    }

    /* ── Grid variant ── */
    if (variant === 'grid') {
        return (
            <Link to="/discounts" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                <div className="neon-card" style={{
                    padding: 22, borderTop: `2px solid ${accent}`, height: '100%', boxSizing: 'border-box',
                    background: `linear-gradient(140deg, ${accent}07 0%, transparent 70%)`,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        {sponsoredLabel}
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: 700, color: accent, letterSpacing: '0.07em' }}>{(deal.cat || '').toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, flex: 1, marginRight: 8 }}>{deal.name}</div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: accent, flexShrink: 0 }}>{deal.discount}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.5, marginBottom: 14 }}>
                        {deal.desc?.slice(0, 80)}{(deal.desc?.length || 0) > 80 ? '…' : ''}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{deal.loc}</div>
                            <div style={{ fontSize: 10, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{deal.validity}</div>
                        </div>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: accent }}>View Deal →</span>
                    </div>
                </div>
            </Link>
        );
    }

    return null;
}
