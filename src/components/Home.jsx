import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const QUICK_ACCESS = [
  { short: 'MAP', label: 'Map', to: '/map', color: '#58a6ff', bg: '#1c2a3a' },
  { short: 'DEALS', label: 'Deals', to: '/discounts', color: '#f09433', bg: '#2a1f0e' },
  { short: 'PGs', label: 'Listings', to: '/listings', color: '#3fb950', bg: '#0f2117' },
  { short: 'BOARD', label: 'Board', to: '/assignments', color: '#e3b341', bg: '#261f0a' },
  { short: 'VOTE', label: 'Polls', to: '/poll', color: '#bc1888', bg: '#220b1a' },
  { short: 'LIVE', label: 'Events', to: '/events', color: '#ff6b6b', bg: '#2a0e0e' },
  { short: 'BUILD', label: 'Builds', to: '/builds', color: '#a78bfa', bg: '#1a1230' },
];

const FEATURES = [
  {
    tag: 'TRENDING', label: 'map', title: 'Campus Navigator',
    desc: 'Interactive map from Pondha to Bidholi. Find PGs, restaurants, hospitals, ATMs, pharmacies.',
    to: '/map', lang: 'OpenStreetMap', upvotes: 42, views: 1240, color: '#58a6ff', hot: true,
  },
  {
    tag: 'POPULAR', label: 'deals', title: 'Discounts Board',
    desc: 'Exclusive student deals on food, transport, study supplies, and local stays.',
    to: '/discounts', lang: 'Community', upvotes: 38, views: 980, color: '#f09433', hot: false,
  },
  {
    tag: 'ACTIVE', label: 'listings', title: 'Local Listings',
    desc: 'Rated PGs, hostels, restaurants, hangout spots, and weekend activities.',
    to: '/listings', lang: 'Peer-rated', upvotes: 61, views: 2100, color: '#3fb950', hot: true,
  },
  {
    tag: 'NEW', label: 'board', title: 'Student Board',
    desc: 'Trade books, find project partners, grab part-time gigs — all peer-to-peer.',
    to: '/assignments', lang: 'P2P', upvotes: 27, views: 760, color: '#e3b341', hot: false,
  },
  {
    tag: 'CIVIC', label: 'poll', title: 'Area Polls',
    desc: 'Problem statements and polls per district. Upvote issues that matter.',
    to: '/poll', lang: 'Civic', upvotes: 19, views: 430, color: '#bc1888', hot: false,
  },
  {
    tag: 'LAUNCH', label: 'builds', title: 'Student Builds',
    desc: 'Apps and tools built by students. Try products, give feedback, find co-founders.',
    to: '/builds', lang: 'Dev', upvotes: 55, views: 880, color: '#a78bfa', hot: true,
  },
];

const ACTIVITY = [
  { user: 'Rahul K.', action: 'posted on Board', item: 'Looking for SIH teammates — HealthTech', time: '4m ago', color: '#e3b341' },
  { user: 'Priya M.', action: 'listed a build', item: 'StudySync — AI timetable for UPES students', time: '12m ago', color: '#a78bfa' },
  { user: 'Sneha B.', action: 'found a deal', item: '30% off at Biryani Blues — today only', time: '28m ago', color: '#f09433' },
  { user: 'Dev A.', action: 'started a poll', item: '"Should TEC add a carpool feature?"', time: '41m ago', color: '#bc1888' },
  { user: 'Arjun S.', action: 'added a listing', item: '1BHK near UPES gate — Rs.7,500/mo', time: '1h ago', color: '#3fb950' },
];

const STATS = [
  { n: '500+', label: 'students', sub: 'across 4 areas' },
  { n: '50+', label: 'deals', sub: 'active right now' },
  { n: '12', label: 'builds', sub: 'in beta' },
  { n: '200+', label: 'listings', sub: 'rated by peers' },
];

