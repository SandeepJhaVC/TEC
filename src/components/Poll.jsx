import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const areas = ['Pondha', 'Bidholi', 'Premnagar', 'Sahastradhara', 'Raipur'];
const areaColors = { Pondha: '#58a6ff', Bidholi: '#3fb950', Premnagar: '#e3b341', Sahastradhara: '#58a6ff', Raipur: '#f85149' };

const initialProblems = [
    { id: 1, area: 'Bidholi', title: 'No reliable bus service to campus after 8 PM', category: 'Transport', votes: 142, upvoted: false, comments: 23, status: 'In Review', urgent: true },
    { id: 2, area: 'Pondha', title: 'No 24-hour pharmacy near campus gate', category: 'Healthcare', votes: 97, upvoted: false, comments: 11, status: 'Submitted', urgent: false },
    { id: 3, area: 'Bidholi', title: 'ATM runs out of cash every Friday evening', category: 'Banking', votes: 218, upvoted: false, comments: 45, status: 'Forwarded', urgent: true },
    { id: 4, area: 'Premnagar', title: 'No clean public drinking water near college area', category: 'Infrastructure', votes: 185, upvoted: false, comments: 30, status: 'In Review', urgent: false },
    { id: 5, area: 'Sahastradhara', title: 'Overcharging by local auto-rickshaws at night', category: 'Transport', votes: 76, upvoted: false, comments: 19, status: 'Submitted', urgent: false },
    { id: 6, area: 'Bidholi', title: 'Stray dog menace on main road after 10 PM', category: 'Safety', votes: 163, upvoted: false, comments: 38, status: 'In Review', urgent: true },
    { id: 7, area: 'Raipur', title: 'No proper street lighting between campus and market', category: 'Safety', votes: 201, upvoted: false, comments: 27, status: 'Forwarded', urgent: true },
    { id: 8, area: 'Pondha', title: 'Overpriced PGs with no standard contract — need regulation', category: 'Housing', votes: 134, upvoted: false, comments: 52, status: 'Submitted', urgent: false },
    { id: 9, area: 'Bidholi', title: 'Slow campus WiFi speeds during peak hours', category: 'Technology', votes: 289, upvoted: false, comments: 61, status: 'In Review', urgent: false },
    { id: 10, area: 'Sahastradhara', title: 'No waste segregation — garbage dumped near residential PGs', category: 'Environment', votes: 58, upvoted: false, comments: 14, status: 'Submitted', urgent: false },
    { id: 11, area: 'Premnagar', title: 'Flooding on main road during monsoon — dangerous for bikes', category: 'Infrastructure', votes: 177, upvoted: false, comments: 33, status: 'Forwarded', urgent: true },
    { id: 12, area: 'Raipur', title: 'Lack of affordable and clean food options for non-veg students', category: 'Food', votes: 93, upvoted: false, comments: 21, status: 'Submitted', urgent: false },
];

const categories = ['All', 'Transport', 'Healthcare', 'Banking', 'Infrastructure', 'Safety', 'Housing', 'Technology', 'Environment', 'Food'];
const catColors = { Transport: '#58a6ff', Healthcare: '#3fb950', Banking: '#e3b341', Infrastructure: '#8b949e', Safety: '#f85149', Housing: '#e3b341', Technology: '#58a6ff', Environment: '#3fb950', Food: '#bc1888' };

const activePolls = [
    {
        id: 1, title: 'What is your BIGGEST daily challenge as a student in Dehradun?',
        options: [
            { label: 'Transport & commute', votes: 312 },
            { label: 'Affordable food', votes: 198 },
            { label: 'Finding safe PGs', votes: 245 },
            { label: 'Campus WiFi & tech', votes: 167 },
            { label: 'Night-time safety', votes: 220 },
        ],
        totalVotes: 1142, area: 'All Areas', active: true,
    },
    {
        id: 2, title: 'Would you use a student-only bus service between Pondha and Bidholi (₹20/trip)?',
        options: [
            { label: 'Yes, absolutely!', votes: 489 },
            { label: 'Yes, but needs to be cheaper', votes: 223 },
            { label: 'Maybe', votes: 87 },
            { label: 'No, I have alternatives', votes: 41 },
        ],
        totalVotes: 840, area: 'All Areas', active: true,
    },
];

