import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const ROLE_META = {
  admin:     { color: '#FF6E84', bg: 'rgba(255,110,132,0.10)', border: 'rgba(255,110,132,0.25)' },
  moderator: { color: '#FF95A0', bg: 'rgba(255,149,160,0.10)', border: 'rgba(255,149,160,0.22)' },
  builder:   { color: '#CC97FF', bg: 'rgba(204,151,255,0.10)', border: 'rgba(204,151,255,0.22)' },
  student:   { color: '#53DDFC', bg: 'rgba(83,221,252,0.10)',  border: 'rgba(83,221,252,0.22)'  },
};

const TABS = [
  { id: 'overview',    icon: 'dashboard',        label: 'Overview'    },
  { id: 'marketplace', icon: 'pending_actions',  label: 'Marketplace' },
  { id: 'deals',       icon: 'sell',             label: 'Deals'       },
  { id: 'listings',    icon: 'location_city',    label: 'Listings'    },
  { id: 'members',     icon: 'people',           label: 'Members'     },
];

const CAT_COLOR = {
  Food: 'var(--secondary)', Transport: 'var(--primary)', Shopping: '#e3b341',
  Health: 'var(--error)', Study: 'var(--tertiary)', Stay: '#a889ff',
};
const DEAL_CATS = ['Food', 'Transport', 'Shopping', 'Health', 'Study', 'Stay'];
const LISTING_TABS = ['PG / Hostels', 'Restaurants', 'Rentals', 'Hangout Spots', 'Activities'];

const DEAL_EMPTY   = { name: '', cat: 'Food', discount: '', desc: '', validity: '', code: '', loc: '' };
const LISTING_EMPTY = { name: '', tab: 'PG / Hostels', loc: '', price: '', rating: 4.0, tags: '', desc: '' };

