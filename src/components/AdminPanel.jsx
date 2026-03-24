import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_META = {
  admin:     { label: "Admin",     color: "var(--error)",    bg: "rgba(255,110,132,0.1)",   border: "rgba(255,110,132,0.25)"   },
  moderator: { label: "Moderator", color: "var(--tertiary)", bg: "rgba(255,149,160,0.1)",   border: "rgba(255,149,160,0.25)"   },
  builder:   { label: "Builder",   color: "var(--primary)",  bg: "rgba(204,151,255,0.1)",   border: "rgba(204,151,255,0.25)"   },
  student:   { label: "Student",   color: "var(--secondary)",bg: "rgba(83,221,252,0.1)",    border: "rgba(83,221,252,0.25)"    },
};

const emptyMember = {
  name: "", joined_at: null, status: "Active Member", certificates: [],
  sap_id: "", pers_email: "", clg_email: "", batch: "", year: "", course: "",
};

const MOCK_PENDING = [
  { id: 101, type: "Listing", title: "CLRS 3rd Ed - Selling",        author: "Arjun S.", time: "10m ago", flag: null },
  { id: 102, type: "Build",   title: "CampusGPT — beta",             author: "Dev A.",   time: "32m ago",flag: "spam" },
  { id: 103, type: "Poll",    title: "Should TEC add carpooling?",    author: "Priya M.", time: "1h ago", flag: null },
  { id: 104, type: "Listing", title: "HP Victus Gaming Laptop",       author: "Vivek P.", time: "2h ago", flag: "duplicate" },
  { id: 105, type: "Build",   title: "SplitIt - bill splitting",      author: "Kiran T.", time: "4h ago", flag: null },
];

const MOCK_ROLE_LOG = [
  { id: 1, user: "Rahul K.",  from: "student", to: "builder",   by: "Admin TEC", time: "Yesterday" },
  { id: 2, user: "Priya M.",  from: "student", to: "moderator", by: "Admin TEC", time: "2 days ago" },
  { id: 3, user: "Sneha B.",  from: "student", to: "builder",   by: "Admin TEC", time: "1 week ago" },
];

