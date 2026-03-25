import React, { useState } from "react";

const CATS = [
    { id: "Colleges", color: "#53DDFC" },
    { id: "PGs", color: "#CC97FF" },
    { id: "Food", color: "#FF95A0" },
    { id: "Transit", color: "#a78bfa" },
];

/* per-category thumbnail style */
const THUMB = {
    Colleges: { grad: "linear-gradient(135deg,#0e2244 0%,#0a1a30 100%)", icon: "school", accent: "#53DDFC" },
    PGs: { grad: "linear-gradient(135deg,#280e44 0%,#1a0a30 100%)", icon: "apartment", accent: "#CC97FF" },
    Food: { grad: "linear-gradient(135deg,#2a1208 0%,#1a0a04 100%)", icon: "restaurant", accent: "#FF95A0" },
    Transit: { grad: "linear-gradient(135deg,#0e0e28 0%,#08081a 100%)", icon: "directions_bus", accent: "#a78bfa" },
};

const LOCATIONS = {
    Colleges: [
        { name: "Main Campus Alpha", sub: "Sector-4, Tech Corridor", dist: "0.8km", live: false, badge: "EST 2024", rating: 4.9 },
        { name: "UPES Pondha Campus", sub: "City Campus, Pondha", dist: "5.2km", live: false, badge: null, rating: 4.7 },
        { name: "DIT University", sub: "Mussoorie Diversion Road", dist: "7.1km", live: false, badge: null, rating: 4.5 },
        { name: "Graphic Era University", sub: "Clement Town", dist: "12km", live: false, badge: null, rating: 4.3 },
    ],
    PGs: [
        { name: "Neon PG Residence", sub: "Sky View Terraces", dist: "2.4km", live: false, badge: "VACANT: 04", rating: 4.5 },
        { name: "Sunrise PG Boys", sub: "₹6,500/mo — AC, WiFi", dist: "1.8km", live: false, badge: null, rating: 4.2 },
        { name: "Patel Bhawan Girls", sub: "₹7,000/mo — 24hr security", dist: "2.0km", live: false, badge: null, rating: 4.4 },
        { name: "Greenwood Hostel", sub: "₹6,000/mo — Mess included", dist: "1.5km", live: false, badge: null, rating: 4.1 },
    ],
    Food: [
        { name: "Cyber Cafe & Hub", sub: "GND Floor, Nexus Block", dist: "1.2km", live: true, badge: null, rating: 4.7 },
        { name: "Chai Sutta Bar", sub: "Student fav — great chai", dist: "0.9km", live: true, badge: null, rating: 4.8 },
        { name: "Bidholi Dhaba", sub: "Cheap & tasty desi food", dist: "1.4km", live: false, badge: null, rating: 4.3 },
        { name: "Crust N Bake", sub: "Pizzas & burgers", dist: "1.7km", live: true, badge: null, rating: 4.6 },
    ],
    Transit: [
        { name: "Bidholi Bus Stand", sub: "Main UPES stop", dist: "0.3km", live: true, badge: null, rating: 4.0 },
        { name: "Sahastradhara Crossing", sub: "Shared autos hub", dist: "3.1km", live: false, badge: null, rating: 3.8 },
        { name: "Pondha Chowk Stop", sub: "City-centre route", dist: "5.4km", live: true, badge: null, rating: 3.9 },
    ],
};

const PINS = [
    { label: "Main Campus Alpha", x: 52, y: 28, color: "#CC97FF" },
    { label: "Cyber Cafe", x: 43, y: 65, color: "#53DDFC" },
    { label: "Neon PG", x: 72, y: 47, color: "#FF6E84" },
];

/* concentric circle radii in a 0-100 viewBox */
const RINGS = [3, 6, 10, 15, 21, 28, 36, 46, 58, 72, 88];
const SPOKES = 36;

