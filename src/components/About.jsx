import React from "react";

const TEAM = [
  { name: "Pragyan Bhatt", role: "Founder & Tech Lead", handle: "@novax", bg: "rgba(204,151,255,0.1)", color: "var(--primary)" },
  { name: "Aria Singh", role: "Community Manager", handle: "@aria_sigma", bg: "rgba(83,221,252,0.1)", color: "var(--secondary)" },
  { name: "Karan Mehta", role: "Design & UI", handle: "@km_designs", bg: "rgba(255,149,160,0.1)", color: "var(--tertiary)" },
  { name: "Dev Arora", role: "Backend & Infra", handle: "@delta_root", bg: "rgba(204,151,255,0.1)", color: "var(--primary)" },
];

const PILLARS = [
  { icon: "campaign", label: "Echo Feed", desc: "Community posts, upvotes, code blocks, project relays." },
  { icon: "explore", label: "Campus Explore", desc: "Live map of PGs, cafes, transit, and hangout spots nearby." },
  { icon: "storefront", label: "The Bazaar", desc: "Buy, sell, or trade hardware, books and study sessions." },
  { icon: "construction", label: "Builds", desc: "Student project showcase — demos, repos, live deploys." },
  { icon: "how_to_vote", label: "Pulse Board", desc: "Upvote campus issues. TEC forwards top votes to authorities." },
  { icon: "event", label: "Events", desc: "Campus and community events with add-to-calendar support." },
];

export default function About() {
  return (
    <div className="page-wrap" style={{ maxWidth: 900 }}>
      {/* Hero */}
      <div style={{ position: "relative", background: "linear-gradient(135deg, rgba(204,151,255,0.06) 0%, rgba(83,221,252,0.04) 100%)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "var(--radius-lg)", padding: "48px 48px 40px", marginBottom: 40, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(204,151,255,0.04)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div className="eyebrow" style={{ marginBottom: 10 }}>About us</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, marginBottom: 16 }}>
          THE_ECHO_<br /><span className="accent-primary">COMMUNITY</span>
        </h1>
        <p style={{ color: "var(--on-surface-var)", fontSize: 15, maxWidth: 560, lineHeight: 1.75 }}>
          TEC is a student-built platform that amplifies campus life. We connect students across Uttarakhand — helping them find PGs, discover deals, showcase projects, voice concerns, and build together.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18, padding: "8px 14px", borderRadius: "var(--radius)", background: "rgba(255,149,160,0.07)", border: "1px solid rgba(255,149,160,0.2)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--tertiary)", flexShrink: 0 }}>info</span>
          <span style={{ fontSize: 12, color: "rgba(255,149,160,0.85)", lineHeight: 1.5 }}>
            TEC is an <strong style={{ color: "var(--tertiary)" }}>independent, student-run</strong> community. We are <strong style={{ color: "var(--tertiary)" }}>not affiliated with, officially recognised by, or endorsed by UPES</strong> or any other institution.
          </span>
        </div>
      </div>

      {/* Mission */}
      <div style={{ marginBottom: 40 }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Our Mission</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { icon: "diversity_3", title: "Student First", desc: "Every feature is built for and tested by students. No corporate interests, no paywalls." },
            { icon: "public", title: "Open Community", desc: "Free to join, easy to contribute. Anyone from any branch or batch can participate." },
            { icon: "bolt", title: "Fast & Useful", desc: "No bloat. Every page solves a real problem students face in Uttarakhand." },
            { icon: "handshake", title: "Collective Voice", desc: "Issues raised here are forwarded to local authorities with real petition pressure." },
          ].map((m, i) => (
            <div key={i} className="neon-card" style={{ padding: 22, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: "rgba(204,151,255,0.1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--primary)" }}>{m.icon}</span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{m.title}</div>
                <div style={{ fontSize: 13, color: "var(--on-surface-var)", lineHeight: 1.6 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform pillars */}
      <div style={{ marginBottom: 40 }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>What we built</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
          {PILLARS.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", background: "var(--surface-low)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--secondary)", flexShrink: 0 }}>{p.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, marginBottom: 3 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: "var(--on-surface-var)", lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={{ marginBottom: 40 }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Core Team</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {TEAM.map((m, i) => (
            <div key={i} className="neon-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: m.bg, border: `1px solid ${m.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: m.color, fontFamily: "var(--font-display)", margin: "0 auto 12px" }}>
                {m.name[0]}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "var(--on-surface-var)", marginBottom: 6 }}>{m.role}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: m.color }}>{m.handle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="neon-card" style={{ padding: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, letterSpacing: "-0.03em", marginBottom: 4 }}>Join the community</div>
          <div style={{ fontSize: 13, color: "var(--on-surface-var)" }}>Open to all students of Uttarakhand. Free forever.</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Independent community &mdash; no institutional affiliation.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost-cyan" style={{ padding: "8px 20px", fontSize: 12 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
            WhatsApp Group
          </button>
          <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 12 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>badge</span>
            Become a Member
          </button>
        </div>
      </div>
    </div>
  );
}