function RoleBadge({ role }) {
  const m = ROLE_META[role] || ROLE_META.student;
  return (
    <span style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}`, borderRadius: 9999, padding: "2px 10px", fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", fontFamily: "var(--font-display)" }}>
      {m.label.toUpperCase()}
    </span>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]         = useState("overview");
  const [members, setMembers]             = useState([]);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [form, setForm]                   = useState(emptyMember);
  const [showForm, setShowForm]           = useState(false);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [pending, setPending]             = useState(MOCK_PENDING);
  const [roleLog, setRoleLog]             = useState(MOCK_ROLE_LOG);
  const [roleChangeTarget, setRoleChangeTarget] = useState(null);
  const [roleChangeTo, setRoleChangeTo]   = useState("student");

  const TABS = [
    { id: "overview",   icon: "dashboard",        label: "Overview" },
    { id: "members",    icon: "group",             label: "Members"  },
    { id: "moderation", icon: "policy",            label: "Moderation", badge: pending.length },
    { id: "roles",      icon: "manage_accounts",   label: "Roles"    },
  ];

  useEffect(() => { getMembers(); }, []);

  const getMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("members").select("*").order("name", { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch (e) { console.error(e.message); }
    finally { setLoading(false); }
  };

  const handleInputChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = m => {
    setForm({ ...m, certificates: (m.certificates || []).join(", ") });
    setEditingMemberId(m.id);
    setShowForm(true);
  };

  const handleDelete = async memberId => {
    if (!window.confirm("Delete this member permanently?")) return;
    const { error } = await supabase.from("members").delete().eq("id", memberId);
    if (!error) getMembers();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const certNames = typeof form.certificates === "string"
      ? form.certificates.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    const payload = { name: form.name, status: form.status, certificates: certNames, sap_id: form.sap_id, pers_email: form.pers_email, clg_email: form.clg_email, batch: form.batch, year: form.year, course: form.course };
    if (editingMemberId) payload.joined_at = form.joined_at;
    try {
      if (editingMemberId) {
        await supabase.from("members").update(payload).eq("id", editingMemberId);
      } else {
        await supabase.from("members").insert([payload]);
      }
      getMembers(); setShowForm(false); setForm(emptyMember); setEditingMemberId(null);
    } catch (err) { alert(err.message); }
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", year: "numeric", day: "numeric" }) : "—";
  const moderateItem = id => setPending(p => p.filter(i => i.id !== id));

  const applyRoleChange = () => {
    if (!roleChangeTarget) return;
    const member = members.find(m => String(m.id) === String(roleChangeTarget));
    if (member) {
      setRoleLog(log => [{ id: Date.now(), user: member.name, from: member.role || "student", to: roleChangeTo, by: user?.name || "Admin", time: "Just now" }, ...log]);
    }
    setRoleChangeTarget(null);
  };

  const filteredMembers = members.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.sap_id?.toString().includes(search)
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* ── Top bar ── */}
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
            {t.badge > 0 && (
              <span style={{ background: "var(--error)", color: "#fff", borderRadius: 9999, padding: "0 6px", fontSize: 10, fontWeight: 800, lineHeight: "18px", height: 18, minWidth: 18, textAlign: "center" }}>{t.badge}</span>
            )}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--surface-highest)", borderRadius: 9999 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,110,132,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "var(--error)" }}>{(user?.name || "A")[0].toUpperCase()}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12 }}>{user?.name || "Admin"}</span>
            <RoleBadge role="admin" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 0" }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Platform at a glance</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 36 }}>
              {[
                { label: "Total Members",   value: loading ? "…" : members.length, sub: "registered",        color: "var(--secondary)" },
                { label: "Pending Review",  value: pending.length,                  sub: "listings & builds", color: "#e3b341" },
                { label: "Active Builders", value: roleLog.filter(r => r.to === "builder").length,   sub: "verified builders", color: "var(--primary)" },
                { label: "Moderators",      value: roleLog.filter(r => r.to === "moderator").length, sub: "content reviewers", color: "var(--tertiary)" },
              ].map((s, i) => (
                <div key={i} className="neon-card" style={{ padding: "20px 22px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, letterSpacing: "-0.05em", color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginTop: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "var(--on-surface-var)", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div className="neon-card" style={{ padding: 22 }}>
                <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>Recent Activity</span>
                {[
                  { text: "New member registered — Sneha B.",     time: "5m ago",  color: "var(--secondary)" },
                  { text: "Build listed — StudySync (BETA)",       time: "22m ago", color: "var(--primary)" },
                  { text: "Content flagged — HP Victus listing",   time: "1h ago",  color: "var(--error)" },
                  { text: "Role upgraded — Rahul K. → Builder",    time: "2h ago",  color: "#e3b341" },
                  { text: "Poll created — Carpool feature vote",   time: "3h ago",  color: "var(--tertiary)" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: 13, color: "var(--on-surface)" }}>{a.text}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--on-surface-var)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{a.time}</span>
                  </div>
                ))}
              </div>
              <div className="neon-card" style={{ padding: 22 }}>
                <span className="eyebrow" style={{ display: "block", marginBottom: 14 }}>Quick Actions</span>
                {[
                  { label: "Add new member",          icon: "person_add",    action: () => { setActiveTab("members"); setTimeout(() => { setForm(emptyMember); setEditingMemberId(null); setShowForm(true); }, 100); } },
                  { label: "Review pending content",  icon: "policy",        action: () => setActiveTab("moderation") },
                  { label: "Manage roles",             icon: "manage_accounts", action: () => setActiveTab("roles") },
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

        {/* ── MEMBERS ── */}
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
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or SAP ID…" className="neon-input" style={{ paddingLeft: 40, width: 220 }} />
                </div>
                <button onClick={() => { setForm(emptyMember); setEditingMemberId(null); setShowForm(true); }} className="btn-primary" style={{ fontSize: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                  Add Member
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--on-surface-var)", fontSize: 13 }}>Loading members…</div>
            ) : (
              <div className="neon-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["#", "Name", "SAP ID", "Course", "Batch", "Joined", "Status", ""].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", whiteSpace: "nowrap", fontFamily: "var(--font-display)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((m, i) => (
                        <tr key={m.id} style={{ borderBottom: i < filteredMembers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "10px 16px", color: "var(--on-surface-var)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{m.id}</td>
                          <td style={{ padding: "10px 16px", fontWeight: 700, fontSize: 13 }}>{m.name}</td>
                          <td style={{ padding: "10px 16px", color: "var(--on-surface-var)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{m.sap_id || "—"}</td>
                          <td style={{ padding: "10px 16px", color: "var(--on-surface-var)", fontSize: 12 }}>{m.course || "—"}</td>
                          <td style={{ padding: "10px 16px", color: "var(--on-surface-var)", fontSize: 12 }}>{m.batch || "—"}</td>
                          <td style={{ padding: "10px 16px", color: "var(--on-surface-var)", fontSize: 12 }}>{formatDate(m.joined_at)}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ background: m.status === "Active Member" ? "rgba(83,221,252,0.1)" : "rgba(255,149,160,0.1)", color: m.status === "Active Member" ? "var(--secondary)" : "var(--tertiary)", border: `1px solid ${m.status === "Active Member" ? "rgba(83,221,252,0.2)" : "rgba(255,149,160,0.2)"}`, borderRadius: 9999, padding: "2px 10px", fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", fontFamily: "var(--font-display)" }}>
                              {m.status || "—"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleEdit(m)} className="btn-secondary" style={{ padding: "4px 12px", fontSize: 11 }}>Edit</button>
                              <button onClick={() => handleDelete(m.id)} style={{ padding: "4px 12px", borderRadius: "var(--radius)", background: "rgba(255,110,132,0.1)", border: "1px solid rgba(255,110,132,0.2)", color: "var(--error)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMembers.length === 0 && !loading && (
                    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--on-surface-var)", fontSize: 13 }}>No members found.</div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── MODERATION ── */}
        {activeTab === "moderation" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <span className="eyebrow">Content Moderation</span>
              <span style={{ fontSize: 12, color: "var(--on-surface-var)", display: "block", marginTop: 2 }}>{pending.length} items pending review</span>
            </div>
            {pending.length === 0 ? (
              <div className="neon-card" style={{ padding: "60px 24px", textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--secondary)", display: "block", marginBottom: 12 }}>check_circle</span>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--secondary)", marginBottom: 6 }}>All clear</div>
                <div style={{ fontSize: 13, color: "var(--on-surface-var)" }}>No content pending review.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pending.map(item => (
                  <div key={item.id} className="neon-card" style={{ padding: "16px 20px", borderLeft: `3px solid ${item.flag ? "var(--error)" : "rgba(255,255,255,0.08)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <span className="tag-ghost" style={{ fontSize: 10 }}>{item.type}</span>
                        {item.flag && <span className="tag-error" style={{ fontSize: 9 }}>FLAGGED: {item.flag.toUpperCase()}</span>}
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: "var(--on-surface-var)", marginTop: 3 }}>{item.author} · {item.time}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => moderateItem(item.id)} style={{ padding: "6px 14px", borderRadius: "var(--radius)", background: "rgba(83,221,252,0.1)", border: "1px solid rgba(83,221,252,0.2)", color: "var(--secondary)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Approve</button>
                      <button onClick={() => moderateItem(item.id)} style={{ padding: "6px 14px", borderRadius: "var(--radius)", background: "rgba(255,110,132,0.1)", border: "1px solid rgba(255,110,132,0.2)", color: "var(--error)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Reject</button>
                      <button onClick={() => moderateItem(item.id)} className="btn-secondary" style={{ padding: "6px 14px", fontSize: 11 }}>Ignore</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── ROLES ── */}
        {activeTab === "roles" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Assign Role</span>
                <div className="neon-card" style={{ padding: 22 }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "var(--font-display)" }}>MEMBER</label>
                    <select value={roleChangeTarget || ""} onChange={e => setRoleChangeTarget(e.target.value || null)} className="neon-select" style={{ width: "100%" }}>
                      <option value="">— Select member —</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sap_id || "no SAP"})</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "var(--font-display)" }}>NEW ROLE</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["student", "builder", "moderator", "admin"].map(r => {
                        const m2 = ROLE_META[r];
                        return (
                          <button key={r} onClick={() => setRoleChangeTo(r)} style={{
                            flex: 1, minWidth: 80, padding: "9px 0", borderRadius: "var(--radius)", fontSize: 11, fontWeight: 800,
                            fontFamily: "var(--font-display)", letterSpacing: "0.05em", cursor: "pointer",
                            border: `1px solid ${roleChangeTo === r ? m2.border : "rgba(255,255,255,0.08)"}`,
                            background: roleChangeTo === r ? m2.bg : "transparent",
                            color: roleChangeTo === r ? m2.color : "var(--on-surface-var)",
                            transition: "all 0.14s",
                          }}>{m2.label}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-highest)", borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "var(--on-surface-var)", lineHeight: 1.7, fontFamily: "var(--font-mono)" }}>
                    {roleChangeTo === "admin"     && "Full access: member CRUD, moderation, role management, analytics."}
                    {roleChangeTo === "moderator" && "Can approve/reject content. Cannot manage members or roles."}
                    {roleChangeTo === "builder"   && "Verified builder badge. All student features included."}
                    {roleChangeTo === "student"   && "Default member. Access to all community features."}
                  </div>
                  <button onClick={applyRoleChange} disabled={!roleChangeTarget} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 12, letterSpacing: "0.05em", opacity: roleChangeTarget ? 1 : 0.4 }}>
                    Apply Role Change
                  </button>
                </div>
              </div>

              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Role Change Log</span>
                <div className="neon-card" style={{ marginBottom: 20, overflow: "hidden", padding: 0 }}>
                  {roleLog.length === 0 ? (
                    <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: "var(--on-surface-var)" }}>No role changes yet.</div>
                  ) : roleLog.map((entry, i) => (
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

                <span className="eyebrow" style={{ display: "block", marginBottom: 12 }}>Role Permissions</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { role: "admin",     perms: "Everything: members, moderation, roles, analytics" },
                    { role: "moderator", perms: "Approve/reject content, flag posts" },
                    { role: "builder",   perms: "All student features + verified build badge" },
                    { role: "student",   perms: "Post listings, vote, builds, polls" },
                  ].map(({ role, perms }) => {
                    const m2 = ROLE_META[role];
                    return (
                      <div key={role} style={{ background: "var(--surface-low)", border: `1px solid rgba(255,255,255,0.05)`, borderLeft: `3px solid ${m2.color}`, borderRadius: "var(--radius)", padding: "10px 14px", display: "flex", gap: 12, alignItems: "center" }}>
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
                    { label: "NAME",    name: "name",    ph: "Full name",         req: true },
                    { label: "SAP ID",  name: "sap_id",  ph: "SAP ID" },
                    { label: "COURSE",  name: "course",  ph: "B.Tech CSE" },
                    { label: "BATCH",   name: "batch",   ph: "2022" },
                    { label: "YEAR",    name: "year",    ph: "2nd Year" },
                    { label: "STATUS",  name: "status",  ph: "Active Member" },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: "var(--font-display)" }}>{f.label}</label>
                      <input name={f.name} value={form[f.name] || ""} onChange={handleInputChange} placeholder={f.ph} required={f.req} className="neon-input" style={{ width: "100%", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: "var(--font-display)" }}>PERSONAL EMAIL</label>
                    <input name="pers_email" type="email" value={form.pers_email || ""} onChange={handleInputChange} placeholder="personal@gmail.com" className="neon-input" style={{ width: "100%", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: "var(--font-display)" }}>COLLEGE EMAIL</label>
                    <input name="clg_email" type="email" value={form.clg_email || ""} onChange={handleInputChange} placeholder="name@ddn.upes.ac.in" className="neon-input" style={{ width: "100%", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: "var(--font-display)" }}>CERTIFICATES (comma-separated)</label>
                  <input name="certificates" value={typeof form.certificates === "string" ? form.certificates : (form.certificates || []).join(", ")} onChange={handleInputChange} placeholder="AWS Cloud, Google Analytics…" className="neon-input" style={{ width: "100%", boxSizing: "border-box" }} />
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