const statusColors = { 'Submitted': '#475569', 'In Review': '#f59e0b', 'Forwarded': '#06d6a0', 'Resolved': '#10b981' };

const emptyForm = { title: '', area: 'Bidholi', category: 'Transport', desc: '' };

export default function Poll() {
    const [problems, setProblems] = useState(initialProblems);
    const [polls, setPolls] = useState(activePolls.map(p => ({ ...p, voted: null })));
    const [activeArea, setActiveArea] = useState('All');
    const [activeCat, setActiveCat] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [sort, setSort] = useState('votes');

    const handleVote = (id) => {
        setProblems(prev => prev.map(p => {
            if (p.id !== id) return p;
            const wasVoted = p.upvoted;
            return { ...p, votes: wasVoted ? p.votes - 1 : p.votes + 1, upvoted: !wasVoted };
        }));
    };

    const handlePollVote = (pollId, optIdx) => {
        setPolls(prev => prev.map(p => {
            if (p.id !== pollId || p.voted !== null) return p;
            const newOpts = p.options.map((o, i) => i === optIdx ? { ...o, votes: o.votes + 1 } : o);
            return { ...p, options: newOpts, totalVotes: p.totalVotes + 1, voted: optIdx };
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newP = { ...form, id: Date.now(), votes: 1, upvoted: false, comments: 0, status: 'Submitted', urgent: false };
        setProblems([newP, ...problems]);
        setForm(emptyForm);
        setShowForm(false);
    };

    let filtered = problems.filter(p => (activeArea === 'All' || p.area === activeArea) && (activeCat === 'All' || p.category === activeCat));
    if (sort === 'votes') filtered = [...filtered].sort((a, b) => b.votes - a.votes);
    if (sort === 'recent') filtered = [...filtered].reverse();

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', padding: '60px 24px 80px' }}>
            <style>{`
        .prob-card:hover { border-color: #58a6ff !important; transform: translateY(-2px); }
        .prob-card { transition: border-color 0.2s, transform 0.2s; }
        .vote-btn:hover { background: rgba(88,166,255,0.15) !important; }
        .poll-opt:hover { background: rgba(88,166,255,0.06) !important; }
      `}</style>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 48 }}>
                    <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>COMMUNITY VOICE</span>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Voice Your Problems 🗳️</h1>
                    <p style={{ color: '#64748b', fontSize: 16, maxWidth: 560, margin: '0 auto 28px' }}>Vote on real problems students face in each area. The most upvoted issues get forwarded to local authorities and NGOs.</p>
                    <button onClick={() => setShowForm(true)} style={{ padding: '9px 22px', background: '#238636', border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        + Report a Problem
                    </button>
                </motion.div>

                {/* Active Polls */}
                <section style={{ marginBottom: 56 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📊 Active Polls</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
                        {polls.map((poll) => {
                            const max = Math.max(...poll.options.map(o => o.votes));
                            return (
                                <motion.div key={poll.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '24px' }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, lineHeight: 1.4 }}>{poll.title}</h3>
                                    {poll.options.map((opt, i) => {
                                        const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                                        const isVoted = poll.voted === i;
                                        return (
                                            <div key={i} className="poll-opt" onClick={() => handlePollVote(poll.id, i)}
                                                style={{ background: 'rgba(88,166,255,0.03)', border: `1px solid ${isVoted ? '#58a6ff' : '#30363d'}`, borderRadius: 6, padding: '10px 14px', marginBottom: 8, cursor: poll.voted === null ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', inset: 0, background: isVoted ? 'rgba(88,166,255,0.1)' : `rgba(88,166,255,0.03)`, width: `${poll.voted !== null ? pct : 0}%`, transition: 'width 0.5s ease', borderRadius: 5 }} />
                                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                                    <span style={{ color: isVoted ? '#58a6ff' : '#8b949e', fontWeight: isVoted ? 700 : 400 }}>{isVoted ? '\u2713 ' : ''}{opt.label}</span>
                                                    {poll.voted !== null && <span style={{ color: '#64748b', fontWeight: 600 }}>{pct}%</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div style={{ fontSize: 12, color: '#475569', marginTop: 10 }}>{poll.totalVotes.toLocaleString()} total votes • {poll.area}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Problem statements */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700 }}>🔎 Problem Statements</h2>
                        <select value={sort} onChange={e => setSort(e.target.value)} className="gh-select">
                            <option value="votes" style={{ background: '#161b22' }}>Most Upvoted</option>
                            <option value="recent" style={{ background: '#161b22' }}>Most Recent</option>
                        </select>
                    </div>

                    {/* Area filter */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                        {['All', ...areas].map(a => (
                            <button key={a} onClick={() => setActiveArea(a)} style={{
                                padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                border: `1px solid ${activeArea === a ? (areaColors[a] || '#58a6ff') : '#30363d'}`,
                                background: activeArea === a ? `${areaColors[a] || '#58a6ff'}20` : 'transparent',
                                color: activeArea === a ? (areaColors[a] || '#58a6ff') : '#8b949e', fontFamily: 'inherit',
                            }}>📍 {a}</button>
                        ))}
                    </div>

                    {/* Category filter */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                        {categories.map(c => (
                            <button key={c} onClick={() => setActiveCat(c)} style={{
                                padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: `1px solid ${activeCat === c ? (catColors[c] || '#58a6ff') : '#30363d'}`,
                                background: activeCat === c ? `${catColors[c] || '#58a6ff'}15` : 'transparent',
                                color: activeCat === c ? (catColors[c] || '#58a6ff') : '#8b949e', fontFamily: 'inherit',
                            }}>{c}</button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {filtered.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                <div className="prob-card" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '20px', display: 'flex', gap: 16 }}>
                                    {/* Vote */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
                                        <button className="vote-btn" onClick={() => handleVote(p.id)} style={{
                                            width: 44, height: 44, borderRadius: 6, border: `1px solid ${p.upvoted ? '#58a6ff' : '#30363d'}`,
                                            background: p.upvoted ? 'rgba(88,166,255,0.15)' : '#21262d',
                                            color: p.upvoted ? '#58a6ff' : '#8b949e', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>▲</button>
                                        <span style={{ fontSize: 16, fontWeight: 800, color: p.upvoted ? '#58a6ff' : '#e6edf3' }}>{p.votes}</span>
                                    </div>
                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {p.urgent && <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 5, padding: '1px 7px', marginBottom: 6, display: 'inline-block' }}>URGENT</span>}
                                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4, marginBottom: 8 }}>{p.title}</h3>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, background: `${areaColors[p.area]}20`, color: areaColors[p.area], border: `1px solid ${areaColors[p.area]}40`, borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>📍 {p.area}</span>
                                            <span style={{ fontSize: 11, background: `${catColors[p.category] || '#47556920'}20`, color: catColors[p.category] || '#64748b', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>{p.category}</span>
                                            <span style={{ fontSize: 11, background: `${statusColors[p.status]}22`, color: statusColors[p.status], border: `1px solid ${statusColors[p.status]}44`, borderRadius: 5, padding: '2px 8px', fontWeight: 700, marginLeft: 'auto' }}>{p.status}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>💬 {p.comments} comments</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Submit modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Report a Problem 📢</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>AREA</label>
                                        <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="gh-select" style={{ width: '100%' }}>
                                            {areas.map(a => <option key={a} value={a} style={{ background: '#161b22' }}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>CATEGORY</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="gh-select" style={{ width: '100%' }}>
                                            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} style={{ background: '#161b22' }}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>PROBLEM TITLE</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Describe the problem in one line..."
                                        className="gh-input" style={{ width: '100%' }} />
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>DETAILS (optional)</label>
                                    <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} placeholder="More context, location details, how often it happens..."
                                        className="gh-input" style={{ width: '100%', resize: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}>Submit Problem</button>
                                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
