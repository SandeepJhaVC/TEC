import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "login", label: "Sign In" },
  { id: "register", label: "Register" },
];

const ROLE_META = {
  admin:     { label: "Admin",     color: "var(--error)",     border: "var(--error)",     bg: "rgba(255,110,132,0.12)" },
  moderator: { label: "Mod",       color: "var(--tertiary)",  border: "var(--tertiary)",  bg: "rgba(255,149,160,0.12)" },
  builder:   { label: "Builder",   color: "var(--primary)",   border: "var(--primary)",   bg: "rgba(204,151,255,0.12)" },
  student:   { label: "Student",   color: "var(--secondary)", border: "var(--secondary)", bg: "rgba(83,221,252,0.12)"  },
};

const fade = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};

function Field({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        color: "var(--on-surface-var)", letterSpacing: "0.06em",
        marginBottom: 6, textTransform: "uppercase",
      }}>
        {label}
      </label>
      <input
        className="neon-input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ width: "100%", boxSizing: "border-box" }}
      />
    </div>
  );
}

export default function Login() {
  const { login, register, authError, DEMO_USERS } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || "/";

  const [tab,        setTab]        = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showDemo,   setShowDemo]   = useState(false);

  // Sign-in state
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regName,     setRegName]     = useState("");
  const [regEmail,    setRegEmail]    = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm,  setRegConfirm]  = useState("");
  const [regRole,     setRegRole]     = useState("student");
  const [regSuccess,  setRegSuccess]  = useState(false);

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
    if (regPassword !== regConfirm) { setLocalError("Passwords do not match."); return; }
    if (regPassword.length < 8)     { setLocalError("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    const { ok, error } = await register(regEmail, regPassword, regName, regRole);
    setSubmitting(false);
    if (!ok) { setLocalError(error || "Registration failed. Try again."); return; }
    setRegSuccess(true);
  };

  const fillDemo = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setTab("login");
    setShowDemo(false);
  };

  const err = localError || authError;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={fade}
        transition={{ duration: 0.35 }}
        style={{ width: "100%", maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <img
              src="/download.jpeg"
              alt="TEC"
              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 16px rgba(204,151,255,0.35)" }}
            />
            <span style={{
              fontSize: 22, fontWeight: 900, fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg,#CC97FF,#53DDFC)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
            }}>
              TEC
            </span>
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--on-surface)", marginBottom: 6, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
            {tab === "login" ? "Welcome back" : "Join the community"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--on-surface-var)" }}>
            {tab === "login" ? "No account? " : "Already a member? "}
            <button
              onClick={() => { setTab(tab === "login" ? "register" : "login"); setLocalError(""); }}
              style={{ background: "none", border: "none", color: "var(--secondary)", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 600 }}
            >
              {tab === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Card */}
        <div className="neon-card" style={{ padding: 0, overflow: "hidden" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setLocalError(""); }}
                style={{
                  flex: 1, padding: "14px", fontSize: 13, fontWeight: 700,
                  fontFamily: "var(--font-display)", border: "none", cursor: "pointer",
                  background: tab === t.id ? "var(--surface-low)" : "var(--surface)",
                  color: tab === t.id ? "var(--on-surface)" : "var(--on-surface-var)",
                  borderBottom: tab === t.id ? "2px solid var(--primary)" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "28px 28px 24px" }}>
            <AnimatePresence mode="wait">

              {/* ── SIGN IN ── */}
              {tab === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={handleLogin}
                >
                  <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                  <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />

                  {err && (
                    <div style={{
                      background: "rgba(255,110,132,0.1)", border: "1px solid rgba(255,110,132,0.3)",
                      borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13,
                      color: "var(--error)", marginBottom: 18,
                    }}>
                      {err}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? "Signing in…" : "Sign In"}
                  </button>

                  {/* Demo users */}
                  {DEMO_USERS && DEMO_USERS.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <button
                        type="button"
                        onClick={() => setShowDemo(v => !v)}
                        style={{
                          width: "100%", background: "none", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "var(--radius)", padding: "8px 14px", fontSize: 12,
                          color: "var(--on-surface-var)", cursor: "pointer", fontFamily: "inherit",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>smart_toy</span>
                        Demo accounts
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                          {showDemo ? "expand_less" : "expand_more"}
                        </span>
                      </button>

                      {showDemo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}
                        >
                          {DEMO_USERS.map(u => {
                            const meta = ROLE_META[u.role] || ROLE_META.student;
                            return (
                              <button
                                key={u.email}
                                type="button"
                                onClick={() => fillDemo(u)}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "10px 14px", border: `1px solid ${meta.border}30`,
                                  borderRadius: "var(--radius)", background: meta.bg,
                                  cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
                                }}
                              >
                                <div style={{ textAlign: "left" }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)" }}>{u.name || u.email}</div>
                                  <div style={{ fontSize: 11, color: "var(--on-surface-var)", marginTop: 2 }}>{u.email}</div>
                                </div>
                                <span style={{
                                  fontSize: 10, fontWeight: 800, color: meta.color,
                                  background: meta.bg, border: `1px solid ${meta.border}50`,
                                  borderRadius: 4, padding: "2px 8px", letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                }}>
                                  {meta.label}
                                </span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.form>
              )}

              {/* ── REGISTER ── */}
              {tab === "register" && !regSuccess && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={handleRegister}
                >
                  <Field label="Full Name" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Your name" required />
                  <Field label="Email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" required />
                  <Field label="Password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 8 characters" required />
                  <Field label="Confirm Password" type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repeat password" required />

                  {/* Role picker */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{
                      display: "block", fontSize: 11, fontWeight: 700,
                      color: "var(--on-surface-var)", letterSpacing: "0.06em",
                      marginBottom: 8, textTransform: "uppercase",
                    }}>
                      I am a
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["student", "builder"].map(r => {
                        const m = ROLE_META[r];
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRegRole(r)}
                            style={{
                              flex: 1, padding: "9px 0", borderRadius: "var(--radius)",
                              fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                              border: `1px solid ${regRole === r ? m.border : "rgba(255,255,255,0.08)"}`,
                              background: regRole === r ? m.bg : "transparent",
                              color: regRole === r ? m.color : "var(--on-surface-var)",
                              transition: "all 0.15s",
                            }}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {err && (
                    <div style={{
                      background: "rgba(255,110,132,0.1)", border: "1px solid rgba(255,110,132,0.3)",
                      borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13,
                      color: "var(--error)", marginBottom: 18,
                    }}>
                      {err}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? "Creating account…" : "Create Account"}
                  </button>
                </motion.form>
              )}

              {/* ── REGISTER SUCCESS ── */}
              {tab === "register" && regSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center", padding: "12px 0 4px" }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "rgba(83,221,252,0.12)", border: "1px solid rgba(83,221,252,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--secondary)" }}>check_circle</span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--on-surface)", marginBottom: 8, fontFamily: "var(--font-display)" }}>
                    Account Created
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--on-surface-var)", marginBottom: 24 }}>
                    Check your email to verify your account, then sign in.
                  </p>
                  <button
                    className="btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => { setTab("login"); setRegSuccess(false); }}
                  >
                    Go to Sign In
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--on-surface-var)", marginTop: 20 }}>
          Built for students of Uttarakhand ·{" "}
          <Link to="/about" style={{ color: "var(--primary)", textDecoration: "none" }}>About TEC</Link>
        </p>
      </motion.div>
    </div>
  );
}
