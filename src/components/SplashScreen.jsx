import React, { useState, useEffect, useRef } from 'react';

const TIPS = [
    {
        heading: "ECHO PROTOCOL",
        body: "TEC connects students across all UPES campuses in real time. Join the network, mint your profile.",
    },
    {
        heading: "BAZAAR GRID",
        body: "Trade lecture notes, sell gear, and find campus services — all verified by the echo network.",
    },
    {
        heading: "EXPLORE MAP",
        body: "Navigate live campus zones. Crosshair tracking shows your current district at all times.",
    },
    {
        heading: "BUILDS BOARD",
        body: "Post your build, find co-founders, and ship something the campus remembers.",
    },
    {
        heading: "ECHO CREDITS",
        body: "Contribute to the community. Earn echo credits. Redeem them in the Bazaar.",
    },
    {
        heading: "PULSE FEED",
        body: "Real-time campus posts, code drops, and announcements — all in one encrypted stream.",
    },
];

const STAGES = [
    { at: 0, text: 'INITIALIZING ECHO NET' },
    { at: 15, text: 'LOADING CAMPUS ASSETS' },
    { at: 38, text: 'CONNECTING TO TEC GRID' },
    { at: 62, text: 'SYNCING CAMPUS DATA' },
    { at: 85, text: 'VERIFYING PROTOCOLS' },
    { at: 96, text: 'READY' },
];

export default function SplashScreen({ onDone }) {
    const [progress, setProgress] = useState(0);
    const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
    const [fading, setFading] = useState(false);
    const [stageText, setStageText] = useState(STAGES[0].text);
    const [dots, setDots] = useState('');
    const rafRef = useRef(null);
    const doneFiredRef = useRef(false);

    /* Blinking dots */
    useEffect(() => {
        const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 420);
        return () => clearInterval(id);
    }, []);

    /* Progress animation — ease-out cubic for that weighty GTA feel */
    useEffect(() => {
        let start = null;
        const DURATION = 3400;

        function step(ts) {
            if (!start) start = ts;
            const elapsed = ts - start;
            const t = Math.min(elapsed / DURATION, 1);
            const eased = 1 - Math.pow(1 - t, 2.8);
            const p = eased * 100;

            setProgress(p);

            const stage = [...STAGES].reverse().find(s => p >= s.at);
            if (stage) setStageText(stage.text);

            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else if (!doneFiredRef.current) {
                doneFiredRef.current = true;
                setTimeout(() => {
                    setFading(true);
                    setTimeout(onDone, 600);
                }, 320);
            }
        }

        rafRef.current = requestAnimationFrame(step);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, []); // intentionally empty — run once on mount

    const tip = TIPS[tipIndex];
    const pct = Math.floor(progress);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#09090a',
            display: 'flex', flexDirection: 'column',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.6s ease',
            pointerEvents: fading ? 'none' : 'all',
            userSelect: 'none',
        }}>
            {/* ── Scanlines overlay ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
            }} />

            {/* ── Ambient center glow ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 90% 70% at 50% 48%, rgba(204,151,255,0.07) 0%, transparent 68%)',
            }} />

            {/* ── Vignette ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)',
            }} />

            {/* ── Center logo ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 2, gap: 14,
            }}>
                {/* Main wordmark */}
                <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900,
                    fontSize: 'clamp(72px, 15vw, 128px)',
                    color: '#fff', letterSpacing: '-0.05em', fontStyle: 'italic',
                    textShadow: '0 0 40px rgba(204,151,255,0.45), 0 0 100px rgba(204,151,255,0.12)',
                    lineHeight: 1,
                }}>TEC</div>

                {/* Subtitle */}
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'rgba(255,255,255,0.22)', letterSpacing: '0.32em',
                    textTransform: 'uppercase',
                }}>The Echo Community</div>

                {/* Horizontal rule */}
                <div style={{
                    width: 'clamp(160px, 30vw, 300px)', height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(204,151,255,0.3), transparent)',
                    marginTop: 8,
                }} />

                {/* Version badge */}
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em',
                }}>V2.0.4-STABLE</div>
            </div>

            {/* ── Bottom info strip ── */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Tip + percentage row */}
                <div style={{
                    padding: '0 clamp(20px, 5vw, 48px) 18px',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    gap: 32,
                }}>
                    {/* Tip */}
                    <div style={{ maxWidth: 520 }}>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 800,
                            color: 'var(--primary)', letterSpacing: '0.22em', marginBottom: 6,
                            textTransform: 'uppercase',
                        }}>{tip.heading}</div>
                        <div style={{
                            fontFamily: 'var(--font-body)', fontSize: 13,
                            color: 'rgba(255,255,255,0.38)', lineHeight: 1.55,
                        }}>{tip.body}</div>
                    </div>

                    {/* Stage + percentage */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: 9,
                            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em',
                            textTransform: 'uppercase', marginBottom: 5,
                        }}>{stageText}{dots}</div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontWeight: 800,
                            fontSize: 'clamp(20px, 4vw, 32px)',
                            color: pct >= 100 ? 'var(--primary)' : 'rgba(255,255,255,0.75)',
                            letterSpacing: '-0.02em',
                            textShadow: pct >= 100 ? '0 0 20px rgba(204,151,255,0.5)' : 'none',
                            transition: 'color 0.3s, text-shadow 0.3s',
                        }}>
                            {pct.toString().padStart(3, '0')}
                            <span style={{ fontSize: '0.38em', color: 'rgba(255,255,255,0.25)', marginLeft: 2 }}>%</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar track — absolute bottom, GTA-style */}
                <div style={{
                    height: 3,
                    background: 'rgba(255,255,255,0.05)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #9c48ea, #cc97ff)',
                        boxShadow: '0 0 14px rgba(204,151,255,0.7), 0 0 4px rgba(204,151,255,1)',
                        transition: 'width 0.08s linear',
                    }} />
                    {/* Leading edge glow pulse */}
                    {progress > 0 && progress < 100 && (
                        <div style={{
                            position: 'absolute', top: 0,
                            left: `calc(${progress}% - 24px)`,
                            width: 48, height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(204,151,255,0.6), transparent)',
                        }} />
                    )}
                </div>
            </div>
        </div>
    );
}
