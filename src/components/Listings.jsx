import React, { useState } from 'react';
import { motion } from 'framer-motion';

const tabs = ['PG / Hostels', 'Restaurants', 'Rentals', 'Hangout Spots', 'Activities'];
const tabEmojis = { 'PG / Hostels': '🏠', Restaurants: '🍽️', Rentals: '🛵', 'Hangout Spots': '🎉', Activities: '🏃' };
const tabColors = { 'PG / Hostels': '#e3b341', Restaurants: '#f85149', Rentals: '#3fb950', 'Hangout Spots': '#58a6ff', Activities: '#58a6ff' };

const data = {
    'PG / Hostels': [
        { name: 'Sunrise Boys PG', location: 'Bidholi', price: '₹6,500/mo', rating: 4.4, tags: ['AC', 'WiFi', 'Meals', '24hr Security'], desc: 'Clean rooms, home-cooked meals, 5min from UPES gate.', reviews: 42 },
        { name: 'Patel Bhawan Girls PG', location: 'Bidholi', price: '₹7,200/mo', rating: 4.6, tags: ['Fully Furnished', 'CCTV', 'Meals', 'Laundry'], desc: 'Safe and comfortable hostel-style PG exclusively for girls.', reviews: 61 },
        { name: 'Shiv Shakti Residency', location: 'Pondha', price: '₹5,200/mo', rating: 4.1, tags: ['Shared Rooms', 'WiFi', 'Parking'], desc: 'Budget-friendly option near Pondha campus.', reviews: 28 },
        { name: 'Greenwood Hostel', location: 'Bidholi', price: '₹6,000/mo', rating: 4.3, tags: ['AC', 'Gym', 'Mess', 'Library Room'], desc: 'Modern hostel with 24hr electricity backup.', reviews: 55 },
        { name: 'Galaxy PG Rooms', location: 'Sahastradhara Road', price: '₹5,800/mo', rating: 4.0, tags: ['Single Rooms', 'Attached Bath', 'WiFi'], desc: 'Individual privacy with attached bathroom for each room.', reviews: 19 },
        { name: 'Ashoka Residency', location: 'Premnagar', price: '₹5,000/mo', rating: 3.9, tags: ['Budget', 'Meals', 'Shared Rooms'], desc: 'Most affordable option with decent food.', reviews: 33 },
    ],
    Restaurants: [
        { name: 'Chai Sutta Bar', location: 'Rajpur Road', price: '₹50–150', rating: 4.7, tags: ['Chai', 'Snacks', 'Student Fav', 'Late Night'], desc: 'The classic student hangout. Unlimited chai and vibe.', reviews: 214 },
        { name: 'Moustache Hostel Café', location: 'Rajpur Road', price: '₹150–400', rating: 4.8, tags: ['Coffee', 'Brunch', 'WiFi', 'Instagrammable'], desc: 'Best café ambiance in Dehradun. Perfect for study sessions.', reviews: 387 },
        { name: 'Bidholi Dhaba', location: 'Near UPES Gate', price: '₹80–200', rating: 4.2, tags: ['Thali', 'North Indian', 'Cheap', 'Fast'], desc: 'Authentic dal-roti-sabzi at unbeatable prices near campus.', reviews: 119 },
        { name: 'Crust N Bake', location: 'Bidholi', price: '₹100–350', rating: 4.4, tags: ['Pizza', 'Burgers', 'Shakes', 'Quick Bites'], desc: 'Best pizzas within 2km of campus. Delivery available.', reviews: 98 },
        { name: 'Pondha Food Corner', location: 'Pondha Chowk', price: '₹60–180', rating: 4.3, tags: ['South Indian', 'Dosa', 'Budget', 'Breakfast'], desc: 'Amazing South Indian breakfast spot open from 7 AM.', reviews: 76 },
        { name: 'The Classy Diner', location: 'Maharani Bagh', price: '₹200–600', rating: 4.5, tags: ['Multi-cuisine', 'Date Spot', 'AC'], desc: 'Great for celebrations and special occasions.', reviews: 143 },
    ],
    Rentals: [
        { name: 'SpeedRental Bikes', location: 'Bidholi Gate', price: '₹250/day', rating: 4.5, tags: ['Bikes', 'Scooters', 'Helmets Provided', 'Aadhar Only'], desc: 'Honda Activa and Yamaha FZ available for daily rental.', reviews: 67 },
        { name: 'Campus Laptop Rentals', location: 'Near Library', price: '₹400/day', rating: 4.0, tags: ['Core i5', 'Windows 11', 'Exam Season'], desc: 'Affordable laptop rentals primarily for exam and project seasons.', reviews: 41 },
        { name: 'Cycle Junction', location: 'Pondha', price: '₹100/day', rating: 4.6, tags: ['Cycles', 'MTB', 'Eco-friendly', 'Cheap'], desc: 'Eco-friendly campus commute. MTB cycles for adventurous students.', reviews: 88 },
        { name: 'Dehradun Rent A Car', location: 'Clock Tower', price: '₹1,200/day', rating: 4.1, tags: ['Car', 'Weekend Trips', 'Driver Available'], desc: 'Hatchbacks for weekend getaways to Mussoorie & Rishikesh.', reviews: 32 },
        { name: 'Flash Scooter Share', location: 'App-based', price: '₹10/km', rating: 4.3, tags: ['App Rental', 'Electric', 'Shared', 'Hourly'], desc: 'Electric scooter rental by minute, available via mobile app.', reviews: 156 },
    ],
    'Hangout Spots': [
        { name: 'Sahastradhara Waterfalls', location: 'Sahastradhara, 8km', price: 'Free entry', rating: 4.8, tags: ['Nature', 'Waterfalls', 'Weekend', 'Group Outing'], desc: 'Sulphur springs and scenic waterfalls. A must-visit from Dehradun.', reviews: 892 },
        { name: 'Robbers Cave (Gucchupani)', location: '7km from UPES', price: '₹30 entry', rating: 4.7, tags: ['Caves', 'Trek', 'Picnic', 'Adventure'], desc: 'Natural cave with cold stream. Popular weekend destination for students.', reviews: 1203 },
        { name: 'Pacific Mall Food Court', location: 'GMS Road', price: 'Free entry', rating: 4.2, tags: ['Mall', 'Movies', 'Shopping', 'AC'], desc: 'Full-day entertainment — movies, food, and shopping under one roof.', reviews: 445 },
        { name: 'Tapkeshwar Temple', location: 'Garhi Cantonment', price: 'Free', rating: 4.6, tags: ['Spiritual', 'Temples', 'Caves', 'Nature Walk'], desc: 'Peaceful cave temple with a river stream. Great for a quiet outing.', reviews: 357 },
        { name: 'Doon Sports Club', location: 'Raipur Road', price: '₹100–300', rating: 4.0, tags: ['Cricket', 'Badminton', 'Pool', 'Affordable'], desc: 'Multi-sport facility open to students with nominal hourly charges.', reviews: 89 },
        { name: 'Mind Melt Board Game Café', location: 'Rajpur Road', price: '₹100/hr pp', rating: 4.9, tags: ['Board Games', 'Café', 'Chill', 'Indoor'], desc: 'Best indoor hangout spot. 100+ board games, amazing drinks.', reviews: 278 },
    ],
    Activities: [
        { name: 'River Rafting — Rishikesh', location: 'Rishikesh, 50km', price: '₹600–2,500', rating: 4.9, tags: ['Rafting', 'Adventure', 'Weekend', 'Group'], desc: 'Grade 3-4 rapids on the Ganges. Best adventure sports experience near Dehradun.', reviews: 2100 },
        { name: 'Mussoorie Trekking Trail', location: 'Mussoorie, 35km', price: '₹200–500', rating: 4.7, tags: ['Trek', 'Hills', 'Scenic', 'Weekend'], desc: 'Multiple trekking routes via Kempty Falls and George Everest Peak.', reviews: 640 },
        { name: 'Bungee & Zipline Park', location: 'Mohan Chatti', price: '₹1,800/activity', rating: 4.6, tags: ['Bungee', 'Zipline', 'Extreme', 'Bucket List'], desc: 'India\'s highest bungee jump near Rishikesh. Worth every rupee.', reviews: 512 },
        { name: 'UPES Cricket League', location: 'UPES Ground', price: 'Free to join', rating: 4.5, tags: ['Cricket', 'On-Campus', 'Team Sports', 'Regular'], desc: 'Intra-campus cricket tournaments with prizes. Always looking for players.', reviews: 88 },
        { name: 'Photography Walk — Doon Valley', location: 'Various', price: '₹100 guided', rating: 4.8, tags: ['Photography', 'Sunrise', 'Nature', 'Skill'], desc: 'Student-led photography walks at sunrise. Explore Doon Valley with your camera.', reviews: 57 },
        { name: 'Camping at Dhanaulti', location: 'Dhanaulti, 60km', price: '₹1,500/night pp', rating: 4.8, tags: ['Camping', 'Bonfire', '2D1N', 'Hills'], desc: 'Overnight camping with bonfires and stargazing in the forests near Dhanaulti.', reviews: 330 },
    ],
};

