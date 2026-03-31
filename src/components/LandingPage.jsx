import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const STATS = [
  { value: '500+', label: 'Active Members', color: '#CC97FF' },
  { value: '12+', label: 'Partner Deals', color: '#53DDFC' },
  { value: '200+', label: 'Campus Listings', color: '#FF95A0' },
  { value: '100%', label: 'Student Run', color: '#a8f0ff' },
];

const TICKER_ITEMS = [
  'Community Feed', 'Member Marketplace', 'Campus Map', 'Exclusive Deals',
  'Assignment Board', 'Member Profiles', 'Invite Only', 'No Public Access',
  'Students', 'Verified Members', 'Student Run Network',
];

const STEPS = [
  { num: '01', icon: 'mark_email_unread', color: '#FF95A0', title: 'Receive an invite', desc: 'A TEC admin issues a single-use referral code assigned specifically to you. It cannot be shared or reused.' },
  { num: '02', icon: 'how_to_reg', color: '#CC97FF', title: 'Register your code', desc: 'Enter the code during sign-up. Your account is created with a permanent unique TEC member ID.' },
  { num: '03', icon: 'verified', color: '#53DDFC', title: 'Access everything', desc: 'Marketplace, feed, deals, map, assignments — all unlocked the moment you join.' },
];

/* ─── UI MOCKS ────────────────────────────────────────────────────── */

