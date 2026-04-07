import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────
   Static hostel / room data
   (replace with a supabase fetch in the future)
───────────────────────────────────────────── */
const HOSTELS = [
    {
        id: "BH-A", label: "Block A — Boys", wings: [
            { id: "A-G", label: "Ground", floors: 1, rooms: 10, bedsPerRoom: 4 },
            { id: "A-1", label: "Floor 1", floors: 1, rooms: 10, bedsPerRoom: 4 },
            { id: "A-2", label: "Floor 2", floors: 1, rooms: 10, bedsPerRoom: 4 },
        ],
    },
    {
        id: "BH-B", label: "Block B — Boys", wings: [
            { id: "B-G", label: "Ground", floors: 1, rooms: 8, bedsPerRoom: 4 },
            { id: "B-1", label: "Floor 1", floors: 1, rooms: 8, bedsPerRoom: 4 },
        ],
    },
    {
        id: "GH-A", label: "Block C — Girls", wings: [
            { id: "C-G", label: "Ground", floors: 1, rooms: 10, bedsPerRoom: 3 },
            { id: "C-1", label: "Floor 1", floors: 1, rooms: 10, bedsPerRoom: 3 },
            { id: "C-2", label: "Floor 2", floors: 1, rooms: 10, bedsPerRoom: 3 },
        ],
    },
];

/* ─────────────────────────────────────────────
   Colour helpers
───────────────────────────────────────────── */
const BED_COLOR = {
    available: { bg: "rgba(83,221,252,0.10)", border: "rgba(83,221,252,0.35)", color: "var(--secondary)" },
    occupied: { bg: "rgba(255,110,132,0.10)", border: "rgba(255,110,132,0.30)", color: "var(--error)" },
    reserved: { bg: "rgba(227,179,65,0.10)", border: "rgba(227,179,65,0.30)", color: "#e3b341" },
    selected: { bg: "rgba(204,151,255,0.20)", border: "rgba(204,151,255,0.70)", color: "var(--primary)" },
    maintenance: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)", color: "var(--on-surface-var)" },
};

const STATUS_META = {
    available: { label: "Available", icon: "bed" },
    occupied: { label: "Occupied", icon: "person" },
    reserved: { label: "Reserved", icon: "pending" },
    maintenance: { label: "Maintenance", icon: "construction" },
};

