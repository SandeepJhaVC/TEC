import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All', 'Books', 'Tutoring', 'Project Partners', 'Part-time Jobs', 'Buy/Sell', 'Lost & Found'];
const catColors = { Books: '#58a6ff', Tutoring: '#3fb950', 'Project Partners': '#58a6ff', 'Part-time Jobs': '#e3b341', 'Buy/Sell': '#f85149', 'Lost & Found': '#bc1888' };

const mockListings = [
    { id: 1, cat: 'Books', title: 'Data Structures & Algorithms — Cormen', desc: 'Selling CLRS 3rd edition, barely used. Highlights on first 3 chapters only. Pick up from Bidholi.', price: '\u20B9450 (orig \u20B91,200)', poster: 'Arjun S.', batch: 'B.Tech 3rd Year', time: '2 hours ago', urgent: true, upvotes: 12 },
    { id: 2, cat: 'Tutoring', title: 'Need Python tutor for Data Science project', desc: 'Final year project on ML — need help with pandas, sklearn. 3-4 sessions needed. Remote or in-person.', price: 'Negotiable', poster: 'Priya M.', batch: 'BCA 2nd Year', time: '5 hours ago', urgent: false, upvotes: 7 },
    { id: 3, cat: 'Project Partners', title: 'Looking for 2 partners for Smart India Hackathon', desc: 'Team of 2 needs a designer and a backend dev. Theme: HealthTech. Submit by Sept 30.', price: 'Free', poster: 'Rahul K.', batch: 'B.Tech CSE 4th Year', time: '1 day ago', urgent: true, upvotes: 24 },
    { id: 4, cat: 'Part-time Jobs', title: 'Content writer for tech blog — WFH', desc: '2-3 articles/week on tech topics. \u20B9300 per 1000 words. Need basic knowledge of technology trends.', price: '\u20B92,000\u20134,000/mo', poster: 'TechBlog.in', batch: 'Company', time: '3 hours ago', urgent: false, upvotes: 5 },
    { id: 5, cat: 'Buy/Sell', title: 'Selling HP Victus Gaming Laptop', desc: '11th Gen i5, 16GB RAM, GTX 1650, barely 8 months old. Selling because I switched to Mac. Perfect condition.', price: '\u20B952,000', poster: 'Vivek P.', batch: 'MCA 1st Year', time: '6 hours ago', urgent: true, upvotes: 31 },
    { id: 6, cat: 'Books', title: 'Physics for Engineers — HC Verma', desc: 'Vol 1 and Vol 2 both available. Some pencil markings inside. Great for first-year physics subjects.', price: '\u20B9200 for both', poster: 'Ananya R.', batch: 'B.Tech 2nd Year', time: '1 day ago', urgent: false, upvotes: 9 },
    { id: 7, cat: 'Tutoring', title: 'Offering Economics tutor sessions', desc: 'Scored 9.2 CGPA in Economics subjects. Offering individual sessions for management students. 1hr/session.', price: '\u20B9200/hr', poster: 'Kiran T.', batch: 'BBA 3rd Year', time: '2 days ago', urgent: false, upvotes: 14 },
    { id: 8, cat: 'Lost & Found', title: 'FOUND: Airpods Pro near Library Block', desc: 'Found white Airpods Pro case (with one pod) near the library on Tuesday. DM to identify and collect.', price: 'Free', poster: 'Admin TEC', batch: 'Community', time: '3 days ago', urgent: false, upvotes: 18 },
    { id: 9, cat: 'Part-time Jobs', title: 'Food delivery gig — Zomato/Swiggy', desc: 'Earn \u20B9400\u2013600/day. Flexible hours, perfect for students. Need a bike. 3\u20134 hours commitment daily.', price: '\u20B9400\u2013600/day', poster: 'Placement Cell', batch: 'Campus', time: '4 hours ago', urgent: true, upvotes: 22 },
    { id: 10, cat: 'Project Partners', title: 'UI/UX Designer for app startup idea', desc: 'Have a validated startup idea in edtech space. Need co-founder who can design. Equity-based collaboration.', price: 'Equity', poster: 'Dev A.', batch: 'MBA 1st Year', time: '12 hours ago', urgent: false, upvotes: 37 },
    { id: 11, cat: 'Buy/Sell', title: 'Scientific Calculator — Casio FX-991ES', desc: 'Selling my scientific calculator in mint condition. Comes with manual and original cover. No defects.', price: '\u20B9550', poster: 'Sneha B.', batch: 'B.Sc Physics 1st Year', time: '2 days ago', urgent: false, upvotes: 3 },
    { id: 12, cat: 'Lost & Found', title: 'LOST: Grey hoodie at TEC event venue', desc: 'Lost my grey UPES hoodie at the last hackathon. Has my name written inside. Please reach out if found.', price: '', poster: 'Mohit V.', batch: 'B.Tech 3rd Year', time: '1 day ago', urgent: false, upvotes: 8 },
];

