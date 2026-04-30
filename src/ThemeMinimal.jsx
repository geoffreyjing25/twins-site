// ============================================================
//  Theme: MINIMAL — quiet, tiny, Swiss-ish.
//  Profile: GEOFFREY (read from window.PROFILES.geoffrey)
//
//  Features (mirrors the original design):
//    · Live San Francisco clock (Pacific Time, ticking 1Hz)
//    · Pulsing accent dot next to "San Francisco"
//    · Rotating "now" status line cycling through Geoffrey's
//      `now` items every ~2.8s with a soft slot-reel animation
//    · Sparkline tick divider (deterministic bars)
//    · Two-column "// now" / "// elsewhere" footer block
//    · Inline FlowsTrigger ("flows") in the bio paragraph —
//      hidden by default, reveals dotted underline + ♪ on hover,
//      click toggles the SoundButton's YouTube playback
//    · Collapsible MiniTerminal pinned bottom-right (small `›_`
//      chevron). Commands: help, now, anticipated, derby,
//      french open, world cup, nba finals, coffee, whoami, clear
// ============================================================

const minimalStyles = {
  stage: {
    minHeight: "100vh",
    background: "#f4ecdb",
    color: "#1a1a18",
    fontFamily: "'Inter Tight', system-ui, sans-serif",
    fontWeight: 400, letterSpacing: "-0.005em",
    position: "relative",
  },
  wrap: { maxWidth: 520, margin: "0 auto", padding: "clamp(56px,10vh,120px) 24px 80px", zoom: 1.03 },
  topMeta: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase",
    color: "#8a8a82", fontWeight: 500,
    paddingBottom: 10, marginBottom: 24,
    borderBottom: "1px solid rgba(26,26,24,0.1)",
  },
  dot: {
    display: "inline-block", width: 5, height: 5, borderRadius: "50%",
    background: "#c45a3a", marginRight: 8, verticalAlign: "middle",
    animation: "min-pulse 2.2s ease-in-out infinite",
  },
  headRow: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 },
  name: {
    fontSize: 16, fontWeight: 500, margin: 0, letterSpacing: "-0.005em",
    whiteSpace: "nowrap", flexShrink: 0,
  },
  monogram: {
    fontSize: 10.5, letterSpacing: "0.2em", color: "#b8b8b0",
    fontFamily: "'JetBrains Mono', monospace",
  },
  status: {
    fontSize: 12.5, color: "#6a6a62", margin: "0 0 24px",
    display: "flex", alignItems: "baseline", gap: 6, minHeight: 18,
  },
  statusLabel: {
    color: "#b8b8b0", fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase",
  },
  statusValue: { display: "inline-block", transition: "opacity .35s, transform .35s" },
  body: { fontSize: 13.5, lineHeight: 1.7, color: "#2a2a28" },
  para: { margin: "0 0 12px" },

  tickRow: {
    display: "flex", gap: 3, margin: "26px 0 20px",
    alignItems: "flex-end", height: 14,
  },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 },
  colLabel: {
    fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase",
    color: "#b8b8b0", fontFamily: "'JetBrains Mono', monospace",
    marginBottom: 10,
  },
  nowList: { display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5 },
  nowRow: { display: "flex", justifyContent: "space-between", gap: 10 },
  nowLabel: { color: "#8a8a82" },
  nowValue: { color: "#1a1a18", textAlign: "right" },
  linksList: { display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5 },
  link: {
    color: "#1a1a18", textDecoration: "none",
    display: "inline-flex", alignItems: "baseline", gap: 8,
    transition: "color .15s", width: "fit-content",
    borderBottom: "1px dotted transparent",
  },
  linkArrow: { fontSize: 10, color: "#c45a3a" },

  footer: {
    marginTop: 48, paddingTop: 14,
    borderTop: "1px solid rgba(26,26,24,0.1)",
    display: "flex", justifyContent: "space-between",
    fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
    color: "#b8b8b0", fontFamily: "'JetBrains Mono', monospace",
  },
};

function Ticks() {
  const heights = [3, 7, 5, 11, 4, 8, 13, 6, 9, 5, 12, 4, 7, 3, 10, 6, 8, 5, 11, 4];
  return (
    <div style={minimalStyles.tickRow} aria-hidden>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 2, height: h,
          background: i % 5 === 0 ? "#c45a3a" : "rgba(26,26,24,0.25)",
        }} />
      ))}
    </div>
  );
}

