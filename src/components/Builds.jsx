import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TABS = ['Latest_Builds', 'Trending', 'Web3_Protocols', 'AI_Systems'];

const BUILDS = [
    {
        id: 1, name: 'KINETIC_FLOW_ENGINE', status: 'LIVE_DEPLOY', votes: 312,
        tagline: 'A high-velocity animation library optimized for low-latency terminal interfaces.',
        desc: 'Built with Rust + WASM. Renders 60fps on mid-range devices. Used in 3 production UPES projects this semester.',
        tech: ['Rust', 'WASM', 'Canvas API', 'Framer'],
        user: 'cyber_junkie', batch: 'B.Tech CSE 2025', time: '2d ago',
        demo: true, repo: true,
    },
    {
        id: 2, name: 'OS_TERMINAL_UI', status: 'BETA_V0.8', votes: 187,
        tagline: 'Recreating the aesthetic of 90s hacking interfaces with modern web tech.',
        desc: 'A component lib for building terminal-style UIs. Full keyboard nav, ASCII art renderer, command parser.',
        tech: ['React', 'TypeScript', 'xterm.js'],
        user: 'delta_root', batch: 'B.Tech IT 2026', time: '4d ago',
        demo: false, repo: true,
    },
    {
        id: 3, name: 'NEURAL_NET_VIS', status: 'LIVE_DEPLOY', votes: 264,
        tagline: 'Real-time visualization of weight adjustments during ML model training.',
        desc: 'WebGL-powered. Connect your PyTorch training loop via websocket and watch your network learn.',
        tech: ['Python', 'WebGL', 'WebSocket', 'Three.js'],
        user: 'neon_ghost', batch: 'B.Tech AI 2025', time: '1w ago',
        demo: true, repo: true,
    },
    {
        id: 4, name: 'CAMPUS_GPT', status: 'BETA_V1.2', votes: 445,
        tagline: 'LLM fine-tuned on all UPES syllabi up to 2025. Ask it anything about your course.',
        desc: 'GPT-4 with RAG. Context covers 200+ subjects, exam papers, faculty notes. 94% accuracy in student testing.',
        tech: ['Python', 'LangChain', 'Supabase', 'Next.js'],
        user: 'novax', batch: 'B.Tech CSE 2024', time: '3d ago',
        demo: true, repo: false,
    },
];

const STATUS_STYLE = {
    'LIVE_DEPLOY': { bg: 'rgba(83,221,252,0.1)', color: 'var(--secondary)', border: 'rgba(83,221,252,0.2)' },
    'BETA_V0.8': { bg: 'rgba(204,151,255,0.1)', color: 'var(--primary)', border: 'rgba(204,151,255,0.2)' },
    'BETA_V1.2': { bg: 'rgba(204,151,255,0.1)', color: 'var(--primary)', border: 'rgba(204,151,255,0.2)' },
};

const ACTIVITY = [
    { handle: '@novax', action: 'pushed to main', detail: 'KineticFlow: visualized vertex buffer arrays', time: '04:15 UTC' },
    { handle: '@cyan_drifter', action: 'deployed v1.2', detail: 'ShadowLing: User_Vault_Security', time: '03:08 UTC' },
    { handle: '@delta_root', action: 'commented', detail: '"The lighting shaders are incredible!"', time: '01:9 UTC' },
];

const KERNEL_UPGRADES = [
    { type: 'HACKATHON', date: 'OCT 24', title: 'Low-Level Logic Sprint', desc: 'Optimize memory management for real-time physics engines.' },
    { type: 'WORKSHOP', date: 'OCT 25', title: 'Shaders for the Void', desc: 'Master GLSL for creating atmospheric dark-mode effects.' },
];

