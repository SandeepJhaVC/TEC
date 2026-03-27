import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import AdBanner from './AdBanner';

const FEED = [];

const BAZAAR_HOT = [
  { name: "GATE CSE 2024 Full Set", credits: "₹1,200" },
  { name: "Arduino Starter Kit", credits: "₹1,800" },
  { name: "Casio FX-991EX Calculator", credits: "₹800" },
];

const LIVE_LOGS = [
  { type: "CONN", msg: "3 new members joined TEC today" },
  { type: "TX", msg: "New listing posted on Bazaar" },
  { type: "INFO", msg: "Events board updated with 2 entries" },
  { type: "CONN", msg: "Campus map refreshed" },
];

const TRENDING_NODES = ["#placement", "#hackathon", "#hostels", "#assignments", "#cafeteria", "#UPES2025", "#internship", "#exam-prep"];

const LOG_COLORS = { CONN: '#53DDFC', TX: '#3fb950', ERR: '#FF6E84', INFO: '#CC97FF' };

const FALLBACK_PROMO = [
  { type: 'deal', data: { name: 'Campus Café', cat: 'Food', discount: '15% OFF', desc: 'Show your TEC student ID for a discount on all beverages and snacks at the Block-A canteen.' } },
  { type: 'listing', data: { name: 'TEC Housing Board', tab: 'Stay', price: 'From ₹4,500/mo', loc: 'On-campus accommodation options available' } },
  { type: 'deal', data: { name: 'PrintZone', cat: 'Study', discount: '₹2/page', desc: 'Discounted printing rates exclusively for TEC members at the library ground floor.' } },
];

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [votes, setVotes] = useState({});
  const [voted, setVoted] = useState({});
  const [postText, setPostText] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [xpPopups, setXpPopups] = useState({});
  const [totalXp, setTotalXp] = useState(0);
  const [promoCards, setPromoCards] = useState([]);

  useEffect(() => {
    Promise.all([
      supabase.from('deals').select('name,cat,discount,desc,loc').limit(4),
      supabase.from('admin_listings').select('name,tab,price,loc').limit(3),
      supabase.from('pulse_issues').select('title,votes').order('votes', { ascending: false }).limit(1),
    ]).then(([deals, listings, issues]) => {
      const cards = [];
      (deals.data || []).forEach(d => cards.push({ type: 'deal', data: d }));
      (listings.data || []).forEach(l => cards.push({ type: 'listing', data: l }));
      if (issues.data?.[0]) cards.push({ type: 'issue', data: issues.data[0] });
      setPromoCards(cards.length > 0 ? cards : FALLBACK_PROMO);
    });
  }, []);

  useEffect(() => {
    supabase.from('feed_posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        const loaded = (data || []).map(p => ({
          ...p,
          user: p.user_name || 'Anonymous',
          time: p.created_at ? new Date(p.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          badge: (p.user_role && p.user_role !== 'student') ? p.user_role : null,
          missionColor: p.user_role === 'builder' ? '#CC97FF' : p.user_role === 'admin' ? '#FF6E84' : '#53DDFC',
          missionType: 'PULSE',
          xpReward: null, kernel: null, code: null, replies: 0,
        }));
        setPosts(loaded);
        setVotes(loaded.reduce((acc, p) => ({ ...acc, [p.id]: p.votes }), {}));
        setLoadingPosts(false);
      });
  }, []);

  const handleRelay = async () => {
    if (!postText.trim() || !user) return;
    setSubmittingPost(true);
    const { data, error } = await supabase.from('feed_posts').insert({
      user_id: user.id, user_name: user.name, user_role: user.role,
      body: postText.trim(), votes: 1,
    }).select().single();
    if (!error && data) {
      const normalized = {
        ...data,
        user: data.user_name || user.name,
        time: 'Just now',
        badge: (user.role && user.role !== 'student') ? user.role : null,
        missionColor: user.role === 'builder' ? '#CC97FF' : user.role === 'admin' ? '#FF6E84' : '#53DDFC',
        missionType: 'PULSE',
        xpReward: null, kernel: null, code: null, replies: 0,
      };
      setPosts(p => [normalized, ...p]);
      setVotes(v => ({ ...v, [data.id]: 1 }));
      setPostText('');
    }
    setSubmittingPost(false);
  };

  const handleVote = (id) => {
    if (voted[id]) return;
    const newCount = (votes[id] || 0) + 1;
    setVotes(v => ({ ...v, [id]: newCount }));
    setVoted(v => ({ ...v, [id]: true }));
    supabase.from('feed_posts').update({ votes: newCount }).eq('id', id);
  };

  return (
    <div className="page-wrap" style={{ maxWidth: 1280 }}>
      <div className="two-col">

        {/* ── LEFT: FEED ── */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 className="section-title" style={{ marginBottom: 6 }}>Echo <span className="accent-primary">Feed</span></h1>
              <p style={{ color: 'var(--on-surface-var)', fontSize: 13 }}>Sub-neural community pulses. Updated real-time.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="tag-error" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="live-dot" /> ACTIVE
                </span>
                <span className="tag-secondary">LIVE</span>
              </div>
              {/* Running XP tally */}
              {totalXp > 0 && (
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800,
                  color: '#e3b341', letterSpacing: '0.06em',
                  background: 'rgba(227,179,65,0.08)',
                  border: '1px solid rgba(227,179,65,0.2)',
                  borderRadius: 6, padding: '3px 10px',
                }}>+{totalXp} XP EARNED</div>
              )}
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
              <button className="btn-ghost-cyan" onClick={handleRelay} disabled={submittingPost || !postText.trim()} style={{ fontSize: 11, padding: '6px 16px', letterSpacing: '0.08em', opacity: (submittingPost || !postText.trim()) ? 0.45 : 1 }}>{submittingPost ? '...' : 'RELAY'}</button>
            </div>
          </div>

          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!loadingPosts && posts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--on-surface-var)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.25, display: 'block', marginBottom: 12 }}>chat_bubble</span>
                No posts yet. Be the first to relay a pulse.
              </div>
            )}
            {posts.map((post, idx) => (
              <React.Fragment key={post.id}>
                <motion.article className="neon-card mission-card" style={{
                  padding: 24, position: 'relative', overflow: 'hidden',
                  borderLeft: `3px solid ${post.missionColor}40`,
                }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Left accent stripe */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: post.missionColor, opacity: voted[post.id] ? 1 : 0.35,
                    transition: 'opacity 0.3s',
                  }} />
                  {/* Mission type */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="mission-type" style={{ background: `${post.missionColor}18`, color: post.missionColor, border: `1px solid ${post.missionColor}35` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 9 }}>radio_button_checked</span>
                      {post.missionType}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#e3b341', letterSpacing: '0.08em' }}>
                        +{post.xpReward} XP
                      </span>
                      {post.kernel && (
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--secondary)', opacity: 0.5 }}>{post.kernel}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {/* Vote column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, position: 'relative' }}>
                      {/* XP popup */}
                      {xpPopups[post.id] && (
                        <div key={xpPopups[post.id]} className="xp-popup" style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}>
                          +{post.xpReward} XP
                        </div>
                      )}
                      <button className="upvote-btn" onClick={() => handleVote(post.id)} style={voted[post.id] ? { background: `${post.missionColor}25`, borderColor: `${post.missionColor}60` } : {}}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: voted[post.id] ? post.missionColor : undefined }}>expand_less</span>
                      </button>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: voted[post.id] ? post.missionColor : 'var(--on-surface)' }}>{votes[post.id]}</span>
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

                {/* Inject promo card every 3 posts */}
                {(idx + 1) % 3 === 0 && promoCards.length > 0 && (() => {
                  const card = promoCards[Math.floor((idx + 1) / 3 - 1) % promoCards.length];
                  const DEAL_ACCENT = { Food: '#53DDFC', Study: '#FF95A0', Shopping: '#e3b341', Health: '#FF6E84', Transport: '#CC97FF', Stay: '#a889ff' };
                  if (card.type === 'deal') {
                    const accent = DEAL_ACCENT[card.data.cat] || '#53DDFC';
                    return (
                      <Link to="/discounts" key={`promo-${idx}`} style={{ textDecoration: 'none' }}>
                        <div className="neon-card" style={{ overflow: 'hidden', borderTop: `2px solid ${accent}`, background: `linear-gradient(135deg, ${accent}09 0%, transparent 65%)` }}>
                          <div style={{ padding: '9px 16px', borderBottom: `1px solid ${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 7, fontFamily: 'var(--font-display)', letterSpacing: '0.22em', fontWeight: 800, color: `${accent}80`, background: `${accent}12`, padding: '2px 7px', borderRadius: 4 }}>SPONSORED</span>
                              <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', color: accent, fontWeight: 700, letterSpacing: '0.08em' }}>{(card.data.cat || 'DEAL').toUpperCase()}</span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: accent, letterSpacing: '-0.02em' }}>{card.data.discount}</span>
                          </div>
                          <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}12`, border: `1px solid ${accent}28`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: accent }}>sell</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--on-surface)', marginBottom: 2 }}>{card.data.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--on-surface-var)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.data.desc}</div>
                            </div>
                            <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, color: accent, flexShrink: 0, letterSpacing: '0.03em' }}>View →</span>
                          </div>
                        </div>
                      </Link>
                    );
                  }
                  if (card.type === 'listing') return (
                    <Link to="/listings" key={`promo-${idx}`} style={{ textDecoration: 'none' }}>
                      <div className="neon-card" style={{ overflow: 'hidden', borderTop: '2px solid var(--primary)', background: 'linear-gradient(135deg, rgba(204,151,255,0.07) 0%, transparent 65%)' }}>
                        <div style={{ padding: '9px 16px', borderBottom: '1px solid rgba(204,151,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 7, fontFamily: 'var(--font-display)', letterSpacing: '0.22em', fontWeight: 800, color: 'rgba(204,151,255,0.55)', background: 'rgba(204,151,255,0.1)', padding: '2px 7px', borderRadius: 4 }}>FEATURED</span>
                            <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.08em' }}>{(card.data.tab || 'LISTING').toUpperCase()}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: 'var(--tertiary)', letterSpacing: '-0.01em' }}>{card.data.price}</span>
                        </div>
                        <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(204,151,255,0.1)', border: '1px solid rgba(204,151,255,0.22)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>location_city</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--on-surface)', marginBottom: 2 }}>{card.data.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--on-surface-var)' }}>{card.data.loc}</div>
                          </div>
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>Explore →</span>
                        </div>
                      </div>
                    </Link>
                  );
                  if (card.type === 'issue') return (
                    <Link to="/poll" key={`promo-${idx}`} style={{ textDecoration: 'none' }}>
                      <div className="neon-card" style={{ overflow: 'hidden', borderTop: '2px solid #e3b341', background: 'linear-gradient(135deg, rgba(227,179,65,0.07) 0%, transparent 65%)' }}>
                        <div style={{ padding: '9px 16px', borderBottom: '1px solid rgba(227,179,65,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 7, fontFamily: 'var(--font-display)', letterSpacing: '0.22em', fontWeight: 800, color: 'rgba(227,179,65,0.55)', background: 'rgba(227,179,65,0.1)', padding: '2px 7px', borderRadius: 4 }}>TRENDING</span>
                            <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', color: '#e3b341', fontWeight: 700, letterSpacing: '0.08em' }}>PULSE ISSUE</span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#e3b341' }}>{card.data.votes} votes</span>
                        </div>
                        <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(227,179,65,0.1)', border: '1px solid rgba(227,179,65,0.22)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#e3b341' }}>how_to_vote</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--on-surface)', marginBottom: 2 }}>{card.data.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--on-surface-var)' }}>Cast your vote · make your voice heard</div>
                          </div>
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#e3b341', flexShrink: 0 }}>Vote →</span>
                        </div>
                      </div>
                    </Link>
                  );
                  return null;
                })()}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 80 }}>
          {/* Bazaar Hot */}
          <div className="neon-card hud-bracket" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 8, fontFamily: 'var(--font-display)', color: '#e3b341', letterSpacing: '0.18em', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>BAZAAR</div>
                <span className="eyebrow" style={{ color: 'var(--on-surface-var)' }}>Hot Items</span>
              </div>
              <Link to="/assignments" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--on-surface-var)', cursor: 'pointer' }}>open_in_new</span>
              </Link>
            </div>
            {BAZAAR_HOT.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < BAZAAR_HOT.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, rgba(227,179,65,0.15), rgba(204,151,255,0.1))', border: '1px solid rgba(227,179,65,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#e3b341' }}>sell</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#e3b341', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{item.credits}</div>
                </div>
              </div>
            ))}
            <Link to="/assignments" className="btn-ghost-cyan" style={{ width: '100%', justifyContent: 'center', marginTop: 14, fontSize: 11, letterSpacing: '0.08em' }}>ENTER BAZAAR</Link>
          </div>

          {/* Live Logs */}
          <div className="neon-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="live-dot" />
              <span className="eyebrow">LIVE TERMINAL</span>
            </div>
            {LIVE_LOGS.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                <span style={{ color: LOG_COLORS[log.type], fontWeight: 700, minWidth: 38 }}>[{log.type}]</span>
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
          <AdBanner variant="sidebar" offset={0} />
        </div>
      </div>
    </div>
  );
}