const LANDING_MAP_STYLE = {
  version: 8,
  sources: { myarea: { type: 'geojson', data: '/map.geojson' } },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#09090a' } },
    { id: 'landuse-residential', type: 'fill', source: 'myarea', filter: ['==', ['get', 'landuse'], 'residential'], paint: { 'fill-color': '#0f100d' } },
    { id: 'landuse-commercial', type: 'fill', source: 'myarea', filter: ['==', ['get', 'landuse'], 'commercial'], paint: { 'fill-color': '#131410' } },
    { id: 'landuse-park', type: 'fill', source: 'myarea', filter: ['any', ['in', ['get', 'landuse'], ['literal', ['park', 'forest', 'grass', 'meadow', 'farmland', 'orchard']]], ['in', ['get', 'leisure'], ['literal', ['park', 'garden', 'pitch', 'golf_course']]], ['==', ['get', 'natural'], 'wood']], paint: { 'fill-color': '#0c1509' } },
    { id: 'water-fill', type: 'fill', source: 'myarea', filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['any', ['==', ['get', 'natural'], 'water'], ['==', ['get', 'landuse'], 'reservoir'], ['in', ['get', 'waterway'], ['literal', ['riverbank', 'dock']]]]], paint: { 'fill-color': '#070e1a' } },
    { id: 'roads-motorway-casing', type: 'line', source: 'myarea', filter: ['in', ['get', 'highway'], ['literal', ['motorway', 'trunk']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#050505', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 9, 16, 26] } },
    { id: 'roads-primary-casing', type: 'line', source: 'myarea', filter: ['in', ['get', 'highway'], ['literal', ['primary', 'secondary']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#050505', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 6, 16, 18] } },
    { id: 'roads-tertiary-casing', type: 'line', source: 'myarea', filter: ['in', ['get', 'highway'], ['literal', ['tertiary', 'residential', 'unclassified', 'living_street']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#050505', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3.5, 16, 12] } },
    { id: 'roads-motorway', type: 'line', source: 'myarea', filter: ['in', ['get', 'highway'], ['literal', ['motorway', 'trunk']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#e2d8a8', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 16, 18] } },
    { id: 'roads-primary', type: 'line', source: 'myarea', filter: ['in', ['get', 'highway'], ['literal', ['primary', 'secondary']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#c0b888', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 16, 12] } },
    { id: 'roads-tertiary', type: 'line', source: 'myarea', filter: ['in', ['get', 'highway'], ['literal', ['tertiary', 'residential', 'unclassified', 'living_street']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#7e7860', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.2, 16, 7] } },
    { id: 'roads-small', type: 'line', source: 'myarea', filter: ['in', ['get', 'highway'], ['literal', ['service', 'footway', 'path', 'track', 'steps', 'pedestrian']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#403e30', 'line-width': ['interpolate', ['linear'], ['zoom'], 14, 0.6, 16, 3] } },
  ],
};

function LiveMapPreview() {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current || !window.maplibregl) return;
    const map = new window.maplibregl.Map({
      container: containerRef.current,
      style: LANDING_MAP_STYLE,
      center: [77.9620, 30.4020],
      zoom: 13.5,
      interactive: false,
      attributionControl: false,
    });
    return () => map.remove();
  }, []);
  return (
    <div className="landing-map-wrap" style={{ position: 'relative', width: '100%', maxWidth: 500, aspectRatio: '4/3', flexShrink: 0, background: '#09090a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, background: 'rgba(8,8,14,0.94)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, zIndex: 2 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#53DDFC', lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>explore</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Campus Map</span>
        <div className="landing-map-tags" style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {['Food', 'Shortcuts', 'Labs', 'Hostels'].map(tag => (
            <span key={tag} style={{ fontSize: 8, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{tag}</span>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, background: 'rgba(8,8,14,0.92)', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 14, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 32, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Campus</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade8090' }} />
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', fontWeight: 700 }}>Live · 47 members online</span>
        </div>
      </div>
      {/* Vignette overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse, transparent 50%, rgba(9,9,10,0.5) 100%)', pointerEvents: 'none', zIndex: 1 }} />
    </div>
  );
}

function FeedMock() {
  const posts = [
    { avatar: 'A', name: 'Aryan K.', role: 'BUILDER', roleColor: '#CC97FF', time: '2h', text: 'Looking for a frontend dev to collab on a SaaS project. DM if interested — serious builders only.' },
    { avatar: 'S', name: 'Shriya M.', role: 'STUDENT', roleColor: '#FF95A0', time: '5h', text: 'Batch update: Lab slot tomorrow 10am shifted to 2pm per Prof. Rawat. Pass it on.' },
    { avatar: 'R', name: 'Rohan T.', role: 'MOD', roleColor: '#53DDFC', time: '1d', text: 'New vendor deal dropped — 30% off Campus Café for TEC members. Check Deals tab.' },
  ];
  return (
    <div className="landing-mock" style={{ width: '100%', maxWidth: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: 'rgba(8,8,14,0.97)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#CC97FF', lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>dynamic_feed</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Community Feed</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>Members only</span>
        </div>
      </div>
      {posts.map(p => (
        <div key={p.name} style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${p.roleColor}18`, border: `1px solid ${p.roleColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: p.roleColor, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{p.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{p.name}</span>
                <span style={{ fontSize: 8, fontWeight: 900, padding: '1px 6px', background: `${p.roleColor}12`, border: `1px solid ${p.roleColor}22`, borderRadius: 20, color: p.roleColor, letterSpacing: '0.06em', flexShrink: 0 }}>{p.role}</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>{p.time} ago</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.46)', lineHeight: 1.68, margin: 0 }}>{p.text}</p>
        </div>
      ))}
    </div>
  );
}

function MarketMock() {
  const items = [
    { icon: 'laptop_mac', title: 'MacBook Air M1', price: '₹55,000', badge: 'Verified', color: '#CC97FF' },
    { icon: 'menu_book', title: 'DS&A Textbook Set', price: '₹350', badge: 'New', color: '#53DDFC' },
    { icon: 'developer_board', title: 'Arduino Starter Kit', price: '₹800', badge: 'Verified', color: '#FF95A0' },
    { icon: 'headphones', title: 'Sony WH-1000XM4', price: '₹18,000', badge: 'Used', color: '#a8f0ff' },
  ];
  return (
    <div className="landing-mock" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380 }}>
      <div style={{ background: 'rgba(8,8,14,0.97)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#FF95A0', lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>storefront</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Marketplace</span>
        <div style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 700 }}>Identity-verified only</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map(item => (
          <div key={item.title} style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 14px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: `radial-gradient(circle,${item.color}08 0%,transparent 70%)` }} />
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}10`, border: `1px solid ${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: item.color, lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>{item.icon}</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, marginBottom: 8 }}>{item.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: item.color, fontFamily: 'var(--font-display)' }}>{item.price}</span>
              <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', background: `${item.color}10`, border: `1px solid ${item.color}20`, borderRadius: 20, color: item.color }}>{item.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DealsMock() {
  const deals = [
    { vendor: 'Campus Café', discount: '30% OFF', code: 'TEC30', expires: 'Apr 2026', color: '#FF95A0', icon: 'local_cafe' },
    { vendor: 'Print House', discount: '₹1 / page', code: 'TECPRINT', expires: 'Ongoing', color: '#CC97FF', icon: 'print' },
    { vendor: 'Stationery Co.', discount: '15% OFF', code: 'TECSTAT', expires: 'May 2026', color: '#53DDFC', icon: 'edit' },
    { vendor: 'Xerox Point', discount: '₹0.50/pg', code: 'TECXRX', expires: 'Ongoing', color: '#a8f0ff', icon: 'content_copy' },
  ];
  return (
    <div className="landing-mock" style={{ width: '100%', maxWidth: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: 'rgba(8,8,14,0.97)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#53DDFC', lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>sell</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Member Deals</span>
        <div style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 700 }}>Not available publicly</div>
      </div>
      {deals.map(d => (
        <div key={d.vendor} style={{ background: 'var(--surface)', border: `1px solid ${d.color}15`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${d.color}10`, border: `1px solid ${d.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: d.color, lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>{d.icon}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.72)', marginBottom: 2 }}>{d.vendor}</div>
            <code style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: 4 }}>{d.code}</code>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: d.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{d.discount}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>Until {d.expires}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AssignmentsMock() {
  const tasks = [
    { title: 'DSA Assignment 3', due: 'Mar 29', status: 'In Progress', members: ['A', 'R', 'S'], color: '#CC97FF', pct: 60 },
    { title: 'OS Lab Report', due: 'Apr 1', status: 'Not Started', members: ['R', 'T'], color: '#FF95A0', pct: 0 },
    { title: 'CN Mini Project', due: 'Apr 7', status: 'Done', members: ['S', 'P', 'A'], color: '#53DDFC', pct: 100 },
  ];
  return (
    <div className="landing-mock" style={{ width: '100%', maxWidth: 420, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: 'rgba(8,8,14,0.97)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#CC97FF', lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>assignment</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Assignments Board</span>
        <div style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 700 }}>Batch-shared</div>
      </div>
      {tasks.map(t => (
        <div key={t.title} style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>{t.title}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 10, lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>schedule</span>
                Due {t.due}
              </div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', background: `${t.color}10`, border: `1px solid ${t.color}22`, borderRadius: 20, color: t.color, whiteSpace: 'nowrap' }}>{t.status}</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${t.pct}%`, background: `linear-gradient(90deg,${t.color}60,${t.color})`, borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {t.members.map(m => (
              <div key={m} style={{ width: 22, height: 22, borderRadius: '50%', background: `${t.color}15`, border: `1px solid ${t.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: t.color }}>{m}</div>
            ))}
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 4 }}>{t.members.length} members</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberCard() {
  return (
    <div className="landing-mock" style={{ width: '100%', maxWidth: 300, flexShrink: 0, background: 'linear-gradient(135deg,rgba(123,47,190,0.25) 0%,rgba(18,18,28,0.92) 45%,rgba(83,221,252,0.08) 100%)', border: '1px solid rgba(204,151,255,0.2)', borderRadius: 20, padding: '28px 24px', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.03)' }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(204,151,255,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: 36, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,rgba(255,220,100,0.28),rgba(255,180,50,0.12))', border: '1px solid rgba(255,200,80,0.22)', marginBottom: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 2, padding: 4 }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ background: 'rgba(255,200,80,0.18)', borderRadius: 2 }} />)}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg,#CC97FF,#53DDFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 3 }}>TEC</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 30 }}>The Entrepreneurs Community</div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)', marginBottom: 22 }}>TEC - **** - **** - ****</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>Member</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>Your Name</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>Role</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#CC97FF', letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>STUDENT</div>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: 'hidden', width: '100%', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', userSelect: 'none' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 40s linear infinite' }}>
        {items.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 22px', whiteSpace: 'nowrap', fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: i % 3 === 0 ? 'rgba(204,151,255,0.4)' : i % 3 === 1 ? 'rgba(83,221,252,0.3)' : 'rgba(255,149,160,0.28)' }}>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />{t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURE SECTION HELPER ──────────────────────────────────────── */
function FeatureSection({ tag, tagColor, headline, sub, bullets, visual, reverse }) {
  return (
    <section className="landing-feature" style={{ padding: '0 20px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 'clamp(32px, 5vw, 72px)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', flexDirection: reverse ? 'row-reverse' : 'row' }}>
        <div style={{ position: 'relative', flexShrink: 0, width: '100%', maxWidth: 500, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: -24, borderRadius: 40, background: `radial-gradient(ellipse,${tagColor}18 0%,transparent 70%)`, filter: 'blur(8px)', pointerEvents: 'none' }} />
          {visual}
        </div>
        <div style={{ maxWidth: 400, flex: '1 1 280px' }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: tagColor, textTransform: 'uppercase', marginBottom: 14 }}>{tag}</div>
          <h2 style={{ fontSize: 'clamp(24px,3.8vw,42px)', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 18 }} dangerouslySetInnerHTML={{ __html: headline }} />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.85, marginBottom: 22 }}>{sub}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bullets.map(b => (
              <div key={b} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.5)', alignItems: 'flex-start', lineHeight: 1.55 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: tagColor, flexShrink: 0, marginTop: 2, lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>check_circle</span>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fadeIn = (delay) => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'none' : 'translateY(22px)',
    transition: `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s cubic-bezier(0.22,1,0.36,1)`,
  });

  return (
    <div style={{ background: 'var(--bg)', height: '100vh', overflowY: 'auto', overflowX: 'hidden', fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 56, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,14,0.88)', backdropFilter: 'blur(22px) saturate(1.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/logo.png" alt="TEC" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'contain', outline: '1px solid rgba(204,151,255,0.28)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg,#CC97FF,#53DDFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEC</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login?tab=login" style={{ textDecoration: 'none', fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.38)', padding: '7px 16px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.07)', transition: 'color 0.14s, border-color 0.14s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'rgba(204,151,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
            SIGN IN
          </Link>
          <Link to="/login?tab=register" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '7px 20px', background: 'linear-gradient(135deg,#7B2FBE,#CC97FF)', border: 'none', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', cursor: 'pointer', boxShadow: '0 2px 18px rgba(123,47,190,0.4)' }}>JOIN</button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '96px 24px 80px', position: 'relative', overflow: 'hidden', background: '#09090a' }}>
        {/* Scanlines — identical to splash */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)' }} />
        {/* Ambient center glow — identical to splash */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 90% 70% at 50% 48%, rgba(204,151,255,0.07) 0%, transparent 68%)' }} />
        {/* Vignette — identical to splash */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Logo */}
          <div style={fadeIn(0.0)}>
            <img src="/logo.png" alt="TEC Logo" style={{ width: 80, height: 80, marginBottom: 40, objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(204,151,255,0.4))' }} />
          </div>

          {/* Badge */}
          <div style={fadeIn(0.05)}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', marginBottom: 36 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 11, color: 'var(--primary)', lineHeight: 1, fontStyle: 'normal', userSelect: 'none', opacity: 0.6 }}>lock</span>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>Invite-Only Network</span>
            </div>
          </div>

          {/* Wordmark — matches splash style */}
          <div style={fadeIn(0.13)}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(90px, 20vw, 180px)', color: '#fff', letterSpacing: '-0.05em', fontStyle: 'italic', textShadow: '0 0 40px rgba(204,151,255,0.45), 0 0 100px rgba(204,151,255,0.12)', lineHeight: 1, margin: '0 0 14px' }}>TEC</h1>
          </div>

          {/* Subtitle — monospace like splash */}
          <div style={fadeIn(0.2)}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.32em', textTransform: 'uppercase', margin: '0 0 12px' }}>The Echo Community</p>
          </div>

          {/* Horizontal rule — matches splash */}
          <div style={fadeIn(0.25)}>
            <div style={{ width: 'clamp(160px, 30vw, 300px)', height: 1, background: 'linear-gradient(90deg, transparent, rgba(204,151,255,0.3), transparent)', margin: '0 auto 32px' }} />
          </div>

          {/* Description */}
          <div style={fadeIn(0.3)}>
            <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: 'rgba(255,255,255,0.34)', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.85, fontWeight: 400 }}>
              Our private inner circle for founders, builders, and doers.<br />We built our own platform — and only the invited get in.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ ...fadeIn(0.38), display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login?tab=register" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ padding: '14px 42px', background: 'linear-gradient(90deg, #9c48ea, #cc97ff)', border: 'none', borderRadius: 2, color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', cursor: 'pointer', boxShadow: '0 0 30px rgba(204,151,255,0.35), 0 0 6px rgba(204,151,255,0.6)', textTransform: 'uppercase' }}>
                Use Referral Code
              </motion.button>
            </Link>
            <Link to="/login?tab=login" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ padding: '14px 36px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, color: 'rgba(255,255,255,0.38)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase' }}>
                Already A Member
              </motion.button>
            </Link>
          </div>

          {/* Scroll hint */}
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} style={{ ...fadeIn(0.55), marginTop: 56 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(255,255,255,0.1)', lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>expand_more</span>
          </motion.div>
        </div>
      </section>

      {/* TICKER */}
      <Ticker />

      {/* STATS */}
      <section style={{ padding: 'clamp(40px, 8vw, 72px) 20px clamp(60px, 10vw, 110px)', maxWidth: 960, margin: '0 auto' }}>
        <div className="landing-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ padding: '36px 20px', textAlign: 'center', background: 'var(--surface)', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: '120%', height: 80, background: `radial-gradient(ellipse,${s.color}10 0%,transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: 'clamp(34px,5vw,58px)', fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1, color: s.color, marginBottom: 8, letterSpacing: '-0.04em' }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.13em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CAMPUS MAP */}
      <FeatureSection
        tag="Campus Map"
        tagColor="#53DDFC"
        headline="Your campus,<br/>fully mapped."
        sub="TEC maintains an interactive, member-curated map of the entire campus — every building, food spot, shortcut, lab, ATM, and hidden gem. Updated by members, for members."
        bullets={[
          '200+ points of interest across the whole campus',
          'Member-submitted food spots, shortcuts, and study zones',
          'Color-coded zones: Academic, Hostels, Sports, Food',
          'Live member presence indicator',
          'Works offline — cached for every session',
        ]}
        visual={<LiveMapPreview />}
        reverse={false}
      />

      {/* COMMUNITY FEED */}
      <FeatureSection
        tag="Community Feed"
        tagColor="#CC97FF"
        headline="The pulse of TEC.<br/>No outsiders."
        sub="A private feed for TEC members — announcements, batch updates, collab calls, polls, and organic conversations. Every post is from a verified member you can trust."
        bullets={[
          'Batch-level and interest-level channels',
          'Verified member badges on every post',
          'Polls, announcements, and collab requests',
          'Moderated — zero spam, zero strangers',
          'Role-tagged posts: Student, Builder, Moderator',
        ]}
        visual={<FeedMock />}
        reverse={true}
      />

      {/* MARKETPLACE */}
      <FeatureSection
        tag="Member Marketplace"
        tagColor="#FF95A0"
        headline="Buy and sell<br/>inside the trust circle."
        sub="A peer-to-peer marketplace exclusively for TEC members. Every seller is identity-verified with their TEC member code. No anonymous listings, no spam, no strangers."
        bullets={[
          'Only identity-verified sellers can list items',
          'Goods, services, notes, tech, and project collabs',
          'TEC member code tied to every transaction',
          'Flag and report system moderated by admins',
          '200+ active listings from your own campus',
        ]}
        visual={<MarketMock />}
        reverse={false}
      />

      {/* DEALS */}
      <FeatureSection
        tag="Exclusive Deals"
        tagColor="#53DDFC"
        headline="Vendor discounts<br/>nobody else gets."
        sub="TEC admins negotiate promo codes and deals with campus vendors on behalf of the network. These codes are issued only to members — you won't find them anywhere else."
        bullets={[
          'Active deals with 12+ campus vendors',
          'Promo codes unlocked immediately on joining',
          'Not advertised publicly, not shareable outside TEC',
          'New deals negotiated and added regularly',
          'Expiry dates shown — always current',
        ]}
        visual={<DealsMock />}
        reverse={true}
      />

      {/* ASSIGNMENTS */}
      <FeatureSection
        tag="Assignments Board"
        tagColor="#CC97FF"
        headline="Group work,<br/>finally organized."
        sub="Shared assignment boards for your batch. Track deadlines, split tasks, mark progress, and keep everyone aligned — without juggling ten WhatsApp threads."
        bullets={[
          'Shared boards visible to your entire batch',
          'Per-task status: Not Started, In Progress, Done',
          'Progress bars and deadline tracking',
          'Member assignment with avatar indicators',
          'Accessible from any device, always in sync',
        ]}
        visual={<AssignmentsMock />}
        reverse={false}
      />

      {/* MEMBER CARD */}
      <section className="landing-feature" style={{ padding: '0 20px 80px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 'clamp(28px, 5vw, 56px)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: -20, borderRadius: 36, background: 'radial-gradient(ellipse,rgba(123,47,190,0.22) 0%,transparent 70%)', filter: 'blur(6px)', pointerEvents: 'none' }} />
            <MemberCard />
          </div>
          <div style={{ maxWidth: 420, flex: '1 1 280px' }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 14 }}>Your identity</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 18 }}>One member code.<br />All-access pass.</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.85, marginBottom: 24 }}>
              Every TEC member gets a unique permanent code — your identity inside the network. It's how you're recognized, how your role is tracked, and how every tool knows who you are.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Permanent TEC code assigned at registration (e.g. TEC-AX4R)',
                'Certificate collection visible on your profile',
                'Exclusive vendor promo codes unlocked immediately',
                'Role progression: Student → Builder → Moderator',
                'Full activity and history tied to your identity',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.48)', lineHeight: 1.55 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--primary)', flexShrink: 0, marginTop: 1, lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>check_circle</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-feature" style={{ padding: '0 20px 80px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: 'var(--tertiary)', textTransform: 'uppercase', marginBottom: 12 }}>How to join</div>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Three steps. That is it.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 1, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
          {STEPS.map(s => (
            <div key={s.num} style={{ padding: '32px 26px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -8, right: -4, fontSize: 100, opacity: 0.018, fontFamily: 'var(--font-display)', fontWeight: 900, color: '#fff', userSelect: 'none', lineHeight: 1 }}>{s.num}</div>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${s.color}0e`, border: `1px solid ${s.color}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: s.color, lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginBottom: 8 }}>{s.num}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.34)', lineHeight: 1.72 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ACCESS POLICY */}
      <section className="landing-feature" style={{ padding: '0 20px 80px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ border: '1px solid rgba(255,149,160,0.12)', borderRadius: 20, padding: 'clamp(24px, 4vw, 36px) clamp(18px, 3vw, 32px)', background: 'rgba(255,149,160,0.025)', display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}>
          <div style={{ flex: '1 1 260px' }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: 'var(--tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>Access policy</div>
            <h3 style={{ fontSize: 'clamp(20px,3vw,32px)', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 12 }}>We do not do open sign-ups.</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.36)', lineHeight: 1.78 }}>Every member is personally invited by a TEC admin. No waitlist, no application form, no back door. It's how we keep the network trusted, focused, and genuinely useful.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, flex: '1 1 280px' }}>
            {[
              { icon: 'person_off', text: 'No public registrations' },
              { icon: 'link_off', text: 'No open invite links' },
              { icon: 'group_remove', text: 'One code per person' },
              { icon: 'admin_panel_settings', text: 'Admin-issued codes only' },
            ].map(r => (
              <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--tertiary)', flexShrink: 0, lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>{r.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.44)', lineHeight: 1.4 }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '0 20px 100px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -1, borderRadius: 28, background: 'linear-gradient(135deg,#7B2FBE 0%,#53DDFC 50%,#FF95A0 100%)', opacity: 0.22, filter: 'blur(1px)', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, background: 'rgba(10,10,16,0.97)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 26, padding: 'clamp(40px,6vw,72px)', textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 250, background: 'radial-gradient(ellipse,rgba(123,47,190,0.14) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(255,149,160,0.07)', border: '1px solid rgba(255,149,160,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--tertiary)', lineHeight: 1, fontStyle: 'normal', userSelect: 'none' }}>lock_person</span>
            </div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 18 }}>
              Not open to the public.<br /><span style={{ color: 'var(--tertiary)' }}>Were you invited?</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.8, maxWidth: 440, margin: '0 auto 38px' }}>
              If a TEC admin sent you a referral code, you're good to go. Register now and claim your permanent member code.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login?tab=register" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.97 }} style={{ padding: '14px 40px', background: 'linear-gradient(135deg,#7B2FBE,#CC97FF)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.09em', cursor: 'pointer', boxShadow: '0 6px 32px rgba(123,47,190,0.45)' }}>
                  USE MY CODE
                </motion.button>
              </Link>
              <Link to="/login?tab=login" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.97 }} style={{ padding: '14px 30px', background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', cursor: 'pointer' }}>
                  SIGN IN
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.14)', fontFamily: 'var(--font-display)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>TEC — Independent, student-run — Not affiliated with any institution</span>
        <Link to="/about" style={{ fontSize: 10, color: 'var(--primary)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.5 }}>About</Link>
      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }
        @media (max-width: 640px) {
          .landing-stats { grid-template-columns: repeat(2,1fr) !important; }
          .landing-feature { padding-left: 16px !important; padding-right: 16px !important; padding-bottom: 56px !important; }
          .landing-map-tags { display: none !important; }
          .landing-map-wrap { border-radius: 14px !important; }
        }
      `}</style>
    </div>
  );
}

