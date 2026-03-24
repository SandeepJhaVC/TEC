import React, { useState } from 'react';
import { motion } from 'framer-motion';

const locations = {
    Colleges: [
        { name: 'UPES Bidholi Campus', type: 'College', lat: 30.433, lng: 78.055, desc: 'Main campus, Energy Acres', icon: '🎓' },
        { name: 'UPES Pondha Campus', type: 'College', lat: 30.347, lng: 77.940, desc: 'City Campus', icon: '🎓' },
        { name: 'DIT University', type: 'College', lat: 30.350, lng: 77.950, desc: 'Mussoorie Diversion Road', icon: '🎓' },
        { name: 'Graphic Era University', type: 'College', lat: 30.313, lng: 78.030, desc: 'Clement Town', icon: '🎓' },
    ],
    PGs: [
        { name: 'Sunrise PG for Boys', type: 'PG', lat: 30.430, lng: 78.052, desc: '₹6,500/mo — AC, WiFi, meals', icon: '🏠' },
        { name: 'Patel Bhawan Girls PG', type: 'PG', lat: 30.428, lng: 78.058, desc: '₹7,000/mo — 24hr security', icon: '🏠' },
        { name: 'Shiv Shakti Residency', type: 'PG', lat: 30.345, lng: 77.942, desc: '₹5,500/mo — Near Pondha', icon: '🏠' },
        { name: 'Greenwood Boys Hostel', type: 'PG', lat: 30.432, lng: 78.060, desc: '₹6,000/mo — Mess included', icon: '🏠' },
    ],
    Restaurants: [
        { name: 'Chai Sutta Bar', type: 'Restaurant', lat: 30.325, lng: 78.040, desc: 'Student fav — great chai & snacks', icon: '🍵' },
        { name: 'Moustache Hostel Café', type: 'Restaurant', lat: 30.330, lng: 78.038, desc: 'Best café in Dehradun', icon: '☕' },
        { name: 'Bidholi Dhaba', type: 'Restaurant', lat: 30.431, lng: 78.053, desc: 'Cheap & tasty desi food', icon: '🍛' },
        { name: 'Crust N Bake', type: 'Restaurant', lat: 30.435, lng: 78.056, desc: 'Pizzas & burgers near campus', icon: '🍕' },
        { name: 'Pondha Food Corner', type: 'Restaurant', lat: 30.346, lng: 77.943, desc: 'Thali & chai, budget friendly', icon: '🥘' },
    ],
    Hospitals: [
        { name: 'Max Super Specialty Hospital', type: 'Hospital', lat: 30.345, lng: 78.050, desc: 'Full service — Mussoorie Road', icon: '🏥' },
        { name: 'AIIMS Rishikesh', type: 'Hospital', lat: 30.140, lng: 78.350, desc: '35km away, major medical center', icon: '🏥' },
        { name: 'Doon Medical College', type: 'Hospital', lat: 30.320, lng: 77.992, desc: 'Palace Road, govt hospital', icon: '🏥' },
    ],
    ATMs: [
        { name: 'SBI ATM — Bidholi', type: 'ATM', lat: 30.432, lng: 78.054, desc: 'Near UPES main gate', icon: '🏧' },
        { name: 'HDFC ATM — Pondha', type: 'ATM', lat: 30.348, lng: 77.941, desc: '24hr ATM', icon: '🏧' },
        { name: 'PNB ATM — Sahastradhara', type: 'ATM', lat: 30.370, lng: 78.060, desc: 'Always operational', icon: '🏧' },
    ],
    Pharmacy: [
        { name: '24hr MedPlus — Bidholi', type: 'Pharmacy', lat: 30.433, lng: 78.057, desc: 'Open 24 hours', icon: '💊' },
        { name: 'Shree Medicals', type: 'Pharmacy', lat: 30.346, lng: 77.938, desc: 'Near Pondha chowk', icon: '💊' },
    ],
};

const catColors = { Colleges: '#58a6ff', PGs: '#e3b341', Restaurants: '#f85149', Hospitals: '#3fb950', ATMs: '#58a6ff', Pharmacy: '#3fb950' };

export default function Map() {
    const [activeCategory, setActiveCategory] = useState('Colleges');

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', padding: '60px 24px 80px' }}>
            <style>{`
        .loc-item:hover { background: #21262d !important; border-color: #58a6ff !important; }
        .loc-item { transition: background 0.2s, border-color 0.2s; }
        .cat-tab:hover { background: #21262d !important; }
        .cat-tab { transition: background 0.2s; }
      `}</style>

            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
                    <span style={{ background: 'rgba(88,166,255,0.12)', color: '#58a6ff', border: '1px solid rgba(88,166,255,0.3)', padding: '5px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>CAMPUS MAP</span>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Navigate Pondha → Bidholi 🗺️</h1>
                    <p style={{ color: '#64748b', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Find everything from PGs and restaurants to ATMs and hospitals around campus.</p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        {/* Category tabs */}
                        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: 16, marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: 1, marginBottom: 12 }}>FILTER BY</div>
                            {Object.keys(locations).map(cat => (
                                <button key={cat} className="cat-tab" onClick={() => setActiveCategory(cat)} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10,
                                    background: activeCategory === cat ? `${catColors[cat]}22` : 'transparent',
                                    border: activeCategory === cat ? `1px solid ${catColors[cat]}44` : '1px solid transparent',
                                    color: activeCategory === cat ? catColors[cat] : '#64748b', fontSize: 14, fontWeight: 600,
                                    cursor: 'pointer', marginBottom: 4, textAlign: 'left', fontFamily: 'inherit',
                                }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColors[cat], flexShrink: 0 }} />
                                    {cat}
                                    <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>{locations[cat].length}</span>
                                </button>
                            ))}
                        </div>

                        {/* Location list */}
                        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: 16, maxHeight: 420, overflowY: 'auto' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', letterSpacing: 1, marginBottom: 12 }}>{activeCategory.toUpperCase()}</div>
                            {locations[activeCategory].map((loc, i) => (
                                <div key={i} className="loc-item" style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 6, padding: '10px 12px', marginBottom: 8, cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: 18 }}>{loc.icon}</span>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>{loc.name}</div>
                                            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>{loc.desc}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Map */}
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #30363d', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: 'rgba(22,27,34,0.9)', border: '1px solid #30363d', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#8b949e', backdropFilter: 'blur(8px)' }}>
                                📍 Dehradun, Uttarakhand
                            </div>
                            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(22,27,34,0.9)', border: '1px solid #30363d', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#3fb950', backdropFilter: 'blur(8px)' }}>
                                🟢 Live Map
                            </div>
                            <iframe
                                title="Pondha to Bidholi Campus Map"
                                src="https://www.openstreetmap.org/export/embed.html?bbox=77.88%2C30.28%2C78.12%2C30.50&layer=mapnik"
                                width="100%"
                                height="540"
                                style={{ border: 'none', display: 'block' }}
                                loading="lazy"
                            />
                        </div>

                        {/* Quick legend */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                            {Object.entries(catColors).map(([cat, color]) => (
                                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                                    {cat}
                                </div>
                            ))}
                        </div>

                        {/* Route info card */}
                        <div style={{ marginTop: 16, background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#58a6ff' }}>~18 km</div>
                                <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>Pondha → Bidholi</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#3fb950' }}>35 min</div>
                                <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>By bike (avg)</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#e3b341' }}>₹80–120</div>
                                <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>Auto fare (est.)</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
