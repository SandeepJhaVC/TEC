import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const ROLE_META = {
  admin:     { color: '#FF6E84', bg: 'rgba(255,110,132,0.12)', label: 'ADMIN' },
  moderator: { color: '#FF95A0', bg: 'rgba(255,149,160,0.12)', label: 'MODERATOR' },
  builder:   { color: '#CC97FF', bg: 'rgba(204,151,255,0.12)', label: 'BUILDER' },
  student:   { color: '#53DDFC', bg: 'rgba(83,221,252,0.12)',  label: 'STUDENT' },
};

function StatCard({ icon, label, value, color = 'var(--primary)' }) {
  return (
    <div className="neon-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.04em', color: 'var(--on-surface)' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--on-surface-var)', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</div>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric', day: 'numeric' });
}

function PublicLookup() {
  const [memberId, setMemberId] = useState('');
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setMember(null); setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('members').select('*').eq('id', memberId.trim().toUpperCase()).single();
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      if (data) setMember(data);
      else setError('Member not found. Please check your Member ID.');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 24, maxWidth: 480 }}>
        <input className="neon-input" placeholder="Enter Member ID (e.g. TEC-AB12)" value={memberId}
          onChange={e => setMemberId(e.target.value)} style={{ flex: 1 }} required />
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 22px', fontSize: 12, whiteSpace: 'nowrap' }}>
          {loading ? 'Looking up\u2026' : 'Look Up'}
        </button>
      </form>

      {error && (
        <div style={{ background: 'rgba(255,110,132,0.1)', border: '1px solid rgba(255,110,132,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', color: 'var(--error)', fontSize: 13, marginBottom: 20 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 8 }}>error</span>
          {error}
        </div>
      )}

      {member && (
        <div className="neon-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(204,151,255,0.15)', border: '2px solid rgba(204,151,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--primary)' }}>
              {(member.name || 'M')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>{member.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--secondary)', marginTop: 2 }}>{member.id}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {(() => { const m = ROLE_META[member.role] || ROLE_META.student; return <span style={{ fontSize: 9, fontWeight: 800, color: m.color, background: m.bg, border: `1px solid ${m.color}30`, borderRadius: 5, padding: '2px 9px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>{m.label}</span>; })()}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 12 }}>
            {[['school', 'Course', member.course], ['calendar_today', 'Batch', member.batch], ['numbers', 'SAP ID', member.sap_id], ['schedule', 'Joined', formatDate(member.joined_at)]].map(([icon, label, val]) => val && (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>{icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.07em', color: 'var(--on-surface-var)', fontFamily: 'var(--font-display)' }}>{label.toUpperCase()}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--on-surface)' }}>{val || '\u2014'}</div>
              </div>
            ))}
          </div>
          {member.certificates?.length > 0 && (
            <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="eyebrow" style={{ display: 'block', marginBottom: 10 }}>Certificates</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {member.certificates.map((cert, i) => {
                  const name = typeof cert === 'string' ? cert : cert.name || 'Certificate';
                  return <button key={i} onClick={() => setSelectedCert(cert)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: 'rgba(204,151,255,0.08)', border: '1px solid rgba(204,151,255,0.2)', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--primary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>workspace_premium</span>
                    {name}
                  </button>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 17 }}>Certificate</h3>
              <button onClick={() => setSelectedCert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-var)' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div style={{ padding: 24, background: 'var(--surface-highest)', borderRadius: 'var(--radius)', textAlign: 'center', marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'var(--primary)', display: 'block', marginBottom: 10 }}>workspace_premium</span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16 }}>{typeof selectedCert === 'string' ? selectedCert : selectedCert.name}</div>
            </div>
            {selectedCert?.file && <a href={selectedCert.file} target="_blank" rel="noreferrer" className="btn-ghost-cyan" style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: 10 }}>View File</a>}
          </div>
        </div>
      )}
    </div>
  );
}

