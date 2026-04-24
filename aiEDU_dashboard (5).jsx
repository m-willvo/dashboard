import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart
} from "recharts";

const C = {
  navy:        "#1a2b5e",
  teal:        "#00c4b4",
  tealLight:   "#e6faf8",
  tealMid:     "#b2ede8",
  muted:       "#6b7280",
  mutedLight:  "#f3f4f6",
  border:      "#d0f0ee",
  white:       "#ffffff",
  amber:       "#f59e0b",
  amberLight:  "#fffbe6",
  surface:     "#f8fffe",
};

const educatorsByYear = [
  { year: "2024", educators: 5455 },
  { year: "2025", educators: 9263 },
  { year: "2026*", educators: 1544 },
];

const eventsByYear = [
  { year: "2023", events: 111, avg: 80.9 },
  { year: "2024", events: 144, avg: 89.9 },
  { year: "2025", events: 304, avg: 40.3 },
];

const npsData = [
  { program: "Curriculum & Events", nps: 1.9,  n: "631 exit surveys" },
  { program: "Spark the Future",    nps: 59.3, n: "54 respondents" },
  { program: "Trailblazers",        nps: 79.6, n: "137 respondents" },
];

const spectrum = [
  { program: "Curriculum Downloads", reach: "16,262", unit: "educators",    nps: "1.9",  sat: "—",     conf: "—",   evidence: 8,  light: true },
  { program: "PL Events",            reach: "35,464", unit: "participants",  nps: "1.9*",  sat: "3.7/5†", conf: "—",   evidence: 15, light: true },
  { program: "Spark the Future",     reach: "141",    unit: "participants",  nps: "59.3", sat: "4.4/5", conf: "77%", evidence: 55, light: false },
  { program: "Trailblazers",         reach: "179",    unit: "fellows",       nps: "79.6", sat: "92%",   conf: "—",   evidence: 85, light: false },
];

const frameworkDomains = [
  { code: "Student 1", label: "Know Your Basics", sub: "AI literacy — define, identify, use AI safely", color: "#00c4b4", evidence: "strong",
    note: "3 competency-mapped quotes in Trailblazers responses. Curriculum rubric avg 4.5/5 on AI literacy items.", signal: "Qualitative signal — not yet quantified", gap: "No pre/post knowledge assessment" },
  { code: "Student 2", label: "Be a Critical Thinker", sub: "Responsible use, identify bias, examine outputs", color: "#00c4b4", evidence: "strong",
    note: "Bias competency (2B) is the most cited domain in Trailblazers open-ended responses.", signal: "Qualitative signal — not yet quantified", gap: "No rubric or assessment instrument" },
  { code: "Student 3", label: "Lead with the Human Advantage", sub: "Emotional intelligence, creativity, life-long learning", color: "#b2ede8", evidence: "partial",
    note: "Human connection themes appear in Trailblazers responses. StF mentions collaboration.", signal: "Sparse qualitative signal", gap: "Not referenced in any survey instrument" },
  { code: "Educator 1", label: "Know and Model the Basics", sub: "Foundational AI knowledge, pedagogical literacy, district policy", color: "#1a2b5e", evidence: "partial",
    note: "StF confidence question loosely maps here. PLC survey references [1a][1b] explicitly.", signal: "Single item (StF) + PLC codes (n=3 post)", gap: "No pre/post for Trailblazers or StF" },
  { code: "Educator 2", label: "Foster and Model Critical Thinking", sub: "Evaluate AI tools, model evaluation, iterate with colleagues", color: "#1a2b5e", evidence: "weak",
    note: "Not referenced in Trailblazers or StF instruments. PLC references [2a][2b][2c].", signal: "PLC only (n=3 post-surveys)", gap: "No instrument coverage for deeper programs" },
  { code: "Educator 3", label: "Lead with the Teacher Advantage", sub: "Emotional intelligence, creativity, life-long learning for educators", color: "#6b7280", evidence: "none",
    note: "No survey instrument references this domain across any program.", signal: "No current signal", gap: "Not yet measured in any program" },
];

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "7px 16px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 7, cursor: "pointer", background: active ? "#1a2b5e" : "transparent", color: active ? "#ffffff" : "#6b7280" }}>
    {label}
  </button>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #d0f0ee" }}>
    {children}
  </div>
);

const Tip = ({ text }) => (
  <div style={{ fontSize: 11, color: "#92400e", background: "#fffbe6", border: "1px solid #f59e0b", borderRadius: 7, padding: "8px 12px", marginTop: 12 }}>⚠ {text}</div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #d0f0ee", borderRadius: 7, padding: "9px 13px", fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#1a2b5e" }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || "#00c4b4" }}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong></div>)}
    </div>
  );
};