/* ─────────────────────────────────────────────
   Seeded pseudo-random allocation
   (replaced by real DB records in prod)
───────────────────────────────────────────── */
function seedBeds(wingId, roomCount, bedsPerRoom) {
    const rooms = [];
    const rng = (x) => ((Math.sin(x * 9301 + 49297) * 233280) % 1 + 1) % 1;
    for (let r = 1; r <= roomCount; r++) {
        const beds = [];
        for (let b = 1; b <= bedsPerRoom; b++) {
            const seed = wingId.charCodeAt(0) * 100 + wingId.charCodeAt(2) * 10 + r * 7 + b;
            const roll = rng(seed);
            const status = roll < 0.55 ? "occupied" : roll < 0.62 ? "reserved" : roll < 0.66 ? "maintenance" : "available";
            beds.push({
                id: `${wingId}-R${r}-B${b}`,
                label: `B${b}`,
                status,
                occupant: status === "occupied" ? `Student #${((r * bedsPerRoom + b) * 13) % 900 + 100}` : null,
            });
        }
        rooms.push({ id: `${wingId}-R${r}`, label: `Room ${r}`, beds });
    }
    return rooms;
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function Legend() {
    return (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
            {Object.entries(STATUS_META).map(([status, { label }]) => {
                const c = BED_COLOR[status];
                return (
                    <div key={status} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 4, background: c.bg, border: `1.5px solid ${c.border}` }} />
                        <span style={{ color: "var(--on-surface-var)", fontFamily: "var(--font-display)", fontWeight: 600 }}>{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function BedCell({ bed, selected, onClick }) {
    const c = selected ? BED_COLOR.selected : BED_COLOR[bed.status];
    const clickable = bed.status === "available" || selected;
    return (
        <motion.button
            whileHover={clickable ? { scale: 1.08 } : {}}
            whileTap={clickable ? { scale: 0.95 } : {}}
            onClick={() => clickable && onClick(bed)}
            title={bed.occupant ? bed.occupant : bed.label}
            style={{
                width: 44, height: 44, borderRadius: 10,
                background: c.bg, border: `1.5px solid ${c.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: clickable ? "pointer" : "default",
                transition: "all 0.14s",
                position: "relative",
                outline: selected ? `2px solid ${c.border}` : "none",
                outlineOffset: 2,
            }}
        >
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: c.color }}>{STATUS_META[bed.status].icon}</span>
            <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: c.color, letterSpacing: "0.04em", marginTop: 1 }}>{bed.label}</span>
            {selected && (
                <div style={{
                    position: "absolute", top: -5, right: -5, width: 12, height: 12,
                    borderRadius: "50%", background: "var(--primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 9, color: "#000" }}>check</span>
                </div>
            )}
        </motion.button>
    );
}

function RoomCard({ room, selectedBeds, onBedClick }) {
    const occupiedCount = room.beds.filter(b => b.status === "occupied").length;
    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "12px 14px",
            minWidth: 0,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, letterSpacing: "0.04em" }}>{room.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-surface-var)" }}>
                    {occupiedCount}/{room.beds.length}
                </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {room.beds.map(bed => (
                    <BedCell
                        key={bed.id}
                        bed={bed}
                        selected={selectedBeds.some(b => b.id === bed.id)}
                        onClick={onBedClick}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Booking Modal
───────────────────────────────────────────── */
function BookingModal({ beds, onClose, onConfirm }) {
    const [name, setName] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [branch, setBranch] = useState("");
    const [year, setYear] = useState("1st");
    const [contact, setContact] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !rollNo.trim()) { setError("Name and roll number are required."); return; }
        setSubmitting(true);
        await onConfirm({ name, rollNo, branch, year, contact });
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="modal-box"
                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 24 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: 460, width: "100%" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                    <div>
                        <div className="eyebrow" style={{ marginBottom: 4 }}>Hostel Allocation</div>
                        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" }}>
                            Confirm Booking
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--on-surface-var)", padding: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                {/* Selected beds summary */}
                <div style={{ background: "var(--surface-low)", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-display)", color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>Selected Beds</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {beds.map(b => (
                            <span key={b.id} className="tag-primary" style={{ fontSize: 10, letterSpacing: "0.04em" }}>{b.id}</span>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Full Name *</label>
                            <input className="neon-input" value={name} onChange={e => setName(e.target.value)} placeholder="Student full name" style={{ width: "100%", boxSizing: "border-box" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Roll No. *</label>
                            <input className="neon-input" value={rollNo} onChange={e => setRollNo(e.target.value)} placeholder="e.g. 22BTCSE001" style={{ width: "100%", boxSizing: "border-box" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Year</label>
                            <select className="neon-select" value={year} onChange={e => setYear(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }}>
                                {["1st", "2nd", "3rd", "4th"].map(y => <option key={y} value={y}>{y} Year</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Branch</label>
                            <input className="neon-input" value={branch} onChange={e => setBranch(e.target.value)} placeholder="e.g. CSE" style={{ width: "100%", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Contact</label>
                            <input className="neon-input" value={contact} onChange={e => setContact(e.target.value)} placeholder="Phone / email" style={{ width: "100%", boxSizing: "border-box" }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: "rgba(255,110,132,0.10)", border: "1px solid rgba(255,110,132,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--error)", marginTop: 12 }}>{error}</div>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                        <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 2, justifyContent: "center", opacity: submitting ? 0.7 : 1 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                            {submitting ? "Booking…" : `Book ${beds.length} Bed${beds.length > 1 ? "s" : ""}`}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Stats bar at top of page
───────────────────────────────────────────── */
function StatsBar({ rooms }) {
    const allBeds = rooms.flatMap(r => r.beds);
    const total = allBeds.length;
    const occupied = allBeds.filter(b => b.status === "occupied").length;
    const available = allBeds.filter(b => b.status === "available").length;
    const reserved = allBeds.filter(b => b.status === "reserved").length;
    const maintenance = allBeds.filter(b => b.status === "maintenance").length;
    const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;

    const items = [
        { label: "Total Beds", value: total, color: "var(--on-surface)" },
        { label: "Occupied", value: occupied, color: "var(--error)" },
        { label: "Available", value: available, color: "var(--secondary)" },
        { label: "Reserved", value: reserved, color: "#e3b341" },
        { label: "Maintenance", value: maintenance, color: "var(--on-surface-var)" },
        { label: "Occupancy", value: `${pct}%`, color: pct > 85 ? "var(--error)" : pct > 60 ? "#e3b341" : "var(--secondary)" },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 28 }}>
            {items.map(({ label, value, color }) => (
                <div key={label} className="neon-card" style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: "var(--on-surface-var)", fontFamily: "var(--font-display)", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, letterSpacing: "-0.04em", color }}>{value}</div>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Occupants list panel
───────────────────────────────────────────── */
function OccupantsPanel({ rooms, bookings }) {
    const [search, setSearch] = useState("");
    const allOccupied = rooms.flatMap(room =>
        room.beds.filter(b => b.status === "occupied").map(b => ({
            bedId: b.id,
            occupant: b.occupant,
            room: room.label,
        }))
    );

    // Merge with admin-booked entries
    const all = [
        ...bookings.map(bk => ({ bedId: bk.bedId, occupant: bk.name, room: bk.bedId.split("-").slice(0, 2).join("-"), rollNo: bk.rollNo, branch: bk.branch, year: bk.year, fromAdmin: true })),
        ...allOccupied.filter(o => !bookings.some(bk => bk.bedId === o.bedId)),
    ];

    const filtered = all.filter(o =>
        !search || (o.occupant || "").toLowerCase().includes(search.toLowerCase()) || (o.bedId || "").toLowerCase().includes(search.toLowerCase()) || (o.rollNo || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ position: "relative", marginBottom: 14 }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--on-surface-var)" }}>search</span>
                <input className="neon-input" placeholder="Search by name, roll no. or bed ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38, width: "100%", boxSizing: "border-box" }} />
            </div>
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--on-surface-var)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 36, opacity: 0.25, display: "block", marginBottom: 8 }}>person_off</span>
                        No occupants found.
                    </div>
                )}
                {filtered.map((o, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: o.fromAdmin ? "rgba(204,151,255,0.12)" : "rgba(83,221,252,0.10)", border: `1px solid ${o.fromAdmin ? "rgba(204,151,255,0.25)" : "rgba(83,221,252,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, color: o.fromAdmin ? "var(--primary)" : "var(--secondary)" }}>
                                {(o.occupant || "?")[0].toUpperCase()}
                            </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{o.occupant}</div>
                            <div style={{ fontSize: 11, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)" }}>
                                {o.rollNo && <span style={{ marginRight: 8 }}>{o.rollNo}</span>}
                                {o.branch && <span style={{ marginRight: 8 }}>{o.branch}</span>}
                                {o.year && <span>{o.year} Yr</span>}
                            </div>
                        </div>
                        <span className="tag-ghost" style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}>{o.bedId}</span>
                        {o.fromAdmin && <span className="tag-primary" style={{ fontSize: 8 }}>NEW</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function HostelManagement() {
    const { user } = useAuth();

    // Navigation state
    const [hostelId, setHostelId] = useState(HOSTELS[0].id);
    const [wingId, setWingId] = useState(HOSTELS[0].wings[0].id);
    const [activeTab, setActiveTab] = useState("map"); // "map" | "occupants" | "waitlist"

    // Room / bed data
    const [rooms, setRooms] = useState([]);

    // Selection state
    const [selectedBeds, setSelectedBeds] = useState([]);

    // Modal
    const [showBooking, setShowBooking] = useState(false);

    // Persisted bookings this session
    const [bookings, setBookings] = useState([]);

    // Toast
    const [toast, setToast] = useState(null);

    // Waitlist
    const [waitlist, setWaitlist] = useState([]);
    const [wlForm, setWlForm] = useState({ name: "", rollNo: "", branch: "", contact: "", pref: "" });
    const [wlSubmitting, setWlSubmitting] = useState(false);

    // ── derive current hostel & wing
    const hostel = HOSTELS.find(h => h.id === hostelId);
    const wing = hostel?.wings.find(w => w.id === wingId);

    // Whenever wing changes, regenerate seeded rooms
    useEffect(() => {
        if (!wing) return;
        setRooms(seedBeds(wing.id, wing.rooms, wing.bedsPerRoom));
        setSelectedBeds([]);
    }, [wingId]);

    // Also init on mount
    useEffect(() => {
        const w = HOSTELS[0].wings[0];
        setRooms(seedBeds(w.id, w.rooms, w.bedsPerRoom));
    }, []);

    const handleHostelChange = (id) => {
        const h = HOSTELS.find(x => x.id === id);
        setHostelId(id);
        setWingId(h.wings[0].id);
    };

    const handleBedClick = (bed) => {
        setSelectedBeds(prev => {
            if (prev.some(b => b.id === bed.id)) return prev.filter(b => b.id !== bed.id);
            if (prev.length >= 4) { showToast("You can book max 4 beds at once."); return prev; }
            return [...prev, bed];
        });
    };

    const handleConfirmBooking = async ({ name, rollNo, branch, year, contact }) => {
        // Mark beds as occupied in local state
        const newBookings = selectedBeds.map(b => ({ bedId: b.id, name, rollNo, branch, year, contact }));
        setBookings(prev => [...prev, ...newBookings]);
        setRooms(prev =>
            prev.map(room => ({
                ...room,
                beds: room.beds.map(b =>
                    selectedBeds.some(s => s.id === b.id)
                        ? { ...b, status: "occupied", occupant: name }
                        : b
                ),
            }))
        );
        setSelectedBeds([]);
        showToast(`Booked ${newBookings.length} bed(s) for ${name}.`);
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const handleWlSubmit = (e) => {
        e.preventDefault();
        if (!wlForm.name.trim() || !wlForm.rollNo.trim()) return;
        setWlSubmitting(true);
        setTimeout(() => {
            setWaitlist(prev => [...prev, { ...wlForm, id: Date.now(), addedAt: new Date().toLocaleString() }]);
            setWlForm({ name: "", rollNo: "", branch: "", contact: "", pref: "" });
            setWlSubmitting(false);
            showToast(`${wlForm.name} added to waitlist.`);
        }, 400);
    };

    // Occupancy bar width
    const allBeds = rooms.flatMap(r => r.beds);
    const occupancyPct = allBeds.length > 0 ? (allBeds.filter(b => b.status === "occupied").length / allBeds.length) * 100 : 0;

    return (
        <div className="page-wrap" style={{ maxWidth: 1340 }}>

            {/* ── Page Header ── */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Admin · Restricted</div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95 }}>
                        HOSTEL_<span className="accent-primary">GRID</span>
                    </h1>
                    <p style={{ color: "var(--on-surface-var)", fontSize: 13, marginTop: 10 }}>
                        Allocate and manage student bed assignments across all campus hostels.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="tag-error" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>lock</span>
                        ADMIN ONLY
                    </span>
                </div>
            </div>

            {/* ── Stats Bar ── */}
            <StatsBar rooms={rooms} />

            {/* ── Hostel + Wing Selectors ── */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                {HOSTELS.map(h => (
                    <button
                        key={h.id}
                        onClick={() => handleHostelChange(h.id)}
                        style={{
                            padding: "8px 18px", borderRadius: 9999, fontFamily: "var(--font-display)",
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer", border: "none",
                            background: hostelId === h.id ? "var(--primary)" : "var(--surface-highest)",
                            color: hostelId === h.id ? "#000" : "var(--on-surface-var)",
                            transition: "all 0.14s",
                        }}
                    >
                        {h.label}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {hostel?.wings.map(w => (
                    <button
                        key={w.id}
                        onClick={() => setWingId(w.id)}
                        style={{
                            padding: "5px 14px", borderRadius: 9999, fontFamily: "var(--font-display)",
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer",
                            border: wingId === w.id ? "1.5px solid var(--secondary)" : "1.5px solid transparent",
                            background: wingId === w.id ? "rgba(83,221,252,0.10)" : "var(--surface-highest)",
                            color: wingId === w.id ? "var(--secondary)" : "var(--on-surface-var)",
                            transition: "all 0.14s",
                        }}
                    >
                        {w.label}
                    </button>
                ))}
            </div>

            {/* ── Occupancy bar ── */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--on-surface-var)", marginBottom: 5 }}>
                    <span>{wing?.label} — {hostel?.label}</span>
                    <span>{Math.round(occupancyPct)}% OCCUPIED</span>
                </div>
                <div style={{ height: 5, background: "var(--surface-highest)", borderRadius: 9999, overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${occupancyPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 9999, background: occupancyPct > 85 ? "var(--error)" : occupancyPct > 60 ? "#e3b341" : "var(--secondary)" }}
                    />
                </div>
            </div>

            {/* ── Tab switcher ── */}
            <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "var(--surface-highest)", borderRadius: 12, padding: 4, width: "fit-content" }}>
                {[["map", "grid_view", "Bed Map"], ["occupants", "people", "Occupants"], ["waitlist", "queue", "Waitlist"]].map(([id, icon, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)} style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
                        background: activeTab === id ? "var(--surface)" : "transparent",
                        color: activeTab === id ? "var(--on-surface)" : "var(--on-surface-var)",
                        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em",
                        transition: "all 0.14s", boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>
                        {label}
                        {id === "waitlist" && waitlist.length > 0 && (
                            <span style={{ background: "var(--error)", color: "#fff", borderRadius: 9999, fontSize: 8, padding: "1px 5px", fontWeight: 800 }}>{waitlist.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">

                {/* BED MAP TAB */}
                {activeTab === "map" && (
                    <motion.div key="map" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Legend />

                        {/* Room grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
                            {rooms.map(room => (
                                <RoomCard key={room.id} room={room} selectedBeds={selectedBeds} onBedClick={handleBedClick} />
                            ))}
                        </div>

                        {/* Selection action bar */}
                        <AnimatePresence>
                            {selectedBeds.length > 0 && (
                                <motion.div
                                    key="action-bar"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    style={{
                                        position: "sticky", bottom: 24,
                                        background: "var(--surface)", border: "1px solid rgba(204,151,255,0.3)",
                                        borderRadius: 16, padding: "14px 20px",
                                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                                        backdropFilter: "blur(12px)",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
                                        {selectedBeds.map(b => (
                                            <span key={b.id} className="tag-primary" style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 10 }}>bed</span>
                                                {b.id}
                                                <button
                                                    onClick={() => setSelectedBeds(p => p.filter(x => x.id !== b.id))}
                                                    style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex", lineHeight: 1 }}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>close</span>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button onClick={() => setSelectedBeds([])} className="btn-secondary" style={{ padding: "7px 16px", fontSize: 11 }}>Clear</button>
                                        <button onClick={() => setShowBooking(true)} className="btn-primary" style={{ padding: "7px 18px", fontSize: 11 }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>how_to_reg</span>
                                            Book {selectedBeds.length} Bed{selectedBeds.length > 1 ? "s" : ""}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* OCCUPANTS TAB */}
                {activeTab === "occupants" && (
                    <motion.div key="occupants" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="neon-card" style={{ padding: 22 }}>
                            <div className="eyebrow" style={{ marginBottom: 14 }}>Current Occupants — {wing?.label}</div>
                            <OccupantsPanel rooms={rooms} bookings={bookings} />
                        </div>
                    </motion.div>
                )}

                {/* WAITLIST TAB */}
                {activeTab === "waitlist" && (
                    <motion.div key="waitlist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                            {/* Add to waitlist form */}
                            <div className="neon-card" style={{ padding: 22 }}>
                                <div className="eyebrow" style={{ marginBottom: 14 }}>Add to Waitlist</div>
                                <form onSubmit={handleWlSubmit}>
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Full Name *</label>
                                        <input className="neon-input" value={wlForm.name} onChange={e => setWlForm(f => ({ ...f, name: e.target.value }))} placeholder="Student name" style={{ width: "100%", boxSizing: "border-box" }} />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Roll No. *</label>
                                            <input className="neon-input" value={wlForm.rollNo} onChange={e => setWlForm(f => ({ ...f, rollNo: e.target.value }))} placeholder="e.g. 22BTCSE001" style={{ width: "100%", boxSizing: "border-box" }} />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Branch</label>
                                            <input className="neon-input" value={wlForm.branch} onChange={e => setWlForm(f => ({ ...f, branch: e.target.value }))} placeholder="e.g. CSE" style={{ width: "100%", boxSizing: "border-box" }} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Block / Room Preference</label>
                                        <input className="neon-input" value={wlForm.pref} onChange={e => setWlForm(f => ({ ...f, pref: e.target.value }))} placeholder="e.g. Block A, ground floor" style={{ width: "100%", boxSizing: "border-box" }} />
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--on-surface-var)", letterSpacing: "0.08em", marginBottom: 5, textTransform: "uppercase" }}>Contact</label>
                                        <input className="neon-input" value={wlForm.contact} onChange={e => setWlForm(f => ({ ...f, contact: e.target.value }))} placeholder="Phone / email" style={{ width: "100%", boxSizing: "border-box" }} />
                                    </div>
                                    <button type="submit" disabled={wlSubmitting || !wlForm.name.trim() || !wlForm.rollNo.trim()} className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: (wlSubmitting || !wlForm.name.trim() || !wlForm.rollNo.trim()) ? 0.5 : 1 }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
                                        {wlSubmitting ? "Adding…" : "Add to Waitlist"}
                                    </button>
                                </form>
                            </div>

                            {/* Waitlist entries */}
                            <div className="neon-card" style={{ padding: 22 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                    <div className="eyebrow">Waitlist ({waitlist.length})</div>
                                </div>
                                {waitlist.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--on-surface-var)" }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 36, opacity: 0.2, display: "block", marginBottom: 8 }}>queue</span>
                                        No one on the waitlist.
                                    </div>
                                )}
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto" }}>
                                    {waitlist.map((wl, i) => (
                                        <motion.div key={wl.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--surface-low)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(227,179,65,0.12)", border: "1px solid rgba(227,179,65,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, color: "#e3b341" }}>{i + 1}</span>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12 }}>{wl.name}</div>
                                                <div style={{ fontSize: 10, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)" }}>
                                                    {wl.rollNo}{wl.branch ? ` · ${wl.branch}` : ""}{wl.pref ? ` · Pref: ${wl.pref}` : ""}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setWaitlist(p => p.filter(x => x.id !== wl.id))}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--on-surface-var)", padding: 4, display: "flex" }}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* ── Booking Modal ── */}
            <AnimatePresence>
                {showBooking && (
                    <BookingModal
                        beds={selectedBeds}
                        onClose={() => setShowBooking(false)}
                        onConfirm={handleConfirmBooking}
                    />
                )}
            </AnimatePresence>

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 24, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 24, x: "-50%" }}
                        style={{
                            position: "fixed", bottom: 32, left: "50%",
                            background: "var(--surface)", border: "1px solid rgba(83,221,252,0.3)",
                            borderRadius: 12, padding: "12px 22px",
                            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                            color: "var(--secondary)", zIndex: 9999,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                            display: "flex", alignItems: "center", gap: 8,
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
