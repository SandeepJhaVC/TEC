import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function MemberPortal() {
  const [memberId, setMemberId] = useState("");
  const [member, setMember]     = useState(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setMember(null); setError("");
    try {
      const { data, error: fetchError } = await supabase
        .from("members").select("*").eq("id", memberId.trim().toUpperCase()).single();
      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;
      if (data) setMember(data);
      else setError("Member not found. Please check your Member ID.");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally { setLoading(false); }
  };

  const formatDate = d => d
    ? new Date(d).toLocaleDateString("en-US", { timeZone:"UTC", month:"long", year:"numeric", day:"numeric" })
    : "—";

  return (
    <div className="page-wrap" style={{ maxWidth:800 }}>
      <div className="eyebrow" style={{ marginBottom:8 }}>Member lookup</div>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2rem,4vw,2.8rem)", fontWeight:900, letterSpacing:"-0.04em", lineHeight:0.95, marginBottom:12 }}>
        MEMBER_<span className="accent-primary">PORTAL</span>
      </h1>
      <p style={{ color:"var(--on-surface-var)", fontSize:14, marginBottom:32, lineHeight:1.6 }}>Enter your Member ID to view your profile, certificates, and membership status.</p>

      <form onSubmit={handleSubmit} style={{ display:"flex", gap:10, marginBottom:32, maxWidth:480 }}>
        <input
          className="neon-input"
          placeholder="Enter Member ID (e.g. TEC-0042)"
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          style={{ flex:1 }}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding:"10px 22px", fontSize:12, whiteSpace:"nowrap" }}>
          {loading ? "Looking up..." : "Look Up"}
        </button>
      </form>

      {error && (
        <div style={{ background:"rgba(255,110,132,0.1)", border:"1px solid rgba(255,110,132,0.2)", borderRadius:"var(--radius)", padding:"14px 18px", color:"var(--error)", fontSize:13, marginBottom:20 }}>
          <span className="material-symbols-outlined" style={{ fontSize:16, verticalAlign:"middle", marginRight:8 }}>error</span>
          {error}
        </div>
      )}

      {member && (
        <div>
          {/* Profile card */}
          <div style={{ background:"linear-gradient(135deg, rgba(204,151,255,0.06) 0%, rgba(83,221,252,0.04) 100%)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"var(--radius-lg)", padding:"28px 32px", marginBottom:20 }}>
            <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(204,151,255,0.15)", border:"2px solid rgba(204,151,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, color:"var(--primary)", fontFamily:"var(--font-display)", flexShrink:0 }}>
                {(member.name||"M")[0].toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", marginBottom:6 }}>
                  <h2 style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:24, letterSpacing:"-0.04em" }}>{member.name}</h2>
                  <span style={{ background: member.status==="Active Member" ? "rgba(83,221,252,0.1)":"rgba(255,110,132,0.1)", color: member.status==="Active Member" ? "var(--secondary)":"var(--error)", border:`1px solid ${member.status==="Active Member" ? "rgba(83,221,252,0.2)":"rgba(255,110,132,0.2)"}`, borderRadius:9999, padding:"2px 12px", fontSize:11, fontWeight:800, fontFamily:"var(--font-display)", letterSpacing:"0.05em" }}>
                    {member.status || "Active Member"}
                  </span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10, marginTop:12 }}>
                  {[
                    { label:"Member ID", value:member.id,          icon:"badge"          },
                    { label:"SAP ID",    value:member.sap_id||"—",  icon:"numbers"        },
                    { label:"Course",    value:member.course||"—",  icon:"school"         },
                    { label:"Batch",     value:member.batch||"—",   icon:"calendar_today" },
                    { label:"Joined",    value:formatDate(member.joined_at), icon:"schedule" },
                  ].map(f => (
                    <div key={f.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:"var(--radius)", padding:"10px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize:13, color:"var(--on-surface-var)" }}>{f.icon}</span>
                        <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.07em", color:"var(--on-surface-var)", fontFamily:"var(--font-display)" }}>{f.label.toUpperCase()}</span>
                      </div>
                      <div style={{ fontFamily:"var(--font-mono)", fontSize:13, color:"var(--on-surface)" }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certificates */}
          {member.certificates?.length > 0 && (
            <div className="neon-card" style={{ padding:22 }}>
              <span className="eyebrow" style={{ display:"block", marginBottom:14 }}>Certificates</span>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {member.certificates.map((cert, i) => {
                  const name = typeof cert==="string" ? cert : cert.name || "Certificate";
                  return (
                    <button key={i} onClick={() => setSelectedCert(cert)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", background:"rgba(204,151,255,0.08)", border:"1px solid rgba(204,151,255,0.2)", borderRadius:"var(--radius)", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:700, fontSize:13, color:"var(--primary)", transition:"all 0.14s" }}>
                      <span className="material-symbols-outlined" style={{ fontSize:16 }}>workspace_premium</span>
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No certificates */}
          {(!member.certificates || member.certificates.length === 0) && (
            <div className="neon-card" style={{ padding:22, textAlign:"center" }}>
              <span className="material-symbols-outlined" style={{ fontSize:32, color:"var(--on-surface-var)", display:"block", marginBottom:8 }}>workspace_premium</span>
              <div style={{ fontSize:13, color:"var(--on-surface-var)" }}>No certificates listed yet.</div>
            </div>
          )}
        </div>
      )}

      {/* Cert modal */}
      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()} style={{ maxWidth:420 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:18, letterSpacing:"-0.03em" }}>Certificate Preview</h3>
              <button onClick={()=>setSelectedCert(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--on-surface-var)" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding:"24px", background:"var(--surface-highest)", borderRadius:"var(--radius)", textAlign:"center", marginBottom:20 }}>
              <span className="material-symbols-outlined" style={{ fontSize:48, color:"var(--primary)", display:"block", marginBottom:12 }}>workspace_premium</span>
              <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:18 }}>
                {typeof selectedCert === "string" ? selectedCert : selectedCert.name || "Certificate"}
              </div>
            </div>
            {selectedCert.file && (
              <a href={selectedCert.file} target="_blank" rel="noreferrer" className="btn-ghost-cyan" style={{ width:"100%", justifyContent:"center", display:"flex", padding:"10px", fontSize:13 }}>View Certificate File</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
