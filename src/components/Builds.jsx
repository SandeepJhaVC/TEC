import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TECH_TAGS = ['All', 'Web App', 'Mobile', 'AI / ML', 'CLI Tool', 'API', 'Chrome Ext', 'Hardware'];

const STATUS_META = {
    'WIP': { color: '#e3b341', bg: 'rgba(227,179,65,0.12)', border: 'rgba(227,179,65,0.3)' },
    'BETA': { color: '#58a6ff', bg: 'rgba(88,166,255,0.12)', border: 'rgba(88,166,255,0.3)' },
    'LIVE': { color: '#3fb950', bg: 'rgba(63,185,80,0.12)', border: 'rgba(63,185,80,0.3)' },
};

const LOOKING_FOR_META = {
    'Testers': '#58a6ff',
    'Contributors': '#3fb950',
    'Co-founder': '#f09433',
    'Feedback': '#a78bfa',
    'Beta users': '#bc1888',
    'Investors': '#e3b341',
};

const mockBuilds = [
    {
        id: 1,
        name: 'StudySync',
        tagline: 'AI-powered timetable planner for UPES students',
        desc: 'Pulls your UPES portal schedule and auto-generates a personalized study plan using GPT. Sends reminders 24hr before exams.',
        builder: 'Priya M.',
        batch: 'BCA 3rd Year',
        tech: ['Web App', 'AI / ML'],
        stack: ['Next.js', 'OpenAI', 'Supabase'],
        status: 'BETA',
        lookingFor: ['Testers', 'Feedback'],
        demoUrl: 'https://studysync.demo',
        githubUrl: 'https://github.com/priyam/studysync',
        upvotes: 47,
        triedBy: 34,
        postedAt: '2 days ago',
    },
    {
        id: 2,
        name: 'PGFinder',
        tagline: 'Real-time PG availability tracker near Bidholi',
        desc: 'Scrapes local PG listings and shows vacancy, pricing, and amenities on a map. No more cold-calling 30 landlords.',
        builder: 'Rahul K.',
        batch: 'B.Tech CSE 4th Year',
        tech: ['Web App'],
        stack: ['React', 'Python', 'Leaflet'],
        status: 'WIP',
        lookingFor: ['Co-founder', 'Contributors'],
        demoUrl: '',
        githubUrl: 'https://github.com/rahulk/pgfinder',
        upvotes: 61,
        triedBy: 0,
        postedAt: '5 days ago',
    },
    {
        id: 3,
        name: 'ExamAlly',
        tagline: 'Peer exam prep — find study partners, share notes',
        desc: 'Students post which exams they are prepping for. Match with others in your batch, share notes, form study groups.',
        builder: 'Ananya R.',
        batch: 'B.Tech ECE 2nd Year',
        tech: ['Mobile', 'Web App'],
        stack: ['React Native', 'Firebase'],
        status: 'LIVE',
        lookingFor: ['Beta users', 'Feedback'],
        demoUrl: 'https://examally.app',
        githubUrl: '',
        upvotes: 88,
        triedBy: 120,
        postedAt: '3 weeks ago',
    },
    {
        id: 4,
        name: 'CampusGPT',
        tagline: 'Ask anything about UPES — courses, faculty, SAP portal',
        desc: 'Fine-tuned LLM on UPES handbooks and campus FAQs. Answers questions about deadlines, fee structure, portal guides.',
        builder: 'Dev A.',
        batch: 'MBA 1st Year',
        tech: ['AI / ML', 'Web App'],
        stack: ['Python', 'LangChain', 'FastAPI', 'React'],
        status: 'BETA',
        lookingFor: ['Testers', 'Co-founder'],
        demoUrl: 'https://campusgpt.demo',
        githubUrl: 'https://github.com/deva/campusgpt',
        upvotes: 54,
        triedBy: 67,
        postedAt: '1 week ago',
    },
    {
        id: 5,
        name: 'QuickMess',
        tagline: 'Mess menu aggregator for all campus hostels',
        desc: 'Pulls daily mess menus from hostel boards (manually updated by students), shows which mess has what today.',
        builder: 'Mohit V.',
        batch: 'B.Tech 3rd Year',
        tech: ['Web App', 'Mobile'],
        stack: ['Vue.js', 'Node.js', 'MongoDB'],
        status: 'WIP',
        lookingFor: ['Contributors', 'Testers'],
        demoUrl: '',
        githubUrl: 'https://github.com/mohitv/quickmess',
        upvotes: 29,
        triedBy: 0,
        postedAt: '4 days ago',
    },
    {
        id: 6,
        name: 'SplitIt',
        tagline: 'Auto bill-splitting for hostel roommates',
        desc: 'Track shared expenses (groceries, electricity, subscriptions). Monthly summary sent on WhatsApp. No signup needed.',
        builder: 'Kiran T.',
        batch: 'BBA 3rd Year',
        tech: ['Chrome Ext', 'Web App'],
        stack: ['Vanilla JS', 'Cloudflare Workers'],
        status: 'LIVE',
        lookingFor: ['Feedback', 'Beta users'],
        demoUrl: 'https://splitit.dev',
        githubUrl: 'https://github.com/kirant/splitit',
        upvotes: 73,
        triedBy: 89,
        postedAt: '2 months ago',
    },
];

