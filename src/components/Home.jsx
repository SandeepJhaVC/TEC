import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEED = [
  {
    id: 1, user: 'cyber_junkie', badge: 'Contributor', time: '2h ago',
    body: 'Just finished building an AI-powered timetable scheduler for UPES. 99.9% uptime in beta. Anyone want to stress test it?',
    code: 'const schedule = await kernel.optimize({ campus: "UPES", algo: "genetic" })\n// → 94.2% conflict-free slots generated',
    votes: 128, replies: 24, kernel: '#X-KERNEL-402',
  },
  {
    id: 2, user: 'neon_ghost', badge: null, time: '5h ago',
    body: "Who's building something for the North campus hackathon? Looking for a designer co-founder with mobile experience.",
    code: 'fn main() {\n  println!("who\'s up for a hack session at the North lab?");\n  loop { campus.code(); sleep(3600); }\n}',
    votes: 52, replies: 8, kernel: null,
  },
  {
    id: 3, user: 'delta_root', badge: 'Builder', time: '8h ago',
    body: 'New version of CampusGPT dropped. Context window now covers all UPES syllabi up to 2025. Try it at the link.',
    code: null,
    votes: 203, replies: 47, kernel: '#AI-SYS-221',
  },
];

const BAZAAR_HOT = [
  { name: 'TEC Oversized Hoodie', credits: '47 Echo Credits' },
  { name: 'Premium Keycap Set', credits: '120 Echo Credits' },
];

const LIVE_LOGS = [
  { type: 'CONN', msg: 'user.492 joined Echo-net' },
  { type: 'TX',   msg: 'Deployment alpha-9 success' },
  { type: 'ERR',  msg: 'Security ping: Block-C' },
  { type: 'INFO', msg: 'Bazaar inventory update' },
];

const TRENDING_NODES = ['#FinalWeek', '#CodeJam24', '#CoffeeLogic', '#Protocol_X'];

const LOG_COLORS = { CONN: '#53DDFC', TX: '#3fb950', ERR: '#FF6E84', INFO: '#CC97FF' };

export default function Home() {
  const [votes, setVotes] = useState(FEED.reduce((acc, p) => ({ ...acc, [p.id]: p.votes }), {}));
  const [voted, setVoted] = useState({});
  const [postText, setPostText] = useState('');

  const handleVote = (id) => {
    if (voted[id]) return;
    setVotes(v => ({ ...v, [id]: v[id] + 1 }));
    setVoted(v => ({ ...v, [id]: true }));
  };

  return (
    <div className="page-wrap" style={{ maxWidth: 1280 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

        {/* ── LEFT: FEED ── */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 className="section-title" style={{ marginBottom: 6 }}>Echo <span className="accent-primary">Feed</span></h1>
              <p style={{ color: 'var(--on-surface-var)', fontSize: 13 }}>Sub-neural community pulses. Updated real-time.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <span className="tag-error" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="live-dot" /> HOT
              </span>
              <span className="tag-secondary">TRENDING</span>
            </div>
          </div>

          {/* Post composer */}
          <div className="neon-card" style={{ padding: 20, marginBottom: 24 }}>
            <textarea value={postText} onChange={e => setPostText(e.target.value)}
              className="neon-input" rows={3} placeholder="Relay a pulse to the campus..."
              style={{ resize: 'none', borderRadius: 10, marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {['image', 'terminal', 'poll'].map(icon => (
                  <button key={icon} style={{ background: 'none', border: 'none', color: 'var(--on-surface-var)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.14s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-var)'}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
                  </button>
                ))}
              </div>
              <button className="btn-ghost-cyan" style={{ fontSize: 11, padding: '6px 16px', letterSpacing: '0.08em' }}>RELAY</button>
            </div>
          </div>

          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FEED.map(post => (
              <motion.article key={post.id} className="neon-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {post.kernel && (
                  <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--secondary)', opacity: 0.5 }}>{post.kernel}</span>
                )}
                <div style={{ display: 'flex', gap: 16 }}>
                  {/* Vote column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button className="upvote-btn" onClick={() => handleVote(post.id)} style={voted[post.id] ? { background: 'rgba(204,151,255,0.15)', borderColor: 'rgba(204,151,255,0.4)' } : {}}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_less</span>
                    </button>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--on-surface)' }}>{votes[post.id]}</span>
                    <button style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-highest)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--on-surface-var)', fontSize: 16, transition: 'color 0.14s' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
                    </button>
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-display)' }}>{post.user}</span>
                      <span style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>{post.time}</span>
                      {post.badge && (
                        <span className="tag-primary" style={{ fontSize: 8, letterSpacing: '0.1em' }}>{post.badge.toUpperCase()}</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--on-surface-var)', lineHeight: 1.6, marginBottom: 14 }}>{post.body}</p>
                    {post.code && (
                      <div style={{ background: 'var(--surface-highest)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid var(--primary)', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
                        <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--secondary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.code}</pre>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-var)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, transition: 'color 0.14s', fontFamily: 'var(--font-body)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--secondary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-var)'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat_bubble</span>
                        {post.replies} Responses
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-var)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, transition: 'color 0.14s', fontFamily: 'var(--font-body)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-var)'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>share</span>
                        Relay
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 80 }}>
          {/* Bazaar Hot */}
          <div className="neon-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span className="eyebrow" style={{ color: 'var(--on-surface-var)' }}>Bazaar Hot</span>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--on-surface-var)', cursor: 'pointer' }}>open_in_new</span>
            </div>
            {BAZAAR_HOT.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < BAZAAR_HOT.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-highest)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-display)' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--primary)' }}>{item.credits}</div>
                </div>
              </div>
            ))}
            <Link to="/assignments" className="btn-ghost-cyan" style={{ width: '100%', justifyContent: 'center', marginTop: 14, fontSize: 11, letterSpacing: '0.08em' }}>ENTER BAZAAR</Link>
          </div>

          {/* Live Logs */}
          <div className="neon-card" style={{ padding: 20 }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 12 }}>Live Terminal Logs</span>
            {LIVE_LOGS.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                <span style={{ color: LOG_COLORS[log.type], fontWeight: 700, minWidth: 36 }}>[{log.type}]</span>
                <span style={{ color: 'var(--on-surface-var)' }}>{log.msg}</span>
              </div>
            ))}
          </div>

          {/* Trending Nodes */}
          <div className="neon-card" style={{ padding: 20 }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 12 }}>Trending #Nodes</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRENDING_NODES.map(tag => (
                <span key={tag} className="tag-ghost" style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(204,151,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick nav */}
          <div className="neon-card" style={{ padding: 20 }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 12 }}>Quick Access</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Explore', '/map'], ['Deals', '/discounts'], ['Listings', '/listings'], ['Events', '/events']].map(([label, to]) => (
                <Link key={to} to={to} style={{ padding: '8px 10px', borderRadius: 10, background: 'var(--surface-highest)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--on-surface-var)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', textAlign: 'center', transition: 'all 0.14s', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(204,151,255,0.1)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-highest)'; e.currentTarget.style.color = 'var(--on-surface-var)'; }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