const tagColor = { TRENDING: '#f09433', POPULAR: '#58a6ff', ACTIVE: '#3fb950', NEW: '#3fb950', CIVIC: '#bc1888', LAUNCH: '#a78bfa' };

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

function useCount(target, duration) {
  const ms = duration || 1200;
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseInt(target, 10);
    if (isNaN(num)) return;
    const step = Math.ceil(num / (ms / 16));
    let current = 0;
    const t = setInterval(function() {
      current = Math.min(current + step, num);
      setCount(current);
      if (current >= num) clearInterval(t);
    }, 16);
    return function() { clearInterval(t); };
  }, [target, ms]);
  return count;
}

function StatCard(props) {
  var n = props.n; var label = props.label; var sub = props.sub;
  var raw = parseInt(n, 10);
  var suffix = n.replace(/[0-9]/g, '');
  var animated = useCount(raw);
  return (
    React.createElement('div', { style: { textAlign: 'center', padding: '0 12px' } },
      React.createElement('div', { style: { fontSize: 28, fontWeight: 900, color: '#e6edf3', fontFamily: '"Mona Sans", var(--font)', lineHeight: 1 } },
        animated, suffix
      ),
      React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#e6edf3', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' } }, label),
      React.createElement('div', { style: { fontSize: 11, color: '#8b949e', marginTop: 2 } }, sub)
    )
  );
}

