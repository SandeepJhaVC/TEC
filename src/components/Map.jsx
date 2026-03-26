import React, { useState, useEffect, useRef } from "react";
import { supabase } from '../supabaseClient';

const ANIM_CSS = `
@keyframes tecScanLine {
  0%   { top: -4px; opacity: 1; }
  88%  { top: calc(100% - 4px); opacity: 0.7; }
  100% { top: 100%; opacity: 0; }
}
@keyframes tecBracketIn {
  from { opacity: 0; transform: scale(0.78) translate(var(--bx,0), var(--by,0)); }
  to   { opacity: 1; transform: scale(1) translate(0,0); }
}
@keyframes tecLogoIn {
  0%   { opacity: 0; letter-spacing: 0.6em; filter: blur(8px); }
  60%  { opacity: 1; filter: blur(0); }
  100% { opacity: 1; letter-spacing: -0.04em; filter: blur(0); }
}
@keyframes tecSubIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tecFromLeft {
  from { opacity: 0; transform: translateX(-22px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes tecFromRight {
  from { opacity: 0; transform: translateX(22px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes tecFromTop {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tecFromBottom {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tecPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.2); }
}
@keyframes tecLockPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(255,110,132,0.12), 0 4px 16px rgba(0,0,0,0.5); }
  50%       { box-shadow: 0 0 22px rgba(255,110,132,0.35), 0 4px 16px rgba(0,0,0,0.5); }
}
@keyframes tecSoonPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(227,179,65,0.12), 0 4px 16px rgba(0,0,0,0.5); }
  50%       { box-shadow: 0 0 22px rgba(227,179,65,0.32), 0 4px 16px rgba(0,0,0,0.5); }
}
@keyframes tecVignetteIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.tec-cat-pill { transition: all 0.15s ease; pointer-events: auto; }
.tec-cat-pill:hover { transform: translateY(-1px); }
.tec-explore-hud { left: 14px; }
.tec-cat-pills { left: 268px; right: 320px; justify-content: center; pointer-events: none; }
@media (max-width: 900px) { .tec-cat-pills { left: 14px; right: 14px; } }
@keyframes tecUserBlipPulse {
  0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.75; }
  70%  { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
  100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
}
.tec-user-blip-ring {
  position: absolute; top: 50%; left: 50%;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(83,221,252,0.18);
  border: 1.5px solid rgba(83,221,252,0.5);
  transform: translate(-50%,-50%);
  animation: tecUserBlipPulse 2s ease-out infinite;
  pointer-events: none;
}
.tec-user-blip-dot {
  position: absolute; top: 50%; left: 50%;
  width: 10px; height: 10px; border-radius: 50%;
  background: #53DDFC;
  border: 2px solid rgba(255,255,255,0.9);
  box-shadow: 0 0 10px rgba(83,221,252,0.9), 0 0 24px rgba(83,221,252,0.5);
  transform: translate(-50%,-50%);
  pointer-events: none;
}
/* ─── Mobile sheet handle ─── */
.tec-sheet-handle { display: none; }
/* ─── Mobile layout (<768px) ─── */
@media (max-width: 767px) {
  .tec-explore-hud { display: none !important; }
  .tec-cat-pills {
    left: 0 !important; right: 0 !important; top: 8px !important;
    overflow-x: auto; flex-wrap: nowrap !important;
    padding: 0 10px; scrollbar-width: none;
    justify-content: flex-start !important;
  }
  .tec-cat-pills::-webkit-scrollbar { display: none; }
  .tec-location-panel {
    position: fixed !important;
    top: auto !important; right: 0 !important; left: 0 !important; bottom: 0 !important;
    width: 100% !important; max-height: 72vh !important;
    border-radius: 16px 16px 0 0 !important;
    animation: tecFromBottom 0.4s cubic-bezier(0.16,1,0.3,1) both !important;
  }
  .tec-sheet-handle {
    display: block;
    width: 36px; height: 4px;
    border-radius: 2px;
    background: rgba(255,255,255,0.18);
    margin: 10px auto 4px;
    flex-shrink: 0;
  }
  .tec-status-bar { display: none !important; }
  .tec-locked-chip { display: none !important; }
  .tec-zoom-controls {
    right: 10px !important;
    bottom: auto !important;
    top: 58px !important;
  }
  .tec-recenter-btn { display: none !important; }
  .tec-locate-btn {
    right: 10px !important;
    bottom: auto !important;
    top: 106px !important;
  }
}
`;

