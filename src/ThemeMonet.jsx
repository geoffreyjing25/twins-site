// ============================================================
//  Theme: MONET — impressionist, with cycling painting gallery.
//  Profile: ALBERT (read from window.PROFILES.albert)
//
//  Features (mirrors the original design):
//    · Click anywhere on the background (not the text panel)
//      to cycle through five procedural SVG paintings:
//        1. Impression, Sunrise         — after Monet
//        2. The Starry Night            — after Van Gogh
//        3. The Persistence of Memory   — after Dalí
//        4. Travelers Among Mtns/Streams— after Fan Kuan
//        5. The Great Wave off Kanagawa — after Hokusai
//    · Each painting ships with a matched palette, so the panel
//      tint, plaque hue, link color, and FlowsTrigger color all
//      shift to fit the active artwork.
//    · The panel parallaxes gently with cursor X, the Monet sun
//      parallaxes with cursor Y, and a soft white flash marks
//      each repaint transition.
//    · Indicator dots show position in the cycle; a small
//      "click canvas →" hint sits in the top-left.
//    · Inline FlowsTrigger ("flows") in the bio paragraph hides
//      until hover, then reveals dotted underline + ♪ — click
//      toggles SoundButton's YouTube playback.
//
//  Procedural paintings live in MonetPaintings.jsx (loaded
//  before this file) and are referenced by `comp` key.
// ============================================================

const PAINTINGS = [
  {
    key: "monet", comp: "monet",
    title: "Impression, Sunrise — after Monet",
    stamp: "Après Monet · 1872",
    flow: "#c0613a", plaqueHue: "#9a7a62",
    panel: "rgba(250,243,232,0.82)", panelBorder: "rgba(80,60,50,0.15)",
    ink: "#2a2e38", loc: "#7a5a4a",
  },
  {
    key: "vangogh", comp: "vangogh",
    title: "The Starry Night — after Van Gogh",
    stamp: "Saint-Rémy · 1889",
    flow: "#f4c542", plaqueHue: "#7c8bc1",
    panel: "rgba(20,30,60,0.78)", panelBorder: "rgba(220,220,255,0.22)",
    ink: "#f4f1e6", loc: "#d4c98a",
  },
  {
    key: "dali", comp: "dali",
    title: "The Persistence of Memory — after Dalí",
    stamp: "Cadaqués · 1931",
    flow: "#8a5a2a", plaqueHue: "#7a6a46",
    panel: "rgba(245,232,205,0.84)", panelBorder: "rgba(100,80,50,0.2)",
    ink: "#2f2a1f", loc: "#6e5a3a",
  },
  {
    key: "shanshui", comp: "shanshui",
    title: "Travelers Among Mountains & Streams — after Fan Kuan",
    stamp: "Northern Song · c. 1000",
    flow: "#a02820", plaqueHue: "#6a5a46",
    panel: "rgba(238,228,210,0.85)", panelBorder: "rgba(70,55,40,0.22)",
    ink: "#2a241e", loc: "#6a5a3a",
  },
  {
    key: "hokusai", comp: "hokusai",
    title: "The Great Wave off Kanagawa — after Hokusai",
    stamp: "Edo · c. 1831",
    flow: "#1f4e6d", plaqueHue: "#4a6a82",
    panel: "rgba(242,234,214,0.88)", panelBorder: "rgba(30,60,90,0.22)",
    ink: "#1a2430", loc: "#35557a",
  },
];