export default function Home() {
  var [hovered, setHovered] = useState(null);
  var [upvoted, setUpvoted] = useState({});

  var toggleUpvote = function(e, label) {
    e.preventDefault();
    setUpvoted(function(u) { return Object.assign({}, u, { [label]: !u[label] }); });
  };

  return (
    React.createElement('div', { style: { background: '#0d1117', minHeight: '100vh' } },

      React.createElement('style', null, `
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(63,185,80,0.4); }
          50% { opacity: 0.8; box-shadow: 0 0 0 5px rgba(63,185,80,0); }
        }
        .qa-card:hover { transform: translateY(-2px); }
        @media (max-width: 720px) {
          .home-two-col { grid-template-columns: 1fr !important; }
          .activity-sticky { position: static !important; }
        }
      `),

      React.createElement('section', { style: { maxWidth: 900, margin: '0 auto', padding: '72px 24px 48px' } },
        React.createElement(motion.div, { initial: 'hidden', animate: 'show', variants: fade, transition: { duration: 0.38 } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 } },
            React.createElement('span', { className: 'dot-green', style: { animation: 'pulse 2s infinite' } }),
            React.createElement('span', { style: { fontSize: 12, color: '#3fb950', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' } }, 'Live — 500+ students across Uttarakhand')
          ),
          React.createElement('h1', { style: { fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.035em', color: '#e6edf3', marginBottom: 20 } },
            'Your campus,', React.createElement('br'),
            React.createElement('span', { style: { backgroundImage: 'linear-gradient(90deg,#f09433,#dc2743,#bc1888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'finally connected.')
          ),
          React.createElement('p', { style: { fontSize: 16, color: '#8b949e', maxWidth: 500, lineHeight: 1.7, marginBottom: 32 } },
            'Find PGs, grab exclusive deals, trade books, launch your build, and solve campus problems — all in one place.'
          ),
          React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } },
            React.createElement(Link, { to: '/member', className: 'btn-ig', style: { fontSize: 15, padding: '10px 26px', fontWeight: 700 } }, 'Join TEC — Free'),
            React.createElement(Link, { to: '/builds', className: 'btn-secondary', style: { fontSize: 14, padding: '10px 22px', border: '1px solid #30363d' } }, 'Browse student builds')
          )
        )
      ),

      React.createElement('section', { style: { maxWidth: 900, margin: '0 auto', padding: '0 24px 44px' } },
        React.createElement(motion.div, { initial: 'hidden', animate: 'show', variants: stagger, style: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' } },
          QUICK_ACCESS.map(function(s) {
            return React.createElement(motion.div, { key: s.to, variants: fade },
              React.createElement(Link, { to: s.to, style: { textDecoration: 'none', flexShrink: 0 } },
                React.createElement('div', {
                  className: 'qa-card',
                  style: { background: s.bg, border: '1px solid ' + s.color + '33', borderRadius: 8, padding: '10px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 64, transition: 'border-color 0.15s, transform 0.15s' },
                  onMouseEnter: function(e) { e.currentTarget.style.borderColor = s.color; },
                  onMouseLeave: function(e) { e.currentTarget.style.borderColor = s.color + '33'; },
                },
                  React.createElement('span', { style: { fontSize: 10, fontWeight: 900, color: s.color, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' } }, s.short),
                  React.createElement('span', { style: { fontSize: 10, color: '#8b949e', fontWeight: 500 } }, s.label)
                )
              )
            );
          })
        )
      ),

      React.createElement('div', { style: { maxWidth: 900, margin: '0 auto', borderTop: '1px solid #21262d' } }),

      React.createElement('section', {
        className: 'home-two-col',
        style: { maxWidth: 900, margin: '0 auto', padding: '40px 24px 48px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }
      },
        React.createElement('div', null,
          React.createElement('p', { className: 'section-eyebrow', style: { marginBottom: 16 } }, "what's on TEC"),
          React.createElement(motion.div, { initial: 'hidden', animate: 'show', variants: stagger, style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 } },
            FEATURES.map(function(f, i) {
              return React.createElement(motion.div, { key: f.label, variants: fade, transition: { duration: 0.3 } },
                React.createElement(Link, { to: f.to, style: { textDecoration: 'none', display: 'block' }, onMouseEnter: function() { setHovered(i); }, onMouseLeave: function() { setHovered(null); } },
                  React.createElement('div', {
                    style: {
                      background: '#161b22',
                      border: '1px solid ' + (hovered === i ? f.color : '#30363d'),
                      borderLeft: '3px solid ' + f.color,
                      borderRadius: 6, padding: '14px 16px', transition: 'border-color 0.15s', position: 'relative',
                    }
                  },
                    f.hot && React.createElement('div', { style: { position: 'absolute', top: 12, right: 12, background: 'rgba(240,64,51,0.18)', border: '1px solid rgba(240,64,51,0.4)', borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 800, color: '#f04033', letterSpacing: '0.06em' } }, 'HOT'),
                    React.createElement('div', { style: { marginBottom: 6 } },
                      React.createElement('span', { style: { fontSize: 10, fontWeight: 800, color: tagColor[f.tag] || '#8b949e', letterSpacing: '0.07em', fontFamily: 'var(--font-mono)' } }, f.tag)
                    ),
                    React.createElement('h3', { style: { fontSize: 14, fontWeight: 700, color: '#58a6ff', fontFamily: '"Mona Sans", var(--font)', marginBottom: 6 } }, f.title),
                    React.createElement('p', { style: { fontSize: 12, color: '#8b949e', lineHeight: 1.55, marginBottom: 12 } }, f.desc),
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                      React.createElement('span', { style: { fontSize: 11, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 } },
                        React.createElement('span', { style: { width: 8, height: 8, borderRadius: '50%', background: f.color, display: 'inline-block' } }),
                        f.lang
                      ),
                      React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
                        React.createElement('button', {
                          onClick: function(e) { toggleUpvote(e, f.label); },
                          style: {
                            background: upvoted[f.label] ? '#0f2117' : 'transparent',
                            border: '1px solid ' + (upvoted[f.label] ? '#3fb950' : '#30363d'),
                            borderRadius: 4, padding: '2px 8px', fontSize: 11,
                            color: upvoted[f.label] ? '#3fb950' : '#8b949e',
                            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, transition: 'all 0.15s',
                          }
                        }, '+ ' + (f.upvotes + (upvoted[f.label] ? 1 : 0))),
                        React.createElement('span', { style: { fontSize: 11, color: '#484f58' } }, f.views.toLocaleString() + ' views')
                      )
                    )
                  )
                )
              );
            })
          )
        ),

        React.createElement('div', { className: 'activity-sticky', style: { position: 'sticky', top: 80 } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
            React.createElement('p', { className: 'section-eyebrow', style: { margin: 0 } }, 'activity feed'),
            React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 5 } },
              React.createElement('span', { className: 'dot-green', style: { width: 6, height: 6, animation: 'pulse 2s infinite' } }),
              React.createElement('span', { style: { fontSize: 11, color: '#3fb950', fontWeight: 600 } }, 'live')
            )
          ),
          ACTIVITY.map(function(a, i) {
            return React.createElement(motion.div, {
              key: i, initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.3 + i * 0.08 },
              style: { background: '#161b22', border: '1px solid #21262d', borderLeft: '3px solid ' + a.color, borderRadius: 6, padding: '10px 12px', marginBottom: 6 }
            },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 } },
                React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: '#e6edf3' } }, a.user),
                React.createElement('span', { style: { fontSize: 10, color: '#484f58', fontFamily: 'var(--font-mono)' } }, a.time)
              ),
              React.createElement('div', { style: { fontSize: 11, color: '#8b949e', marginBottom: 3 } }, a.action),
              React.createElement('div', { style: { fontSize: 12, color: a.color, fontWeight: 600, lineHeight: 1.3 } }, a.item)
            );
          }),
          React.createElement('div', { style: { background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '18px 16px', marginTop: 8 } },
            React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 6 } }, 'Want to see your activity here?'),
            React.createElement('div', { style: { fontSize: 12, color: '#8b949e', marginBottom: 14 } }, 'Join TEC and post your listings, builds, and polls.'),
            React.createElement(Link, { to: '/member', className: 'btn-primary', style: { display: 'block', textAlign: 'center', padding: '8px', fontSize: 13 } }, 'Join for free')
          )
        )
      ),

      React.createElement('section', { style: { maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' } },
        React.createElement(motion.div, {
          initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 },
          style: { background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '28px 32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: 24 }
        },
          STATS.map(function(s, i) {
            return React.createElement(React.Fragment, { key: s.label },
              i > 0 && React.createElement('div', { style: { width: 1, background: '#30363d', alignSelf: 'stretch' } }),
              React.createElement(StatCard, s)
            );
          })
        )
      ),

      React.createElement('section', { style: { maxWidth: 900, margin: '0 auto', padding: '0 24px 96px' } },
        React.createElement('div', { style: { border: '1px solid #30363d', borderRadius: 8, padding: '52px 40px', background: '#0d1117', position: 'relative', overflow: 'hidden', textAlign: 'center' } },
          React.createElement('div', { style: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(188,24,136,0.12) 0%, transparent 70%)', pointerEvents: 'none' } }),
          React.createElement('div', { style: { position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(88,166,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' } }),
          React.createElement('div', { style: { position: 'relative' } },
            React.createElement('span', { style: { display: 'inline-block', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', marginBottom: 20 } }, 'BUILT FOR STUDENTS'),
            React.createElement('h2', { style: { fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, color: '#e6edf3', marginBottom: 14, letterSpacing: '-0.025em', lineHeight: 1.15 } },
              "Build Uttarakhand's", React.createElement('br'), 'student OS — together.'
            ),
            React.createElement('p', { style: { fontSize: 15, color: '#8b949e', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 } },
              'Post listings, share builds, launch polls, find deals. The platform is yours.'
            ),
            React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' } },
              React.createElement(Link, { to: '/member', className: 'btn-ig', style: { fontSize: 15, padding: '11px 30px', fontWeight: 700 } }, 'Join TEC'),
              React.createElement(Link, { to: '/builds', className: 'btn-secondary', style: { fontSize: 14, padding: '11px 24px' } }, 'Browse builds'),
              React.createElement(Link, { to: '/about', className: 'btn-secondary', style: { fontSize: 14, padding: '11px 24px' } }, 'Read the roadmap')
            )
          )
        )
      )
    )
  );
}
