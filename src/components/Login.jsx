import { useState } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22,1,0.36,1] } } };
const stag = { show: { transition: { staggerChildren: 0.07 } } };

function Field({ label, type = "text", value, onChange, placeholder, required, mono }) {
  return (
    <motion.div variants={fade} style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--on-surface-var)", letterSpacing: "0.1em", marginBottom: 7, textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        className="neon-input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ width: "100%", boxSizing: "border-box", fontFamily: mono ? "var(--font-mono)" : undefined, letterSpacing: mono ? "0.1em" : undefined, textTransform: mono ? "uppercase" : undefined }}
      />
    </motion.div>
  );
}

export default function Login() {
  const { login, register, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from || "/";

  const [mode, setMode] = useState(searchParams.get("tab") === "login" ? "login" : "register");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  // Sign-in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regReferral, setRegReferral] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);
    const { ok, error } = await login(email, password);
    setSubmitting(false);
    if (!ok) { setLocalError(error || "Invalid credentials."); return; }
    navigate(from, { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (regPassword !== regConfirm) { setLocalError("Passwords don't match."); return; }
    if (regPassword.length < 8) { setLocalError("Password must be at least 8 characters."); return; }
    if (!regReferral.trim()) { setLocalError("A referral code is required."); return; }
    setSubmitting(true);
    const { ok, error } = await register(regEmail, regPassword, regName, regReferral);
    setSubmitting(false);
    if (!ok) { setLocalError(error || "Registration failed. Try again."); return; }
    setRegSuccess(true);
  };

  const err = localError || authError;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* Minimal nav */}
      <nav style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/download.jpeg" alt="TEC" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 900, letterSpacing: "-0.03em", background: "linear-gradient(135deg,#CC97FF,#53DDFC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TEC</span>
        </Link>
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setLocalError(""); }}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, padding: "6px 14px", color: "var(--on-surface-var)", fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.borderColor = "rgba(204,151,255,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--on-surface-var)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
          {mode === "login" ? "REGISTER" : "SIGN IN"}
        </button>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>

        {/* Glow */}
        <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(156,72,234,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

          <AnimatePresence mode="wait">

            {/* -- SIGN IN -- */}
            {mode === "login" && (
              <motion.div key="login" initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }} variants={stag}>
                <motion.div variants={fade} style={{ textAlign: "center", marginBottom: 36 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: "var(--on-surface-var)", textTransform: "uppercase", marginBottom: 12 }}>Member Access</div>
                  <h1 style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--on-surface)", letterSpacing: "-0.02em", marginBottom: 8 }}>Welcome back</h1>
                  <p style={{ fontSize: 13, color: "var(--on-surface-var)" }}>Sign in to your TEC account.</p>
                </motion.div>

                <form onSubmit={handleLogin}>
                  <motion.div variants={stag} initial="hidden" animate="show">
                    <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                    <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
                  </motion.div>

                  <AnimatePresence>
                    {err && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        style={{ background: "rgba(255,110,132,0.08)", border: "1px solid rgba(255,110,132,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--error)", marginBottom: 16 }}>
                        {err}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button variants={fade} type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Signing in…" : "Sign In"}
                  </motion.button>
                </form>

                <motion.p variants={fade} style={{ textAlign: "center", fontSize: 12, color: "var(--on-surface-var)", marginTop: 20 }}>
                  Don't have an account?{" "}
                  <button onClick={() => { setMode("register"); setLocalError(""); }} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 700 }}>Register with a code</button>
                </motion.p>
              </motion.div>
            )}

            {/* -- REGISTER -- */}
            {mode === "register" && !regSuccess && (
              <motion.div key="register" initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }} variants={stag}>
                <motion.div variants={fade} style={{ textAlign: "center", marginBottom: 36 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: "var(--tertiary)", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>lock</span>
                    Invite Only
                  </div>
                  <h1 style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--on-surface)", letterSpacing: "-0.02em", marginBottom: 8 }}>Create your account</h1>
                  <p style={{ fontSize: 13, color: "var(--on-surface-var)" }}>You need a referral code issued by a TEC admin.</p>
                </motion.div>

                <form onSubmit={handleRegister}>
                  <motion.div variants={stag} initial="hidden" animate="show">
                    <Field label="Full Name" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Your name" required />
                    <Field label="Email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" required />
                    <Field label="Password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 8 characters" required />
                    <Field label="Confirm Password" type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repeat password" required />
                    <Field label="Referral Code *" value={regReferral} onChange={e => setRegReferral(e.target.value.toUpperCase())} placeholder="e.g. A7B2K9X3" required mono />
                  </motion.div>

                  <AnimatePresence>
                    {err && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        style={{ background: "rgba(255,110,132,0.08)", border: "1px solid rgba(255,110,132,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--error)", marginBottom: 16 }}>
                        {err}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button variants={fade} type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Creating account…" : "Create Account"}
                  </motion.button>
                </form>

                <motion.p variants={fade} style={{ textAlign: "center", fontSize: 12, color: "var(--on-surface-var)", marginTop: 20 }}>
                  Already a member?{" "}
                  <button onClick={() => { setMode("login"); setLocalError(""); }} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 700 }}>Sign in</button>
                </motion.p>
              </motion.div>
            )}

            {/* -- SUCCESS -- */}
            {mode === "register" && regSuccess && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(83,221,252,0.1)", border: "1px solid rgba(83,221,252,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 30, color: "var(--secondary)" }}>check_circle</span>
                </div>
                <h2 style={{ fontSize: 24, fontFamily: "var(--font-display)", fontWeight: 900, color: "var(--on-surface)", marginBottom: 10, letterSpacing: "-0.02em" }}>You're in!</h2>
                <p style={{ fontSize: 13, color: "var(--on-surface-var)", marginBottom: 8, lineHeight: 1.7 }}>Your TEC account has been created. Check your email to verify, then sign in to find your member code in your profile.</p>
                <p style={{ fontSize: 11, color: "var(--on-surface-var)", marginBottom: 32, opacity: 0.6 }}>Admins can promote your role after you join.</p>
                <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setMode("login"); setRegSuccess(false); }}>
                  Go to Sign In
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
