import React, { useState } from 'react';
import { motion } from 'framer-motion';

const milestones = [
    { phase: 'Phase 1', title: 'MVP Launch', date: 'Mar–Apr 2026', status: 'active', desc: 'Core website with Login, Map, Discounts, Listings, Assignments Board, and Polls. Deployed and live.', items: ['Central website + Auth', 'Campus Map (Pondha–Bidholi)', 'Student Discounts page', 'Listings (PGs, Food, Rentals)', 'Assignments Board', 'Poll & Problem Statements'] },
    { phase: 'Phase 2', title: 'Community Growth', date: 'May–Jul 2026', status: 'upcoming', desc: 'Real-time features, verified listings, a student marketplace, and community-driven ratings.', items: ['Verified student profiles', 'Real-time chat for listings', 'Rating & review system', 'Mobile app (PWA)', 'College ambassador program', 'WhatsApp/Telegram bot'] },
    { phase: 'Phase 3', title: 'Monetization', date: 'Aug–Nov 2026', status: 'upcoming', desc: 'Introducing revenue streams while keeping core features free for students.', items: ['Business dashboard for vendors', 'Premium listings for PGs', 'Sponsored discount campaigns', 'TEC Pro tier for students', 'API for college clubs', 'Analytics for institutions'] },
    { phase: 'Phase 4', title: 'Scale to All of Uttarakhand', date: '2027', status: 'future', desc: 'Expand coverage to other universities and districts across Uttarakhand and beyond.', items: ['IIT Roorkee, HNB Garhwal U', 'Tier-2 city expansion', 'Government partnerships', 'Job board integration', 'Alumni network', 'TEC Fellowship program'] },
];

const pricingTiers = [
    {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        color: '#06d6a0',
        features: ['Browse all listings', 'Access to discounts', 'Campus map', 'View assignment board', 'Participate in polls', '3 posts/month'],
        cta: 'Get Started',
    },
    {
        name: 'Student Pro',
        price: '₹99',
        period: 'per month',
        color: '#238636',
        badge: 'POPULAR',
        features: ['Everything in Free', 'Unlimited posts', 'Priority listing visibility', 'Early access to new deals', 'Direct message system', 'Verified Student badge'],
        cta: 'Go Pro',
    },
    {
        name: 'Community',
        price: '₹999',
        period: 'per month',
        color: '#f59e0b',
        features: ['Everything in Pro', 'Business listing management', 'Analytics dashboard', 'Custom discount campaigns', 'API access', 'Dedicated support'],
        cta: 'For Businesses',
    },
];

const businessModel = [
    { title: 'Freemium SaaS', icon: '💳', desc: 'Core features free for every student. Premium tier for power users unlocks priority visibility, unlimited posts, and DMs.' },
    { title: 'B2B Listings', icon: '🏢', desc: 'PG owners, restaurants, and local businesses pay for verified premium placement in our listings — trusted by 500+ students.' },
    { title: 'Sponsored Discounts', icon: '🎯', desc: 'Brands sponsor student discount campaigns — pays per redemption. Win-win for businesses and students.' },
    { title: 'Data Insights', icon: '📊', desc: 'Anonymized, aggregated insights on student spending and location patterns sold to urban planners and local businesses.' },
];