const emptyForm = {
    name: '', tagline: '', desc: '', builder: '', batch: '', stack: '',
    demoUrl: '', githubUrl: '', status: 'WIP', lookingFor: [], tech: [],
};

const SORT_OPTIONS = ['Top Voted', 'Newest', 'Most Tried'];

export default function Builds() {
    const [activeTech, setActiveTech] = useState('All');
    const [sort, setSort] = useState('Top Voted');
    const [builds, setBuilds] = useState(mockBuilds);
    const [upvoted, setUpvoted] = useState({});
    const [tried, setTried] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [expand, setExpand] = useState(null);

    const toggleUpvote = (e, id) => {
        e.stopPropagation();
        setUpvoted(u => ({ ...u, [id]: !u[id] }));
    };

    const toggleTried = (e, id) => {
        e.stopPropagation();
        setTried(t => ({ ...t, [id]: !t[id] }));
    };

    const toggleLookingFor = (tag) => {
        setForm(f => ({
            ...f,
            lookingFor: f.lookingFor.includes(tag)
                ? f.lookingFor.filter(t => t !== tag)
                : [...f.lookingFor, tag],
        }));
    };

    const toggleTechTag = (tag) => {
        setForm(f => ({
            ...f,
            tech: f.tech.includes(tag)
                ? f.tech.filter(t => t !== tag)
                : [...f.tech, tag],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newBuild = {
            ...form,
            id: Date.now(),
            stack: form.stack.split(',').map(s => s.trim()).filter(Boolean),
            upvotes: 0,
            triedBy: 0,
            postedAt: 'Just now',
        };
        setBuilds([newBuild, ...builds]);
        setForm(emptyForm);
        setShowForm(false);
    };

    let filtered = activeTech === 'All'
        ? builds
        : builds.filter(b => b.tech && b.tech.includes(activeTech));

    if (sort === 'Top Voted') filtered = [...filtered].sort((a, b) => (b.upvotes + (upvoted[b.id] ? 1 : 0)) - (a.upvotes + (upvoted[a.id] ? 1 : 0)));
    if (sort === 'Most Tried') filtered = [...filtered].sort((a, b) => (b.triedBy + (tried[b.id] ? 1 : 0)) - (a.triedBy + (tried[a.id] ? 1 : 0)));

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', padding: '60px 24px 80px' }}>
            <style>{`
        .build-card { transition: border-color 0.18s, box-shadow 0.18s; }
        .build-card:hover { border-color: #a78bfa !important; box-shadow: 0 0 0 1px rgba(167,139,250,0.2); }
        .upvote-btn:hover { border-color: #3fb950 !important; color: #3fb950 !important; background: rgba(63,185,80,0.08) !important; }
        .try-btn:hover { border-color: #58a6ff !important; color: #58a6ff !important; background: rgba(88,166,255,0.08) !important; }
        .filter-chip { transition: all 0.14s; cursor: pointer; }
        .filter-chip:hover { border-color: #a78bfa !important; color: #a78bfa !important; }
      `}</style>

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                        <div>
                            <span style={{ display: 'inline-block', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', marginBottom: 14 }}>STUDENT BUILDS</span>
                            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#e6edf3', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 10 }}>
                                What students are building
                            </h1>
                            <p style={{ color: '#8b949e', fontSize: 15, maxWidth: 520, lineHeight: 1.6 }}>
                                Real projects by real students. Try beta products, give feedback, find co-founders, or share what you are building.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-ig"
                            style={{ fontSize: 14, padding: '10px 22px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                            + List your build
                        </button>
                    </div>
                </motion.div>

                {/* Filters + Sort row */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {TECH_TAGS.map(tag => (
                            <button key={tag} className="filter-chip" onClick={() => setActiveTech(tag)} style={{
                                padding: '5px 13px', borderRadius: 6,
                                border: `1px solid ${activeTech === tag ? '#a78bfa' : '#30363d'}`,
                                background: activeTech === tag ? 'rgba(167,139,250,0.12)' : 'transparent',
                                color: activeTech === tag ? '#a78bfa' : '#8b949e',
                                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                            }}>
                                {tag}
                                {tag !== 'All' && (
                                    <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.6 }}>
                                        {builds.filter(b => b.tech && b.tech.includes(tag)).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {SORT_OPTIONS.map(opt => (
                            <button key={opt} onClick={() => setSort(opt)} style={{
                                padding: '5px 12px', borderRadius: 6,
                                border: `1px solid ${sort === opt ? '#30363d' : '#21262d'}`,
                                background: sort === opt ? '#21262d' : 'transparent',
                                color: sort === opt ? '#e6edf3' : '#8b949e',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            }}>{opt}</button>
                        ))}
                    </div>
                </motion.div>

                {/* Build cards — Product Hunt style with upvote on left */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map((build, i) => {
                        const sm = STATUS_META[build.status] || STATUS_META['WIP'];
                        const votes = build.upvotes + (upvoted[build.id] ? 1 : 0);
                        const triedCount = build.triedBy + (tried[build.id] ? 1 : 0);
                        const isExpanded = expand === build.id;

                        return (
                            <motion.div key={build.id}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            >
                                <div className="build-card" onClick={() => setExpand(isExpanded ? null : build.id)}
                                    style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '18px 20px', cursor: 'pointer', display: 'flex', gap: 18, alignItems: 'flex-start' }}>

                                    {/* Upvote column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                        <button className="upvote-btn" onClick={(e) => toggleUpvote(e, build.id)} style={{
                                            width: 44, height: 44, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            background: upvoted[build.id] ? 'rgba(63,185,80,0.12)' : '#0d1117',
                                            border: `1px solid ${upvoted[build.id] ? '#3fb950' : '#30363d'}`,
                                            color: upvoted[build.id] ? '#3fb950' : '#8b949e',
                                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                            fontSize: 10, fontWeight: 800, letterSpacing: '0.02em', gap: 1,
                                        }}>
                                            <span style={{ fontSize: 14, lineHeight: 1 }}>{upvoted[build.id] ? '▲' : '△'}</span>
                                            <span>{votes}</span>
                                        </button>
                                    </div>

                                    {/* Card body */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#e6edf3', lineHeight: 1 }}>{build.name}</h3>
                                                    <span style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}>{build.status}</span>
                                                    {build.tech && build.tech.map(t => (
                                                        <span key={t} style={{ background: '#21262d', color: '#8b949e', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 600, border: '1px solid #30363d' }}>{t}</span>
                                                    ))}
                                                </div>
                                                <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.4 }}>{build.tagline}</p>
                                            </div>
                                            <div style={{ fontSize: 11, color: '#484f58', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{build.postedAt}</div>
                                        </div>

                                        {/* Expandable description */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                                    <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.65, marginBottom: 14, marginTop: 10 }}>{build.desc}</p>
                                                    {build.stack && build.stack.length > 0 && (
                                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                                            <span style={{ fontSize: 11, color: '#484f58', fontWeight: 600, marginRight: 4, alignSelf: 'center' }}>STACK</span>
                                                            {build.stack.map(s => (
                                                                <span key={s} className="code-chip" style={{ fontSize: 11 }}>{s}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Footer row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: isExpanded ? 0 : 10 }}>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {build.lookingFor && build.lookingFor.map(tag => (
                                                    <span key={tag} style={{
                                                        background: `${LOOKING_FOR_META[tag] || '#8b949e'}18`,
                                                        color: LOOKING_FOR_META[tag] || '#8b949e',
                                                        border: `1px solid ${LOOKING_FOR_META[tag] || '#8b949e'}40`,
                                                        borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                                                    }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span style={{ fontSize: 11, color: '#484f58' }}>
                                                    {triedCount > 0 ? `${triedCount} tried it` : 'Be first to try'}
                                                </span>
                                                {build.demoUrl && (
                                                    <button className="try-btn" onClick={(e) => { e.stopPropagation(); window.open(build.demoUrl, '_blank', 'noopener'); }}
                                                        style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #30363d', background: 'transparent', color: '#8b949e', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                                        Try it
                                                    </button>
                                                )}
                                                {!build.demoUrl && build.status === 'WIP' && (
                                                    <button className="try-btn" onClick={(e) => toggleTried(e, build.id)}
                                                        style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #30363d', background: tried[build.id] ? 'rgba(88,166,255,0.1)' : 'transparent', color: tried[build.id] ? '#58a6ff' : '#8b949e', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                                        {tried[build.id] ? 'Watching' : 'Watch WIP'}
                                                    </button>
                                                )}
                                                {build.githubUrl && (
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(build.githubUrl, '_blank', 'noopener'); }}
                                                        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #30363d', background: 'transparent', color: '#8b949e', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.15s' }}>
                                                        GitHub
                                                    </button>
                                                )}
                                                <span style={{ fontSize: 11, color: '#484f58' }}>{build.builder} · {build.batch}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px 24px', color: '#484f58' }}>
                        <div style={{ fontSize: 13, marginBottom: 16 }}>No builds in this category yet.</div>
                        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: 13 }}>Be the first to list one</button>
                    </div>
                )}
            </div>

            {/* Post Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24, backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '28px 28px 24px', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>

                            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3', marginBottom: 4 }}>List your build</h2>
                            <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 24 }}>Share what you are building so other students can try it, give feedback, or collaborate.</p>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>PROJECT NAME</label>
                                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. StudySync"
                                            className="gh-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>STATUS</label>
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="gh-select" style={{ width: '100%', boxSizing: 'border-box' }}>
                                            <option value="WIP">WIP — In Development</option>
                                            <option value="BETA">BETA — Testing</option>
                                            <option value="LIVE">LIVE — Shipped</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>ONE-LINE TAGLINE</label>
                                    <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} required placeholder="e.g. AI timetable planner for UPES students"
                                        className="gh-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
                                    <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} required rows={3}
                                        placeholder="What does it do? What problem does it solve?"
                                        className="gh-input" style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box' }} />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>CATEGORY</label>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {TECH_TAGS.filter(t => t !== 'All').map(tag => (
                                            <button key={tag} type="button" onClick={() => toggleTechTag(tag)} style={{
                                                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                                border: `1px solid ${form.tech.includes(tag) ? '#a78bfa' : '#30363d'}`,
                                                background: form.tech.includes(tag) ? 'rgba(167,139,250,0.12)' : 'transparent',
                                                color: form.tech.includes(tag) ? '#a78bfa' : '#8b949e',
                                            }}>{tag}</button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>TECH STACK <span style={{ fontWeight: 400, color: '#484f58' }}>(comma-separated)</span></label>
                                    <input value={form.stack} onChange={e => setForm({ ...form, stack: e.target.value })} placeholder="e.g. React, Node.js, Supabase"
                                        className="gh-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>LOOKING FOR</label>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {Object.keys(LOOKING_FOR_META).map(tag => (
                                            <button key={tag} type="button" onClick={() => toggleLookingFor(tag)} style={{
                                                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                                border: `1px solid ${form.lookingFor.includes(tag) ? LOOKING_FOR_META[tag] : '#30363d'}`,
                                                background: form.lookingFor.includes(tag) ? `${LOOKING_FOR_META[tag]}18` : 'transparent',
                                                color: form.lookingFor.includes(tag) ? LOOKING_FOR_META[tag] : '#8b949e',
                                            }}>{tag}</button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>DEMO URL <span style={{ fontWeight: 400, color: '#484f58' }}>(optional)</span></label>
                                        <input value={form.demoUrl} onChange={e => setForm({ ...form, demoUrl: e.target.value })} placeholder="https://..."
                                            className="gh-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>GITHUB <span style={{ fontWeight: 400, color: '#484f58' }}>(optional)</span></label>
                                        <input value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..."
                                            className="gh-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                                    <div>
                                        <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>YOUR NAME</label>
                                        <input value={form.builder} onChange={e => setForm({ ...form, builder: e.target.value })} required placeholder="Name"
                                            className="gh-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, color: '#8b949e', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>BATCH / YEAR</label>
                                        <input value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="e.g. B.Tech CSE 3rd Year"
                                            className="gh-input" style={{ width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="submit" className="btn-ig" style={{ flex: 1, padding: '11px', textAlign: 'center', fontSize: 14, fontWeight: 700 }}>List Build</button>
                                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '11px 20px', fontSize: 14 }}>Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
