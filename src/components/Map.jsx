import React, { useState, useEffect, useRef } from "react";

const MAP_STYLE = {
    version: 8,
    sources: {
        myarea: { type: 'geojson', data: '/map.geojson' }
    },
    layers: [
        { id: 'background', type: 'background', paint: { 'background-color': '#0e0f0b' } },
        {
            id: 'landuse-residential', type: 'fill', source: 'myarea',
            filter: ['==', ['get', 'landuse'], 'residential'],
            paint: { 'fill-color': '#1a1c14' }
        },
        {
            id: 'landuse-commercial', type: 'fill', source: 'myarea',
            filter: ['==', ['get', 'landuse'], 'commercial'],
            paint: { 'fill-color': '#1e2016' }
        },
        {
            id: 'landuse-park', type: 'fill', source: 'myarea',
            filter: ['any',
                ['in', ['get', 'landuse'], ['literal', ['park', 'forest', 'grass', 'meadow']]],
                ['in', ['get', 'leisure'], ['literal', ['park', 'garden', 'pitch']]]
            ],
            paint: { 'fill-color': '#1e2d12' }
        },
        {
            id: 'water-fill', type: 'fill', source: 'myarea',
            filter: ['all',
                ['==', ['geometry-type'], 'Polygon'],
                ['any',
                    ['==', ['get', 'natural'], 'water'],
                    ['==', ['get', 'landuse'], 'reservoir'],
                    ['in', ['get', 'waterway'], ['literal', ['riverbank', 'dock']]]
                ]
            ],
            paint: { 'fill-color': '#0d1a24', 'fill-opacity': 1 }
        },
        {
            id: 'water-line', type: 'line', source: 'myarea',
            filter: ['all',
                ['==', ['geometry-type'], 'LineString'],
                ['in', ['get', 'waterway'], ['literal', ['river', 'stream', 'canal', 'drain']]]
            ],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
                'line-color': '#0d1a24',
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 16, 6]
            }
        },
        {
            id: 'roads-motorway-casing', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['motorway', 'trunk']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#000000', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 7, 16, 22] }
        },
        {
            id: 'roads-primary-casing', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['primary', 'secondary']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#000000', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 16, 16] }
        },
        {
            id: 'roads-tertiary-casing', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['tertiary', 'residential', 'unclassified']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#000000', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2.5, 16, 10] }
        },
        {
            id: 'roads-motorway', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['motorway', 'trunk']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#c8c9b2', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 16, 16] }
        },
        {
            id: 'roads-primary', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['primary', 'secondary']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#b8b9a4', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 16, 10] }
        },
        {
            id: 'roads-tertiary', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['tertiary', 'residential', 'unclassified']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#a0a190', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 6] }
        },
        {
            id: 'roads-small', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['service', 'footway', 'path', 'track']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#787868', 'line-width': ['interpolate', ['linear'], ['zoom'], 14, 0.5, 16, 3] }
        }
    ]
};

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


export default function Map() {
    const [cat, setCat] = useState("Colleges");
    const [activePin, setPin] = useState(null);
    const mapContainerRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (!mapContainerRef.current || !window.maplibregl) return;
        const map = new window.maplibregl.Map({
            container: mapContainerRef.current,
            style: MAP_STYLE,
            center: [0, 0],
            zoom: 2,
        });
        map.on('load', () => {
            fetch('/map.geojson')
                .then(r => r.json())
                .then(data => {
                    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
                    function processCoord(c) {
                        if (c[0] < minLng) minLng = c[0];
                        if (c[0] > maxLng) maxLng = c[0];
                        if (c[1] < minLat) minLat = c[1];
                        if (c[1] > maxLat) maxLat = c[1];
                    }
                    function processGeom(geom) {
                        if (!geom) return;
                        if (geom.type === 'LineString') geom.coordinates.forEach(processCoord);
                        else if (geom.type === 'Polygon') geom.coordinates[0].forEach(processCoord);
                        else if (geom.type === 'MultiLineString') geom.coordinates.forEach(r => r.forEach(processCoord));
                        else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(p => p[0].forEach(processCoord));
                    }
                    data.features.forEach(f => processGeom(f.geometry));
                    if (minLng !== Infinity) {
                        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 40 });
                    }
                })
                .catch(() => { });
        });
        mapInstance.current = map;
        return () => { map.remove(); };
    }, []);

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
                <div className="map-area" style={{ flex: 1, position: "relative", background: "#0e0f0b", overflow: "hidden" }}>
                    {/* MapLibre GL container */}
                    <div ref={mapContainerRef} style={{ position: "absolute", inset: 0 }} />

                    {/* my_location — top right */}
                    <button onClick={() => mapInstance.current && mapInstance.current.flyTo({ zoom: mapInstance.current.getZoom() })} style={{
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
                        {[["add", () => mapInstance.current && mapInstance.current.zoomIn()],
                        ["remove", () => mapInstance.current && mapInstance.current.zoomOut()]].map(([icon, handler], idx) => (
                            <button key={icon} onClick={handler} style={{
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
