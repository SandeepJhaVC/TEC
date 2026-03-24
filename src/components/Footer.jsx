import React from 'react';
import { Link } from 'react-router-dom';

const links = [
  { label: '🗺️ Map', to: '/map' },
  { label: '🏷️ Discounts', to: '/discounts' },
  { label: '🏠 Listings', to: '/listings' },
  { label: '📋 Assignments', to: '/assignments' },
  { label: '🗳️ Poll', to: '/poll' },
  { label: 'ℹ️ About', to: '/about' },
  { label: '🎉 Events', to: '/events' },
  { label: '👤 Members', to: '/member' },
];

export default function Footer() {
  return (
    <footer style={{ background: '#161b22', borderTop: '1px solid #30363d', padding: '48px 32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
          <div style={{ maxWidth: 280 }}>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: '"Mona Sans", var(--font)', color: '#e6edf3', marginBottom: 10, letterSpacing: '-0.02em' }}>TEC — The Echo Community</div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>Amplifying student lives across Uttarakhand. Find PGs, deals, maps, and community support — all in one place.</p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: 1, marginBottom: 14 }}>PLATFORM</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links.map(l => (
                <Link key={l.to} to={l.to} style={{ fontSize: 14, color: '#64748b', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#e6edf3'}
                  onMouseLeave={e => e.target.style.color = '#8b949e'}>{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: 1, marginBottom: 14 }}>COMMUNITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['📧 Contact Us', '#'], ['💬 WhatsApp Group', '#'], ['📸 Instagram', '#'], ['🐦 Twitter/X', '#']].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: 14, color: '#64748b' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #30363d', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#8b949e' }}>&copy; {new Date().getFullYear()} The Echo Community. All rights reserved.</div>
          <div style={{ fontSize: 13, color: '#8b949e' }}>Built with ❤️ for students of Uttarakhand</div>
        </div>
      </div>
    </footer>
  );
}