function RoleBadge({ role }) {
  const m = ROLE_META[role] || ROLE_META.student;
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 5, border: `1px solid ${m.border}`,
      background: m.bg, color: m.color, fontFamily: 'var(--font-display)',
    }}>{role}</span>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ members: 0, posts: 0, listings: 0, issues: 0, deals: 0 });
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [mktListings, setMktListings] = useState([]);
  const [editMktItem, setEditMktItem] = useState(null);
  const [mktFilter, setMktFilter] = useState('all');
  const [deals, setDeals] = useState([]);
  const [dealForm, setDealForm] = useState(DEAL_EMPTY);
  const [editDealId, setEditDealId] = useState(null);
  const [showDealForm, setShowDealForm] = useState(false);
  const [adminListings, setAdminListings] = useState([]);
  const [listingForm, setListingForm] = useState(LISTING_EMPTY);
  const [editListingId, setEditListingId] = useState(null);
  const [showListingForm, setShowListingForm] = useState(false);
  const [activeListingTab, setActiveListingTab] = useState('PG / Hostels');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (tab === 'overview')    fetchOverview();
    if (tab === 'marketplace') fetchMktListings();
    if (tab === 'deals')       fetchDeals();
    if (tab === 'listings')    fetchAdminListings();
    if (tab === 'members')     fetchMembers();
  }, [tab]);

  const fetchOverview = async () => {
    const [m, p, l, i, d] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('feed_posts').select('*', { count: 'exact', head: true }),
      supabase.from('marketplace_listings').select('*', { count: 'exact', head: true }),
      supabase.from('pulse_issues').select('*', { count: 'exact', head: true }),
      supabase.from('deals').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ members: m.count||0, posts: p.count||0, listings: l.count||0, issues: i.count||0, deals: d.count||0 });
  };

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    setMembers(data || []); setLoading(false);
  };

  const fetchMktListings = async () => {
    setLoading(true);
    const { data } = await supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false });
    setMktListings(data || []); setLoading(false);
  };

  const fetchDeals = async () => {
    setLoading(true);
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    setDeals(data || []); setLoading(false);
  };

  const fetchAdminListings = async () => {
    setLoading(true);
    const { data } = await supabase.from('admin_listings').select('*').order('created_at', { ascending: false });
    setAdminListings(data || []); setLoading(false);
  };

  const approveMkt = async (id, val) => {
    await supabase.from('marketplace_listings').update({ approved: val }).eq('id', id);
    setMktListings(p => p.map(l => l.id === id ? { ...l, approved: val } : l));
    showToast(val === true ? 'Approved.' : val === false ? 'Rejected.' : 'Status cleared.');
  };

  const deleteMkt = async (id) => {
    await supabase.from('marketplace_listings').delete().eq('id', id);
    setMktListings(p => p.filter(l => l.id !== id));
    showToast('Listing deleted.');
  };

  const saveMktEdit = async () => {
    if (!editMktItem) return;
    const { id, created_at, user_id, ...fields } = editMktItem;
    await supabase.from('marketplace_listings').update(fields).eq('id', id);
    setMktListings(p => p.map(l => l.id === id ? editMktItem : l));
    setEditMktItem(null); showToast('Listing updated.');
  };

  const saveDeal = async () => {
    if (!dealForm.name.trim()) return;
    if (editDealId) {
      await supabase.from('deals').update(dealForm).eq('id', editDealId);
      setDeals(d => d.map(x => x.id === editDealId ? { ...x, ...dealForm } : x));
      showToast('Deal updated.');
    } else {
      const { data } = await supabase.from('deals').insert({ ...dealForm }).select().single();
      if (data) { setDeals(d => [data, ...d]); showToast('Deal added.'); }
    }
    setDealForm(DEAL_EMPTY); setEditDealId(null); setShowDealForm(false);
  };

  const deleteDeal = async (id) => {
    await supabase.from('deals').delete().eq('id', id);
    setDeals(d => d.filter(x => x.id !== id)); showToast('Deal deleted.');
  };

  const startEditDeal = (deal) => {
    setDealForm({ name: deal.name, cat: deal.cat, discount: deal.discount, desc: deal.desc||'', validity: deal.validity||'', code: deal.code||'', loc: deal.loc||'' });
    setEditDealId(deal.id); setShowDealForm(true);
  };

  const saveAdminListing = async () => {
    if (!listingForm.name.trim()) return;
    if (editListingId) {
      await supabase.from('admin_listings').update(listingForm).eq('id', editListingId);
      setAdminListings(d => d.map(x => x.id === editListingId ? { ...x, ...listingForm } : x));
      showToast('Listing updated.');
    } else {
      const { data } = await supabase.from('admin_listings').insert(listingForm).select().single();
      if (data) { setAdminListings(d => [data, ...d]); showToast('Listing added.'); }
    }
    setListingForm(LISTING_EMPTY); setEditListingId(null); setShowListingForm(false);
  };

  const deleteAdminListing = async (id) => {
    await supabase.from('admin_listings').delete().eq('id', id);
    setAdminListings(d => d.filter(x => x.id !== id)); showToast('Listing deleted.');
  };

  const startEditAdminListing = (item) => {
    setListingForm({ name: item.name, tab: item.tab, loc: item.loc||'', price: item.price||'', rating: item.rating||4.0, tags: item.tags||'', desc: item.desc||'' });
    setEditListingId(item.id); setShowListingForm(true);
  };

  const filteredMkt = mktListings.filter(l => {
    if (mktFilter === 'pending')  return l.approved === null || l.approved === undefined;
    if (mktFilter === 'approved') return l.approved === true;
    if (mktFilter === 'rejected') return l.approved === false;
    return true;
  });

  return (
    <div className="page-wrap" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Control Room</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95 }}>
          ADMIN_<span className="accent-error">PANEL</span>
        </h1>
        <p style={{ color: 'var(--on-surface-var)', fontSize: 13, marginTop: 10 }}>Manage content, deals, listings, and members.</p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--surface-highest)', borderRadius: 14, padding: 4, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: tab === t.id ? 'var(--surface)' : 'transparent',
            color: tab === t.id ? 'var(--on-surface)' : 'var(--on-surface-var)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.06em', transition: 'all 0.14s',
            boxShadow: tab === t.id ? '0 1px 6px rgba(0,0,0,0.3)' : 'none',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Members',    value: stats.members,  icon: 'people',      color: 'var(--secondary)' },
                { label: 'Feed Posts', value: stats.posts,    icon: 'forum',       color: 'var(--primary)'   },
                { label: 'Marketplace',value: stats.listings, icon: 'storefront',  color: 'var(--tertiary)'  },
                { label: 'Pulse Issues',value: stats.issues,  icon: 'how_to_vote', color: '#e3b341'          },
                { label: 'Deals',      value: stats.deals,    icon: 'sell',        color: 'var(--secondary)' },
              ].map(s => (
                <div key={s.label} className="neon-card" style={{ padding: '18px 20px', borderTop: `2px solid ${s.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                    <div className="eyebrow">{s.label}</div>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: s.color, opacity: 0.6 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="neon-card" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Review Listings', tab: 'marketplace', icon: 'pending_actions' },
                  { label: 'Add Deal',    tab: 'deals',    icon: 'sell'         },
                  { label: 'Add Listing', tab: 'listings', icon: 'add_location' },
                  { label: 'Members',     tab: 'members',  icon: 'manage_accounts' },
                ].map(a => (
                  <button key={a.tab} onClick={() => setTab(a.tab)} className="btn-secondary" style={{ fontSize: 11 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'marketplace' && (
          <motion.div key="marketplace" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div className="eyebrow">Marketplace ({mktListings.length})</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['all','All',mktListings.length],['pending','Pending',mktListings.filter(l=>l.approved===null||l.approved===undefined).length],['approved','Approved',mktListings.filter(l=>l.approved===true).length],['rejected','Rejected',mktListings.filter(l=>l.approved===false).length]].map(([id,label,count]) => (
                  <button key={id} onClick={() => setMktFilter(id)} style={{ padding: '4px 12px', borderRadius: 9999, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', background: mktFilter === id ? 'var(--surface)' : 'var(--surface-highest)', color: mktFilter === id ? 'var(--on-surface)' : 'var(--on-surface-var)' }}>{label} ({count})</button>
                ))}
              </div>
            </div>
            {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--on-surface-var)' }}>Loading…</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredMkt.map(item => {
                const sc = item.approved===true ? '#4ade80' : item.approved===false ? 'var(--error)' : '#e3b341';
                const sl = item.approved===true ? 'APPROVED' : item.approved===false ? 'REJECTED' : 'PENDING';
                return (
                  <div key={item.id} className="neon-card" style={{ padding: 18, borderLeft: `3px solid ${sc}` }}>
                    {editMktItem?.id === item.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input className="neon-input" value={editMktItem.title||''} onChange={e => setEditMktItem({...editMktItem,title:e.target.value})} placeholder="Title" style={{ width:'100%',boxSizing:'border-box' }} />
                        <input className="neon-input" value={editMktItem.price||''} onChange={e => setEditMktItem({...editMktItem,price:e.target.value})} placeholder="Price" style={{ width:'100%',boxSizing:'border-box' }} />
                        <textarea className="neon-input" rows={2} value={editMktItem.description||''} onChange={e => setEditMktItem({...editMktItem,description:e.target.value})} placeholder="Description" style={{ width:'100%',boxSizing:'border-box',resize:'vertical' }} />
                        <div style={{ display:'flex',gap:8 }}>
                          <button className="btn-primary" onClick={saveMktEdit} style={{ fontSize:11,padding:'6px 16px' }}>Save</button>
                          <button className="btn-secondary" onClick={() => setEditMktItem(null)} style={{ fontSize:11,padding:'6px 16px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap' }}>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:4,flexWrap:'wrap' }}>
                            <span style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:14 }}>{item.title}</span>
                            <span className="tag-ghost" style={{ fontSize:9 }}>{item.cat}</span>
                            <span style={{ fontSize:9,padding:'2px 8px',borderRadius:9999,fontFamily:'var(--font-mono)',background:`${sc}18`,color:sc }}>{sl}</span>
                          </div>
                          <p style={{ fontSize:12,color:'var(--on-surface-var)',marginBottom:4 }}>{item.description}</p>
                          <span style={{ fontSize:11,color:'var(--on-surface-var)',fontFamily:'var(--font-mono)' }}>by {item.seller_name} · {item.price} · {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                        </div>
                        <div style={{ display:'flex',gap:6,alignItems:'flex-start',flexShrink:0,flexWrap:'wrap' }}>
                          {item.approved!==true  && <button onClick={() => approveMkt(item.id,true)}  style={{ padding:'5px 12px',borderRadius:8,border:'1px solid rgba(74,222,128,0.3)',background:'rgba(74,222,128,0.08)',color:'#4ade80',fontSize:11,cursor:'pointer',fontFamily:'var(--font-display)',fontWeight:700 }}>Approve</button>}
                          {item.approved!==false && <button onClick={() => approveMkt(item.id,false)} style={{ padding:'5px 12px',borderRadius:8,border:'1px solid rgba(255,110,132,0.3)',background:'rgba(255,110,132,0.08)',color:'var(--error)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-display)',fontWeight:700 }}>Reject</button>}
                          <button onClick={() => setEditMktItem({...item})} style={{ padding:'5px 12px',borderRadius:8,border:'1px solid rgba(204,151,255,0.3)',background:'rgba(204,151,255,0.08)',color:'var(--primary)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-display)',fontWeight:700 }}>Edit</button>
                          <button onClick={() => deleteMkt(item.id)} style={{ padding:'5px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',background:'transparent',color:'var(--on-surface-var)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-display)',fontWeight:700 }}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {!loading && filteredMkt.length === 0 && (
                <div style={{ textAlign:'center',padding:'60px 0',color:'var(--on-surface-var)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:40,opacity:0.2,display:'block',marginBottom:12 }}>storefront</span>
                  No listings in this view.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'deals' && (
          <motion.div key="deals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
              <div className="eyebrow">Deals ({deals.length})</div>
              <button className="btn-primary" onClick={() => { setDealForm(DEAL_EMPTY); setEditDealId(null); setShowDealForm(true); }} style={{ fontSize:11,padding:'7px 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize:15 }}>add</span>Add Deal
              </button>
            </div>
            {loading && <div style={{ textAlign:'center',padding:40,color:'var(--on-surface-var)' }}>Loading…</div>}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10 }}>
              {deals.map(d => (
                <div key={d.id} className="neon-card" style={{ padding:18,borderTop:`2px solid ${CAT_COLOR[d.cat]||'var(--primary)'}` }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                    <div>
                      <span style={{ fontSize:9,fontFamily:'var(--font-display)',fontWeight:700,color:CAT_COLOR[d.cat]||'var(--primary)',letterSpacing:'0.07em' }}>{(d.cat||'').toUpperCase()}</span>
                      <div style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:15,marginTop:2 }}>{d.name}</div>
                    </div>
                    <span style={{ fontFamily:'var(--font-display)',fontWeight:900,fontSize:18,color:'var(--secondary)',whiteSpace:'nowrap' }}>{d.discount}</span>
                  </div>
                  <p style={{ fontSize:12,color:'var(--on-surface-var)',marginBottom:6,lineHeight:1.4 }}>{d.desc}</p>
                  <div style={{ fontSize:10,color:'var(--on-surface-var)',fontFamily:'var(--font-mono)',marginBottom:10 }}>{d.loc} · {d.validity}</div>
                  <div style={{ display:'flex',gap:6 }}>
                    <button onClick={() => startEditDeal(d)} style={{ flex:1,padding:'5px 0',borderRadius:8,border:'1px solid rgba(204,151,255,0.3)',background:'rgba(204,151,255,0.08)',color:'var(--primary)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-display)',fontWeight:700 }}>Edit</button>
                    <button onClick={() => deleteDeal(d.id)} style={{ flex:1,padding:'5px 0',borderRadius:8,border:'1px solid rgba(255,110,132,0.25)',background:'rgba(255,110,132,0.06)',color:'var(--error)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-display)',fontWeight:700 }}>Delete</button>
                  </div>
                </div>
              ))}
              {!loading && deals.length === 0 && (
                <div style={{ gridColumn:'1/-1',textAlign:'center',padding:'60px 0',color:'var(--on-surface-var)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:40,opacity:0.2,display:'block',marginBottom:12 }}>sell</span>
                  No deals yet.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'listings' && (
          <motion.div key="listings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:10 }}>
              <div className="eyebrow">Campus Listings ({adminListings.length})</div>
              <button className="btn-primary" onClick={() => { setListingForm(LISTING_EMPTY); setEditListingId(null); setShowListingForm(true); }} style={{ fontSize:11,padding:'7px 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize:15 }}>add</span>Add Listing
              </button>
            </div>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:16 }}>
              {LISTING_TABS.map(t => (
                <button key={t} onClick={() => setActiveListingTab(t)} style={{ padding:'5px 14px',borderRadius:9999,fontFamily:'var(--font-display)',fontSize:11,fontWeight:700,letterSpacing:'0.06em',cursor:'pointer',border:'none',background:activeListingTab===t?'var(--primary)':'var(--surface-highest)',color:activeListingTab===t?'#000':'var(--on-surface-var)',transition:'all 0.14s' }}>{t}</button>
              ))}
            </div>
            {loading && <div style={{ textAlign:'center',padding:40,color:'var(--on-surface-var)' }}>Loading…</div>}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10 }}>
              {adminListings.filter(l => l.tab === activeListingTab).map(item => (
                <div key={item.id} className="neon-card" style={{ padding:18 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                    <div style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:14 }}>{item.name}</div>
                    <span style={{ fontFamily:'var(--font-display)',fontWeight:900,fontSize:13,color:'var(--tertiary)' }}>{item.price}</span>
                  </div>
                  <div style={{ fontSize:11,color:'var(--on-surface-var)',fontFamily:'var(--font-mono)',marginBottom:6 }}>{item.loc}</div>
                  <p style={{ fontSize:12,color:'var(--on-surface-var)',lineHeight:1.4,marginBottom:10 }}>{item.desc}</p>
                  <div style={{ display:'flex',gap:6 }}>
                    <button onClick={() => startEditAdminListing(item)} style={{ flex:1,padding:'5px 0',borderRadius:8,border:'1px solid rgba(204,151,255,0.3)',background:'rgba(204,151,255,0.08)',color:'var(--primary)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-display)',fontWeight:700 }}>Edit</button>
                    <button onClick={() => deleteAdminListing(item.id)} style={{ flex:1,padding:'5px 0',borderRadius:8,border:'1px solid rgba(255,110,132,0.25)',background:'rgba(255,110,132,0.06)',color:'var(--error)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-display)',fontWeight:700 }}>Delete</button>
                  </div>
                </div>
              ))}
              {!loading && adminListings.filter(l => l.tab === activeListingTab).length === 0 && (
                <div style={{ gridColumn:'1/-1',textAlign:'center',padding:'60px 0',color:'var(--on-surface-var)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:40,opacity:0.2,display:'block',marginBottom:12 }}>location_city</span>
                  No listings in this category yet.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'members' && (
          <motion.div key="members" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ marginBottom:14,position:'relative' }}>
              <span className="material-symbols-outlined" style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:16,color:'var(--on-surface-var)' }}>search</span>
              <input className="neon-input" placeholder="Search by name or email…" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} style={{ paddingLeft:38,width:'100%',boxSizing:'border-box' }} />
            </div>
            {loading && <div style={{ textAlign:'center',padding:40,color:'var(--on-surface-var)' }}>Loading…</div>}
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {members.filter(m => !memberSearch || (m.name||'').toLowerCase().includes(memberSearch.toLowerCase()) || (m.email||'').toLowerCase().includes(memberSearch.toLowerCase())).map(m => (
                <div key={m.id} className="neon-card" style={{ padding:'14px 18px',display:'flex',alignItems:'center',gap:14 }}>
                  <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,background:'rgba(204,151,255,0.1)',border:'1.5px solid rgba(204,151,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:16,color:'var(--primary)' }}>{(m.name||'U')[0].toUpperCase()}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:14 }}>{m.name}</div>
                    <div style={{ fontSize:11,color:'var(--on-surface-var)',fontFamily:'var(--font-mono)' }}>{m.email}</div>
                  </div>
                  <RoleBadge role={m.role||'student'} />
                </div>
              ))}
              {!loading && members.length === 0 && (
                <div style={{ textAlign:'center',padding:'60px 0',color:'var(--on-surface-var)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:40,opacity:0.2,display:'block',marginBottom:12 }}>people</span>
                  No members found.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDealForm && (
          <div className="modal-overlay" onClick={() => setShowDealForm(false)}>
            <motion.div className="modal-box" initial={{ opacity:0,scale:0.94 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth:440 }}>
              <h2 style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:900,letterSpacing:'-0.03em',marginBottom:6 }}>{editDealId?'Edit':'New'} <span className="accent-secondary">Deal</span></h2>
              <p style={{ color:'var(--on-surface-var)',fontSize:13,marginBottom:20 }}>Appears on the Deals page for all students.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
                <input className="neon-input" placeholder="Business / Offer Name *" value={dealForm.name} onChange={e => setDealForm({...dealForm,name:e.target.value})} />
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <select className="neon-select" value={dealForm.cat} onChange={e => setDealForm({...dealForm,cat:e.target.value})}>{DEAL_CATS.map(c => <option key={c}>{c}</option>)}</select>
                  <input className="neon-input" placeholder="Discount (e.g. 30% OFF)" value={dealForm.discount} onChange={e => setDealForm({...dealForm,discount:e.target.value})} />
                </div>
                <textarea className="neon-input" rows={3} placeholder="Description" value={dealForm.desc} onChange={e => setDealForm({...dealForm,desc:e.target.value})} style={{ resize:'vertical' }} />
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <input className="neon-input" placeholder="Validity (e.g. Ongoing)" value={dealForm.validity} onChange={e => setDealForm({...dealForm,validity:e.target.value})} />
                  <input className="neon-input" placeholder="Promo Code" value={dealForm.code} onChange={e => setDealForm({...dealForm,code:e.target.value})} />
                </div>
                <input className="neon-input" placeholder="Location" value={dealForm.loc} onChange={e => setDealForm({...dealForm,loc:e.target.value})} />
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button className="btn-primary" onClick={saveDeal} style={{ flex:1,justifyContent:'center' }}>{editDealId?'Save Changes':'Add Deal'}</button>
                <button className="btn-secondary" onClick={() => setShowDealForm(false)} style={{ padding:'12px 20px' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showListingForm && (
          <div className="modal-overlay" onClick={() => setShowListingForm(false)}>
            <motion.div className="modal-box" initial={{ opacity:0,scale:0.94 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.94 }} onClick={e => e.stopPropagation()} style={{ maxWidth:480 }}>
              <h2 style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:900,letterSpacing:'-0.03em',marginBottom:6 }}>{editListingId?'Edit':'New'} <span className="accent-primary">Listing</span></h2>
              <p style={{ color:'var(--on-surface-var)',fontSize:13,marginBottom:20 }}>Appears on the Listings page.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
                <input className="neon-input" placeholder="Name *" value={listingForm.name} onChange={e => setListingForm({...listingForm,name:e.target.value})} />
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <select className="neon-select" value={listingForm.tab} onChange={e => setListingForm({...listingForm,tab:e.target.value})}>{LISTING_TABS.map(t => <option key={t}>{t}</option>)}</select>
                  <input className="neon-input" placeholder="Location" value={listingForm.loc} onChange={e => setListingForm({...listingForm,loc:e.target.value})} />
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <input className="neon-input" placeholder="Price" value={listingForm.price} onChange={e => setListingForm({...listingForm,price:e.target.value})} />
                  <input className="neon-input" type="number" step="0.1" min="0" max="5" placeholder="Rating (0–5)" value={listingForm.rating} onChange={e => setListingForm({...listingForm,rating:parseFloat(e.target.value)||4})} />
                </div>
                <input className="neon-input" placeholder="Tags (comma-separated)" value={listingForm.tags} onChange={e => setListingForm({...listingForm,tags:e.target.value})} />
                <textarea className="neon-input" rows={3} placeholder="Description" value={listingForm.desc} onChange={e => setListingForm({...listingForm,desc:e.target.value})} style={{ resize:'vertical' }} />
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button className="btn-primary" onClick={saveAdminListing} style={{ flex:1,justifyContent:'center' }}>{editListingId?'Save Changes':'Add Listing'}</button>
                <button className="btn-secondary" onClick={() => setShowListingForm(false)} style={{ padding:'12px 20px' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div key="toast" initial={{ opacity:0,y:20,x:'-50%' }} animate={{ opacity:1,y:0,x:'-50%' }} exit={{ opacity:0,y:20,x:'-50%' }}
            style={{ position:'fixed',bottom:32,left:'50%',background:'var(--surface)',border:'1px solid rgba(83,221,252,0.3)',borderRadius:12,padding:'12px 22px',zIndex:9999,fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--secondary)',boxShadow:'0 8px 24px rgba(0,0,0,0.4)',display:'flex',alignItems:'center',gap:8 }}>
            <span className="material-symbols-outlined" style={{ fontSize:16 }}>check_circle</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
