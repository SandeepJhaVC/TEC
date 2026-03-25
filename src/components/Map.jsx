import React, { useState, useEffect, useRef } from "react";

/* ── GTA V-inspired dark map palette ── */
const MAP_STYLE = {
    version: 8,
    sources: {
        myarea: { type: 'geojson', data: '/map.geojson' }
    },
    layers: [
        /* near-black warm ground */
        { id: 'background', type: 'background', paint: { 'background-color': '#09090a' } },
        /* blocks/fill — barely lighter than background, keep it moody */
        {
            id: 'landuse-residential', type: 'fill', source: 'myarea',
            filter: ['==', ['get', 'landuse'], 'residential'],
            paint: { 'fill-color': '#0f100d' }
        },
        {
            id: 'landuse-commercial', type: 'fill', source: 'myarea',
            filter: ['==', ['get', 'landuse'], 'commercial'],
            paint: { 'fill-color': '#131410' }
        },
        {
            id: 'landuse-industrial', type: 'fill', source: 'myarea',
            filter: ['in', ['get', 'landuse'], ['literal', ['industrial', 'railway', 'construction']]],
            paint: { 'fill-color': '#111210' }
        },
        /* parks — dark olive, GTA signature */
        {
            id: 'landuse-park', type: 'fill', source: 'myarea',
            filter: ['any',
                ['in', ['get', 'landuse'], ['literal', ['park', 'forest', 'grass', 'meadow', 'farmland', 'orchard']]],
                ['in', ['get', 'leisure'], ['literal', ['park', 'garden', 'pitch', 'golf_course']]],
                ['==', ['get', 'natural'], 'wood']
            ],
            paint: { 'fill-color': '#0c1509' }
        },
        /* water — dark navy-black, subtle */
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
            paint: { 'fill-color': '#070e1a', 'fill-opacity': 1 }
        },
        {
            id: 'water-line', type: 'line', source: 'myarea',
            filter: ['all',
                ['==', ['geometry-type'], 'LineString'],
                ['in', ['get', 'waterway'], ['literal', ['river', 'stream', 'canal', 'drain']]]
            ],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
                'line-color': '#0a1828',
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 16, 8]
            }
        },
        /* ── Road casings (black outline for depth) ── */
        {
            id: 'roads-motorway-casing', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['motorway', 'trunk']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#050505', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 9, 16, 26] }
        },
        {
            id: 'roads-primary-casing', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['primary', 'secondary']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#050505', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 6, 16, 18] }
        },
        {
            id: 'roads-tertiary-casing', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['tertiary', 'residential', 'unclassified', 'living_street']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#050505', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3.5, 16, 12] }
        },
        /* ── Road fills — GTA's signature light-on-dark palette ── */
        /* Motorway: bright cream/sand — dominant, GTA highways glow */
        {
            id: 'roads-motorway', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['motorway', 'trunk']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#e2d8a8', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 16, 18] }
        },
        /* Primary: warm gray-tan */
        {
            id: 'roads-primary', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['primary', 'secondary']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#c0b888', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 16, 12] }
        },
        /* Tertiary: medium gray */
        {
            id: 'roads-tertiary', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['tertiary', 'residential', 'unclassified', 'living_street']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#7e7860', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.2, 16, 7] }
        },
        /* Small/service paths: dark, barely visible */
        {
            id: 'roads-small', type: 'line', source: 'myarea',
            filter: ['in', ['get', 'highway'], ['literal', ['service', 'footway', 'path', 'track', 'steps', 'pedestrian']]],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#403e30', 'line-width': ['interpolate', ['linear'], ['zoom'], 14, 0.6, 16, 3] }
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
        { name: "Main Campus Alpha", lng: 77.9720, lat: 30.4135, sub: "Sector-4, Tech Corridor", dist: "0.8km", live: false, badge: "EST 2024", rating: 4.9 },
        { name: "UPES Pondha Campus", lng: 77.9642, lat: 30.3905, sub: "City Campus, Pondha", dist: "5.2km", live: false, badge: null, rating: 4.7 },
        { name: "DIT University", lng: 77.9560, lat: 30.3860, sub: "Mussoorie Diversion Road", dist: "7.1km", live: false, badge: null, rating: 4.5 },
        { name: "Graphic Era University", lng: 77.9480, lat: 30.3820, sub: "Clement Town", dist: "12km", live: false, badge: null, rating: 4.3 },
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

const ZONES = [
    { name: "32 Bigha", color: "#1e4a28", accent: "#4ade80", desc: "Agricultural zone — upper ridge" },
    { name: "Maggie Point", color: "#142840", accent: "#53DDFC", desc: "Scenic overlook — east valley" },
    { name: "District 3", color: "#3d200a", accent: "#FF95A0", desc: "Residential sector — western slopes" },
    { name: "Aravali", color: "#2a1040", accent: "#CC97FF", desc: "Dense canopy — forest boundary" },
];

export default function Map() {
    const [cat, setCat] = useState("Colleges");
    const [activePin, setPin] = useState(null);
    const [activeZone, setActiveZone] = useState(null);
    const mapContainerRef = useRef(null);
    const mapInstance = useRef(null);

    const [coords, setCoords] = useState({ lng: '—', lat: '—', zoom: '—' });

    useEffect(() => {
        if (!mapContainerRef.current || !window.maplibregl) return;
        const map = new window.maplibregl.Map({
            container: mapContainerRef.current,
            style: MAP_STYLE,
            center: [0, 0],
            zoom: 2,
            /* disable default map controls — we provide our own */
            attributionControl: false,
        });
        map.on('load', () => {
            /* ── Fit to road network ── */
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
                        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60 });
                    }
                })
                .catch(() => { });

            /* ── Zone fills & outlines ── */
            map.addSource('zones', { type: 'geojson', data: '/zones.geojson' });

            /* Fill layer — use color from feature property */
            map.addLayer({
                id: 'zones-fill',
                type: 'fill',
                source: 'zones',
                paint: {
                    'fill-color': ['get', 'color'],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], 0.65,
                        0.45
                    ],
                },
            });

            /* Outline layer */
            map.addLayer({
                id: 'zones-outline',
                type: 'line',
                source: 'zones',
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': ['get', 'accent'],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], 3,
                        1.8
                    ],
                    'line-opacity': 0.85,
                },
            });

            /* Hover state */
            let hoveredZoneId = null;
            map.on('mousemove', 'zones-fill', e => {
                if (e.features.length > 0) {
                    if (hoveredZoneId !== null) {
                        map.setFeatureState({ source: 'zones', id: hoveredZoneId }, { hover: false });
                    }
                    hoveredZoneId = e.features[0].id;
                    map.setFeatureState({ source: 'zones', id: hoveredZoneId }, { hover: true });
                    map.getCanvas().style.cursor = 'pointer';
                }
            });
            map.on('mouseleave', 'zones-fill', () => {
                if (hoveredZoneId !== null) {
                    map.setFeatureState({ source: 'zones', id: hoveredZoneId }, { hover: false });
                }
                hoveredZoneId = null;
                map.getCanvas().style.cursor = '';
            });

            /* ── College markers ── */
            const collegeFeatures = LOCATIONS.Colleges
                .filter(c => c.lng && c.lat)
                .map(c => ({
                    type: 'Feature',
                    properties: { name: c.name },
                    geometry: { type: 'Point', coordinates: [c.lng, c.lat] }
                }));
            map.addSource('colleges', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: collegeFeatures }
            });
            /* Outer ring */
            map.addLayer({
                id: 'colleges-ring', type: 'circle', source: 'colleges',
                paint: {
                    'circle-radius': 11,
                    'circle-color': 'transparent',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#53DDFC',
                    'circle-stroke-opacity': 0.85,
                }
            });
            /* Inner dot */
            map.addLayer({
                id: 'colleges-dot', type: 'circle', source: 'colleges',
                paint: {
                    'circle-radius': 4.5,
                    'circle-color': '#53DDFC',
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#000',
                    'circle-stroke-opacity': 0.7,
                }
            });
        });
        const updateCoords = () => {
            const c = map.getCenter();
            setCoords({
                lng: c.lng.toFixed(4),
                lat: c.lat.toFixed(4),
                zoom: map.getZoom().toFixed(1),
            });
        };
        map.on('move', updateCoords);
        map.on('zoom', updateCoords);
        mapInstance.current = map;
        return () => { map.remove(); };
    }, []);

    const isZoneView = cat === 'Zones';
    const catMeta = CATS.find(c => c.id === cat) || CATS[0];
    const thumb = THUMB[cat] || THUMB['Colleges'];
    const locations = LOCATIONS[cat] || [];

    /* Fly to zone bounds when a zone card is clicked */
    function flyToZone(zoneName) {
        const next = zoneName === activeZone ? null : zoneName;
        setActiveZone(next);
        if (!next || !mapInstance.current) return;
        fetch('/zones.geojson')
            .then(r => r.json())
            .then(data => {
                const feat = data.features.find(f => f.properties.name === next);
                if (!feat) return;
                let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
                feat.geometry.coordinates[0].forEach(([lng, lat]) => {
                    if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
                    if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
                });
                mapInstance.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 80, duration: 700 });
            }).catch(() => { });
    }

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            height: "calc(100vh - var(--topnav-h))",
            overflow: "hidden", background: "#09090a",
        }}>

            {/* ── main row ── */}
            <div className="map-main-row" style={{ flex: 1, overflow: "hidden" }}>

                {/* ──────────────── Sidebar ──────────────── */}
                <div className="map-panel" style={{
                    width: 280, flexShrink: 0,
                    background: "#0c0c0d",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", flexDirection: "column", overflow: "hidden",
                }}>

                    {/* Sidebar header */}
                    <div style={{
                        padding: "16px 16px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        paddingBottom: 14,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#CC97FF" }}>radar</span>
                                <span style={{
                                    fontFamily: "var(--font-display)", fontWeight: 800,
                                    fontSize: 13, color: "#fff", letterSpacing: "0.06em",
                                }}>EXPLORE</span>
                            </div>
                            <span style={{
                                fontSize: 9, fontWeight: 700, color: "#53DDFC",
                                fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
                                background: "rgba(83,221,252,0.08)",
                                border: "1px solid rgba(83,221,252,0.2)",
                                borderRadius: 4, padding: "2px 7px",
                            }}>LIVE</span>
                        </div>
                        {/* Search */}
                        <div style={{ position: "relative" }}>
                            <span className="material-symbols-outlined" style={{
                                position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
                                fontSize: 14, color: "rgba(255,255,255,0.25)", pointerEvents: "none",
                            }}>search</span>
                            <input
                                className="neon-input"
                                placeholder="Search locations..."
                                style={{
                                    paddingLeft: 32, borderRadius: 8, fontSize: 12, height: 34,
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                }}
                            />
                        </div>
                    </div>

                    {/* Category tabs — 4 place tabs + 1 zone tab */}
                    <div style={{
                        display: "flex",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        flexShrink: 0, overflowX: "auto",
                    }}>
                        {[...CATS, { id: 'Zones', color: '#e3b341' }].map(c => (
                            <button key={c.id} onClick={() => setCat(c.id)} style={{
                                flex: 1, minWidth: 0,
                                padding: "10px 4px", cursor: "pointer",
                                fontFamily: "var(--font-display)", fontSize: 9, fontWeight: 800,
                                letterSpacing: "0.05em",
                                background: "transparent",
                                color: cat === c.id ? c.color : "rgba(255,255,255,0.28)",
                                border: "none",
                                borderBottom: cat === c.id ? `2px solid ${c.color}` : "2px solid transparent",
                                transition: "all 0.15s", whiteSpace: "nowrap",
                            }}>{c.id.toUpperCase()}</button>
                        ))}
                    </div>

                    {/* Count row */}
                    <div style={{ padding: "10px 16px 6px", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-mono)" }}>
                            {isZoneView
                                ? `${ZONES.length} ZONES MAPPED`
                                : `${locations.length} LOCATION${locations.length !== 1 ? 'S' : ''} FOUND`
                            }
                        </span>
                    </div>

                    {/* ── Zone cards (shown when Zones tab active) ── */}
                    {isZoneView && (
                        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                            {ZONES.map((zone) => (
                                <div key={zone.name} onClick={() => flyToZone(zone.name)} style={{
                                    borderRadius: 10, padding: "12px", cursor: "pointer",
                                    transition: "background 0.12s, border-color 0.12s",
                                    background: activeZone === zone.name ? `${zone.accent}10` : "rgba(255,255,255,0.02)",
                                    border: `1px solid ${activeZone === zone.name ? `${zone.accent}40` : "rgba(255,255,255,0.05)"}`,
                                    display: "flex", gap: 11, alignItems: "center",
                                }}>
                                    {/* Color swatch */}
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                                        background: zone.color,
                                        border: `2px solid ${zone.accent}50`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: zone.accent }}>terrain</span>
                                    </div>
                                    {/* Text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
                                            <span style={{
                                                fontFamily: "var(--font-display)", fontWeight: 700,
                                                fontSize: 12.5, color: "#fff",
                                            }}>{zone.name}</span>
                                            {activeZone === zone.name && (
                                                <span style={{
                                                    fontSize: 8, fontWeight: 800, color: zone.accent,
                                                    background: `${zone.accent}12`,
                                                    border: `1px solid ${zone.accent}30`,
                                                    borderRadius: 3, padding: "1px 5px",
                                                    letterSpacing: "0.06em", flexShrink: 0,
                                                }}>VIEWING</span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>{zone.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Location cards (shown for all non-zone tabs) ── */}
                    {!isZoneView && (
                        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                            {locations.map((loc, i) => (
                                <div key={i} onClick={() => {
                                    const next = loc.name === activePin ? null : loc.name;
                                    setPin(next);
                                    if (next && loc.lng && loc.lat && mapInstance.current) {
                                        mapInstance.current.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 700 });
                                    }
                                }} style={{
                                    borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                                    transition: "background 0.12s, border-color 0.12s",
                                    background: activePin === loc.name ? `${catMeta.color}0e` : "rgba(255,255,255,0.02)",
                                    border: `1px solid ${activePin === loc.name ? `${catMeta.color}35` : "rgba(255,255,255,0.05)"}`,
                                    display: "flex", gap: 10, alignItems: "center",
                                }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                                        background: thumb.grad,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        border: `1px solid ${thumb.accent}18`,
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: thumb.accent }}>{thumb.icon}</span>
                                    </div>
                                    {/* Text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
                                            <span style={{
                                                fontFamily: "var(--font-display)", fontWeight: 700,
                                                fontSize: 12, color: "#fff", lineHeight: 1.3,
                                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}>{loc.name}</span>
                                            {loc.live && (
                                                <span style={{
                                                    fontSize: 8, fontWeight: 800, color: "#53DDFC",
                                                    background: "rgba(83,221,252,0.1)",
                                                    border: "1px solid rgba(83,221,252,0.25)",
                                                    borderRadius: 3, padding: "1px 5px",
                                                    letterSpacing: "0.06em", flexShrink: 0,
                                                }}>LIVE</span>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>{loc.sub}</span>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                                <span style={{ fontSize: 10, color: "#e3b341", flexShrink: 0 }}>★ {loc.rating}</span>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700, color: catMeta.color,
                                                    fontFamily: "var(--font-mono)", flexShrink: 0,
                                                }}>{loc.dist}</span>
                                            </div>
                                        </div>
                                        {loc.badge && (
                                            <div style={{ marginTop: 4 }}>
                                                <span style={{
                                                    fontSize: 8.5, fontWeight: 700,
                                                    color: "rgba(255,255,255,0.32)",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                    borderRadius: 3, padding: "1px 6px",
                                                    letterSpacing: "0.05em",
                                                }}>{loc.badge}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Sidebar footer */}
                    <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        padding: "11px 16px",
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                        flexShrink: 0, gap: 0,
                    }}>
                        {[{ label: "NODES", val: "42", color: "#53DDFC" },
                        { label: "STATUS", val: "Online", color: "#4ade80" },
                        { label: "ZONES", val: `${ZONES.length}`, color: "#e3b341" }].map(s => (
                            <div key={s.label}>
                                <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em", fontFamily: "var(--font-display)", marginBottom: 2 }}>{s.label}</div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: s.color, fontFamily: "var(--font-display)" }}>{s.val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ──────────────── Map area ──────────────── */}
                <div className="map-area" style={{ flex: 1, position: "relative", background: "#09090a", overflow: "hidden" }}>

                    {/* MapLibre GL container */}
                    <div ref={mapContainerRef} style={{ position: "absolute", inset: 0 }} />

                    {/* ── GTA-style crosshair overlay ── */}
                    <div style={{
                        position: "absolute", inset: 0,
                        pointerEvents: "none", zIndex: 10,
                    }}>
                        {/* Horizontal arm — left */}
                        <div style={{
                            position: "absolute",
                            top: "50%", left: 0,
                            width: "calc(50% - 10px)",
                            height: 1,
                            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.12))",
                            transform: "translateY(-0.5px)",
                        }} />
                        {/* Horizontal arm — right */}
                        <div style={{
                            position: "absolute",
                            top: "50%", right: 0,
                            width: "calc(50% - 10px)",
                            height: 1,
                            background: "linear-gradient(to left, transparent, rgba(255,255,255,0.12))",
                            transform: "translateY(-0.5px)",
                        }} />
                        {/* Vertical arm — top */}
                        <div style={{
                            position: "absolute",
                            left: "50%", top: 0,
                            height: "calc(50% - 10px)",
                            width: 1,
                            background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.12))",
                            transform: "translateX(-0.5px)",
                        }} />
                        {/* Vertical arm — bottom */}
                        <div style={{
                            position: "absolute",
                            left: "50%", bottom: 0,
                            height: "calc(50% - 10px)",
                            width: 1,
                            background: "linear-gradient(to top, transparent, rgba(255,255,255,0.12))",
                            transform: "translateX(-0.5px)",
                        }} />
                        {/* Center dot */}
                        <div style={{
                            position: "absolute",
                            top: "50%", left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 6, height: 6, borderRadius: "50%",
                            background: "rgba(255,255,255,0.85)",
                            boxShadow: "0 0 0 2px rgba(0,0,0,0.6), 0 0 8px rgba(255,255,255,0.35)",
                        }} />
                    </div>

                    {/* Zoom controls — bottom right */}
                    <div style={{
                        position: "absolute", right: 14, bottom: 14,
                        display: "flex", flexDirection: "column", zIndex: 20,
                        gap: 2,
                    }}>
                        {[["add", () => mapInstance.current && mapInstance.current.zoomIn()],
                        ["remove", () => mapInstance.current && mapInstance.current.zoomOut()]].map(([icon, handler]) => (
                            <button key={icon} onClick={handler} style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: "rgba(12,12,13,0.92)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "rgba(255,255,255,0.6)",
                                transition: "background 0.12s, color 0.12s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(30,30,32,0.95)"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(12,12,13,0.92)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                            </button>
                        ))}
                    </div>

                    {/* Re-center / my_location — bottom right above zoom */}
                    <button
                        onClick={() => {
                            if (!mapInstance.current) return;
                            fetch('/map.geojson').then(r => r.json()).then(data => {
                                let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
                                function pc(c) { if (c[0] < minLng) minLng = c[0]; if (c[0] > maxLng) maxLng = c[0]; if (c[1] < minLat) minLat = c[1]; if (c[1] > maxLat) maxLat = c[1]; }
                                function pg(g) { if (!g) return; if (g.type === 'LineString') g.coordinates.forEach(pc); else if (g.type === 'Polygon') g.coordinates[0].forEach(pc); else if (g.type === 'MultiLineString') g.coordinates.forEach(r => r.forEach(pc)); else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => p[0].forEach(pc)); }
                                data.features.forEach(f => pg(f.geometry));
                                if (minLng !== Infinity) mapInstance.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, duration: 800 });
                            }).catch(() => { });
                        }}
                        style={{
                            position: "absolute", right: 14, bottom: 90, zIndex: 20,
                            width: 34, height: 34, borderRadius: 8,
                            background: "rgba(12,12,13,0.92)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "rgba(255,255,255,0.6)",
                            transition: "background 0.12s, color 0.12s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(30,30,32,0.95)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(12,12,13,0.92)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>center_focus_strong</span>
                    </button>

                </div>
            </div>

            {/* ──── Bottom status bar ──── */}
            <div style={{
                flexShrink: 0,
                background: "#0c0c0d",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "7px 18px",
                display: "flex", alignItems: "center", gap: 0,
            }}>
                {/* Coords */}
                <div style={{ display: "flex", gap: 20, flex: 1 }}>
                    {[{ label: "LNG", val: coords.lng }, { label: "LAT", val: coords.lat }, { label: "ZOOM", val: coords.zoom }].map(c => (
                        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>{c.label}</span>
                            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-mono)" }}>{c.val}</span>
                        </div>
                    ))}
                </div>
                {/* Branding */}
                <span style={{
                    fontSize: 9, color: "rgba(255,255,255,0.15)",
                    fontFamily: "var(--font-display)", letterSpacing: "0.08em",
                }}>TEC KINETIC OS · EXPLORE v2</span>
            </div>

        </div>
    );
}