// ============================================================
//  MiniTerminal — collapsible terminal panel pinned to the
//  bottom-right of the page. A small `›_` chevron toggles it
//  open. The ↑/↓ arrows step through input history.
// ============================================================
function MiniTerminal({ C }) {
  const [open, setOpen] = React.useState(false);
  const [cmd, setCmd] = React.useState("");
  const [entries, setEntries] = React.useState([
    { cmd: "", out: "type `help` to see what's in here." },
  ]);
  const [history, setHistory] = React.useState([]);
  const [histIdx, setHistIdx] = React.useState(-1);
  const scrollRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries, open]);

  React.useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const run = (raw) => {
    const c = raw.trim().toLowerCase();
    let out = "";
    if (c === "help") {
      out = "commands: help, now, anticipated, derby, sports, coffee, links, twin, pbf, clear";
    } else if (c === "now") {
      out = C.now.map(n => `  ${n.label.padEnd(18)} ${n.value}`).join("\n");
    } else if (c === "anticipated") {
      out = "triple crown\n    · kentucky derby    — may 2  · churchill downs\n    · preakness stakes  — may 16 · pimlico\n    · belmont stakes    — jun 7  · belmont park\n\n  golf majors\n    · pga championship  — may 15 · quail hollow\n    · us open           — jun 16 · stony brook\n\n  · french open — may 24 · roland-garros\n  · fifa world cup — jun 11 · north america\n  · nba finals — jun · tbd";
    } else if (c === "derby" || c === "kentucky derby") {
      out = "kentucky derby · may 2 · churchill downs · post time ~6:57pm ET";
    } else if (c === "sports") {
      out = "basketball, golf, tennis, calisthenics, running, swimming, badminton, volleyball, football, soccer, ultimate frisbee, BJJ, pickleball, bowling, table tennis.";
    } else if (c === "coffee") {
      out = "current: iced latte + 1 pump vanilla";
    } else if (c === "pbf") {
      out = "12";
    } else if (c === "twin") {
      out = "https://www.linkedin.com/in/albert-jing/";
    } else if (c === "links") {
      out = C.links.map(l => `  ${l.label.padEnd(10)} ${l.handle}  →  ${l.href}`).join("\n");
    } else if (c === "clear") {
      setEntries([]); return;
    } else if (c === "") {
      out = "";
    } else {
      out = `command not found: ${raw}  (try: help)`;
    }
    setEntries((e) => [...e, { cmd: raw, out }]);
    if (raw) {
      setHistory((h) => [raw, ...h].slice(0, 50));
      setHistIdx(-1);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") { run(cmd); setCmd(""); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length) {
        const next = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(next);
        setCmd(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setCmd(next === -1 ? "" : history[next]);
    }
  };

  return (
    <>
      <style>{`
        @keyframes mt-slide { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .mt-scroll::-webkit-scrollbar { width: 6px; }
        .mt-scroll::-webkit-scrollbar-thumb { background: rgba(196,90,58,0.25); border-radius: 3px; }
      `}</style>

      {/* Toggle chevron — always visible, bottom-right, very small */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "close terminal" : "open terminal"}
        style={{
          position: "fixed", right: 16, bottom: 16, zIndex: 50,
          width: 26, height: 26, borderRadius: "50%",
          background: open ? "#1a1a18" : "transparent",
          color: open ? "#f4ecdb" : "#8a8a82",
          border: "1px solid rgba(26,26,24,0.18)",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .25s ease",
          padding: 0,
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.color = "#c45a3a"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.color = "#8a8a82"; }}
      >
        {open ? "×" : "›_"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed", left: 16, right: 16, bottom: 52, zIndex: 49,
            maxWidth: 560, margin: "0 auto",
            background: "rgba(26,26,24,0.96)", color: "#e9e2cf",
            border: "1px solid rgba(26,26,24,0.4)",
            borderRadius: 4,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, lineHeight: 1.55,
            boxShadow: "0 18px 48px rgba(20,15,10,0.35)",
            animation: "mt-slide .22s cubic-bezier(.2,.8,.2,1)",
          }}
          onClick={() => inputRef.current && inputRef.current.focus()}
        >
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "6px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8a82",
          }}>
            <span>~/{C.name.split(" ")[0].toLowerCase()} · sh</span>
            <span style={{ color: "#c45a3a" }}>help · now · anticipated · clear</span>
          </div>

          <div ref={scrollRef} className="mt-scroll" style={{
            maxHeight: 200, overflowY: "auto", padding: "10px 12px 4px",
          }}>
            {entries.map((e, k) => (
              <div key={k} style={{ marginBottom: 6 }}>
                {e.cmd !== undefined && e.cmd !== "" && (
                  <div><span style={{ color: "#c45a3a" }}>$</span> <span>{e.cmd}</span></div>
                )}
                {e.out && (
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", color: "#c8bfa8" }}>{e.out}</pre>
                )}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#c45a3a" }}>$</span>
              <input
                ref={inputRef}
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                onKeyDown={onKey}
                spellCheck={false}
                style={{
                  flex: 1, background: "transparent", border: 0, outline: 0,
                  color: "#e9e2cf", font: "inherit", caretColor: "#c45a3a",
                }}
                aria-label="mini terminal"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const BIRTH_YEAR = 2003; // update if wrong — used for the age stat

function ThemeMinimal() {
  const C = window.PROFILES.geoffrey;
  const [now, setNow] = React.useState(new Date());
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  React.useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % C.now.length), 2800);
    return () => clearInterval(id);
  }, [C.now.length]);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles",
  });
  const current = C.now[idx];

  return (
    <div style={minimalStyles.stage}>
      <style>{`
        @keyframes min-pulse { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        @keyframes min-slot {
          from { opacity: 0; transform: translateY(6px); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0);  filter: blur(0); }
        }
      `}</style>
      <div style={minimalStyles.wrap}>
        <div style={minimalStyles.topMeta}>
          <span><span style={minimalStyles.dot} />San Francisco</span>
          <span>{timeStr} PT</span>
        </div>

        <div style={minimalStyles.headRow}>
          <h1 style={minimalStyles.name}>{C.name}</h1>
          <span style={minimalStyles.monogram}>— {C.initials.split("").join(".")}.</span>
        </div>

        <div style={minimalStyles.status}>
          <span style={minimalStyles.statusLabel}>{current.label.toLowerCase()}</span>
          <span key={idx} style={{ ...minimalStyles.statusValue, animation: "min-slot .4s cubic-bezier(.2,.8,.2,1)" }}>
            {current.value}
          </span>
        </div>

        <div style={minimalStyles.body}>
          {C.intro.paragraphs.map((p, i) => <p key={i} style={minimalStyles.para}>{p}</p>)}
          <p style={minimalStyles.para}>
            {C.flowsLine.prefix}
            <window.FlowsTrigger color="#c45a3a" word="tunes" />
            {C.flowsLine.suffix}
          </p>
        </div>

        <Ticks />

        <div style={minimalStyles.twoCol}>
          <div>
            <div style={minimalStyles.colLabel}>// stats</div>
            <div style={minimalStyles.nowList}>
              {[
                { label: "age",          value: String(now.getFullYear() - BIRTH_YEAR) },
                { label: "countries",    value: "11" },
                { label: "weekly saunas",    value: "3" },
                { label: "oz of greek yogurt consumed per week",    value: "48" },
              ].map((s) => (
                <div key={s.label} style={minimalStyles.nowRow}>
                  <span style={minimalStyles.nowLabel}>{s.label}</span>
                  <span style={minimalStyles.nowValue}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={minimalStyles.colLabel}>// elsewhere</div>
            <div style={minimalStyles.linksList}>
              {C.links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={minimalStyles.link}
                   onMouseEnter={(e) => { e.currentTarget.style.color = "#c45a3a"; e.currentTarget.style.borderBottomColor = "#c45a3a"; }}
                   onMouseLeave={(e) => { e.currentTarget.style.color = "#1a1a18"; e.currentTarget.style.borderBottomColor = "transparent"; }}>
                  {l.label}<span style={minimalStyles.linkArrow}>↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={minimalStyles.footer}>
          <span>© {now.getFullYear()}</span>
          <span>37.77° N</span>
        </div>
      </div>
      <MiniTerminal C={C} />
    </div>
  );
}

window.ThemeMinimal = ThemeMinimal;