const GLASS = {
    background: 'rgba(9,9,10,0.84)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.09)',
};

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

/*
 * Supabase tables required:
 *
 * map_locations  — id uuid pk, category text, name text, lng float8, lat float8,
 *                  subtitle text, distance text, is_live bool default false,
 *                  badge text, rating numeric(2,1), sort_order int default 0
 *
 * map_zones      — id uuid pk, name text, color text, accent text,
 *                  description text, sort_order int default 0
 *
 * map_locked_zones — id text pk, label text, status text ('locked'|'soon'),
 *                    reason text, chip_top text, chip_left text
 */

/* ── Locked / coming-soon areas overlaid on the map ── */
const CAMPUS_CENTER = [77.9620, 30.4020];

/* Ray-cast point-in-polygon — returns true if [lng, lat] is inside the ring */
function pointInPolygon([x, y], ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i], [xj, yj] = ring[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

export default function Map() {
    const [cat, setCat] = useState("Colleges");
    const [activePin, setPin] = useState(null);
    const [activeZone, setActiveZone] = useState(null);
    const mapContainerRef = useRef(null);
    const mapInstance = useRef(null);
    const zonesDataRef = useRef(null);

    const [mapCenter, setMapCenter] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const userMarkerRef = useRef(null);
    const [coords, setCoords] = useState({ lng: '—', lat: '—', zoom: '—' });
    const [currentDistrict, setCurrentDistrict] = useState(null);

    /* ─ Supabase data ─ */
    const [locationsData, setLocationsData] = useState({});
    const [zonesConfig, setZonesConfig] = useState([]);
    const [lockedZones, setLockedZones] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [mapStyleLoaded, setMapStyleLoaded] = useState(false);

    /* Boot animation phases */
    const [phase, setPhase] = useState(0);
    const [listOpen, setListOpen] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(1), 750),
            setTimeout(() => setPhase(2), 1550),
            setTimeout(() => setPhase(3), 2500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    /* ── Fetch all map data from Supabase ── */
    useEffect(() => {
        async function fetchMapData() {
            setDataLoading(true);
            const [locsResult, zonesResult, lockedResult] = await Promise.all([
                supabase.from('map_locations').select('*').order('sort_order'),
                supabase.from('map_zones').select('*').order('sort_order'),
                supabase.from('map_locked_zones').select('*'),
            ]);
            if (!locsResult.error && locsResult.data) {
                const grouped = {};
                for (const loc of locsResult.data) {
                    if (!grouped[loc.category]) grouped[loc.category] = [];
                    grouped[loc.category].push({
                        name: loc.name, lng: loc.lng, lat: loc.lat,
                        sub: loc.subtitle, dist: loc.distance,
                        live: loc.is_live, badge: loc.badge, rating: loc.rating,
                    });
                }
                setLocationsData(grouped);
            }
            if (!zonesResult.error && zonesResult.data) {
                setZonesConfig(zonesResult.data.map(z => ({
                    name: z.name, color: z.color, accent: z.accent, desc: z.description,
                })));
            }
            if (!lockedResult.error && lockedResult.data) {
                setLockedZones(lockedResult.data.map(z => ({
                    id: z.id, label: z.label, status: z.status, reason: z.reason,
                    chipStyle: { top: z.chip_top, left: z.chip_left },
                })));
            }
            setDataLoading(false);
        }
        fetchMapData();
    }, []);
    useEffect(() => {
        if (!navigator.geolocation) { setMapCenter(CAMPUS_CENTER); return; }
        const fallback = setTimeout(() => setMapCenter(CAMPUS_CENTER), 4000);
        navigator.geolocation.getCurrentPosition(
            pos => { clearTimeout(fallback); setMapCenter([pos.coords.longitude, pos.coords.latitude]); },
            () => { clearTimeout(fallback); setMapCenter(CAMPUS_CENTER); },
            { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
        );
        return () => clearTimeout(fallback);
    }, []);

    /* ── Geolocation watcher — device coordinates + user blip ── */
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            pos => {
                const { longitude: lng, latitude: lat, accuracy } = pos.coords;
                setUserLocation({ lng, lat, accuracy });
                if (!mapInstance.current || !window.maplibregl) return;
                if (!userMarkerRef.current) {
                    const el = document.createElement('div');
                    el.style.cssText = 'position:relative;width:32px;height:32px;';
                    el.innerHTML = '<div class="tec-user-blip-ring"></div><div class="tec-user-blip-dot"></div>';
                    userMarkerRef.current = new window.maplibregl.Marker({ element: el, anchor: 'center' })
                        .setLngLat([lng, lat])
                        .addTo(mapInstance.current);
                } else {
                    userMarkerRef.current.setLngLat([lng, lat]);
                }
            },
            () => { /* location denied or unavailable */ },
            { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
        );
        return () => {
            navigator.geolocation.clearWatch(watchId);
            userMarkerRef.current?.remove();
            userMarkerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapCenter || !mapContainerRef.current || !window.maplibregl) return;
        const map = new window.maplibregl.Map({
            container: mapContainerRef.current,
            style: MAP_STYLE,
            center: mapCenter,
            zoom: 11.5,
            minZoom: 11.0,
            maxZoom: 18,
            maxBounds: [[77.60, 30.20], [78.25, 30.58]],
            attributionControl: false,
        });
        map.on('load', () => {
            /* ── Cinematic fly-in: zoom from 11.5 → 14 ── */
            setTimeout(() => {
                map.flyTo({
                    center: mapCenter,
                    zoom: 14,
                    duration: 3200,
                    easing: t => t * t * t,
                });
            }, 500);

            /* ── Zone fills & outlines ── */
            map.addSource('zones', { type: 'geojson', data: '/zones.geojson' });
            fetch('/zones.geojson').then(r => r.json()).then(d => { zonesDataRef.current = d.features; }).catch(() => { });

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

            /* ── College markers — source seeded empty; filled by locationsData effect ── */
            map.addSource('colleges', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
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
            setMapStyleLoaded(true);
        });
        const updateCoords = () => {
            const c = map.getCenter();
            setCoords({
                lng: c.lng.toFixed(4),
                lat: c.lat.toFixed(4),
                zoom: map.getZoom().toFixed(1),
            });
            /* District detection — ray-cast map center against loaded zones */
            if (zonesDataRef.current) {
                const pt = [c.lng, c.lat];
                const match = zonesDataRef.current.find(
                    f => f.geometry.type === 'Polygon' && pointInPolygon(pt, f.geometry.coordinates[0])
                );
                setCurrentDistrict(match ? match.properties.name : null);
            }
        };
        map.on('move', updateCoords);
        map.on('zoom', updateCoords);
        mapInstance.current = map;
        return () => { map.remove(); };
    }, [mapCenter]);

    /* ── Update college map markers whenever Supabase data arrives ── */
    useEffect(() => {
        if (!mapStyleLoaded || !mapInstance.current) return;
        const src = mapInstance.current.getSource('colleges');
        if (!src) return;
        const colleges = (locationsData.Colleges || []).filter(c => c.lng && c.lat);
        src.setData({
            type: 'FeatureCollection',
            features: colleges.map(c => ({
                type: 'Feature',
                properties: { name: c.name },
                geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
            })),
        });
    }, [mapStyleLoaded, locationsData]);

    const isZoneView = cat === 'Zones';
    const catMeta = CATS.find(c => c.id === cat) || CATS[0];
    const thumb = THUMB[cat] || THUMB['Colleges'];
    const allLocations = locationsData[cat] || [];
    const locations = search ? allLocations.filter(l => l.name.toLowerCase().includes(search.toLowerCase())) : allLocations;
    const CAT_WITH_ZONES = [...CATS, { id: 'Zones', color: '#e3b341' }];

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

    function recenterMap() {
        if (!mapInstance.current) return;
        fetch('/map.geojson').then(r => r.json()).then(data => {
            let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
            function pc(c) { if (c[0] < minLng) minLng = c[0]; if (c[0] > maxLng) maxLng = c[0]; if (c[1] < minLat) minLat = c[1]; if (c[1] > maxLat) maxLat = c[1]; }
            function pg(g) { if (!g) return; if (g.type === 'LineString') g.coordinates.forEach(pc); else if (g.type === 'Polygon') g.coordinates[0].forEach(pc); else if (g.type === 'MultiLineString') g.coordinates.forEach(r => r.forEach(pc)); else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => p[0].forEach(pc)); }
            data.features.forEach(f => pg(f.geometry));
            if (minLng !== Infinity) mapInstance.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, duration: 800 });
        }).catch(() => { });
    }

    const hud = (dir, delay = 0) => ({
        animation: `tec${dir} 0.5s cubic-bezier(0.16,1,0.3,1) both`,
        animationDelay: `${delay}s`,
    });

    const districtZone = currentDistrict ? zonesConfig.find(z => z.name === currentDistrict) : null;

    return (
        <div style={{ position: 'fixed', top: 68, left: 0, right: 0, bottom: 0, zIndex: 1, background: '#09090a', overflow: 'hidden' }}>
            <style>{ANIM_CSS}</style>

            {/* ══════════════════ MAP CANVAS ══════════════════ */}
            <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />

            {/* Edge vignette */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
                background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
                animation: 'tecVignetteIn 1.5s ease-out 2s both',
            }} />

            {/* ══════════════════ BOOT OVERLAY ══════════════════ */}
            {phase < 3 && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 80,
                    background: '#09090a',
                    opacity: phase === 2 ? 0 : 1,
                    transition: phase === 2 ? 'opacity 1.1s cubic-bezier(0.4,0,0.2,1)' : 'none',
                    pointerEvents: phase >= 2 ? 'none' : 'auto',
                    overflow: 'hidden',
                }}>
                    {/* CRT scanlines */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.2) 0px,rgba(0,0,0,0.2) 1px,transparent 1px,transparent 4px)',
                    }} />

                    {/* Corner brackets */}
                    {[
                        { top: 24, left: 24, '--bx': '-8px', '--by': '-8px' },
                        { top: 24, right: 24, '--bx': '8px', '--by': '-8px' },
                        { bottom: 24, left: 24, '--bx': '-8px', '--by': '8px' },
                        { bottom: 24, right: 24, '--bx': '8px', '--by': '8px' },
                    ].map((pos, i) => {
                        const isRight = 'right' in pos;
                        const isBottom = 'bottom' in pos;
                        return (
                            <div key={i} style={{
                                position: 'absolute', width: 40, height: 40, ...pos,
                                animation: `tecBracketIn 0.55s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.06}s both`,
                                '--bx': pos['--bx'], '--by': pos['--by'],
                            }}>
                                <div style={{ position: 'absolute', [isBottom ? 'bottom' : 'top']: 0, [isRight ? 'right' : 'left']: 0, width: 24, height: 2.5, background: 'rgba(204,151,255,0.95)' }} />
                                <div style={{ position: 'absolute', [isBottom ? 'bottom' : 'top']: 0, [isRight ? 'right' : 'left']: 0, width: 2.5, height: 24, background: 'rgba(204,151,255,0.95)' }} />
                            </div>
                        );
                    })}

                    {/* Scan line */}
                    {phase >= 1 && (
                        <div style={{
                            position: 'absolute', left: 0, right: 0, height: 3,
                            background: 'linear-gradient(to right, transparent, rgba(83,221,252,0.4), rgba(83,221,252,1), rgba(83,221,252,0.4), transparent)',
                            boxShadow: '0 0 18px rgba(83,221,252,0.8), 0 0 40px rgba(83,221,252,0.3)',
                            animation: 'tecScanLine 1.1s cubic-bezier(0.4,0,1,1) forwards',
                            pointerEvents: 'none', zIndex: 6,
                        }} />
                    )}

                    {/* Center branding */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 72,
                            color: '#CC97FF', fontStyle: 'italic', letterSpacing: '-0.04em',
                            textShadow: '0 0 40px rgba(204,151,255,0.7), 0 0 90px rgba(204,151,255,0.3)',
                            animation: 'tecLogoIn 0.8s cubic-bezier(0.16,1,0.3,1) both',
                            lineHeight: 1,
                        }}>TEC</div>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 10,
                            color: 'rgba(255,255,255,0.38)', letterSpacing: '0.38em', textTransform: 'uppercase',
                            marginTop: 10,
                            animation: 'tecSubIn 0.6s ease-out 0.35s both',
                        }}>Kinetic OS &nbsp;·&nbsp; Explore v2</div>
                        <div style={{
                            marginTop: 36, width: 220, height: 2,
                            background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden',
                            animation: 'tecSubIn 0.5s ease-out 0.45s both',
                        }}>
                            <div style={{
                                height: '100%', borderRadius: 2,
                                width: phase >= 1 ? '100%' : '18%',
                                background: 'linear-gradient(90deg, #9c48ea, #53DDFC)',
                                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
                                boxShadow: '0 0 8px rgba(83,221,252,0.5)',
                            }} />
                        </div>
                        <div style={{
                            marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                            animation: 'tecSubIn 0.5s ease-out 0.55s both',
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#53DDFC', animation: 'tecPulse 0.9s ease-in-out infinite' }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em' }}>
                                {phase === 0 ? 'INITIALIZING MAP GRID...' : 'ESTABLISHING SECTOR LINK...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════ CROSSHAIR ══════════════════ */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
                opacity: phase >= 3 ? 1 : 0, transition: 'opacity 0.7s ease 0.5s',
            }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, width: 'calc(50% - 10px)', height: 1, background: 'linear-gradient(to right,transparent,rgba(255,255,255,0.11))', transform: 'translateY(-0.5px)' }} />
                <div style={{ position: 'absolute', top: '50%', right: 0, width: 'calc(50% - 10px)', height: 1, background: 'linear-gradient(to left,transparent,rgba(255,255,255,0.11))', transform: 'translateY(-0.5px)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, height: 'calc(50% - 10px)', width: 1, background: 'linear-gradient(to bottom,transparent,rgba(255,255,255,0.11))', transform: 'translateX(-0.5px)' }} />
                <div style={{ position: 'absolute', left: '50%', bottom: 0, height: 'calc(50% - 10px)', width: 1, background: 'linear-gradient(to top,transparent,rgba(255,255,255,0.11))', transform: 'translateX(-0.5px)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', boxShadow: '0 0 0 2px rgba(0,0,0,0.6),0 0 8px rgba(255,255,255,0.35)' }} />
                {districtZone && (
                    <div style={{
                        position: 'absolute', top: 'calc(50% + 14px)', left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(9,9,10,0.88)', border: `1px solid ${districtZone.accent}40`,
                        borderRadius: 4, padding: '2px 9px', fontSize: 9, fontWeight: 700,
                        color: districtZone.accent, fontFamily: 'var(--font-display)',
                        letterSpacing: '0.08em', whiteSpace: 'nowrap', boxShadow: `0 0 10px ${districtZone.accent}18`,
                    }}>{districtZone.name.toUpperCase()}</div>
                )}
            </div>

            {/* ══════════════════ LOCKED ZONE LABELS ══════════════════ */}
            {phase >= 3 && lockedZones.map(z => {
                const isLocked = z.status === 'locked';
                const accent = isLocked ? '#FF6E84' : '#e3b341';
                return (
                    <div key={z.id} className="tec-locked-chip" style={{
                        position: 'absolute', zIndex: 15,
                        ...z.chipStyle,
                        transform: 'translateX(-50%)',
                        animation: 'tecSubIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.7s both',
                        pointerEvents: 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    }}>
                        {/* District-style name label */}
                        <div style={{
                            background: 'rgba(9,9,10,0.88)',
                            border: `1px solid ${accent}40`,
                            borderRadius: 4,
                            padding: '2px 9px',
                            fontSize: 9, fontWeight: 700,
                            color: accent,
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '0.08em',
                            whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: 4,
                            animation: `${isLocked ? 'tecLockPulse' : 'tecSoonPulse'} 2.4s ease-in-out infinite`,
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 8, color: accent, fontVariationSettings: "'FILL' 1" }}>
                                {isLocked ? 'lock' : 'schedule'}
                            </span>
                            {z.label}
                        </div>
                        {/* Status sub-label */}
                        <div style={{
                            fontSize: 7.5, fontWeight: 700,
                            color: `${accent}99`,
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.1em',
                        }}>{z.reason.toUpperCase()}</div>
                    </div>
                );
            })}

            {/* ══════════════════ HUD CARDS ══════════════════ */}

            {/* ── EXPLORE info card (top-left) ── */}
            {phase >= 3 && (
                <div className="tec-explore-hud" style={{ position: 'absolute', top: 16, zIndex: 20, ...hud('FromLeft', 0.05) }}>
                    <div style={{ ...GLASS, borderRadius: 12, padding: '14px 18px', minWidth: 208 }} className="hud-bracket">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#CC97FF' }}>radar</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: '0.09em' }}>EXPLORE</span>
                            </div>
                            <span style={{ fontSize: 8.5, fontWeight: 800, color: '#53DDFC', letterSpacing: '0.08em', background: 'rgba(83,221,252,0.1)', border: '1px solid rgba(83,221,252,0.25)', borderRadius: 4, padding: '3px 8px', fontFamily: 'var(--font-display)' }}>LIVE</span>
                        </div>
                        {userLocation && (
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 8, color: '#53DDFC', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#53DDFC', boxShadow: '0 0 6px #53DDFC', animation: 'tecPulse 1.4s ease-in-out infinite' }} />
                                    MY POSITION
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {[
                                        { label: 'LNG', val: userLocation.lng.toFixed(5) },
                                        { label: 'LAT', val: userLocation.lat.toFixed(5) },
                                        { label: 'ACC', val: `${Math.round(userLocation.accuracy)}m` },
                                    ].map(c => (
                                        <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                            <span style={{ fontSize: 9, color: 'rgba(83,221,252,0.45)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>{c.label}</span>
                                            <span style={{ fontSize: 11, color: '#53DDFC', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '9px 0 0' }} />
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[{ label: 'LNG', val: coords.lng }, { label: 'LAT', val: coords.lat }, { label: 'ZOOM', val: coords.zoom }].map(c => (
                                <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>{c.label}</span>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.val}</span>
                                </div>
                            ))}
                        </div>
                        {districtZone && (
                            <div style={{ marginTop: 12, padding: '8px 11px', borderRadius: 8, background: `${districtZone.accent}0d`, border: `1px solid ${districtZone.accent}30` }}>
                                <div style={{ fontSize: 8, color: districtZone.accent, letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 3 }}>DISTRICT</div>
                                <span style={{ fontSize: 13, color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{districtZone.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Category filter pills (top-center) ── */}
            {phase >= 3 && (
                <div className="tec-cat-pills" style={{
                    position: 'absolute', top: 16, zIndex: 20,
                    display: 'flex', gap: 6, alignItems: 'center',
                    ...hud('FromTop', 0.15),
                }}>
                    {CAT_WITH_ZONES.map(c => (
                        <button key={c.id} className="tec-cat-pill" onClick={() => setCat(c.id)} style={{
                            padding: '9px 18px', borderRadius: 24,
                            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '0.07em',
                            cursor: 'pointer',
                            background: cat === c.id ? `${c.color}22` : 'rgba(9,9,10,0.82)',
                            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                            border: cat === c.id ? `1.5px solid ${c.color}66` : '1px solid rgba(255,255,255,0.12)',
                            color: cat === c.id ? c.color : 'rgba(255,255,255,0.5)',
                            boxShadow: cat === c.id ? `0 0 20px ${c.color}30, 0 4px 16px rgba(0,0,0,0.5)` : '0 4px 14px rgba(0,0,0,0.35)',
                        }}>{c.id.toUpperCase()}</button>
                    ))}
                </div>
            )}

            {/* ── Location list card (right side) ── */}
            {phase >= 3 && (
                <div className="tec-location-panel" style={{
                    position: 'absolute', top: 16, right: 16, zIndex: 20,
                    width: 296, maxHeight: 'calc(100% - 80px)',
                    display: 'flex', flexDirection: 'column',
                    ...hud('FromRight', 0.25),
                }}>
                    {/* Mobile drag handle */}
                    <div className="tec-sheet-handle" />
                    {/* Header */}
                    <div
                        style={{
                            ...GLASS,
                            borderRadius: listOpen ? '12px 12px 0 0' : 12,
                            padding: '12px 14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            cursor: 'pointer',
                            borderBottom: listOpen ? '1px solid rgba(255,255,255,0.06)' : undefined,
                        }}
                        onClick={() => setListOpen(o => !o)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: isZoneView ? '#e3b341' : catMeta.color }}>
                                {isZoneView ? 'terrain' : thumb.icon}
                            </span>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: '0.06em' }}>
                                {isZoneView ? 'ZONES' : cat.toUpperCase()}
                            </span>
                            <span style={{
                                fontSize: 9, fontWeight: 700,
                                color: isZoneView ? '#e3b341' : catMeta.color,
                                background: isZoneView ? 'rgba(227,179,65,0.1)' : `${catMeta.color}12`,
                                border: `1px solid ${isZoneView ? 'rgba(227,179,65,0.25)' : `${catMeta.color}30`}`,
                                borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--font-mono)',
                            }}>{isZoneView ? zonesConfig.length : locations.length}</span>
                        </div>
                        <span className="material-symbols-outlined" style={{
                            fontSize: 18, color: 'rgba(255,255,255,0.4)',
                            transition: 'transform 0.22s ease',
                            transform: listOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        }}>expand_more</span>
                    </div>

                    {/* Search */}
                    {listOpen && !isZoneView && (
                        <div style={{ ...GLASS, borderRadius: 0, padding: '5px 9px', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 19, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}>search</span>
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search locations..."
                                style={{
                                    width: '100%', paddingLeft: 28, background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7,
                                    fontSize: 11, color: '#fff', height: 30, outline: 'none',
                                    fontFamily: 'var(--font-body)',
                                }}
                            />
                        </div>
                    )}

                    {/* List body */}
                    {listOpen && (
                        <div style={{
                            ...GLASS, borderRadius: '0 0 10px 10px',
                            borderTop: 'none', overflowY: 'auto',
                            padding: '5px 7px 7px', display: 'flex', flexDirection: 'column', gap: 3,
                        }}>
                            {dataLoading ? (
                                [0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        borderRadius: 10, padding: '10px 11px', display: 'flex', gap: 10, alignItems: 'center',
                                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.05)', flexShrink: 0,
                                            animation: 'tecPulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s`
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ height: 11, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 7 }} />
                                            <div style={{ height: 9, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.04)' }} />
                                        </div>
                                    </div>
                                ))
                            ) : isZoneView ? zonesConfig.map(zone => (
                                <div key={zone.name} onClick={() => flyToZone(zone.name)} style={{
                                    borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                                    transition: 'background 0.12s,border-color 0.12s',
                                    background: activeZone === zone.name ? `${zone.accent}10` : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${activeZone === zone.name ? `${zone.accent}40` : 'rgba(255,255,255,0.04)'}`,
                                    display: 'flex', gap: 10, alignItems: 'center',
                                }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: zone.color, border: `2px solid ${zone.accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: zone.accent }}>terrain</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 3 }}>
                                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{zone.name}</span>
                                            {activeZone === zone.name && <span style={{ fontSize: 8, fontWeight: 800, color: zone.accent, background: `${zone.accent}12`, border: `1px solid ${zone.accent}30`, borderRadius: 3, padding: '1px 5px', letterSpacing: '0.06em', flexShrink: 0 }}>VIEWING</span>}
                                        </div>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{zone.desc}</span>
                                    </div>
                                </div>
                            )) : locations.map((loc, i) => (
                                <div key={i} onClick={() => {
                                    const next = loc.name === activePin ? null : loc.name;
                                    setPin(next);
                                    if (next && loc.lng && loc.lat && mapInstance.current)
                                        mapInstance.current.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 700 });
                                }} style={{
                                    borderRadius: 10, padding: '9px 11px', cursor: 'pointer',
                                    transition: 'background 0.12s,border-color 0.12s',
                                    background: activePin === loc.name ? `${catMeta.color}0e` : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${activePin === loc.name ? `${catMeta.color}35` : 'rgba(255,255,255,0.04)'}`,
                                    display: 'flex', gap: 10, alignItems: 'center',
                                }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: thumb.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${thumb.accent}18` }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: thumb.accent }}>{thumb.icon}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 3 }}>
                                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.name}</span>
                                            {loc.live && <span style={{ fontSize: 8, fontWeight: 800, color: '#53DDFC', background: 'rgba(83,221,252,0.1)', border: '1px solid rgba(83,221,252,0.25)', borderRadius: 3, padding: '1px 4px', letterSpacing: '0.06em', flexShrink: 0 }}>LIVE</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{loc.sub}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                                <span style={{ fontSize: 10, color: '#e3b341' }}>★ {loc.rating}</span>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: catMeta.color, fontFamily: 'var(--font-mono)' }}>{loc.dist}</span>
                                            </div>
                                        </div>
                                        {loc.badge && <div style={{ marginTop: 4 }}><span style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '1px 5px' }}>{loc.badge}</span></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Status bar (bottom) ── */}
            {phase >= 3 && (
                <div className="tec-status-bar" style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
                    ...hud('FromBottom', 0.35),
                    ...GLASS,
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
                    padding: '9px 22px', display: 'flex', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', gap: 24, flex: 1 }}>
                        {[{ label: 'LNG', val: coords.lng }, { label: 'LAT', val: coords.lat }, { label: 'ZOOM', val: coords.zoom }].map(c => (
                            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)', letterSpacing: '0.09em' }}>{c.label}</span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.val}</span>
                            </div>
                        ))}
                    </div>
                    <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>TEC KINETIC OS · EXPLORE v2</span>
                </div>
            )}

            {/* ── Zoom controls ── */}
            <div className="tec-zoom-controls" style={{ position: 'absolute', right: 16, bottom: 52, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[['add', () => mapInstance.current?.zoomIn()], ['remove', () => mapInstance.current?.zoomOut()]].map(([icon, handler]) => (
                    <button key={icon} onClick={handler} style={{
                        width: 38, height: 38, borderRadius: 10, ...GLASS,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.12s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,30,32,0.96)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(9,9,10,0.84)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                    </button>
                ))}
            </div>

            {/* ── Re-center ── */}
            <button className="tec-recenter-btn" onClick={recenterMap} style={{
                position: 'absolute', right: 16, bottom: 136, zIndex: 20,
                width: 38, height: 38, borderRadius: 10, ...GLASS,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.12s',
            }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,30,32,0.96)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(9,9,10,0.84)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>center_focus_strong</span>
            </button>

            {/* ── Locate me ── */}
            <button className="tec-locate-btn" onClick={() => {
                if (userLocation) {
                    mapInstance.current?.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 16, duration: 900 });
                }
            }} style={{
                position: 'absolute', right: 16, bottom: 184, zIndex: 20,
                width: 38, height: 38, borderRadius: 10, ...GLASS,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: userLocation ? 'pointer' : 'default',
                color: userLocation ? '#53DDFC' : 'rgba(255,255,255,0.22)',
                transition: 'all 0.12s',
            }}
                onMouseEnter={e => { if (userLocation) { e.currentTarget.style.background = 'rgba(30,30,32,0.96)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(9,9,10,0.84)'; }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>my_location</span>
            </button>
        </div>
    );
}
