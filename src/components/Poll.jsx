import React, { useState } from "react";
import { motion } from "framer-motion";

const AREAS = ["All", "Pondha", "Bidholi", "Premnagar", "Sahastradhara", "Raipur"];
const CATS = ["All", "Transport", "Healthcare", "Banking", "Infrastructure", "Safety", "Housing", "Technology", "Environment", "Food"];

const AREA_COLOR = { Pondha: "var(--secondary)", Bidholi: "var(--primary)", Premnagar: "#e3b341", Sahastradhara: "var(--tertiary)", Raipur: "var(--error)" };

const INIT_PROBLEMS = [
    { id: 1, area: "Bidholi", title: "No direct auto-rickshaw route to Railway Station", cat: "Transport", votes: 234, upvoted: false, comments: 45, status: "In Review", urgent: true },
    { id: 2, area: "Pondha", title: "Street lights broken on main road — safety risk after 9PM", cat: "Safety", votes: 189, upvoted: false, comments: 32, status: "Forwarded", urgent: true },
    { id: 3, area: "Premnagar", title: "No 24hr ATM near student residential area", cat: "Banking", votes: 156, upvoted: false, comments: 28, status: "Submitted", urgent: false },
    { id: 4, area: "Bidholi", title: "Pothole on entry road causing bike accidents", cat: "Infrastructure", votes: 143, upvoted: false, comments: 19, status: "In Review", urgent: false },
    { id: 5, area: "Sahastradhara", title: "No pharmacy open past 8PM on weekends", cat: "Healthcare", votes: 121, upvoted: false, comments: 14, status: "Submitted", urgent: false },
    { id: 6, area: "Raipur", title: "Shortage of budget accommodation causing overcrowding in PGs", cat: "Housing", votes: 110, upvoted: false, comments: 37, status: "Resolved", urgent: false },
    { id: 7, area: "Pondha", title: "Unstable college WiFi in off-campus zones", cat: "Technology", votes: 98, upvoted: false, comments: 22, status: "In Review", urgent: false },
    { id: 8, area: "Bidholi", title: "No waste disposal bins along main shopping street", cat: "Environment", votes: 87, upvoted: false, comments: 11, status: "Submitted", urgent: false },
    { id: 9, area: "Premnagar", title: "No public transport connectivity after 10PM", cat: "Transport", votes: 76, upvoted: false, comments: 16, status: "Forwarded", urgent: false },
    { id: 10, area: "Sahastradhara", title: "Traffic congestion near campus gate every morning", cat: "Transport", votes: 65, upvoted: false, comments: 9, status: "Submitted", urgent: false },
    { id: 11, area: "Bidholi", title: "No proper pedestrian crossings near market area", cat: "Infrastructure", votes: 54, upvoted: false, comments: 7, status: "Submitted", urgent: false },
    { id: 12, area: "Raipur", title: "Lack of clean non-veg affordable food options", cat: "Food", votes: 93, upvoted: false, comments: 21, status: "Submitted", urgent: false },
];

const ACTIVE_POLLS = [
    {
        id: 1, q: "Which campus feature do you want TEC to build next?", totalVotes: 428,
        options: [{ text: "Carpooling board", votes: 148 }, { text: "Live classroom updates", votes: 127 }, { text: "Internship board", votes: 103 }, { text: "Mess menu planner", votes: 50 }]
    },
    {
        id: 2, q: "Most urgent infrastructure issue in Bidholi?", totalVotes: 312,
        options: [{ text: "Better streetlights", votes: 145 }, { text: "Footpaths on main road", votes: 102 }, { text: "More roundabouts", votes: 65 }]
    },
];

