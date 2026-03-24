import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_META = {
  admin:     { label: "Admin",     color: "#f85149", bg: "rgba(248,81,73,0.12)",   border: "rgba(248,81,73,0.3)"   },
  moderator: { label: "Moderator", color: "#e3b341", bg: "rgba(227,179,65,0.12)",  border: "rgba(227,179,65,0.3)"  },
  builder:   { label: "Builder",   color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" },
  student:   { label: "Student",   color: "#3fb950", bg: "rgba(63,185,80,0.12)",   border: "rgba(63,185,80,0.3)"   },
};

const emptyMember = {
  name: "", joined_at: null, status: "Active Member", certificates: [],
  sap_id: "", pers_email: "", clg_email: "", batch: "", year: "", course: "",
};

// Mock pending content for moderation tab
const MOCK_PENDING = [
  { id: 101, type: "Listing", title: "CLRS 3rd Ed - Selling", author: "Arjun S.", time: "10m ago", flag: null },
  { id: 102, type: "Build",   title: "CampusGPT — beta",       author: "Dev A.",   time: "32m ago", flag: "spam" },
  { id: 103, type: "Poll",    title: "Should TEC add carpooling?", author: "Priya M.", time: "1h ago", flag: null },
  { id: 104, type: "Listing", title: "HP Victus Gaming Laptop", author: "Vivek P.", time: "2h ago", flag: "duplicate" },
  { id: 105, type: "Build",   title: "SplitIt - bill splitting", author: "Kiran T.", time: "4h ago", flag: null },
];

// Mock role change log
const MOCK_ROLE_LOG = [
  { id: 1, user: "Rahul K.",  from: "student", to: "builder",   by: "Admin TEC", time: "Yesterday" },
  { id: 2, user: "Priya M.",  from: "student", to: "moderator", by: "Admin TEC", time: "2 days ago" },
  { id: 3, user: "Sneha B.",  from: "student", to: "builder",   by: "Admin TEC", time: "1 week ago" },
];

function Badge({ role }) {
  const m = ROLE_META[role] || ROLE_META.student;
  return (
    <span style={{ background: m.bg, color: m.color, border: "1px solid " + m.border, borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em" }}>
      {m.label.toUpperCase()}
    </span>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, padding: "16px 20px" }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: color || "#e6edf3", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [form, setForm] = useState(emptyMember);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(MOCK_PENDING);
  const [roleLog, setRoleLog] = useState(MOCK_ROLE_LOG);
  const [roleChangeTarget, setRoleChangeTarget] = useState(null);
  const [roleChangeTo, setRoleChangeTo] = useState("student");

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

  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCertChange = (e) => setForm({ ...form, certificates: e.target.value });

  const handleEdit = (m) => {
    setForm({ ...m, certificates: (m.certificates || []).join(", ") });
    setEditingMemberId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm("Delete this member permanently?")) return;
    const { error } = await supabase.from("members").delete().eq("id", memberId);
    if (!error) getMembers();
  };

  const handleSubmit = async (e) => {
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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", year: "numeric", day: "numeric" }) : "—";

  const moderateItem = (id, action) => {
    setPending(p => p.filter(item => item.id !== id));
  };

  const applyRoleChange = () => {
    if (!roleChangeTarget) return;
    const member = members.find(m => m.id === roleChangeTarget);
    if (member) {
      setRoleLog(log => [{ id: Date.now(), user: member.name, from: member.role || "student", to: roleChangeTo, by: user?.name || "Admin", time: "Just now" }, ...log]);
    }
    setRoleChangeTarget(null);
  };

  const TABS = [
    { id: "overview",   label: "Overview"   },
    { id: "members",    label: "Members"    },
    { id: "moderation", label: "Moderation" },
    { id: "roles",      label: "Roles"      },
  ];

  const filteredMembers = members.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.sap_id?.toString().includes(search)
  );

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", padding: "0 0 80px" }}>
      <style>{`
        .admin-row:hover { background: #1c2128 !important; }
        .admin-tab { transition: all 0.14s; cursor: pointer; }
        .admin-tab:hover { color: #e6edf3 !important; }
        .mod-card:hover { border-color: #30363d !important; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#e6edf3", letterSpacing: "-0.02em", lineHeight: 1 }}>Admin Panel</h1>
          <p style={{ fontSize: 12, color: "#8b949e", marginTop: 3 }}>The Echo Community — internal dashboard</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#8b949e" }}>Signed in as</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "6px 12px" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(248,81,73,0.2)", border: "1px solid rgba(248,81,73,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#f85149" }}>
              {(user?.name || "A")[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>{user?.name || "Admin"}</span>
            <Badge role="admin" />
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ borderBottom: "1px solid #30363d", padding: "0 32px", display: "flex", gap: 0 }}>
        {TABS.map(t => (
          <button key={t.id} className="admin-tab" onClick={() => setActiveTab(t.id)} style={{
            padding: "12px 18px", background: "transparent", border: "none", fontFamily: "inherit",
            fontSize: 13, fontWeight: 600, color: activeTab === t.id ? "#e6edf3" : "#8b949e",
            borderBottom: activeTab === t.id ? "2px solid #f09433" : "2px solid transparent",
            cursor: "pointer",
          }}>
            {t.label}
            {t.id === "moderation" && pending.length > 0 && (
              <span style={{ marginLeft: 6, background: "#f85149", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 0" }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-eyebrow" style={{ marginBottom: 16 }}>platform at a glance</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 40 }}>
              <StatCard label="Total Members"  value={loading ? "…" : members.length} sub="registered students" color="#58a6ff" />
              <StatCard label="Pending Review" value={pending.length} sub="listings & builds" color="#e3b341" />
              <StatCard label="Active Builders" value={roleLog.filter(r => r.to === "builder").length} sub="verified this month" color="#a78bfa" />
              <StatCard label="Moderators"     value={roleLog.filter(r => r.to === "moderator").length} sub="content reviewers" color="#3fb950" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 20 }}>
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>recent activity</p>
                {[
                  { text: "New member registered — Sneha B.", time: "5m ago", color: "#3fb950" },
                  { text: "Build listed — StudySync (BETA)", time: "22m ago", color: "#a78bfa" },
                  { text: "Content flagged — HP Victus listing", time: "1h ago", color: "#f85149" },
                  { text: "Role upgraded — Rahul K. to Builder", time: "2h ago", color: "#e3b341" },
                  { text: "Poll created — Carpool feature vote", time: "3h ago", color: "#bc1888" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: i < 4 ? "1px solid #21262d" : "none" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: 13, color: "#e6edf3" }}>{item.text}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#484f58", flexShrink: 0, marginLeft: 12, fontFamily: "var(--font-mono)" }}>{item.time}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 20 }}>
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>quick actions</p>
                {[
                  { label: "Add new member",     action: () => { setActiveTab("members"); setTimeout(() => { setForm(emptyMember); setEditingMemberId(null); setShowForm(true); }, 100); }, color: "#238636" },
                  { label: "Review pending content", action: () => setActiveTab("moderation"), color: "#e3b341" },
                  { label: "Manage roles",        action: () => setActiveTab("roles"),      color: "#a78bfa" },
                ].map((q, i) => (
                  <button key={i} onClick={q.action} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", marginBottom: 8, background: "transparent", border: "1px solid #30363d", borderRadius: 6, color: q.color, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background 0.14s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#21262d"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
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
                <p className="section-eyebrow" style={{ margin: 0 }}>registered members</p>
                <span style={{ fontSize: 12, color: "#8b949e" }}>{members.length} total</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or SAP ID…"
                  className="gh-input" style={{ width: 220 }} />
                <button onClick={() => { setForm(emptyMember); setEditingMemberId(null); setShowForm(true); }}
                  className="btn-primary" style={{ fontSize: 13, padding: "7px 16px" }}>
                  + Add member
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: "#8b949e", fontSize: 13 }}>Loading members…</div>
            ) : (
              <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #30363d" }}>
                        {["ID", "Name", "SAP ID", "Course", "Batch", "Joined", "Status", "Actions"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8b949e", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map(m => (
                        <tr key={m.id} className="admin-row" style={{ borderBottom: "1px solid #21262d", background: "transparent", transition: "background 0.12s" }}>
                          <td style={{ padding: "10px 14px", color: "#484f58", fontFamily: "var(--font-mono)", fontSize: 11 }}>{m.id}</td>
                          <td style={{ padding: "10px 14px", color: "#e6edf3", fontWeight: 600 }}>{m.name}</td>
                          <td style={{ padding: "10px 14px", color: "#8b949e", fontFamily: "var(--font-mono)", fontSize: 11 }}>{m.sap_id || "—"}</td>
                          <td style={{ padding: "10px 14px", color: "#8b949e" }}>{m.course || "—"}</td>
                          <td style={{ padding: "10px 14px", color: "#8b949e" }}>{m.batch || "—"}</td>
                          <td style={{ padding: "10px 14px", color: "#8b949e", fontSize: 12 }}>{formatDate(m.joined_at)}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ background: m.status === "Active Member" ? "rgba(63,185,80,0.12)" : "rgba(227,179,65,0.12)", color: m.status === "Active Member" ? "#3fb950" : "#e3b341", border: "1px solid " + (m.status === "Active Member" ? "rgba(63,185,80,0.3)" : "rgba(227,179,65,0.3)"), borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                              {m.status || "—"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleEdit(m)} style={{ padding: "4px 12px", borderRadius: 6, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                              <button onClick={() => handleDelete(m.id)} style={{ padding: "4px 12px", borderRadius: 6, background: "transparent", border: "1px solid rgba(248,81,73,0.3)", color: "#f85149", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMembers.length === 0 && !loading && (
                    <div style={{ textAlign: "center", padding: "48px 24px", color: "#484f58", fontSize: 13 }}>No members found.</div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── MODERATION ── */}
        {activeTab === "moderation" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p className="section-eyebrow" style={{ margin: 0 }}>content moderation</p>
                <span style={{ fontSize: 12, color: "#8b949e" }}>{pending.length} items pending review</span>
              </div>
            </div>

            {pending.length === 0 ? (
              <div style={{ textAlign: "center", background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: "60px 24px" }}>
                <div style={{ fontSize: 13, color: "#3fb950", fontWeight: 700, marginBottom: 6 }}>All clear</div>
                <div style={{ fontSize: 12, color: "#8b949e" }}>No content pending review.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pending.map(item => (
                  <div key={item.id} className="mod-card"
                    style={{ background: "#161b22", border: "1px solid #21262d", borderLeft: "3px solid " + (item.flag ? "#f85149" : "#30363d"), borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#8b949e", background: "#21262d", border: "1px solid #30363d", borderRadius: 4, padding: "2px 8px", letterSpacing: "0.05em" }}>{item.type.toUpperCase()}</span>
                        {item.flag && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#f85149", background: "rgba(248,81,73,0.12)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 4, padding: "2px 8px", letterSpacing: "0.05em" }}>FLAGGED: {item.flag.toUpperCase()}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3", marginBottom: 3 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: "#8b949e" }}>{item.author} &middot; {item.time}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => moderateItem(item.id, "approve")} style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(63,185,80,0.12)", border: "1px solid rgba(63,185,80,0.3)", color: "#3fb950", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Approve</button>
                      <button onClick={() => moderateItem(item.id, "reject")} style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", color: "#f85149", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Reject</button>
                      <button onClick={() => moderateItem(item.id, "remove_flag")} style={{ padding: "6px 14px", borderRadius: 6, background: "transparent", border: "1px solid #30363d", color: "#8b949e", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Ignore flag</button>
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
              {/* Role assignment */}
              <div>
                <p className="section-eyebrow" style={{ marginBottom: 16 }}>assign role</p>
                <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 20 }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#8b949e", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>MEMBER</label>
                    <select value={roleChangeTarget || ""} onChange={e => setRoleChangeTarget(e.target.value || null)}
                      className="gh-select" style={{ width: "100%" }}>
                      <option value="">— Select member —</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sap_id || "no SAP"})</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#8b949e", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>NEW ROLE</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["student", "builder", "moderator", "admin"].map(r => {
                        const m2 = ROLE_META[r];
                        return (
                          <button key={r} onClick={() => setRoleChangeTo(r)} style={{
                            flex: 1, minWidth: 80, padding: "8px 0", borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                            border: "1px solid " + (roleChangeTo === r ? m2.border : "#30363d"),
                            background: roleChangeTo === r ? m2.bg : "transparent",
                            color: roleChangeTo === r ? m2.color : "#8b949e",
                          }}>{m2.label}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>
                    {roleChangeTo === "admin" && "Full access: member CRUD, moderation, role management, analytics."}
                    {roleChangeTo === "moderator" && "Can approve/reject content and flag posts. Cannot manage members or roles."}
                    {roleChangeTo === "builder" && "Verified student builder. Builds show a verified badge. All student features included."}
                    {roleChangeTo === "student" && "Default registered member. Access to all community features."}
                  </div>
                  <button onClick={applyRoleChange} disabled={!roleChangeTarget} className="btn-primary" style={{ width: "100%", padding: "9px", fontSize: 13, fontWeight: 700, opacity: roleChangeTarget ? 1 : 0.4 }}>
                    Apply Role Change
                  </button>
                </div>
              </div>

              {/* Role change log */}
              <div>
                <p className="section-eyebrow" style={{ marginBottom: 16 }}>role change log</p>
                <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}>
                  {roleLog.length === 0 ? (
                    <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: "#484f58" }}>No role changes yet.</div>
                  ) : roleLog.map((entry, i) => {
                    const fromM = ROLE_META[entry.from] || ROLE_META.student;
                    const toM   = ROLE_META[entry.to]   || ROLE_META.student;
                    return (
                      <div key={entry.id} style={{ padding: "12px 16px", borderBottom: i < roleLog.length - 1 ? "1px solid #21262d" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>{entry.user}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <Badge role={entry.from} />
                            <span style={{ fontSize: 11, color: "#484f58" }}>→</span>
                            <Badge role={entry.to} />
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "#484f58", fontFamily: "var(--font-mono)" }}>{entry.time}</div>
                          <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>by {entry.by}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Role reference */}
                <p className="section-eyebrow" style={{ marginBottom: 12, marginTop: 24 }}>role permissions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { role: "admin",     perms: "Everything: members, moderation, roles, analytics" },
                    { role: "moderator", perms: "Approve/reject content, flag posts" },
                    { role: "builder",   perms: "All student features + verified build badge" },
                    { role: "student",   perms: "Post listings, vote, builds, polls" },
                  ].map(({ role, perms }) => {
                    const m2 = ROLE_META[role];
                    return (
                      <div key={role} style={{ background: "#161b22", border: "1px solid #21262d", borderLeft: "3px solid " + m2.color, borderRadius: 6, padding: "10px 14px", display: "flex", gap: 12, alignItems: "center" }}>
                        <Badge role={role} />
                        <span style={{ fontSize: 12, color: "#8b949e" }}>{perms}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Member form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 24, backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "28px", width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#e6edf3", marginBottom: 20 }}>{editingMemberId ? "Edit Member" : "Add New Member"}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[
                    { label: "NAME", name: "name", placeholder: "Full name", required: true },
                    { label: "SAP ID", name: "sap_id", placeholder: "SAP ID number" },
                    { label: "COURSE", name: "course", placeholder: "e.g. B.Tech CSE" },
                    { label: "BATCH", name: "batch", placeholder: "e.g. 2022" },
                    { label: "YEAR", name: "year", placeholder: "Current year" },
                    { label: "STATUS", name: "status", placeholder: "Active Member" },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ fontSize: 11, color: "#8b949e", fontWeight: 700, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input name={f.name} value={form[f.name] || ""} onChange={handleInputChange} placeholder={f.placeholder} required={f.required}
                        className="gh-input" style={{ width: "100%", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[
                    { label: "PERSONAL EMAIL", name: "pers_email", type: "email", placeholder: "personal@gmail.com" },
                    { label: "COLLEGE EMAIL", name: "clg_email", type: "email", placeholder: "name@college.edu" },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ fontSize: 11, color: "#8b949e", fontWeight: 700, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input type={f.type} name={f.name} value={form[f.name] || ""} onChange={handleInputChange} placeholder={f.placeholder}
                        className="gh-input" style={{ width: "100%", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                {editingMemberId && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: "#8b949e", fontWeight: 700, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>JOINED AT</label>
                    <input type="date" name="joined_at" value={form.joined_at || ""} onChange={handleInputChange} className="gh-input" style={{ width: "100%", boxSizing: "border-box" }} />
                  </div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: "#8b949e", fontWeight: 700, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>CERTIFICATES <span style={{ fontWeight: 400, color: "#484f58" }}>(comma-separated)</span></label>
                  <input name="certificates" value={form.certificates} onChange={handleCertChange} placeholder="e.g. AWS, Python, Web Dev"
                    className="gh-input" style={{ width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: "10px", fontSize: 14, fontWeight: 700 }}>
                    {editingMemberId ? "Save Changes" : "Add Member"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: "10px 20px", fontSize: 14 }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