function Stars({ rating }) {
    return (
        <span style={{ fontSize: 13 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ color: rating >= s ? '#f59e0b' : rating >= s - 0.5 ? '#f59e0b' : '#334155' }}>★</span>
            ))}
            <span style={{ color: '#64748b', marginLeft: 5 }}>{rating} ({data[Object.keys(data)[0]]?.length > 0 ? '' : ''})</span>
        </span>
    );
}

export default function Listings() {
    const [tab, setTab] = useState('PG / Hostels');
    const [search, setSearch] = useState('');

    const items = data[tab].filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', padding: '60px 24px 80px' }}>
            <style>{`
        .listing-card:hover { transform: translateY(-2px); border-color: #58a6ff !important; }
        .listing-card { transition: transform 0.2s, border-color 0.2s; }
        .tab-btn:hover { opacity: 1 !important; }
      `}</style>

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
                    <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>LOCAL LISTINGS</span>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Explore Around Campus 🏠</h1>
                    <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto 24px' }}>Rated PGs, restaurants, rentals, hangout spots and activities — all within reach of Pondha & Bidholi.</p>

                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, location or tag..." className="gh-input" style={{ width: '100%', maxWidth: 420 }} />
                </motion.div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
                    {tabs.map(t => (
                        <button key={t} className="tab-btn" onClick={() => { setTab(t); setSearch(''); }} style={{
                            padding: '7px 16px', borderRadius: 6,
                            border: `1px solid ${tab === t ? tabColors[t] : '#30363d'}`,
                            background: tab === t ? `${tabColors[t]}22` : '#161b22',
                            color: tab === t ? tabColors[t] : '#8b949e',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}>
                            {tabEmojis[t]} {t}
                        </button>
                    ))}
                </div>

                {/* Cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {items.map((item, i) => (
                        <motion.div key={item.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <div className="listing-card" style={{ background: '#161b22', border: '1px solid #30363d', borderLeft: `3px solid ${tabColors[tab]}`, borderRadius: 6, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span style={{ fontSize: 24 }}>{tabEmojis[tab]}</span>
                                        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginTop: 8 }}>{item.name}</h3>
                                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>📍 {item.location}</div>
                                    </div>
                                    <div style={{ background: `${tabColors[tab]}22`, border: `1px solid ${tabColors[tab]}44`, borderRadius: 10, padding: '6px 12px', textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: tabColors[tab] }}>{item.price}</div>
                                    </div>
                                </div>

                                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, flex: 1 }}>{item.desc}</p>

                                <div>
                                    <Stars rating={item.rating} />
                                    <span style={{ fontSize: 12, color: '#475569', marginLeft: 4 }}>({item.reviews} reviews)</span>
                                </div>

                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {item.tags.map(tag => (
                                        <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 500 }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {items.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#475569', padding: '60px 0', fontSize: 16 }}>No results found. Try a different search.</div>
                )}
            </div>
        </div>
    );
}