const EvidencePill = ({ level }) => {
  const m = { strong: ["Strong signal", "#e6faf8", "#0f6e56"], partial: ["Partial signal", "#fffbe6", "#92400e"], weak: ["Weak signal", "#fef2f2", "#991b1b"], none: ["No signal yet", "#f3f4f6", "#6b7280"] };
  const [label, bg, color] = m[level];
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: bg, color }}>{label}</span>;
};

export default function Dashboard() {
  const [tab, setTab] = useState("reach");
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fffe", minHeight: "100vh", padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#00c4b4", marginBottom: 5 }}>aiEDU · Program Intelligence</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2b5e", margin: 0 }}>Impact Dashboard</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Data through April 2026</div>
            <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, marginTop: 2 }}>⚠ 2026 figures are partial year</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 20, background: "#fff", border: "1px solid #d0f0ee", borderRadius: 9, padding: 3, width: "fit-content" }}>
          {[["reach","Reach & Growth"],["quality","Engagement Quality"],["framework","Framework Alignment"]].map(([k,l]) =>
            <Tab key={k} label={l} active={tab===k} onClick={() => setTab(k)} />
          )}
        </div>
      </div>

      {tab === "reach" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[["16,262","Educators Reached","Via curriculum downloads",true],["+70%","YoY Growth","Educator downloads 2024→2025",false],["694","Events","2023–2026",false],["35,464","Event Participants","Across all event types",false]].map(([v,l,s,a],i) => (
              <div key={i} style={{ background: a ? "#1a2b5e" : "#fff", border: "1px solid #d0f0ee", borderRadius: 10, padding: "20px 22px" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: a ? "#fff" : "#1a2b5e", lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: a ? "rgba(255,255,255,0.85)" : "#1a2b5e", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6 }}>{l}</div>
                <div style={{ fontSize: 11, color: a ? "rgba(255,255,255,0.6)" : "#6b7280", marginTop: 2 }}>{s}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #d0f0ee", padding: 22 }}>
              <SectionTitle>Curriculum downloads — educators by year</SectionTitle>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={educatorsByYear} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d0f0ee" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => (v/1000).toFixed(0)+"k"} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="educators" name="Educators" fill="#1a2b5e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: "#0f6e56", marginTop: 8, fontWeight: 600 }}>↑ 70% growth from 2024 to 2025</div>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #d0f0ee", padding: 22 }}>
              <SectionTitle>Events — volume vs avg participants per event</SectionTitle>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={eventsByYear} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d0f0ee" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#00c4b4" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="events" name="Events" fill="#1a2b5e" radius={[4,4,0,0]} opacity={0.85} />
                  <Line yAxisId="right" type="monotone" dataKey="avg" name="Avg size" stroke="#00c4b4" strokeWidth={2} dot={{ r: 4, fill: "#00c4b4" }} />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 8, fontWeight: 600 }}>⚠ Events doubled in 2025 — avg size fell from 90 to 40</div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #d0f0ee", padding: 22 }}>
            <SectionTitle>Program enrollment — deeper programs</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
              {[["179","Trailblazers Fellows","12 cohorts",true],["141","StF Participants","6 cohorts",true],["59.8%","StF Completion Rate","Concluded cohorts only",false],["77%","TB Survey Response Rate","138 of 179 fellows",false]].map(([v,l,s,h],i) => (
                <div key={i} style={{ padding: "16px 20px", borderRight: i<3 ? "1px solid #d0f0ee" : "none" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: h ? "#1a2b5e" : "#00c4b4", letterSpacing: "-1px" }}>{v}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1a2b5e", marginTop: 4 }}>{l}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s}</div>
                </div>
              ))}
            </div>
            <Tip text="Trailblazers individual completion rate cannot be calculated — the completion field is a cohort label, not individual tracking." />
          </div>
        </div>
      )}

      {tab === "quality" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #d0f0ee", padding: 22 }}>
            <SectionTitle>Engagement spectrum — reach vs. evidence quality</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, marginTop: 4 }}>
              {spectrum.map((s,i) => (
                <div key={i} style={{ padding: "16px 18px", borderRight: i<3 ? "1px solid #d0f0ee" : "none", borderTop: `3px solid ${s.light ? "#6b7280" : "#00c4b4"}`, background: s.light ? "#f3f4f6" : "#e6faf8" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: s.light ? "#6b7280" : "#00c4b4", marginBottom: 6 }}>{s.program}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#1a2b5e", letterSpacing: "-1px" }}>{s.reach}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{s.unit}</div>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #d0f0ee" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>Evidence quality</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#1a2b5e" }}>{s.evidence}%</span>
                    </div>
                    <div style={{ height: 5, background: "#d0f0ee", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.evidence}%`, background: s.light ? "#6b7280" : "#00c4b4", borderRadius: 3 }} />
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: "#6b7280", display: "flex", flexDirection: "column", gap: 3 }}>
                      <span>NPS: <strong style={{ color: "#1a2b5e" }}>{s.nps}</strong></span>
                      <span>Satisfaction: <strong style={{ color: "#1a2b5e" }}>{s.sat}</strong></span>
                      <span>High confidence: <strong style={{ color: "#1a2b5e" }}>{s.conf}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 18px 0", fontSize: 11, color: "#6b7280", fontStyle: "italic", borderTop: "1px solid #d0f0ee", marginTop: 12 }}>
              <span>← broader reach, thinner evidence</span>
              <span>deeper engagement, stronger signals →</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #d0f0ee", padding: 22 }}>
              <SectionTitle>NPS by program level</SectionTitle>
              {npsData.map((d,i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#1a2b5e", fontWeight: 600 }}>{d.program}</span>
                    <div><span style={{ fontSize: 18, fontWeight: 700, color: i===2 ? "#00c4b4" : "#1a2b5e" }}>{d.nps}</span><span style={{ fontSize: 11, color: "#6b7280", marginLeft: 4 }}>/ 100</span></div>
                  </div>
                  <div style={{ height: 7, background: "#d0f0ee", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.max(d.nps,2)}%`, background: i===2 ? "#1a2b5e" : "#00c4b4", borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{d.n}</div>
                </div>
              ))}
              <Tip text="* NPS 1.9 calculated from individual exit survey recommend scores only (n=631). Includes pre-surveys: NPS drops to 0.3. Always filter to exit surveys. † After-knowledge rating 3.7/5 excludes 428 zero-coded non-responses." />
            </div>

            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #d0f0ee", padding: 22 }}>
              <SectionTitle>Trailblazers — satisfaction breakdown (n=138)</SectionTitle>
              {[["Extremely Satisfied",58,42,"#1a2b5e"],["Very Satisfied",69,50,"#00c4b4"],["Somewhat Satisfied",9,7,"#f59e0b"],["Slightly Satisfied",2,1,"#ef4444"]].map(([l,v,p,c],i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#1a2b5e" }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{v} ({p}%)</span>
                  </div>
                  <div style={{ height: 5, background: "#d0f0ee", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p}%`, background: c, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: "10px 14px", background: "#e6faf8", borderRadius: 8, fontSize: 12, color: "#0f6e56", fontWeight: 600 }}>
                92% Very or Extremely Satisfied · NPS 79.6
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "framework" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: "14px 18px", background: "#e6faf8", border: "1px solid #b2ede8", borderRadius: 10, fontSize: 13, color: "#0f6e56", lineHeight: 1.6 }}>
            <strong>About this view:</strong> Current program evidence mapped to AI Readiness Framework competency domains. Evidence levels reflect what the data shows today — not program quality. Click any domain to expand. The final note describes what full measurement would enable.
          </div>

          {frameworkDomains.map((d,i) => {
            const isOpen = expanded === i;
            return (
              <div key={i} onClick={() => setExpanded(isOpen ? null : i)} style={{ background: "#fff", borderRadius: 10, border: "1px solid #d0f0ee", borderLeft: `4px solid ${d.color}`, padding: "16px 20px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ background: d.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{d.code}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2b5e" }}>{d.label}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{d.sub}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <EvidencePill level={d.evidence} />
                    <span style={{ fontSize: 14, color: "#6b7280" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #d0f0ee", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00c4b4", marginBottom: 6 }}>Current Evidence</div>
                      <div style={{ fontSize: 13, color: "#1a2b5e", lineHeight: 1.5 }}>{d.note}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00c4b4", marginBottom: 6 }}>Signal Type</div>
                      <div style={{ fontSize: 13, color: "#1a2b5e", lineHeight: 1.5 }}>{d.signal}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f59e0b", marginBottom: 6 }}>Measurement Gap</div>
                      <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>{d.gap}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ padding: "14px 18px", background: "#fffbe6", border: "1px solid #f59e0b", borderRadius: 10, fontSize: 12, color: "#92400e", lineHeight: 1.7 }}>
            <strong>What this view would show with full measurement:</strong> Quantified competency coverage rates per domain per cohort, pre/post confidence gains mapped to each domain, and implementation log data linking program participation to specific curriculum products and student competency exposure. The evaluation plan in Part II of the accompanying brief describes how to build toward this.
          </div>
        </div>
      )}

      <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #d0f0ee", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: "#6b7280" }}>Source: aiEDU Airtable Program Dataset · Built with Claude Artifacts</div>
        <div style={{ fontSize: 11, color: "#f59e0b" }}>* 2026 data is partial year through April</div>
      </div>
    </div>
  );
}
