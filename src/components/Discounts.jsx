import React, { useState } from 'react';
import { motion } from 'framer-motion';

const discounts = [
    { id: 1, name: "Chai Sutta Bar", category: "Food", discount: "20%", desc: "Show your college ID for 20% off on all beverages. Valid all week.", validity: "Ongoing", rating: 4.5, code: "STUDENT20", location: "Rajpur Road, Dehradun", tag: "🍵" },
    { id: 2, name: "Domino's Pizza", category: "Food", discount: "30%", desc: "Order online using code for 30% off on medium & large pizzas.", validity: "Weekdays only", rating: 4.2, code: "UPES30", location: "Pacific Mall, Doon", tag: "🍕" },
    { id: 3, name: "Rapido Bike Taxi", category: "Transport", discount: "50%", desc: "First 5 rides at 50% off for new sign-ups with college email.", validity: "New users", rating: 4.7, code: "TECRIDER", location: "App-based", tag: "🛵" },
    { id: 4, name: "Moustache Hostel Cafe", category: "Food", discount: "15%", desc: "Flat 15% off on café menu for UPES students every day.", validity: "Ongoing", rating: 4.8, code: "MOUSTEC", location: "Rajpur Road", tag: "☕" },
    { id: 5, name: "D-Mart Dehradun", category: "Shopping", discount: "10%", desc: "10% student discount on grocery shopping above ₹500.", validity: "Weekends", rating: 4.0, code: "DMART10", location: "Sahastradhara Road", tag: "🛒" },
    { id: 6, name: "Xtreme One Fitness", category: "Health", discount: "40%", desc: "40% off on a 3-month gym membership for enrolled students.", validity: "Semester-based", rating: 4.4, code: "XFIT40", location: "Bidholi, Dehradun", tag: "💪" },
    { id: 7, name: "Kitaab Ghar", category: "Study", discount: "25%", desc: "Discounts on textbooks, stationery and printing for students.", validity: "Ongoing", rating: 4.6, code: "BOOKS25", location: "Near UPES Gate", tag: "📚" },
    { id: 8, name: "OYO Rooms", category: "Stay", discount: "35%", desc: "Exclusive 35% off for guests with verified student ID.", validity: "Advance booking", rating: 3.9, code: "OYOSTUD35", location: "Multiple locations", tag: "🏨" },
    { id: 9, name: "Zomato Gold", category: "Food", discount: "Free", desc: "3-month Zomato Gold subscription free with college email.", validity: "Limited slots", rating: 4.3, code: "ZGOLD3M", location: "App-based", tag: "🍔" },
    { id: 10, name: "IndiGo Student Fares", category: "Transport", discount: "15%", desc: "Additional 15% off on booked economy tickets for students.", validity: "Academic year", rating: 4.1, code: "INDIGO15", location: "Jolly Grant Airport", tag: "✈️" },
    { id: 11, name: "Anytime Fitness", category: "Health", discount: "30%", desc: "Monthly membership at 30% off with valid student ID.", validity: "Per semester", rating: 4.5, code: "ANYTIME30", location: "Premnagar", tag: "🏋️" },
    { id: 12, name: "PhotoShop Studio", category: "Study", discount: "20%", desc: "20% off on all printing, scanning, and ID card services.", validity: "Ongoing", rating: 4.7, code: "PRINT20", location: "Pondha", tag: "🖨️" },
];

const categories = ['All', 'Food', 'Transport', 'Shopping', 'Health', 'Study', 'Stay'];
const catColors = { Food: '#e3b341', Transport: '#3fb950', Shopping: '#58a6ff', Health: '#f85149', Study: '#58a6ff', Stay: '#bc1888', All: '#8b949e' };

function Stars({ rating }) {
    return (
        <span style={{ color: '#f59e0b', fontSize: 13 }}>
            {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
            <span style={{ color: '#64748b', marginLeft: 4 }}>{rating}</span>
        </span>
    );
}

export default function Discounts() {
    const [active, setActive] = useState('All');
    const [revealed, setRevealed] = useState({});

    const filtered = active === 'All' ? discounts : discounts.filter(d => d.category === active);

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', padding: '60px 24px 80px' }}>
            <style>{`
        .disc-card:hover { transform: translateY(-2px); border-color: #58a6ff !important; }
        .disc-card { transition: transform 0.2s, border-color 0.2s; }
        .cat-btn:hover { opacity: 1 !important; }
        .reveal-btn:hover { opacity: 0.85; }
      `}</style>

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 48 }}>
                    <span style={{ background: 'rgba(6,214,160,0.15)', color: '#06d6a0', border: '1px solid rgba(6,214,160,0.3)', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>STUDENT DEALS</span>
                    <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Exclusive Discounts 🏷️</h1>
                    <p style={{ color: '#64748b', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Show your student ID and save big on food, transport, fitness and more around Dehradun.</p>
                </motion.div>

                {/* Category filters */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
                    {categories.map(cat => (
                        <button key={cat} className="cat-btn" onClick={() => setActive(cat)} style={{
                            padding: '7px 16px', borderRadius: 6, border: `1px solid ${active === cat ? catColors[cat] : '#30363d'}`,
                            background: active === cat ? `${catColors[cat]}22` : 'transparent',
                            color: active === cat ? catColors[cat] : '#8b949e',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}>
                            {cat}
                        </button>
                    ))}
                </motion.div>

                {/* Cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {filtered.map((d, i) => (
                        <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="disc-card" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                                {/* Discount badge */}
                                <div style={{ position: 'absolute', top: 16, right: 16, background: `${catColors[d.category]}22`, color: catColors[d.category], border: `1.5px solid ${catColors[d.category]}55`, borderRadius: 10, padding: '4px 12px', fontWeight: 800, fontSize: 15 }}>
                                    {d.discount} OFF
                                </div>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{d.tag}</div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{d.name}</h3>
                                <div style={{ marginBottom: 8 }}>
                                    <Stars rating={d.rating} />
                                </div>
                                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{d.desc}</p>
                                <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>📍 {d.location}</div>
                                <div style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>⏰ {d.validity}</div>

                                {revealed[d.id] ? (
                                    <div style={{ background: 'rgba(6,214,160,0.1)', border: '1.5px dashed #06d6a0', borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>PROMO CODE</div>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#06d6a0', letterSpacing: 2 }}>{d.code}</div>
                                    </div>
                                ) : (
                                    <button className="reveal-btn" onClick={() => setRevealed(prev => ({ ...prev, [d.id]: true }))}
                                        style={{ width: '100%', padding: '10px', background: '#238636', border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Reveal Code
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#475569', padding: '60px 0', fontSize: 16 }}>No deals in this category yet. Check back soon!</div>
                )}
            </div>
        </div>
    );
}