function AuthProfile({ user }) {
  const [member, setMember] = useState(null);
  const [stats, setStats] = useState({ posts: 0, listings: 0, issues: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    async function load() {
      const [memberRes, postsRes, listingsRes, issuesRes, dealsRes] = await Promise.all([
        supabase.from('members').select('*').eq('auth_id', user.id).single(),
        supabase.from('feed_posts').select('id,body,created_at,votes').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('pulse_issues').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('deals').select('name,cat,discount,code,validity,loc').not('code', 'is', null).limit(6),
      ]);
      setMember(memberRes.data || null);
      setStats({
        posts: postsRes.data?.length || 0,
        listings: listingsRes.count || 0,
        issues: issuesRes.count || 0,
      });
      setRecentPosts(postsRes.data || []);
      setDeals((dealsRes.data || []).filter(d => d.code));
      setLoading(false);
    }
    load();
  }, [user.id]);

  const rm = ROLE_META[user.role] || ROLE_META.student;
  const memberCode = user.memberCode || member?.id || '\u2014';
  const joinDate = formatDate(member?.joined_at);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--on-surface-var)' }}>Loading profile\u2026</div>;

  return (
    <div>
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(204,151,255,0.07) 0%, rgba(83,221,252,0.04) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '32px 32px 28px', marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(204,151,255,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(204,151,255,0.18)', border: '2px solid rgba(204,151,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: 'var(--primary)', flexShrink: 0 }}>
            {(user.name || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, letterSpacing: '-0.04em', margin: 0 }}>{user.name}</h2>
              <span style={{ fontSize: 9, fontWeight: 800, color: rm.color, background: rm.bg, border: `1px solid ${rm.color}30`, borderRadius: 5, padding: '2px 9px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>{rm.label}</span>
              {member?.status && <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--secondary)', background: 'rgba(83,221,252,0.1)', border: '1px solid rgba(83,221,252,0.2)', borderRadius: 5, padding: '2px 9px', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>{member.status.toUpperCase()}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--secondary)' }}>badge</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14, color: 'var(--secondary)', letterSpacing: '0.06em' }}>{memberCode}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {[
                ['email', 'Email', user.email],
                ['numbers', 'SAP ID', member?.sap_id || '\u2014'],
                ['school', 'Course', member?.course || '\u2014'],
                ['calendar_today', 'Batch', member?.batch || '\u2014'],
                ['schedule', 'Member since', joinDate],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>{icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.07em', color: 'var(--on-surface-var)', fontFamily: 'var(--font-display)' }}>{label.toUpperCase()}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--on-surface)' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard icon="post_add" label="Posts Relayed" value={stats.posts} color="var(--secondary)" />
        <StatCard icon="storefront" label="Bazaar Listings" value={stats.listings} color="var(--primary)" />
        <StatCard icon="how_to_vote" label="Issues Filed" value={stats.issues} color="#e3b341" />
        <StatCard icon="workspace_premium" label="Certificates" value={member?.certificates?.length || 0} color="var(--tertiary)" />
      </div>

      <div className="two-col" style={{ gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="neon-card" style={{ padding: 22 }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 14 }}>Certificates</span>
            {member?.certificates?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {member.certificates.map((cert, i) => {
                  const name = typeof cert === 'string' ? cert : cert.name || 'Certificate';
                  return (
                    <button key={i} onClick={() => setSelectedCert(cert)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(204,151,255,0.06)', border: '1px solid rgba(204,151,255,0.18)', borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.14s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,151,255,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(204,151,255,0.06)'}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>workspace_premium</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--on-surface)' }}>{name}</div>
                        {cert?.issued && <div style={{ fontSize: 11, color: 'var(--on-surface-var)', marginTop: 2 }}>Issued {formatDate(cert.issued)}</div>}
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--on-surface-var)' }}>open_in_new</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--on-surface-var)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.25, display: 'block', marginBottom: 8 }}>workspace_premium</span>
                <div style={{ fontSize: 13 }}>No certificates yet.</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>Participate in events and workshops to earn them.</div>
              </div>
            )}
          </div>

          <div className="neon-card" style={{ padding: 22 }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 14 }}>Recent Posts</span>
            {recentPosts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentPosts.map(p => (
                  <div key={p.id} style={{ padding: '11px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', borderLeft: '2px solid rgba(83,221,252,0.25)' }}>
                    <div style={{ fontSize: 13, color: 'var(--on-surface)', lineHeight: 1.5, marginBottom: 6 }}>{p.body?.slice(0, 120)}{(p.body?.length || 0) > 120 ? '\u2026' : ''}</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>\u25b2 {p.votes || 0}</span>
                    </div>
                  </div>
                ))}
                <Link to="/feed" className="btn-ghost-cyan" style={{ justifyContent: 'center', fontSize: 11, letterSpacing: '0.08em', marginTop: 4 }}>VIEW ALL IN FEED</Link>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--on-surface-var)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.25, display: 'block', marginBottom: 8 }}>chat_bubble</span>
                <div style={{ fontSize: 13 }}>No posts yet.</div>
                <Link to="/feed" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', marginTop: 6, display: 'inline-block' }}>Go to Feed \u2192</Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="neon-card" style={{ padding: 22, background: 'linear-gradient(135deg, rgba(83,221,252,0.06) 0%, transparent 70%)', borderTop: '2px solid var(--secondary)' }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 10 }}>Your Member Code</span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, letterSpacing: '0.04em', color: 'var(--secondary)', marginBottom: 8 }}>{memberCode}</div>
            <p style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6, marginBottom: 14 }}>
              Show this code when redeeming exclusive TEC member deals and verifying your membership.
            </p>
            <button onClick={() => navigator.clipboard?.writeText(memberCode)} className="btn-ghost-cyan" style={{ fontSize: 11, letterSpacing: '0.06em' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>content_copy</span>
              Copy Code
            </button>
          </div>

          {deals.length > 0 && (
            <div className="neon-card" style={{ padding: 22 }}>
              <span className="eyebrow" style={{ display: 'block', marginBottom: 14 }}>Member Promo Codes</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {deals.map((d, i) => (
                  <div key={i} style={{ padding: '11px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', borderLeft: '2px solid rgba(204,151,255,0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--on-surface)' }}>{d.name}</div>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, color: 'var(--primary)' }}>{d.discount}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--secondary)', background: 'rgba(83,221,252,0.1)', border: '1px solid rgba(83,221,252,0.2)', borderRadius: 6, padding: '2px 10px', letterSpacing: '0.08em' }}>{d.code}</span>
                      {d.validity && <span style={{ fontSize: 10, color: 'var(--on-surface-var)' }}>{d.validity}</span>}
                    </div>
                  </div>
                ))}
                <Link to="/discounts" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', marginTop: 4 }}>View all deals \u2192</Link>
              </div>
            </div>
          )}

          <div className="neon-card" style={{ padding: 22 }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 12 }}>Quick Access</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['storefront', 'My Bazaar Listings', '/assignments'], ['how_to_vote', 'Pulse Board', '/poll'], ['workspace_premium', 'Discounts & Deals', '/discounts'], ['event', 'Events', '/events']].map(([icon, label, to]) => (
                <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', color: 'var(--on-surface-var)', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'all 0.14s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(204,151,255,0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--on-surface-var)'; }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18 }}>Certificate</h3>
              <button onClick={() => setSelectedCert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-var)' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div style={{ padding: 28, background: 'var(--surface-highest)', borderRadius: 'var(--radius)', textAlign: 'center', marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 52, color: 'var(--primary)', display: 'block', marginBottom: 12 }}>workspace_premium</span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{typeof selectedCert === 'string' ? selectedCert : selectedCert.name}</div>
              {selectedCert?.issued && <div style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>Issued {formatDate(selectedCert.issued)}</div>}
            </div>
            {selectedCert?.file && <a href={selectedCert.file} target="_blank" rel="noreferrer" className="btn-ghost-cyan" style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: 10, fontSize: 13 }}>View Certificate File</a>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemberPortal() {
  const { user } = useAuth();
  return (
    <div className="page-wrap" style={{ maxWidth: 1100 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{user ? 'Your Account' : 'Member Lookup'}</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 6 }}>
        MEMBER_<span className="accent-primary">PORTAL</span>
      </h1>
      <p style={{ color: 'var(--on-surface-var)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
        {user ? `Welcome back, ${user.name}. View your profile, certificates, and member codes below.` : 'Enter your Member ID to view a public profile and verify membership.'}
      </p>
      {user ? <AuthProfile user={user} /> : (
        <>
          <div className="neon-card" style={{ padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, borderLeft: '3px solid var(--primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>info</span>
            <span style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>
              <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link> to access your full profile, certificates, and exclusive promo codes.
            </span>
          </div>
          <PublicLookup />
        </>
      )}
    </div>
  );
}