const STATUS_STYLE = {
    "Submitted": { color: "var(--on-surface-var)", bg: "var(--surface-highest)" },
    "In Review": { color: "#e3b341", bg: "rgba(227,179,65,0.1)" },
    "Forwarded": { color: "var(--secondary)", bg: "rgba(83,221,252,0.1)" },
    "Resolved": { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
};

export default function Poll() {
    const [problems, setProblems] = useState(INIT_PROBLEMS);
    const [polls, setPolls] = useState(ACTIVE_POLLS.map(p => ({ ...p, voted: null })));
    const [activeArea, setActiveArea] = useState("All");
    const [activeCat, setActiveCat] = useState("All");
    const [sort, setSort] = useState("votes");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", area: "Bidholi", cat: "Transport", desc: "" });

    const handleVote = id => {
        setProblems(ps => ps.map(p => p.id === id
            ? { ...p, votes: p.upvoted ? p.votes - 1 : p.votes + 1, upvoted: !p.upvoted }
            : p
        ));
    };

    const handlePollVote = (pollId, optIdx) => {
        setPolls(ps => ps.map(p => {
            if (p.id !== pollId || p.voted !== null) return p;
            return { ...p, options: p.options.map((o, i) => i === optIdx ? { ...o, votes: o.votes + 1 } : o), totalVotes: p.totalVotes + 1, voted: optIdx };
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        setProblems(ps => [{ ...form, id: Date.now(), votes: 1, upvoted: false, comments: 0, status: "Submitted", urgent: false }, ...ps]);
        setShowForm(false); setForm({ title: "", area: "Bidholi", cat: "Transport", desc: "" });
    };

    const filtered = problems
        .filter(p => (activeArea === "All" || p.area === activeArea) && (activeCat === "All" || p.cat === activeCat))
        .sort((a, b) => sort === "votes" ? b.votes - a.votes : b.id - a.id);

    return (
        <div className="page-wrap" style={{ maxWidth: 1200 }}>
            <div className="two-col">

                {/* LEFT */}
                <div>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Community Voice</div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 12 }}>
                        PULSE_<span className="accent-tertiary">BOARD</span>
                    </h1>
                    <p style={{ color: "var(--on-surface-var)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Upvote real issues. Add your own. TEC forwards the highest-voted problems to local authorities monthly.</p>

                    {/* Filter bar */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
                        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
                            {AREAS.map(a => (
                                <button key={a} onClick={() => setActiveArea(a)} style={{
                                    padding: "5px 14px", borderRadius: 9999, fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700,
                                    letterSpacing: "0.06em", cursor: "pointer", border: "none", transition: "all 0.14s",
                                    background: activeArea === a ? (AREA_COLOR[a] || "var(--primary)") : "var(--surface-highest)",
                                    color: activeArea === a ? "#000" : "var(--on-surface-var)",
                                }}>{a}</button>
                            ))}
                        </div>
                        <select className="neon-select" value={sort} onChange={e => setSort(e.target.value)} style={{ minWidth: 120 }}>
                            <option value="votes">Most Voted</option>
                            <option value="new">Newest</option>
                        </select>
                        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: 11, padding: "7px 16px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                            Report Issue
                        </button>
                    </div>

                    {/* Category chips */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                        {CATS.map(c => (
                            <button key={c} onClick={() => setActiveCat(c)} style={{
                                padding: "4px 12px", borderRadius: 9999, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                                cursor: "pointer", border: "none", fontFamily: "var(--font-display)", transition: "all 0.14s",
                                background: activeCat === c ? "rgba(255,149,160,0.15)" : "var(--surface-highest)",
                                color: activeCat === c ? "var(--tertiary)" : "var(--on-surface-var)",
                                outline: activeCat === c ? "1px solid rgba(255,149,160,0.2)" : "none",
                            }}>{c}</button>
                        ))}
                    </div>

                    {/* Problems list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {filtered.map((p, i) => {
                            const ss = STATUS_STYLE[p.status] || STATUS_STYLE["Submitted"];
                            return (
                                <motion.div key={p.id} className="neon-card" style={{ padding: "16px 20px", display: "flex", gap: 0, borderLeft: p.urgent ? "3px solid var(--error)" : "none" }}
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                                    {/* Vote col */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 44, flexShrink: 0, marginRight: 14 }}>
                                        <button className="upvote-btn" onClick={() => handleVote(p.id)} style={p.upvoted ? { background: "rgba(204,151,255,0.15)", borderColor: "rgba(204,151,255,0.4)" } : {}}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_less</span>
                                        </button>
                                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: p.upvoted ? "var(--primary)" : "var(--on-surface)" }}>{p.votes}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                                            {p.urgent && <span className="tag-error" style={{ fontSize: 9 }}>URGENT</span>}
                                            <span style={{ fontSize: 11, color: AREA_COLOR[p.area] || "var(--primary)", fontFamily: "var(--font-display)", fontWeight: 700 }}>{p.area}</span>
                                            <span className="tag-ghost" style={{ fontSize: 9 }}>{p.cat}</span>
                                            <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, letterSpacing: "0.05em", background: ss.bg, color: ss.color, borderRadius: 9999, padding: "2px 8px", fontFamily: "var(--font-display)" }}>{p.status}</span>
                                        </div>
                                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", marginBottom: 6 }}>{p.title}</p>
                                        <span style={{ fontSize: 11, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)" }}>{p.comments} comments</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Active Polls */}
                <div style={{ position: "sticky", top: 80 }}>
                    <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Active Polls</span>
                    {polls.map(poll => {
                        const max = Math.max(...poll.options.map(o => o.votes));
                        return (
                            <div key={poll.id} className="neon-card" style={{ padding: 20, marginBottom: 16 }}>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", marginBottom: 16, lineHeight: 1.4 }}>{poll.q}</p>
                                {poll.options.map((opt, i) => {
                                    const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                                    const isLeading = opt.votes === max;
                                    const isVoted = poll.voted === i;
                                    return (
                                        <div key={i} style={{ marginBottom: 10 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, color: isVoted ? "var(--secondary)" : "var(--on-surface)", fontWeight: isVoted ? 700 : 400 }}>{opt.text}</span>
                                                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--on-surface-var)" }}>{pct}%</span>
                                            </div>
                                            <div style={{ height: 6, borderRadius: 3, background: "var(--surface-highest)", overflow: "hidden", cursor: poll.voted === null ? "pointer" : "default" }}
                                                onClick={() => handlePollVote(poll.id, i)}>
                                                <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, transition: "width 0.4s", background: isLeading ? "linear-gradient(90deg, var(--secondary), var(--primary))" : "var(--surface-bright)" }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                <div style={{ fontSize: 11, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)", marginTop: 8 }}>
                                    {poll.totalVotes.toLocaleString()} votes · {poll.voted !== null ? "Voted" : "Click bar to vote"}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6 }}>Report an <span className="accent-tertiary">Issue</span></h2>
                        <p style={{ color: "var(--on-surface-var)", fontSize: 13, marginBottom: 24 }}>Top-voted issues are forwarded to local authorities monthly.</p>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "0.07em", color: "var(--on-surface-var)", display: "block", marginBottom: 6 }}>ISSUE TITLE</label>
                                <input className="neon-input" required placeholder="Describe the problem" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: "100%", boxSizing: "border-box" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                                <div>
                                    <label style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "0.07em", color: "var(--on-surface-var)", display: "block", marginBottom: 6 }}>AREA</label>
                                    <select className="neon-select" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} style={{ width: "100%" }}>
                                        {AREAS.filter(a => a !== "All").map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "0.07em", color: "var(--on-surface-var)", display: "block", marginBottom: 6 }}>CATEGORY</label>
                                    <select className="neon-select" value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })} style={{ width: "100%" }}>
                                        {CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "0.07em", color: "var(--on-surface-var)", display: "block", marginBottom: 6 }}>DESCRIPTION (optional)</label>
                                <textarea className="neon-input" rows={3} placeholder="More context..." value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }} />
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: 12, fontSize: 12 }}>Submit Issue</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ padding: "12px 20px" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