export default function About() {
    const [expandPhase, setExpandPhase] = useState(0);

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', padding: '60px 24px 80px' }}>
            <style>{`
        .milestone-card:hover { border-color: #58a6ff !important; }
        .milestone-card { transition: border-color 0.2s; cursor: pointer; }
        .biz-card:hover { transform: translateY(-2px); }
        .biz-card { transition: transform 0.2s; }
        .pricing-card:hover { transform: translateY(-4px); }
        .pricing-card { transition: transform 0.2s; }
      `}</style>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Mission */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 72 }}>
                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>OUR MISSION</span>
                    <h1 style={{ fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 700, marginTop: 20, marginBottom: 20, lineHeight: 1.1 }}>
                        Amplifying Student Lives,<br />
                        <span style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>One Problem at a Time.</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, maxWidth: 680, margin: '0 auto 40px', lineHeight: 1.8 }}>
                        TEC (The Echo Community) is a student-first platform built to solve the real problems college students face — finding affordable housing, grabbing deals, navigating a new city, and connecting with their peers.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
                        {[{ v: 'Student First', d: 'Every decision is made for students, not against them' }, { v: 'Open Platform', d: 'Built with community input and feedback at its core' }, { v: 'Local Impact', d: 'Starting in Dehradun, expanding across Uttarakhand' }].map((v, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                                style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '20px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#58a6ff', marginBottom: 8 }}>{v.v}</div>
                                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{v.d}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Business Model */}
                <section style={{ marginBottom: 72 }}>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 34, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Business Model 💡</motion.h2>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 36 }}>How TEC stays free for students while building a sustainable business.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
                        {businessModel.map((b, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <div className="biz-card" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '24px' }}>
                                    <div style={{ fontSize: 32, marginBottom: 14 }}>{b.icon}</div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{b.title}</h3>
                                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{b.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Pricing */}
                <section style={{ marginBottom: 72 }}>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 34, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Pricing 💳</motion.h2>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 36 }}>Simple, transparent pricing. Always free for students to get started.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        {pricingTiers.map((tier, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <div className="pricing-card" style={{
                                    background: tier.badge ? `rgba(35,134,54,0.12)` : '#161b22',
                                    border: `1px solid ${tier.badge ? '#238636' : '#30363d'}`,
                                    borderRadius: 6, padding: '28px 24px', position: 'relative',
                                }}>
                                    {tier.badge && (
                                        <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#238636', color: '#fff', borderRadius: 4, padding: '3px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{tier.badge}</span>
                                    )}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: tier.color, letterSpacing: 1, marginBottom: 10 }}>{tier.name.toUpperCase()}</div>
                                        <div style={{ fontSize: 40, fontWeight: 800, color: '#f1f5f9' }}>{tier.price}</div>
                                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{tier.period}</div>
                                    </div>
                                    <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                                        {tier.features.map((f, j) => (
                                            <li key={j} style={{ fontSize: 14, color: '#94a3b8', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ color: tier.color, fontWeight: 700 }}>✓</span> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button style={{ width: '100%', padding: '10px', background: tier.badge ? '#238636' : '#21262d', border: tier.badge ? '1px solid rgba(240,246,252,0.1)' : '1px solid #30363d', borderRadius: 6, color: tier.badge ? '#fff' : tier.color, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {tier.cta}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Roadmap */}
                <section>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 34, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Roadmap 🚀</motion.h2>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 36 }}>Where we are and where we're going.</p>
                    <div style={{ position: 'relative', paddingLeft: 40 }}>
                        <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #58a6ff, rgba(88,166,255,0))' }} />
                        {milestones.map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <div className="milestone-card" onClick={() => setExpandPhase(expandPhase === i ? -1 : i)}
                                    style={{ background: '#161b22', border: `1px solid ${m.status === 'active' ? '#58a6ff' : '#30363d'}`, borderRadius: 6, padding: '20px 24px', marginBottom: 16, position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: -34, top: 20, width: 14, height: 14, borderRadius: '50%', background: m.status === 'active' ? '#3fb950' : m.status === 'upcoming' ? '#30363d' : '#21262d', border: `2px solid ${m.status === 'active' ? '#3fb950' : '#30363d'}`, boxShadow: m.status === 'active' ? '0 0 10px #3fb950' : 'none' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                        <div>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: m.status === 'active' ? '#58a6ff' : '#8b949e', letterSpacing: 1 }}>{m.phase}</span>
                                            <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: '#f1f5f9' }}>{m.title}</h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <span style={{ fontSize: 12, color: '#475569' }}>{m.date}</span>
                                            {m.status === 'active' && <span style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff', border: '1px solid rgba(88,166,255,0.3)', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>IN PROGRESS</span>}
                                            {m.status === 'future' && <span style={{ background: 'rgba(71,85,105,0.2)', color: '#475569', border: '1px solid rgba(71,85,105,0.3)', borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>FUTURE</span>}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 14, color: '#64748b', marginTop: 10, lineHeight: 1.6 }}>{m.desc}</p>
                                    {expandPhase === i && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #30363d' }}>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {m.items.map((item, j) => (
                                                    <span key={j} style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d', borderRadius: 4, padding: '4px 12px', fontSize: 13 }}>{item}</span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
