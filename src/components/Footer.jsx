import React from 'react';

export default function Footer() {
  // Sidebar replaces the footer nav — this is a minimal status strip
  return (
    <footer style={{ background: 'var(--surface-low)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 32px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
          &copy; {new Date().getFullYear()} The Echo Community
        </span>
        <span style={{ fontSize: 11, color: 'var(--on-surface-var)' }}>
          Built for students of Uttarakhand
        </span>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', textAlign: 'center', letterSpacing: '0.02em' }}>
        TEC is an independent, student-run community &mdash; not affiliated with, officially recognised by, or endorsed by UPES or any other institution.
      </div>
    </footer>
  );
}