export default function Builds() {
    const [activeTab, setActiveTab] = useState('Latest_Builds');
    const [votes, setVotes] = useState(BUILDS.reduce((a, b) => ({ ...a, [b.id]: b.votes }), {}));
    const [voted, setVoted] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', tagline: '', tech: '', demo: '', repo: '' });

    const handleVote = id => {
        if (voted[id]) return;
        setVotes(v => ({ ...v, [id]: v[id] + 1 }));
        setVoted(v => ({ ...v, [id]: true }));
    };

    return (
        <div className="page-wrap" style={{ maxWidth: 1280 }}>
            <div className="two-col">

                {/* ── LEFT ── */}
                <div>
                    {/* Hero */}
                    <div style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(204,151,255,0.06) 0%, rgba(83,221,252,0.04) 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: '36px 40px', marginBottom: 32, overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(204,151,255,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 12 }}>
                            PROJECT_<span className="accent-primary">SHOWCASE</span>
                        </h1>
                        <p style={{ color: 'var(--on-surface-var)', fontSize: 14, maxWidth: 500, lineHeight: 1.6 }}>Visualizing the next generation of kinetic logic. Direct from the student kernel.</p>
                    </div>

                    {/* Tabs + post button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {TABS.map(t => (
                                <button key={t} onClick={() => setActiveTab(t)} style={{
                                    padding: '6px 16px', borderRadius: 9999, fontFamily: 'var(--font-display)', fontSize: 11,
                                    fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', border: 'none',
                                    background: activeTab === t ? 'var(--primary)' : 'var(--surface-highest)',
                                    color: activeTab === t ? '#000' : 'var(--on-surface-var)',
                                    transition: 'all 0.14s',
                                }}>{t}</button>
                            ))}
                        </div>
                        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: 11, padding: '8px 18px', letterSpacing: '0.08em' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                            List Build
                        </button>
                    </div>

                    {/* Build cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {BUILDS.map((build, i) => {
                            const statusStyle = STATUS_STYLE[build.status] || STATUS_STYLE['BETA_V1.2'];
                            return (
                                <motion.div key={build.id} className="neon-card" style={{ padding: 24, display: 'flex', gap: 0 }}
                                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                    {/* Vote col */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 48, flexShrink: 0, marginRight: 16 }}>
                                        <button className="upvote-btn" onClick={() => handleVote(build.id)} style={voted[build.id] ? { background: 'rgba(204,151,255,0.15)', borderColor: 'rgba(204,151,255,0.4)' } : {}}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_less</span>
                                        </button>
                                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: voted[build.id] ? 'var(--primary)' : 'var(--on-surface)' }}>{votes[build.id]}</span>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>{build.name}</h3>
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: statusStyle.color, background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, borderRadius: 9999, padding: '2px 8px', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{build.status}</span>
                                                </div>
                                                <p style={{ color: 'var(--on-surface-var)', fontSize: 13, lineHeight: 1.5 }}>{build.tagline}</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                            {build.tech.map(t => <span key={t} className="code-chip">{t}</span>)}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--on-surface-var)', fontFamily: 'var(--font-display)' }}>
                                                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(204,151,255,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'var(--primary)' }}>{build.user[0].toUpperCase()}</span>
                                                    {build.user}
                                                </span>
                                                <span style={{ fontSize: 11, color: 'var(--outline)' }}>·</span>
                                                <span style={{ fontSize: 11, color: 'var(--on-surface-var)' }}>{build.batch}</span>
                                                <span style={{ fontSize: 11, color: 'var(--outline)' }}>·</span>
                                                <span style={{ fontSize: 11, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{build.time}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {build.repo && (
                                                    <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: 11 }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>code</span>
                                                        Repo
                                                    </button>
                                                )}
                                                {build.demo && (
                                                    <button className="btn-ghost-cyan" style={{ padding: '5px 14px', fontSize: 11 }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>rocket_launch</span>
                                                        Launch
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* ── RIGHT: Activity sidebar ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 80 }}>
                    <div className="neon-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <span className="eyebrow">Live Activity</span>
                            <span className="tag-secondary" style={{ fontSize: 9 }}>12 NODES ONLINE</span>
                        </div>
                        {ACTIVITY.map((a, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-highest)', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 12, marginBottom: 2 }}>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>{a.handle}</span>
                                        <span style={{ color: 'var(--on-surface-var)' }}> {a.action}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{a.detail}</div>
                                    <div style={{ fontSize: 10, color: 'var(--outline)', marginTop: 2 }}>{a.time}</div>
                                </div>
                            </div>
                        ))}
                        <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}>View Terminal Logs</button>
                    </div>

                    <div className="neon-card" style={{ padding: 20 }}>
                        <span className="eyebrow" style={{ display: 'block', marginBottom: 14 }}>Kernel Upgrades</span>
                        {KERNEL_UPGRADES.map((k, i) => (
                            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < KERNEL_UPGRADES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                                    <span className="tag-error" style={{ fontSize: 9 }}>{k.type}</span>
                                    <span style={{ fontSize: 10, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{k.date}</span>
                                </div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{k.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.5 }}>{k.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>List your <span className="accent-primary">Build</span></h2>
                        <p style={{ color: 'var(--on-surface-var)', fontSize: 13, marginBottom: 24 }}>Share what you're building with the community.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                            {[['name', 'Project Name (e.g. CAMPUS_GPT)'], ['tagline', 'One-line description'], ['tech', 'Tech stack (comma-separated)'], ['demo', 'Demo URL (optional)'], ['repo', 'GitHub repo (optional)']].map(([k, ph]) => (
                                <input key={k} className="neon-input" placeholder={ph} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: 12, fontSize: 11 }}>Deploy Build</button>
                            <button className="btn-secondary" onClick={() => setShowForm(false)} style={{ padding: '12px 20px' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
