import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

const DEALS = [
  { id: 1, name: "Chai Sutta Bar", cat: "Food", discount: "20% OFF", desc: "Show your college ID for 20% off on all beverages. Valid all week.", validity: "Ongoing", code: "STUDENT20", loc: "Rajpur Road, Dehradun", rating: 4.5 },
  { id: 2, name: "Domino's Pizza", cat: "Food", discount: "30% OFF", desc: "Order online using code for 30% off on medium & large pizzas.", validity: "Weekdays only", code: "UPES30", loc: "Pacific Mall, Doon", rating: 4.2 },
  { id: 3, name: "Rapido Bike Taxi", cat: "Transport", discount: "50% OFF", desc: "First 5 rides at 50% off for new sign-ups with college email.", validity: "New users", code: "TECRIDER", loc: "App-based", rating: 4.7 },
  { id: 4, name: "Moustache Hostel", cat: "Food", discount: "15% OFF", desc: "Flat 15% off on café menu for UPES students every day.", validity: "Ongoing", code: "MOUSTEC", loc: "Rajpur Road", rating: 4.8 },
  { id: 5, name: "D-Mart Dehradun", cat: "Shopping", discount: "10% OFF", desc: "10% student discount on grocery shopping above ₹500.", validity: "Weekends", code: "DMART10", loc: "Sahastradhara Road", rating: 4.0 },
  { id: 6, name: "Xtreme One Fitness", cat: "Health", discount: "40% OFF", desc: "40% off on a 3-month gym membership for enrolled students.", validity: "Semester-based", code: "XFIT40", loc: "Bidholi, Dehradun", rating: 4.4 },
  { id: 7, name: "Kitaab Ghar", cat: "Study", discount: "25% OFF", desc: "Discounts on textbooks, stationery and printing for students.", validity: "Ongoing", code: "BOOKS25", loc: "Near UPES Gate", rating: 4.6 },
  { id: 8, name: "OYO Rooms", cat: "Stay", discount: "35% OFF", desc: "Exclusive 35% off for guests with verified student ID.", validity: "Advance booking", code: "OYOSTUD35", loc: "Multiple locations", rating: 3.9 },
  { id: 9, name: "Zomato Gold", cat: "Food", discount: "FREE", desc: "3-month Zomato Gold subscription free with college email.", validity: "Limited slots", code: "ZGOLD3M", loc: "App-based", rating: 4.3 },
  { id: 10, name: "IndiGo Student", cat: "Transport", discount: "15% OFF", desc: "Additional 15% off on booked economy tickets for students.", validity: "Academic year", code: "INDIGO15", loc: "Jolly Grant Airport", rating: 4.1 },
  { id: 11, name: "Anytime Fitness", cat: "Health", discount: "30% OFF", desc: "Monthly membership at 30% off with valid student ID.", validity: "Per semester", code: "ANYTIME30", loc: "Premnagar", rating: 4.5 },
  { id: 12, name: "PhotoShop Studio", cat: "Study", discount: "20% OFF", desc: "20% off on all printing, scanning, and ID card services.", validity: "Ongoing", code: "PRINT20", loc: "Pondha", rating: 4.7 },
];
const CATS = ["All", "Food", "Transport", "Shopping", "Health", "Study", "Stay"];
const CAT_COLOR = { Food: "var(--secondary)", Transport: "var(--primary)", Shopping: "#e3b341", Health: "var(--error)", Study: "var(--tertiary)", Stay: "#a889ff" };

export default function Discounts() {
  const [active, setActive] = useState("All");
  const [revealed, setRevealed] = useState({});
  const [dealsData, setDealsData] = useState(DEALS);

  useEffect(() => {
    supabase.from('deals').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data && data.length > 0) setDealsData(data); });
  }, []);

  const filtered = active === "All" ? dealsData : dealsData.filter(d => d.cat === active);
  return (
    <div className="page-wrap" style={{ maxWidth: 1100 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Student Perks</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 12 }}>
        EXCLUSIVE_<span className="accent-secondary">DEALS</span>
      </h1>
      <p style={{ color: "var(--on-surface-var)", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Show your student ID and save big on food, transport, fitness and more around Dehradun.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setActive(c)} style={{ padding: "6px 16px", borderRadius: 9999, fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", border: "none", background: active === c ? (CAT_COLOR[c] || "var(--primary)") : "var(--surface-highest)", color: active === c ? "#000" : "var(--on-surface-var)", opacity: active === c ? 1 : 0.75, transition: "all 0.14s" }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--on-surface-var)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.25, display: 'block', marginBottom: 12 }}>sell</span>
            No deals listed yet.
          </div>
        )}
        {filtered.map((d, i) => (
          <motion.div key={d.id} className="neon-card" style={{ padding: 22 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, color: CAT_COLOR[d.cat] || "var(--primary)", letterSpacing: "0.07em" }}>{(d.cat || '').toUpperCase()}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, marginTop: 2, letterSpacing: "-0.02em" }}>{d.name}</h3>
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, color: "var(--secondary)", whiteSpace: "nowrap" }}>{d.discount}</span>
            </div>
            <p style={{ color: "var(--on-surface-var)", fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{d.desc}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              <span className="tag-ghost" style={{ fontSize: 10 }}>{d.validity}</span>
              <span style={{ fontSize: 11, color: "var(--on-surface-var)", display: "flex", alignItems: "center", gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>{d.loc}
              </span>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-var)" }}>
                {revealed[d.id] ? <span style={{ color: "var(--primary)", fontWeight: 700, letterSpacing: "0.1em" }}>{d.code}</span> : <span style={{ filter: "blur(4px)", userSelect: "none", color: "var(--primary)" }}>{d.code}</span>}
              </div>
              <button onClick={() => setRevealed(r => ({ ...r, [d.id]: !r[d.id] }))} className="btn-ghost-cyan" style={{ padding: "5px 14px", fontSize: 11 }}>
                {revealed[d.id] ? "Hide" : "Reveal Code"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Partner CTA */}
      <div className="neon-card" style={{
        marginTop: 40, padding: "28px 32px",
        background: "linear-gradient(135deg, rgba(83,221,252,0.05) 0%, rgba(204,151,255,0.05) 100%)",
        borderTop: "2px solid rgba(83,221,252,0.25)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "var(--font-display)", letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)", marginBottom: 6, fontWeight: 700 }}>ADVERTISE WITH US</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, letterSpacing: "-0.03em", color: "var(--on-surface)", marginBottom: 6 }}>
            Have a student-friendly <span style={{ color: "var(--secondary)" }}>deal?</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--on-surface-var)", lineHeight: 1.6, maxWidth: 480 }}>
            Partner with TEC to reach 5,000+ UPES students. Deals added by our admin team appear here and get promoted across the Feed, Listings, and more.
          </p>
        </div>
        <a href="mailto:tec@upes.ac.in?subject=Partner%20Deal%20Request" style={{ textDecoration: "none", flexShrink: 0 }}>
          <button className="btn-ghost-cyan" style={{ fontSize: 12, padding: "10px 24px", whiteSpace: "nowrap" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mail</span>
            Contact Us
          </button>
        </a>
      </div>
    </div>
  );
}