const emptyForm = { title: '', cat: 'Books', desc: '', price: '', poster: '', urgent: false };

export default function Assignments() {
    const [active, setActive] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [listings, setListings] = useState(mockListings);
    const [expand, setExpand] = useState(null);
    const [upvoted, setUpvoted] = useState({});

    const filtered = active === 'All' ? listings : listings.filter(l => l.cat === active);

    const handlePost = (e) => {
        e.preventDefault();
        const newPost = { ...form, id: Date.now(), time: 'Just now', batch: 'Student' };
        setListings([newPost, ...listings]);
        setForm(emptyForm);
        setShowForm(false);
    };

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', padding: '60px 24px 80px' }}>
            <style>{`
        .assignment-card:hover { border-color: #58a6ff !important; transform: translateY(-2px); }
        .assignment-card { transition: border-color 0.2s, transform 0.2s; }
        .post-btn:hover { opacity: 0.9; transform: translateY(-1px) !important; }
        .upvote-pill:hover { border-color: #3fb950 !important; color: #3fb950 !important; background: rgba(63,185,80,0.08) !important; }
      `}</style>

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 48 }}>
                    <span style={{ display: 'inline-block', background: 'rgba(88,166,255,0.1)', color: '#58a6ff', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', marginBottom: 14 }}>STUDENT BOARD</span>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginTop: 0, marginBottom: 10, letterSpacing: '-0.03em', color: '#e6edf3' }}>Campus Exchange</h1>
                    <p style={{ color: '#8b949e', fontSize: 15, maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.6 }}>Buy/sell books, find project partners, grab part-time gigs — all peer-to-peer within your campus.</p>

                    <button className="post-btn" onClick={() => setShowForm(true)} style={{ padding: '9px 22px', background: '#238636', border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        + Post a Listing
                    </button>
                </motion.div>

                {/* Category filters */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActive(cat)} style={{
                            padding: '6px 14px', borderRadius: 6,
                            border: `1px solid ${active === cat ? (catColors[cat] || '#58a6ff') : '#30363d'}`,
                            background: active === cat ? `${catColors[cat] || '#58a6ff'}22` : 'transparent',
                            color: active === cat ? (catColors[cat] || '#58a6ff') : '#8b949e',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                            {cat}
                            {cat !== 'All' && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{listings.filter(l => l.cat === cat).length}</span>}
                        </button>
                    ))}
                </motion.div>

                {/* Listings grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
                    {filtered.map((item, i) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                            <div className="assignment-card" onClick={() => setExpand(expand === item.id ? null : item.id)}
                                style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '20px', cursor: 'pointer', position: 'relative' }}>
                                {item.urgent && (
                                    <span style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>URGENT</span>
                                )}
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: catColors[item.cat] || '#58a6ff', letterSpacing: '0.07em', background: `${catColors[item.cat] || '#58a6ff'}18`, border: `1px solid ${catColors[item.cat] || '#58a6ff'}33`, borderRadius: 4, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{item.cat}</span>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', lineHeight: 1.3 }}>{item.title}</h3>
                                </div>

                                <AnimatePresence>
                                    {expand === item.id && (
                                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12, overflow: 'hidden' }}>
                                            {item.desc}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                {expand !== item.id && (
                                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 12, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</p>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: '#3fb950' }}>{item.price}</div>
                                        <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>{item.poster} · {item.batch}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <button className="upvote-pill" onClick={e => { e.stopPropagation(); setUpvoted(u => ({ ...u, [item.id]: !u[item.id] })); }}
                                            style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${upvoted[item.id] ? '#3fb950' : '#30363d'}`, background: upvoted[item.id] ? 'rgba(63,185,80,0.1)' : 'transparent', color: upvoted[item.id] ? '#3fb950' : '#8b949e', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                            {upvoted[item.id] ? '▲' : '△'} {(item.upvotes || 0) + (upvoted[item.id] ? 1 : 0)}
                                        </button>
                                        <div style={{ fontSize: 11, color: '#484f58' }}>{item.time}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Post Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Post a Listing</h2>
                            <form onSubmit={handlePost}>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>CATEGORY</label>
                                    <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })} required
                                        className="gh-select" style={{ width: '100%' }}>
                                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} style={{ background: '#161b22' }}>{c}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>TITLE</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Selling CLRS textbook"
                                        className="gh-input" style={{ width: '100%' }} />
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
                                    <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} required rows={3} placeholder="Add details..."
                                        className="gh-input" style={{ width: '100%', resize: 'none' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>PRICE / RATE</label>
                                        <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. \u20B9500 or Free"
                                            className="gh-input" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>YOUR NAME</label>
                                        <input value={form.poster} onChange={e => setForm({ ...form, poster: e.target.value })} required placeholder="Name"
                                            className="gh-input" style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.urgent} onChange={e => setForm({ ...form, urgent: e.target.checked })} />
                                    Mark as Urgent
                                </label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}>Post Listing</button>
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
