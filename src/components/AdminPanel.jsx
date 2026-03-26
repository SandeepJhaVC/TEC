import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_META = {
  admin: { label: "Admin", color: "var(--error)", bg: "rgba(255,110,132,0.1)", border: "rgba(255,110,132,0.25)" },
  moderator: { label: "Moderator", color: "var(--tertiary)", bg: "rgba(255,149,160,0.1)", border: "rgba(255,149,160,0.25)" },
  builder: { label: "Builder", color: "var(--primary)", bg: "rgba(204,151,255,0.1)", border: "rgba(204,151,255,0.25)" },
  student: { label: "Student", color: "var(--secondary)", bg: "rgba(83,221,252,0.1)", border: "rgba(83,221,252,0.25)" },
};

const emptyMember = {
  name: "", joined_at: null, status: "Active Member", certificates: [],
  sap_id: "", pers_email: "", clg_email: "", batch: "", year: "", course: "",
};

function RoleBadge({ role }) {
  const m = ROLE_META[role] || ROLE_META.student;
  return (
    <span style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}`, borderRadius: 9999, padding: "2px 10px", fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", fontFamily: "var(--font-display)" }}>
      {m.label.toUpperCase()}
    </span>
  );
}

function StatCard({ label, value, sub, color, loading }) {
  return (
    <div className="neon-card" style={{ padding: "20px 22px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, letterSpacing: "-0.05em", color, lineHeight: 1 }}>
        {loading ? "…" : value}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 11, color: "var(--on-surface-var)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

const DEL_BTN = { padding: "4px 12px", borderRadius: "var(--radius)", background: "rgba(255,110,132,0.1)", border: "1px solid rgba(255,110,132,0.2)", color: "var(--error)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const TH = { padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", fontFamily: "var(--font-display)", whiteSpace: "nowrap" };
const TD = { padding: "10px 16px" };

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Members
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [form, setForm] = useState(emptyMember);
  const [showForm, setShowForm] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  // Content logs
  const [feedPosts, setFeedPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logTab, setLogTab] = useState("feed");

  // Stats
  const [statsLoading, setStatsLoading] = useState(true);

  // Roles
  const [roleLog, setRoleLog] = useState([]);
  const [roleTarget, setRoleTarget] = useState("");
  const [roleTo, setRoleTo] = useState("student");

  // ── Deals (admin CRUD) ────────────────────────────────────────────────────
  const CATS_DEAL = ["Food", "Transport", "Shopping", "Health", "Study", "Stay"];
  const emptyDeal = { name: "", cat: "Food", discount: "", desc: "", validity: "", code: "", loc: "", rating: 4.0 };
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dealForm, setDealForm] = useState(emptyDeal);
  const [editingDealId, setEditingDealId] = useState(null);
  const [showDealForm, setShowDealForm] = useState(false);

  // ── Admin Listings (local_listings) ──────────────────────────────────────
  const LISTING_TABS_ADMIN = ["PG / Hostels", "Restaurants", "Rentals", "Hangout Spots", "Activities"];
  const emptyListing = { name: "", tab: "PG / Hostels", loc: "", price: "", rating: 4.0, tags: "", desc: "", reviews: 0 };
  const [adminListings, setAdminListings] = useState([]);
  const [adminListingsLoading, setAdminListingsLoading] = useState(true);
  const [listingForm, setListingForm] = useState(emptyListing);
  const [editingListingId, setEditingListingId] = useState(null);
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingTabFilter, setListingTabFilter] = useState("PG / Hostels");

  const TABS = [
    { id: "overview", icon: "dashboard", label: "Overview" },
    { id: "logs", icon: "terminal", label: "Content" },
    { id: "deals", icon: "sell", label: "Deals" },
    { id: "listings", icon: "location_city", label: "Listings" },
    { id: "members", icon: "group", label: "Members" },
    { id: "roles", icon: "manage_accounts", label: "Roles" },
  ];

  const fetchAll = useCallback(async () => {
    setMembersLoading(true);
    setLogsLoading(true);
    setStatsLoading(true);
    setDealsLoading(true);
    setAdminListingsLoading(true);

    const [{ data: mData }, { data: fData }, { data: lData }, { data: iData }, { data: dData }, { data: alData }] = await Promise.all([
      supabase.from("members").select("*").order("name"),
      supabase.from("feed_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("marketplace_listings").select("*").order("created_at", { ascending: false }),
      supabase.from("pulse_issues").select("*").order("votes", { ascending: false }),
      supabase.from("deals").select("*").order("id", { ascending: true }),
      supabase.from("local_listings").select("*").order("id", { ascending: true }),
    ]);

    setMembers(mData || []);
    setFeedPosts(fData || []);
    setListings(lData || []);
    setIssues(iData || []);
    setDeals(dData || []);
    setAdminListings(alData || []);
    setMembersLoading(false);
    setLogsLoading(false);
    setStatsLoading(false);
    setDealsLoading(false);
    setAdminListingsLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Member CRUD ─────────────────────────────────────────────────────────────
  const handleEdit = m => {
    setForm({ ...m, certificates: (m.certificates || []).join(", ") });
    setEditingMemberId(m.id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this member permanently?")) return;
    await supabase.from("members").delete().eq("id", id);
    setMembers(ms => ms.filter(m => m.id !== id));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const certs = typeof form.certificates === "string"
      ? form.certificates.split(",").map(s => s.trim()).filter(Boolean) : [];
    const payload = { name: form.name, status: form.status, certificates: certs, sap_id: form.sap_id, pers_email: form.pers_email, clg_email: form.clg_email, batch: form.batch, year: form.year, course: form.course };
    if (editingMemberId) {
      await supabase.from("members").update(payload).eq("id", editingMemberId);
    } else {
      await supabase.from("members").insert([payload]);
    }
    const { data } = await supabase.from("members").select("*").order("name");
    setMembers(data || []);
    setShowForm(false); setForm(emptyMember); setEditingMemberId(null);
  };

  // ─── Content delete ───────────────────────────────────────────────────────────
  const deletePost = async id => { await supabase.from("feed_posts").delete().eq("id", id); setFeedPosts(ps => ps.filter(p => p.id !== id)); };
  const deleteListing = async id => { await supabase.from("marketplace_listings").delete().eq("id", id); setListings(ls => ls.filter(l => l.id !== id)); };
  const deleteIssue = async id => { await supabase.from("pulse_issues").delete().eq("id", id); setIssues(is => is.filter(i => i.id !== id)); };

  const approveListing = async id => {
    await supabase.from("marketplace_listings").update({ status: "approved" }).eq("id", id);
    setListings(ls => ls.map(l => l.id === id ? { ...l, status: "approved" } : l));
  };
  const rejectListing = async id => {
    await supabase.from("marketplace_listings").update({ status: "rejected" }).eq("id", id);
    setListings(ls => ls.map(l => l.id === id ? { ...l, status: "rejected" } : l));
  };

  // ─── Deals CRUD ───────────────────────────────────────────────────────────────
  const handleDealSubmit = async e => {
    e.preventDefault();
    const payload = { name: dealForm.name, cat: dealForm.cat, discount: dealForm.discount, desc: dealForm.desc, validity: dealForm.validity, code: dealForm.code, loc: dealForm.loc, rating: parseFloat(dealForm.rating) || 4.0 };
    if (editingDealId) {
      await supabase.from("deals").update(payload).eq("id", editingDealId);
    } else {
      await supabase.from("deals").insert([payload]);
    }
    const { data } = await supabase.from("deals").select("*").order("id");
    setDeals(data || []);
    setShowDealForm(false); setDealForm(emptyDeal); setEditingDealId(null);
  };
  const handleDealEdit = d => { setDealForm({ ...d }); setEditingDealId(d.id); setShowDealForm(true); };
  const handleDealDelete = async id => {
    if (!window.confirm("Delete this deal?")) return;
    await supabase.from("deals").delete().eq("id", id);
    setDeals(ds => ds.filter(d => d.id !== id));
  };

  // ─── Admin Listings CRUD ──────────────────────────────────────────────────────
  const handleListingSubmit = async e => {
    e.preventDefault();
    const payload = { name: listingForm.name, tab: listingForm.tab, loc: listingForm.loc, price: listingForm.price, rating: parseFloat(listingForm.rating) || 4.0, tags: (listingForm.tags || "").split(",").map(t => t.trim()).filter(Boolean), desc: listingForm.desc, reviews: parseInt(listingForm.reviews) || 0 };
    if (editingListingId) {
      await supabase.from("local_listings").update(payload).eq("id", editingListingId);
    } else {
      await supabase.from("local_listings").insert([payload]);
    }
    const { data } = await supabase.from("local_listings").select("*").order("id");
    setAdminListings(data || []);
    setShowListingForm(false); setListingForm(emptyListing); setEditingListingId(null);
  };
  const handleListingEdit = l => { setListingForm({ ...l, tags: Array.isArray(l.tags) ? l.tags.join(", ") : (l.tags || "") }); setEditingListingId(l.id); setShowListingForm(true); };
  const handleListingDelete = async id => {
    if (!window.confirm("Delete this listing?")) return;
    await supabase.from("local_listings").delete().eq("id", id);
    setAdminListings(ls => ls.filter(l => l.id !== id));
  };

  const updateIssueStatus = async (id, status) => {
    await supabase.from("pulse_issues").update({ status }).eq("id", id);
    setIssues(is => is.map(i => i.id === id ? { ...i, status } : i));
  };

  // ─── Role change → upsert user_roles table ───────────────────────────────────
  const applyRoleChange = async () => {
    if (!roleTarget) return;
    const member = members.find(m => String(m.id) === String(roleTarget));
    await supabase.from("user_roles").upsert({ user_id: roleTarget, role: roleTo }, { onConflict: "user_id" });
    setRoleLog(log => [{
      id: Date.now(), user: member?.name || roleTarget,
      from: member?.role || "student", to: roleTo,
      by: user?.name || "Admin", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }, ...log]);
    setRoleTarget("");
  };

  const fmt = d => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const fmtT = d => d ? new Date(d).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const filteredMembers = members.filter(m =>
    !memberSearch || m.name?.toLowerCase().includes(memberSearch.toLowerCase()) || m.sap_id?.toString().includes(memberSearch)
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>

      {/* ── Tab bar ── */}
      <div style={{ background: "var(--surface-low)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", display: "flex", gap: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "16px 20px",
            background: "transparent", border: "none", fontFamily: "var(--font-display)",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
            color: activeTab === t.id ? "var(--on-surface)" : "var(--on-surface-var)",
            borderBottom: activeTab === t.id ? "2px solid var(--primary)" : "2px solid transparent",
            cursor: "pointer", transition: "all 0.14s",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--surface-highest)", borderRadius: 9999 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,110,132,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "var(--error)" }}>{(user?.name || "A")[0].toUpperCase()}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12 }}>{user?.name || "Admin"}</span>
            <RoleBadge role="admin" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 0" }}>

        {/* ═══════════════════════ OVERVIEW ═══════════════════════ */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Platform at a glance</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 36 }}>
              <StatCard label="Registered Members" value={members.length} sub="all time" color="var(--secondary)" loading={statsLoading} />
              <StatCard label="Feed Posts" value={feedPosts.length} sub="community pulses" color="var(--primary)" loading={statsLoading} />
              <StatCard label="Marketplace Listings" value={listings.length} sub="active listings" color="var(--tertiary)" loading={statsLoading} />
              <StatCard label="Pulse Issues" value={issues.length} sub="reported problems" color="#e3b341" loading={statsLoading} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div className="neon-card" style={{ padding: 22 }}>
                <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>Latest Feed Posts</span>
                {feedPosts.length === 0
                  ? <div style={{ fontSize: 13, color: "var(--on-surface-var)", padding: "16px 0" }}>No posts yet.</div>
                  : feedPosts.slice(0, 5).map((p, i) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", minWidth: 0 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: 5 }} />
                        <span style={{ fontSize: 13, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.body?.slice(0, 60)}{(p.body?.length || 0) > 60 ? "…" : ""}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--on-surface-var)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{fmtT(p.created_at)}</span>
                    </div>
                  ))}
              </div>
              <div className="neon-card" style={{ padding: 22 }}>
                <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>Quick Actions</span>
                {[
                  { label: "View all content logs", icon: "terminal", action: () => setActiveTab("logs") },
                  { label: "Add new member", icon: "person_add", action: () => { setActiveTab("members"); setTimeout(() => { setForm(emptyMember); setEditingMemberId(null); setShowForm(true); }, 100); } },
                  { label: "Manage user roles", icon: "manage_accounts", action: () => setActiveTab("roles") },
                ].map((q, i) => (
                  <button key={i} onClick={q.action} className="btn-secondary" style={{ width: "100%", justifyContent: "flex-start", marginBottom: 8, fontSize: 13 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{q.icon}</span>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ CONTENT LOGS ═══════════════════════ */}
        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Content Logs</div>
            <p style={{ fontSize: 13, color: "var(--on-surface-var)", marginBottom: 20 }}>All user-generated content. Admins can delete any entry or update issue status.</p>

            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { id: "feed", label: `Feed Posts (${feedPosts.length})`, icon: "campaign" },
                { id: "listings", label: `Listings (${listings.length})`, icon: "storefront" },
                { id: "issues", label: `Pulse Issues (${issues.length})`, icon: "how_to_vote" },
              ].map(t => (
                <button key={t.id} onClick={() => setLogTab(t.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                  color: logTab === t.id ? "var(--on-surface)" : "var(--on-surface-var)",
                  borderBottom: logTab === t.id ? "2px solid var(--secondary)" : "2px solid transparent",
                  transition: "all 0.14s",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {logsLoading ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--on-surface-var)" }}>Loading logs…</div>
            ) : (
              <>
                {/* Feed Posts */}
                {logTab === "feed" && (
                  <div className="neon-card" style={{ padding: 0, overflow: "hidden" }}>
                    {feedPosts.length === 0
                      ? <div style={{ padding: 48, textAlign: "center", color: "var(--on-surface-var)" }}>No feed posts.</div>
                      : <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["User", "Role", "Body", "Votes", "Posted", ""].map(h => <th key={h} style={TH}>{h}</th>)}
                          </tr></thead>
                          <tbody>{feedPosts.map((p, i) => (
                            <tr key={p.id} style={{ borderBottom: i < feedPosts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                              <td style={{ ...TD, fontWeight: 700, whiteSpace: "nowrap" }}>{p.user_name || "—"}</td>
                              <td style={TD}><RoleBadge role={p.user_role || "student"} /></td>
                              <td style={{ ...TD, color: "var(--on-surface-var)", maxWidth: 340 }}>{p.body?.slice(0, 100)}{(p.body?.length || 0) > 100 ? "…" : ""}</td>
                              <td style={{ ...TD, fontFamily: "var(--font-mono)", color: "var(--secondary)" }}>{p.votes}</td>
                              <td style={{ ...TD, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-var)", whiteSpace: "nowrap" }}>{fmtT(p.created_at)}</td>
                              <td style={TD}><button style={DEL_BTN} onClick={() => deletePost(p.id)}>Delete</button></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>}
                  </div>
                )}

                {/* Marketplace Listings */}
                {logTab === "listings" && (
                  <div className="neon-card" style={{ padding: 0, overflow: "hidden" }}>
                    {listings.length === 0
                      ? <div style={{ padding: 48, textAlign: "center", color: "var(--on-surface-var)" }}>No listings.</div>
                      : <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["Title", "Category", "Condition", "Price", "Seller", "Contact", "Posted", ""].map(h => <th key={h} style={TH}>{h}</th>)}
                          </tr></thead>
                          <tbody>{listings.map((l, i) => (
                            <tr key={l.id} style={{ borderBottom: i < listings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                              <td style={{ ...TD, fontWeight: 700 }}>{l.title}</td>
                              <td style={TD}><span className="tag-ghost" style={{ fontSize: 10 }}>{l.cat}</span></td>
                              <td style={{ ...TD, fontSize: 11, color: "var(--on-surface-var)" }}>{l.condition || "—"}</td>
                              <td style={{ ...TD, color: "var(--tertiary)", fontFamily: "var(--font-display)", fontWeight: 700 }}>{l.price}</td>
                              <td style={{ ...TD, color: "var(--on-surface-var)", fontSize: 12 }}>{l.seller_name || "—"}</td>
                              <td style={{ ...TD, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-var)" }}>{l.contact || "—"}</td>
                              <td style={{ ...TD, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-var)", whiteSpace: "nowrap" }}>{fmtT(l.created_at)}</td>
                              <td style={TD}><button style={DEL_BTN} onClick={() => deleteListing(l.id)}>Delete</button></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>}
                  </div>
                )}

                {/* Pulse Issues */}
                {logTab === "issues" && (
                  <div className="neon-card" style={{ padding: 0, overflow: "hidden" }}>
                    {issues.length === 0
                      ? <div style={{ padding: 48, textAlign: "center", color: "var(--on-surface-var)" }}>No issues reported.</div>
                      : <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["Title", "Area", "Category", "Votes", "Status", "Reported", ""].map(h => <th key={h} style={TH}>{h}</th>)}
                          </tr></thead>
                          <tbody>{issues.map((iss, i) => (
                            <tr key={iss.id} style={{ borderBottom: i < issues.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                              <td style={{ ...TD, fontWeight: 700, maxWidth: 260 }}>{iss.title}</td>
                              <td style={{ ...TD, color: "var(--secondary)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11 }}>{iss.area}</td>
                              <td style={TD}><span className="tag-ghost" style={{ fontSize: 10 }}>{iss.cat}</span></td>
                              <td style={{ ...TD, fontFamily: "var(--font-mono)", color: "var(--primary)" }}>{iss.votes}</td>
                              <td style={TD}>
                                <select value={iss.status} onChange={e => updateIssueStatus(iss.id, e.target.value)} className="neon-select" style={{ fontSize: 11, padding: "3px 8px", minWidth: 110 }}>
                                  {["Submitted", "In Review", "Forwarded", "Resolved"].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td style={{ ...TD, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-var)", whiteSpace: "nowrap" }}>{fmtT(iss.created_at)}</td>
                              <td style={TD}><button style={DEL_BTN} onClick={() => deleteIssue(iss.id)}>Delete</button></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════ MEMBERS ═══════════════════════ */}
        {activeTab === "members" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <span className="eyebrow">Registered Members</span>
                <span style={{ fontSize: 12, color: "var(--on-surface-var)", display: "block", marginTop: 2 }}>{members.length} total</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <span className="material-symbols-outlined" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--on-surface-var)" }}>search</span>
                  <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Search name or SAP ID…" className="neon-input" style={{ paddingLeft: 40, width: 220 }} />
                </div>
                <button onClick={() => { setForm(emptyMember); setEditingMemberId(null); setShowForm(true); }} className="btn-primary" style={{ fontSize: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                  Add Member
                </button>
              </div>
            </div>
            {membersLoading ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--on-surface-var)" }}>Loading members…</div>
            ) : (
              <div className="neon-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["#", "Name", "SAP ID", "Course", "Batch", "Joined", "Status", ""].map(h => <th key={h} style={TH}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((m, i) => (
                        <tr key={m.id} style={{ borderBottom: i < filteredMembers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ ...TD, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{m.id}</td>
                          <td style={{ ...TD, fontWeight: 700 }}>{m.name}</td>
                          <td style={{ ...TD, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{m.sap_id || "—"}</td>
                          <td style={{ ...TD, color: "var(--on-surface-var)", fontSize: 12 }}>{m.course || "—"}</td>
                          <td style={{ ...TD, color: "var(--on-surface-var)", fontSize: 12 }}>{m.batch || "—"}</td>
                          <td style={{ ...TD, color: "var(--on-surface-var)", fontSize: 12 }}>{fmt(m.joined_at)}</td>
                          <td style={TD}>
                            <span style={{ background: m.status === "Active Member" ? "rgba(83,221,252,0.1)" : "rgba(255,149,160,0.1)", color: m.status === "Active Member" ? "var(--secondary)" : "var(--tertiary)", border: `1px solid ${m.status === "Active Member" ? "rgba(83,221,252,0.2)" : "rgba(255,149,160,0.2)"}`, borderRadius: 9999, padding: "2px 10px", fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", fontFamily: "var(--font-display)" }}>
                              {m.status || "—"}
                            </span>
                          </td>
                          <td style={TD}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleEdit(m)} className="btn-secondary" style={{ padding: "4px 12px", fontSize: 11 }}>Edit</button>
                              <button onClick={() => handleDelete(m.id)} style={DEL_BTN}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMembers.length === 0 && (
                    <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--on-surface-var)", fontSize: 13 }}>No members found.</div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════ ROLES ═══════════════════════ */}
        {activeTab === "roles" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Assign Role</span>
                <div className="neon-card" style={{ padding: 22 }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "var(--font-display)" }}>MEMBER</label>
                    <select value={roleTarget} onChange={e => setRoleTarget(e.target.value)} className="neon-select" style={{ width: "100%" }}>
                      <option value="">— Select member —</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sap_id || "no SAP"})</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "var(--font-display)" }}>NEW ROLE</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["student", "builder", "moderator", "admin"].map(r => {
                        const rm = ROLE_META[r];
                        return (
                          <button key={r} onClick={() => setRoleTo(r)} style={{
                            flex: 1, minWidth: 80, padding: "9px 0", borderRadius: "var(--radius)", fontSize: 11, fontWeight: 800,
                            fontFamily: "var(--font-display)", letterSpacing: "0.05em", cursor: "pointer",
                            border: `1px solid ${roleTo === r ? rm.border : "rgba(255,255,255,0.08)"}`,
                            background: roleTo === r ? rm.bg : "transparent",
                            color: roleTo === r ? rm.color : "var(--on-surface-var)",
                            transition: "all 0.14s",
                          }}>{rm.label}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-highest)", borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                    {roleTo === "admin" && "Full access: members, content logs, roles, all data."}
                    {roleTo === "moderator" && "Approve/reject content. Cannot manage members or roles."}
                    {roleTo === "builder" && "Verified builder badge. All student features included."}
                    {roleTo === "student" && "Default member. Access to all community features."}
                  </div>
                  <div style={{ padding: "10px 14px", background: "rgba(227,179,65,0.06)", border: "1px solid rgba(227,179,65,0.15)", borderRadius: "var(--radius)", marginBottom: 18, fontSize: 11, color: "#e3b341", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                    ⚠ Updates user_roles table. User must sign out and back in for the new role to take effect.
                  </div>
                  <button onClick={applyRoleChange} disabled={!roleTarget} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 12, letterSpacing: "0.05em", opacity: roleTarget ? 1 : 0.4 }}>
                    Apply Role Change
                  </button>
                </div>
              </div>

              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Role Change Log <span style={{ fontSize: 10, color: "var(--on-surface-var)", fontWeight: 400 }}>(this session)</span></span>
                <div className="neon-card" style={{ marginBottom: 20, overflow: "hidden", padding: 0 }}>
                  {roleLog.length === 0
                    ? <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: "var(--on-surface-var)" }}>No role changes this session.</div>
                    : roleLog.map((entry, i) => (
                      <div key={entry.id} style={{ padding: "14px 18px", borderBottom: i < roleLog.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13 }}>{entry.user}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                            <RoleBadge role={entry.from} />
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--on-surface-var)" }}>arrow_forward</span>
                            <RoleBadge role={entry.to} />
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)" }}>{entry.time}</div>
                          <div style={{ fontSize: 11, color: "var(--on-surface-var)", marginTop: 2 }}>by {entry.by}</div>
                        </div>
                      </div>
                    ))}
                </div>

                <span className="eyebrow" style={{ display: "block", marginBottom: 12 }}>Role Hierarchy</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { role: "admin", perms: "Everything: members, content logs, roles, analytics" },
                    { role: "moderator", perms: "Approve/reject content, flag posts" },
                    { role: "builder", perms: "All student features + verified build badge" },
                    { role: "student", perms: "Post listings, vote, report issues, use polls" },
                  ].map(({ role, perms }) => {
                    const rm = ROLE_META[role];
                    return (
                      <div key={role} style={{ background: "var(--surface-low)", border: "1px solid rgba(255,255,255,0.05)", borderLeft: `3px solid ${rm.color}`, borderRadius: "var(--radius)", padding: "10px 14px", display: "flex", gap: 12, alignItems: "center" }}>
                        <RoleBadge role={role} />
                        <span style={{ fontSize: 12, color: "var(--on-surface-var)" }}>{perms}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Member Form Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.94, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94 }}
              onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 20 }}>
                {editingMemberId ? "Edit " : "Add "}<span className="accent-primary">Member</span>
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[
                    { label: "NAME", name: "name", ph: "Full name", req: true },
                    { label: "SAP ID", name: "sap_id", ph: "SAP ID" },
                    { label: "COURSE", name: "course", ph: "B.Tech CSE" },
                    { label: "BATCH", name: "batch", ph: "2022" },
                    { label: "YEAR", name: "year", ph: "2nd Year" },
                    { label: "STATUS", name: "status", ph: "Active Member" },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: "var(--font-display)" }}>{f.label}</label>
                      <input name={f.name} value={form[f.name] || ""} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} placeholder={f.ph} required={!!f.req} className="neon-input" style={{ width: "100%", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: "var(--font-display)" }}>PERSONAL EMAIL</label>
                    <input type="email" value={form.pers_email || ""} onChange={e => setForm({ ...form, pers_email: e.target.value })} placeholder="personal@gmail.com" className="neon-input" style={{ width: "100%", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: "var(--font-display)" }}>COLLEGE EMAIL</label>
                    <input type="email" value={form.clg_email || ""} onChange={e => setForm({ ...form, clg_email: e.target.value })} placeholder="name@ddn.upes.ac.in" className="neon-input" style={{ width: "100%", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: "var(--font-display)" }}>CERTIFICATES (comma-separated)</label>
                  <input value={typeof form.certificates === "string" ? form.certificates : (form.certificates || []).join(", ")} onChange={e => setForm({ ...form, certificates: e.target.value })} placeholder="AWS Cloud, Google Analytics…" className="neon-input" style={{ width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: 12, fontSize: 12 }}>
                    {editingMemberId ? "Save Changes" : "Add Member"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingMemberId(null); setForm(emptyMember); }} style={{ padding: "12px 20px" }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}