function ThemeMonet() {
  const C = window.PROFILES.albert;
  const [i, setI] = React.useState(0);
  const P = PAINTINGS[i];
  const [y, setY] = React.useState(0);
  const [mx, setMx] = React.useState(0);
  const [flash, setFlash] = React.useState(false);

  React.useEffect(() => {
    const onMove = (e) => {
      setY(((e.clientY / window.innerHeight) - 0.5) * 80);
      setMx(((e.clientX / window.innerWidth) - 0.5) * 10);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const cycle = () => {
    setI((v) => (v + 1) % PAINTINGS.length);
    setFlash(true);
    setTimeout(() => setFlash(false), 450);
  };

  const styles = {
    stage: {
      minHeight: "100vh", position: "relative", overflow: "hidden",
      color: P.ink,
      fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
      background: "#1a1a1a",
      cursor: "pointer",
    },
    canvas: { position: "absolute", inset: 0, zIndex: 0 },
    overlay: {
      position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
      background: "linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.22) 100%)",
    },
    flash: {
      position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
      background: "rgba(255,255,255,0.22)",
      opacity: flash ? 1 : 0, transition: "opacity .45s ease",
    },
    panel: {
      position: "relative", zIndex: 3, cursor: "auto",
      maxWidth: 440, margin: "clamp(56px,12vh,140px) auto 56px",
      padding: "22px 26px 26px", zoom: 1.10,
      background: P.panel, color: P.ink,
      backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
      border: `1px solid ${P.panelBorder}`,
      boxShadow: "0 24px 60px rgba(20,15,20,0.35)",
      transform: `translateX(${mx}px)`,
      transition: "background .5s, color .5s, border-color .5s",
    },
    header: {
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      gap: 16, marginBottom: 6,
    },
    name: {
      fontFamily: "inherit", fontWeight: 500, fontStyle: "italic",
      fontSize: 18, margin: 0, whiteSpace: "nowrap", color: P.ink,
    },
    loc: {
      fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase",
      color: P.loc, fontFamily: "'Inter Tight', sans-serif",
      fontWeight: 500, whiteSpace: "nowrap",
    },
    plaque: {
      fontStyle: "italic", fontSize: 11, color: P.plaqueHue,
      marginBottom: 14, letterSpacing: "0.04em",
    },
    body: { fontSize: 13.5, lineHeight: 1.75 },
    para: { margin: "0 0 11px" },
    section: {
      marginTop: 20, marginBottom: 8, fontSize: 9.5, letterSpacing: "0.26em",
      textTransform: "uppercase", color: P.loc,
      fontFamily: "'Inter Tight', sans-serif", fontWeight: 500,
      borderTop: `1px solid ${P.panelBorder}`, paddingTop: 10,
    },
    nowGrid: {
      display: "grid", gridTemplateColumns: "110px 1fr",
      rowGap: 5, columnGap: 10, fontSize: 12.5,
    },
    nowLabel: { fontStyle: "italic", color: P.loc },
    links: { display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5 },
    link: {
      color: P.flow, textDecoration: "none", fontStyle: "italic",
      borderBottom: `1px solid ${P.flow}55`, paddingBottom: 1,
    },
    caption: {
      position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center",
      zIndex: 3, color: "rgba(250,243,232,0.9)",
      fontFamily: "inherit", fontStyle: "italic", fontSize: 11.5, letterSpacing: "0.05em",
      textShadow: "0 1px 4px rgba(0,0,0,0.55)", pointerEvents: "none",
    },
    stamp: {
      position: "absolute", top: "10%", right: "6%", zIndex: 3,
      fontStyle: "italic", color: "rgba(255,238,210,0.88)",
      fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
      textShadow: "0 1px 6px rgba(0,0,0,0.5)",
      writingMode: "vertical-rl", transform: "rotate(180deg)",
      pointerEvents: "none",
    },
    hint: {
      position: "absolute", top: 16, left: 16, zIndex: 3,
      fontFamily: "'Inter Tight', sans-serif", fontSize: 10, letterSpacing: "0.22em",
      textTransform: "uppercase", color: "rgba(255,245,225,0.75)",
      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
      pointerEvents: "none",
    },
    dots: {
      position: "absolute", bottom: 60, left: 0, right: 0, display: "flex",
      justifyContent: "center", gap: 6, zIndex: 3, pointerEvents: "none",
    },
    dot: (on) => ({
      width: 5, height: 5, borderRadius: "50%",
      background: on ? "rgba(255,245,225,0.95)" : "rgba(255,245,225,0.35)",
      boxShadow: "0 0 6px rgba(0,0,0,0.4)",
    }),
  };

  return (
    <div style={styles.stage} onClick={cycle}>
      <div key={P.key} style={styles.canvas}>
        {window.MonetPaintings && React.createElement(window.MonetPaintings[P.comp], { sunY: y })}
      </div>
      <div style={styles.overlay} />
      <div style={styles.stamp}>{P.stamp}</div>
      <div style={styles.hint}>click canvas →</div>

      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h1 style={styles.name}>
            {C.name.split(" ")[0]}{" "}
            <a
              href="https://jingtwins.com"
              style={{ color: "inherit", textDecoration: "none", fontStyle: "inherit", borderBottom: "1px dotted transparent", transition: "border-color .2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = `${P.ink}55`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = "transparent"; }}
              title="jingtwins.com"
            >Jing</a>
          </h1>
          <span style={styles.loc}>San Francisco</span>
        </div>
        <div style={styles.plaque}>{P.title.toLowerCase()}</div>

        <div style={styles.body}>
          {C.intro.paragraphs.map((p, j) => <p key={j} style={styles.para}>{p}</p>)}
          <p style={styles.para}>
            {C.flowsLine.prefix}
            <window.FlowsTrigger color={P.flow} />
            {C.flowsLine.suffix}
          </p>
        </div>

        {/* Presently section intentionally hidden — keep for future re-enable.
        <div style={styles.section}>Presently</div>
        <div style={styles.nowGrid}>
          {C.now.map((n) => (
            <React.Fragment key={n.label}>
              <div style={styles.nowLabel}>{n.label.toLowerCase()}</div>
              <div>{n.value}</div>
            </React.Fragment>
          ))}
        </div>
        */}

        <div style={styles.section}>Elsewhere</div>
        <div style={styles.links}>
          {C.links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
               style={styles.link} onClick={(e) => e.stopPropagation()}>{l.label}</a>
          ))}
        </div>
      </div>

      <div style={styles.dots}>
        {PAINTINGS.map((_, j) => <span key={j} style={styles.dot(j === i)} />)}
      </div>

      <div style={styles.caption}>{P.title}</div>
      <div style={styles.flash} />
    </div>
  );
}

window.ThemeMonet = ThemeMonet;