export default function Map() {
    const [cat, setCat] = useState("Colleges");
    const [activePin, setPin] = useState(null);

    const catMeta = CATS.find(c => c.id === cat) || CATS[0];
    const thumb = THUMB[cat];
    const locations = LOCATIONS[cat] || [];

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            height: "calc(100vh - var(--topnav-h))",
            overflow: "hidden", background: "#080808",
        }}>

            {/* ── main row ── */}
            <div className="map-main-row" style={{ flex: 1, overflow: "hidden" }}>
                {/* ──── Sidebar ──── */}
                <div className="map-panel" style={{
                    width: 272, flexShrink: 0,
                    background: "rgba(10,10,10,0.97)",
                    borderRight: "1px solid rgba(255,255,255,0.05)",
                    display: "flex", flexDirection: "column", overflow: "hidden",
                }}>

                    {/* Search */}
                    <div style={{ padding: "18px 14px 12px" }}>
                        <div style={{ position: "relative" }}>
                            <span className="material-symbols-outlined" style={{
                                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                                fontSize: 15, color: "rgba(255,255,255,0.28)", pointerEvents: "none",
                            }}>search</span>
                            <input
                                className="neon-input"
                                placeholder="Scan coordinates..."
                                style={{ paddingLeft: 34, borderRadius: 9999, fontSize: 12, height: 36 }}
                            />
                        </div>
                    </div>

                    {/* Category chips */}
                    <div style={{ display: "flex", gap: 5, padding: "0 14px 14px", flexWrap: "wrap" }}>
                        {CATS.map(c => (
                            <button key={c.id} onClick={() => setCat(c.id)} style={{
                                padding: "4px 11px", borderRadius: 9999, cursor: "pointer",
                                fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 800,
                                letterSpacing: "0.07em", border: `1px solid ${cat === c.id ? c.color : "rgba(255,255,255,0.1)"}`,
                                background: cat === c.id ? `${c.color}18` : "transparent",
                                color: cat === c.id ? c.color : "rgba(255,255,255,0.38)",
                                transition: "all 0.13s",
                            }}>{c.id.toUpperCase()}</button>
                        ))}
                    </div>

                    {/* Cards */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "0 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                        {locations.map((loc, i) => (
                            <div key={i} onClick={() => setPin(loc.name)} style={{
                                borderRadius: 12, padding: 12, cursor: "pointer", transition: "all 0.13s",
                                background: activePin === loc.name ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.018)",
                                border: `1px solid ${activePin === loc.name ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                            }}>
                                {/* Card header */}
                                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                                        background: thumb.grad,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        border: `1px solid ${thumb.accent}20`,
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 22, color: thumb.accent }}>{thumb.icon}</span>
                                    </div>
                                    {/* Text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                                            <span style={{
                                                fontFamily: "var(--font-display)", fontWeight: 700,
                                                fontSize: 12.5, color: "#fff", lineHeight: 1.25,
                                            }}>{loc.name}</span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, flexShrink: 0,
                                                color: catMeta.color, fontFamily: "var(--font-mono)",
                                                background: `${catMeta.color}18`,
                                                border: `1px solid ${catMeta.color}30`,
                                                borderRadius: 9999, padding: "2px 7px",
                                            }}>{loc.dist}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginTop: 3 }}>{loc.sub}</div>
                                    </div>
                                </div>

                                {/* Card footer */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                                    <span style={{ fontSize: 11, color: "#e3b341" }}>★ {loc.rating}</span>
                                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                                        {loc.live && (
                                            <span style={{
                                                fontSize: 9, fontWeight: 700, color: "#53DDFC",
                                                border: "1px solid rgba(83,221,252,0.3)", borderRadius: 4,
                                                padding: "1px 6px", letterSpacing: "0.05em",
                                                display: "flex", alignItems: "center", gap: 3,
                                            }}>
                                                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#53DDFC", display: "inline-block" }} />
                                                LIVE
                                            </span>
                                        )}
                                        {loc.badge && (
                                            <span style={{
                                                fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.38)",
                                                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4,
                                                padding: "1px 6px", letterSpacing: "0.04em",
                                            }}>{loc.badge}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar footer: connected status */}
                    <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        padding: "13px 16px", display: "flex", gap: 28, flexShrink: 0,
                    }}>
                        <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-display)", marginBottom: 2 }}>Connected</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#53DDFC", fontFamily: "var(--font-display)" }}>42 Nodes</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-display)", marginBottom: 2 }}>Status</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#53DDFC", fontFamily: "var(--font-display)" }}>Operational</div>
                        </div>
                    </div>
                </div>

                {/* ──── Map area ──── */}
                <div className="map-area" style={{ flex: 1, position: "relative", background: "#070707", overflow: "hidden" }}>
                    {/* Radial grid SVG — viewBox 0 0 100 100, center at (50,50) */}
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="xMidYMid slice"
                        width="100%" height="100%"
                        style={{ position: "absolute", inset: 0 }}
                    >
                        <defs>
                            {/* edge vignette */}
                            <radialGradient id="mapVig" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#070707" stopOpacity="0" />
                                <stop offset="60%" stopColor="#070707" stopOpacity="0.05" />
                                <stop offset="100%" stopColor="#070707" stopOpacity="0.88" />
                            </radialGradient>
                            {/* center glow */}
                            <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(204,151,255,0.06)" stopOpacity="1" />
                                <stop offset="40%" stopColor="rgba(204,151,255,0)" stopOpacity="1" />
                            </radialGradient>
                        </defs>

                        {/* Radial spokes */}
                        {Array.from({ length: SPOKES }).map((_, i) => {
                            const angle = (i / SPOKES) * Math.PI * 2;
                            const len = 72;
                            const primary = i % 6 === 0;
                            return (
                                <line key={`s${i}`}
                                    x1="50" y1="50"
                                    x2={50 + Math.cos(angle) * len}
                                    y2={50 + Math.sin(angle) * len}
                                    stroke={primary ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.055)"}
                                    strokeWidth={primary ? "0.18" : "0.1"}
                                />
                            );
                        })}

                        {/* Concentric ring circles */}
                        {RINGS.map((r, i) => (
                            <circle key={`r${i}`} cx="50" cy="50" r={r}
                                fill="none"
                                stroke={i === 0 ? "rgba(204,151,255,0.25)" : "rgba(255,255,255,0.1)"}
                                strokeWidth={i === 0 ? "0.25" : "0.12"}
                                strokeDasharray={i > 6 ? "0.6 0.9" : undefined}
                            />
                        ))}

                        {/* Center cross-hair */}
                        <circle cx="50" cy="50" r="0.6" fill="rgba(204,151,255,0.6)" />
                        <circle cx="50" cy="50" r="1.2" fill="none" stroke="rgba(204,151,255,0.25)" strokeWidth="0.15" />

                        {/* Center glow */}
                        <rect x="0" y="0" width="100" height="100" fill="url(#mapGlow)" />

                        {/* Edge vignette */}
                        <rect x="0" y="0" width="100" height="100" fill="url(#mapVig)" />
                    </svg>

                    {/* Map pins */}
                    {PINS.map((pin, i) => (
                        <div key={i} style={{
                            position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`,
                            transform: "translate(-50%,-50%)", zIndex: 10,
                            display: "flex", alignItems: "center", gap: 7,
                        }}>
                            {/* Dot with outer ring */}
                            <div style={{
                                width: 18, height: 18, borderRadius: "50%",
                                background: pin.color,
                                boxShadow: `0 0 0 4px ${pin.color}28, 0 0 18px ${pin.color}70`,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#000", display: "block" }} />
                            </div>
                            {/* Label pill */}
                            <div style={{
                                background: "rgba(7,7,7,0.86)", backdropFilter: "blur(10px)",
                                border: `1px solid ${pin.color}45`, borderRadius: 9999,
                                padding: "3px 11px", fontSize: 9, fontWeight: 800,
                                color: pin.color, fontFamily: "var(--font-display)",
                                letterSpacing: "0.1em", whiteSpace: "nowrap",
                            }}>
                                {pin.label.toUpperCase()}
                            </div>
                        </div>
                    ))}

                    {/* my_location — top right */}
                    <button style={{
                        position: "absolute", top: 14, right: 14, zIndex: 20,
                        width: 38, height: 38, borderRadius: "50%",
                        background: "rgba(16,16,16,0.92)", backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "rgba(255,255,255,0.65)",
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>my_location</span>
                    </button>

                    {/* Zoom controls — right center */}
                    <div style={{
                        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                        display: "flex", flexDirection: "column", zIndex: 20,
                        overflow: "hidden", borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                        {["add", "remove"].map((icon, idx) => (
                            <button key={icon} style={{
                                width: 38, height: 38,
                                background: "rgba(16,16,16,0.92)", backdropFilter: "blur(10px)",
                                border: "none",
                                borderBottom: idx === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "rgba(255,255,255,0.65)",
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            {/* ──── Full-width bottom bar ──── */}
            <div style={{
                flexShrink: 0, background: "rgba(7,7,7,0.97)",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                padding: "7px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <span style={{
                    fontSize: 10, color: "rgba(255,255,255,0.22)",
                    fontFamily: "var(--font-display)", letterSpacing: "0.06em",
                }}>© 2024 TEC KINETIC OS</span>
                <div style={{ display: "flex", gap: 24 }} className="map-bottom-nav">
                    {["PROTOCOL", "KERNEL", "SECURITY", "MANUAL"].map(item => (
                        <span key={item} style={{
                            fontSize: 10, color: "rgba(255,255,255,0.22)",
                            fontFamily: "var(--font-display)", letterSpacing: "0.07em",
                            cursor: "pointer", transition: "color 0.13s",
                        }}
                            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.6)"}
                            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.22)"}
                        >{item}</span>
                    ))}
                </div>
                <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg,#CC97FF,#9C48EA)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    boxShadow: "0 0 12px rgba(204,151,255,0.4)",
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#fff" }}>navigation</span>
                </div>
            </div>

        </div>
    );
}
