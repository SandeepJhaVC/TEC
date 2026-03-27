import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import AdBanner from './AdBanner';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("events").select("*").order("start_time", { ascending: true });
        if (error) throw error;
        setEvents(data || []);
      } catch (e) { console.error(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const formatDate = d => d
    ? new Date(d).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" })
    : "TBA";

  return (
    <div className="page-wrap" style={{ maxWidth: 840 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>The Echo Community</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 12 }}>
        UPCOMING_<span className="accent-secondary">EVENTS</span>
      </h1>
      <p style={{ color: "var(--on-surface-var)", fontSize: 14, marginBottom: 36, lineHeight: 1.6 }}>Campus events near you — add directly to your calendar.</p>

      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
          <span className="live-dot" style={{ display: "inline-block", marginRight: 8 }} />
          Loading events…
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="neon-card" style={{ padding: "60px 24px", textAlign: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: "var(--on-surface-var)", display: "block", marginBottom: 12 }}>event_busy</span>
          <div style={{ fontSize: 14, color: "var(--on-surface-var)" }}>No upcoming events found. Check back soon.</div>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((ev, evIdx) => (
            <React.Fragment key={ev.id}>
              <div className="neon-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, letterSpacing: "-0.03em" }}>{ev.title}</h2>
                  <span className="tag-secondary" style={{ flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: "middle", marginRight: 4 }}>schedule</span>
                    {ev.start_time ? new Date(ev.start_time).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--on-surface-var)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--primary)" }}>calendar_today</span>
                    <span style={{ color: "var(--on-surface)" }}>{formatDate(ev.start_time)}</span>
                  </div>
                  {ev.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--on-surface-var)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--secondary)" }}>location_on</span>
                      <span style={{ color: "var(--on-surface)" }}>{ev.location}</span>
                    </div>
                  )}
                </div>

                {ev.description && (
                  <p style={{ fontSize: 14, color: "var(--on-surface-var)", lineHeight: 1.6, marginBottom: 18 }}>{ev.description}</p>
                )}

                {ev.start_time && ev.end_time && (
                  <AddToCalendarButton
                    name={ev.title}
                    description={ev.description || ""}
                    startDate={ev.start_time.split("T")[0]}
                    endDate={ev.end_time.split("T")[0]}
                    startTime={ev.start_time.split("T")[1]?.substring(0, 5)}
                    endTime={ev.end_time.split("T")[1]?.substring(0, 5)}
                    timeZone="Asia/Kolkata"
                    location={ev.location || ""}
                    options={["Apple", "Google", "Outlook.com"]}
                    buttonStyle="round"
                    styleLight="--btn-background: #CC97FF; --btn-text: #000; --btn-border-radius: 999px;"
                  />
                )}
              </div>
              {(evIdx + 1) % 3 === 0 && <AdBanner variant="inline" offset={Math.floor((evIdx + 1) / 3) - 1} />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
