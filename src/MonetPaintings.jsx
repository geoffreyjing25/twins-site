// ============================================================
//  Procedural SVG paintings for the Monet page.
//
//  Each painting is a stylized homage — not a reproduction —
//  rendered from seeded noise so it's deterministic and looks
//  identical on every load. Zero external dependencies, so the
//  page never depends on a CDN, museum CORS policy, etc.
//
//  Exposed via window.MonetPaintings = { monet, vangogh, dali,
//  shanshui, hokusai }.
// ============================================================

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1600, H = 1000;

function strokes(rnd, n, cfg) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = cfg.xMin + rnd() * (cfg.xMax - cfg.xMin);
    const y = cfg.yMin + rnd() * (cfg.yMax - cfg.yMin);
    const len = cfg.lenMin + rnd() * (cfg.lenMax - cfg.lenMin);
    const wdt = cfg.wMin + rnd() * (cfg.wMax - cfg.wMin);
    const ang = cfg.angMin + rnd() * (cfg.angMax - cfg.angMin);
    const color = cfg.palette[Math.floor(rnd() * cfg.palette.length)];
    const op = cfg.opMin + rnd() * (cfg.opMax - cfg.opMin);
    out.push({ x, y, len, wdt, ang, color, op });
  }
  return out;
}

function Stroke({ s }) {
  const rad = s.ang * Math.PI / 180;
  return (
    <line
      x1={s.x - Math.cos(rad) * s.len / 2} y1={s.y - Math.sin(rad) * s.len / 2}
      x2={s.x + Math.cos(rad) * s.len / 2} y2={s.y + Math.sin(rad) * s.len / 2}
      stroke={s.color} strokeWidth={s.wdt} strokeLinecap="round" opacity={s.op}
    />
  );
}

// ---------- 1. Monet: Impression, Sunrise ----------
function MonetPainting({ sunY = 0 }) {
  const rnd = React.useMemo(() => mulberry32(42), []);
  const sky = ["#d9c9b1", "#d7bca4", "#c9a997", "#b89a8e", "#a69896"];
  const cloud = ["#e7d6c2", "#d6c4b4", "#c9b3a0"];
  const waterDark = ["#4f5660", "#59616d", "#6a7280", "#7b8390"];
  const waterLite = ["#b6bcc3", "#c9ccd1", "#a7adb5"];
  const sunOrange = ["#e8703a", "#f08648", "#d8642c", "#ec8a55"];
  const warmDab = ["#f2a878", "#e78656", "#d9653a"];

  const all = React.useMemo(() => [
    ...strokes(rnd, 260, { xMin:0, xMax:W, yMin:0, yMax:540, lenMin:60, lenMax:180, wMin:6, wMax:14, angMin:-6, angMax:6, palette:sky, opMin:0.5, opMax:0.95 }),
    ...strokes(rnd, 80,  { xMin:0, xMax:W, yMin:60, yMax:340, lenMin:120, lenMax:260, wMin:8, wMax:18, angMin:-4, angMax:4, palette:cloud, opMin:0.3, opMax:0.7 }),
    ...strokes(rnd, 220, { xMin:0, xMax:W, yMin:560, yMax:1000, lenMin:70, lenMax:200, wMin:6, wMax:14, angMin:-3, angMax:3, palette:waterDark, opMin:0.6, opMax:0.95 }),
    ...strokes(rnd, 140, { xMin:0, xMax:W, yMin:580, yMax:980, lenMin:50, lenMax:140, wMin:4, wMax:10, angMin:-3, angMax:3, palette:waterLite, opMin:0.4, opMax:0.8 }),
    ...Array.from({ length: 120 }, () => {
      const y = 620 + rnd() * 340;
      const x = 1020 + (rnd() - 0.5) * 220;
      return { x, y, len: 40 + rnd() * 120, wdt: 4 + rnd() * 8, ang: (rnd() - 0.5) * 6, color: sunOrange[Math.floor(rnd() * sunOrange.length)], op: 0.65 + rnd() * 0.3 };
    }),
    ...strokes(rnd, 60, { xMin:400, xMax:1500, yMin:480, yMax:600, lenMin:30, lenMax:90, wMin:5, wMax:10, angMin:-4, angMax:4, palette:warmDab, opMin:0.45, opMax:0.8 }),
  ], [rnd]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
      <defs>
        <filter id="monet-blur"><feGaussianBlur stdDeviation="1.2"/></filter>
        <radialGradient id="sun-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#f4a26a" stopOpacity="0.85"/>
          <stop offset=".4" stopColor="#e67a44" stopOpacity="0.4"/>
          <stop offset="1" stopColor="#e67a44" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#c9b3a0"/>
      <rect y={540} width={W} height={460} fill="#5f6a7a"/>
      <g opacity="0.45" filter="url(#monet-blur)">
        <ellipse cx="280" cy="200" rx="360" ry="40" fill="#e7d6c2"/>
        <ellipse cx="1150" cy="140" rx="420" ry="34" fill="#ecd9c4"/>
      </g>
      <g filter="url(#monet-blur)">{all.map((s, i) => <Stroke key={i} s={s}/>)}</g>
      <g style={{ transition:"transform .6s cubic-bezier(.2,.8,.2,1)", transform:`translateY(${sunY}px)` }}>
        <circle cx="1080" cy="440" r="300" fill="url(#sun-glow)"/>
        <circle cx="1080" cy="440" r="40" fill="#e8703a"/>
      </g>
      <g opacity="0.72" filter="url(#monet-blur)">
        <path d="M420 720 q30 -24 60 0 l-8 14 h-44 z" fill="#2a2a30"/>
        <line x1="450" y1="676" x2="450" y2="720" stroke="#2a2a30" strokeWidth="2"/>
        <path d="M300 790 q40 -28 80 0 l-10 16 h-60 z" fill="#1e1e24"/>
        <line x1="340" y1="742" x2="340" y2="790" stroke="#1e1e24" strokeWidth="2"/>
      </g>
    </svg>
  );
}

// ---------- 2. Van Gogh: The Starry Night ----------
function VanGoghPainting() {
  const rnd = React.useMemo(() => mulberry32(7), []);
  const darkBlue = ["#0f1e4a", "#152b66", "#1e3b7a", "#2a4a8c"];
  const midBlue  = ["#3c5aa6", "#4a6abf", "#5a7dd0"];
  const liteBlue = ["#88a6e0", "#a8bce8", "#c4d2ee"];
  const hills    = ["#1a3450", "#203b5a", "#274468"];

  const spiralPts = (cx, cy, r0, turns, steps) => {
    const arr = [];
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * turns * Math.PI * 2;
      const r = r0 + t * 6;
      arr.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
    }
    return "M " + arr.map(p => p.join(",")).join(" L ");
  };

  const skyStrokes = React.useMemo(() => [
    ...strokes(rnd, 380, { xMin:0, xMax:W, yMin:0, yMax:720, lenMin:50, lenMax:140, wMin:8, wMax:18, angMin:-40, angMax:40, palette:darkBlue, opMin:0.6, opMax:0.95 }),
    ...strokes(rnd, 220, { xMin:0, xMax:W, yMin:0, yMax:720, lenMin:40, lenMax:100, wMin:5, wMax:12, angMin:-80, angMax:80, palette:midBlue, opMin:0.5, opMax:0.85 }),
    ...strokes(rnd, 120, { xMin:0, xMax:W, yMin:0, yMax:680, lenMin:30, lenMax:80, wMin:4, wMax:10, angMin:-60, angMax:60, palette:liteBlue, opMin:0.4, opMax:0.75 }),
  ], [rnd]);

  const hillStrokes = React.useMemo(() =>
    strokes(rnd, 220, { xMin:0, xMax:W, yMin:680, yMax:1000, lenMin:40, lenMax:120, wMin:6, wMax:14, angMin:-20, angMax:20, palette:hills, opMin:0.7, opMax:0.95 }),
  [rnd]);

  const stars = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      arr.push({ x: 50 + rnd() * (W - 100), y: 40 + rnd() * 600, r: 10 + rnd() * 22 });
    }
    return arr;
  }, [rnd]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
      <defs>
        <filter id="vg-blur"><feGaussianBlur stdDeviation="0.8"/></filter>
        <radialGradient id="vg-star" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff3b8" stopOpacity="0.95"/>
          <stop offset=".4" stopColor="#f6c84c" stopOpacity="0.6"/>
          <stop offset="1" stopColor="#f6c84c" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="vg-moon" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff6c4" stopOpacity="1"/>
          <stop offset=".6" stopColor="#f6c84c" stopOpacity="0.7"/>
          <stop offset="1" stopColor="#f6c84c" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#0a1530"/>
      <g filter="url(#vg-blur)">{skyStrokes.map((s,i) => <Stroke key={i} s={s}/>)}</g>
      <path d={spiralPts(780, 380, 20, 3.2, 200)} stroke="#6a8bd8" strokeWidth="14" fill="none" opacity="0.55" strokeLinecap="round"/>
      <path d={spiralPts(780, 380, 60, 2.2, 150)} stroke="#a8bce8" strokeWidth="8" fill="none" opacity="0.65" strokeLinecap="round"/>
      <circle cx="1320" cy="200" r="180" fill="url(#vg-moon)"/>
      <circle cx="1320" cy="200" r="58" fill="#ffd970" opacity="0.9"/>
      {stars.map((s,i) => <circle key={i} cx={s.x} cy={s.y} r={s.r * 2} fill="url(#vg-star)"/>)}
      {stars.slice(0,8).map((s,i) => <circle key={"c"+i} cx={s.x} cy={s.y} r={s.r * 0.4} fill="#fff3b8"/>)}
      <rect y={740} width={W} height={260} fill="#152745"/>
      <g filter="url(#vg-blur)">{hillStrokes.map((s,i) => <Stroke key={i} s={s}/>)}</g>
      <path d="M180 1000 L180 360 Q220 280 200 160 Q260 240 240 340 Q290 260 260 420 Q310 400 280 520 Q330 500 290 640 L320 1000 Z" fill="#0a1a2e"/>
      <g opacity="0.85">
        {[580, 660, 740, 820, 900, 980].map(x => (
          <rect key={x} x={x} y={810} width="4" height="10" fill="#f6c84c"/>
        ))}
      </g>
      <polygon points="700,700 720,780 680,780" fill="#0a1a2e"/>
      <rect x="686" y="780" width="28" height="60" fill="#0a1a2e"/>
    </svg>
  );
}

// ---------- 3. Dalí: The Persistence of Memory ----------
function DaliPainting() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
      <defs>
        <linearGradient id="dali-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a88a5a"/>
          <stop offset=".55" stopColor="#d8b878"/>
          <stop offset="1" stopColor="#e8c890"/>
        </linearGradient>
        <linearGradient id="dali-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c4a68"/>
          <stop offset="1" stopColor="#1a2a3e"/>
        </linearGradient>
        <linearGradient id="dali-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a4a2a"/>
          <stop offset="1" stopColor="#2e1e10"/>
        </linearGradient>
        <radialGradient id="dali-glow" cx=".5" cy=".6" r=".6">
          <stop offset="0" stopColor="#f5d89a" stopOpacity="0.45"/>
          <stop offset="1" stopColor="#f5d89a" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={W} height={650} fill="url(#dali-sky)"/>
      <rect y={650} width={W} height={80} fill="url(#dali-sea)"/>
      <path d="M1100 650 L1200 560 L1280 580 L1360 520 L1440 540 L1520 500 L1600 520 L1600 650 Z" fill="#b8986a"/>
      <path d="M1100 650 L1200 580 L1280 600 L1360 560 L1440 580 L1520 560 L1600 570 L1600 650 Z" fill="#a88a5a" opacity="0.7"/>
      <rect y={730} width={W} height={270} fill="url(#dali-ground)"/>
      <ellipse cx={W/2} cy={730} rx={W*0.6} ry="18" fill="url(#dali-glow)"/>
      <rect x="0" y="720" width="480" height="8" fill="#3a2616"/>
      <rect x="0" y="728" width="480" height="140" fill="#4a3020"/>
      {/* Dead olive tree */}
      <g>
        <rect x="240" y="560" width="22" height="180" fill="#2a1a0e"/>
        <path d="M251 560 Q160 500 140 420 Q210 460 251 540 Z" fill="#2a1a0e"/>
        <path d="M251 560 Q320 520 360 470 Q320 560 270 580 Z" fill="#2a1a0e"/>
      </g>
      {/* Melting clock on tree branch */}
      <g>
        <ellipse cx="300" cy="500" rx="58" ry="52" fill="#c4a86a"/>
        <path d="M305 548 Q320 580 300 620 Q280 580 295 548 Z" fill="#c4a86a"/>
        <ellipse cx="300" cy="500" rx="58" ry="52" fill="none" stroke="#3a2616" strokeWidth="4"/>
        <line x1="300" y1="500" x2="300" y2="460" stroke="#1a1008" strokeWidth="3"/>
        <line x1="300" y1="500" x2="332" y2="500" stroke="#1a1008" strokeWidth="3"/>
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
          const a = i * Math.PI / 6 - Math.PI / 2;
          const x1 = 300 + Math.cos(a) * 52, y1 = 500 + Math.sin(a) * 48;
          const x2 = 300 + Math.cos(a) * 58, y2 = 500 + Math.sin(a) * 54;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1008" strokeWidth="2"/>;
        })}
      </g>
      {/* Melting clock draped on the table edge */}
      <g>
        <path d="M80 700 Q120 700 160 702 L160 740 Q200 760 260 740 L260 702 Q300 700 320 700 L320 728 L80 728 Z" fill="#4a5a3a"/>
        <path d="M80 700 Q120 700 160 702 L160 740 Q200 760 260 740 L260 702 Q300 700 320 700 L320 728 L80 728 Z" fill="none" stroke="#2a3420" strokeWidth="3"/>
        <circle cx="200" cy="720" r="4" fill="#1a1008"/>
      </g>
      {/* Soft clock leaning against the platform */}
      <g transform="translate(540 720) rotate(-8)">
        <ellipse cx="0" cy="0" rx="80" ry="24" fill="#c4a86a"/>
        <ellipse cx="0" cy="0" rx="80" ry="24" fill="none" stroke="#3a2616" strokeWidth="4"/>
      </g>
      {/* Amoeba form (central distorted face/object) */}
      <path d="M650 820 Q720 760 820 780 Q900 800 870 860 Q820 900 720 890 Q640 880 650 820 Z" fill="#9a7a5a" opacity="0.9"/>
      <ellipse cx="730" cy="830" rx="10" ry="20" fill="#2a1a0e"/>
    </svg>
  );
}

// ---------- 4. Fan Kuan: Travelers Among Mountains and Streams ----------
function ShanShuiPainting() {
  const rnd = React.useMemo(() => mulberry32(11), []);
  const ink = ["#1a1a1a", "#2a2420", "#3a3228", "#4a4038"];
  const paperBase = "#e8e0c8";

  const peakStrokes = React.useMemo(() =>
    strokes(rnd, 520, { xMin:500, xMax:1100, yMin:80, yMax:700, lenMin:10, lenMax:30, wMin:1, wMax:3, angMin:70, angMax:110, palette:ink, opMin:0.35, opMax:0.75 }),
  [rnd]);

  const texturePoints = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 400; i++) {
      arr.push({ x: 100 + rnd() * 1400, y: 780 + rnd() * 220, r: 0.6 + rnd() * 1.2, op: 0.2 + rnd() * 0.4 });
    }
    return arr;
  }, [rnd]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
      <defs>
        <filter id="ss-paper">
          <feTurbulence baseFrequency="0.9" numOctaves="2" seed="3"/>
          <feColorMatrix values="0 0 0 0 0.88  0 0 0 0 0.82  0 0 0 0 0.72  0 0 0 0.08 0"/>
          <feComposite in2="SourceGraphic" operator="in"/>
        </filter>
        <linearGradient id="ss-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={paperBase} stopOpacity="1"/>
          <stop offset=".6" stopColor={paperBase} stopOpacity="0.2"/>
          <stop offset="1" stopColor={paperBase} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={paperBase}/>
      <rect width={W} height={H} fill="#c8b890" opacity="0.25" filter="url(#ss-paper)"/>

      {/* Distant mist peaks */}
      <path d="M0 500 Q200 400 400 460 T800 440 T1200 450 T1600 430 L1600 700 L0 700 Z" fill="#b8b0a0" opacity="0.45"/>

      {/* Central towering peak */}
      <path d="M620 780 L640 620 L660 500 Q690 380 740 260 Q790 140 830 90 Q860 180 880 260 Q920 380 950 480 L970 600 L990 780 Z" fill="#3a3228" opacity="0.92"/>
      <path d="M620 780 L640 620 L660 500 Q690 380 740 260 Q790 140 830 90 Q860 180 880 260 Q920 380 950 480 L970 600 L990 780 Z" fill="url(#ss-mist)"/>
      <g>{peakStrokes.map((s,i) => <Stroke key={i} s={s}/>)}</g>

      <path d="M300 780 L340 600 Q380 500 420 440 Q460 500 500 600 L540 780 Z" fill="#2a2420" opacity="0.85"/>
      <path d="M1050 780 L1090 620 Q1130 520 1180 460 Q1220 520 1260 620 L1300 780 Z" fill="#2a2420" opacity="0.85"/>

      {/* Waterfall */}
      <path d="M800 260 Q798 400 804 560 Q800 620 798 700" stroke={paperBase} strokeWidth="6" fill="none" opacity="0.95"/>
      <path d="M800 260 Q798 400 804 560 Q800 620 798 700" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8"/>

      {/* Mid-ground mist band */}
      <rect y={700} width={W} height={90} fill={paperBase} opacity="0.85"/>
      <rect y={700} width={W} height={90} fill="url(#ss-mist)"/>

      <path d="M0 780 Q200 760 400 770 T800 765 T1200 770 T1600 760 L1600 1000 L0 1000 Z" fill="#5a4a3a" opacity="0.7"/>

      {/* Twisted trees */}
      <g stroke="#1a1208" strokeWidth="3" fill="none">
        <path d="M480 820 Q470 760 490 720 Q478 690 500 660"/>
        <path d="M500 660 Q480 650 470 630"/>
        <path d="M500 660 Q520 650 530 640"/>
        <path d="M490 720 Q510 710 525 695"/>
        <path d="M1120 820 Q1130 770 1110 720 Q1130 690 1110 660"/>
        <path d="M1110 660 Q1090 650 1080 635"/>
        <path d="M1110 660 Q1130 650 1140 640"/>
      </g>
      <g fill="#1a1208" opacity="0.75">
        <circle cx="498" cy="660" r="10"/><circle cx="512" cy="658" r="8"/><circle cx="486" cy="664" r="7"/>
        <circle cx="1108" cy="660" r="10"/><circle cx="1122" cy="658" r="8"/><circle cx="1095" cy="664" r="7"/>
      </g>

      {/* Two travelers */}
      <g fill="#1a1208">
        <ellipse cx="720" cy="870" rx="5" ry="8"/>
        <ellipse cx="736" cy="872" rx="5" ry="8"/>
        <line x1="720" y1="878" x2="720" y2="895" stroke="#1a1208" strokeWidth="2"/>
        <line x1="736" y1="880" x2="736" y2="895" stroke="#1a1208" strokeWidth="2"/>
      </g>

      <g fill="#1a1208">{texturePoints.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} opacity={p.op}/>)}</g>

      {/* Red seal */}
      <g transform="translate(1480 880)">
        <rect width="48" height="48" fill="#a02820" opacity="0.85"/>
        <text x="24" y="20" fill="#e8e0c8" fontSize="14" textAnchor="middle" fontFamily="serif">江</text>
        <text x="24" y="38" fill="#e8e0c8" fontSize="14" textAnchor="middle" fontFamily="serif">山</text>
      </g>
    </svg>
  );
}

// ---------- 5. Hokusai: The Great Wave off Kanagawa ----------
function HokusaiPainting() {
  const rnd = React.useMemo(() => mulberry32(23), []);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
      <defs>
        <linearGradient id="hk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8dcc0"/>
          <stop offset="1" stopColor="#d4c4a0"/>
        </linearGradient>
        <linearGradient id="hk-wave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a3a6a"/>
          <stop offset="1" stopColor="#0f2448"/>
        </linearGradient>
        <linearGradient id="hk-wave-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a6ca0"/>
          <stop offset="1" stopColor="#1a3a6a"/>
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#hk-sky)"/>
      <g opacity="0.5">
        <ellipse cx="1200" cy="180" rx="280" ry="18" fill="#b8a888"/>
        <ellipse cx="400" cy="220" rx="220" ry="14" fill="#b8a888"/>
      </g>
      {/* Mount Fuji */}
      <g>
        <path d="M640 620 L820 280 L1000 620 Z" fill="#a8b8c8"/>
        <path d="M740 420 L820 280 L900 420 Q880 410 820 425 Q760 410 740 420 Z" fill="#f4ecdc"/>
        <path d="M820 280 L830 300 L810 310 Z" fill="#d8d0c0" opacity="0.6"/>
      </g>
      <rect y={620} width={W} height={380} fill="url(#hk-wave)"/>
      <path d="M0 680 Q400 620 800 680 T1600 660 L1600 780 L0 780 Z" fill="url(#hk-wave-mid)"/>
      <path d="M0 680 Q400 620 800 680 T1600 660" stroke="#e8dcc0" strokeWidth="2" fill="none" opacity="0.6"/>
      <path d="M400 580 Q500 500 640 540 Q720 560 800 580 L800 620 L400 620 Z" fill="#3a6ca0" opacity="0.9"/>
      <g fill="#f4ecdc">
        <path d="M560 540 Q555 510 570 490 Q575 520 565 545 Z"/>
        <path d="M590 535 Q585 510 600 495 Q600 520 595 540 Z"/>
        <path d="M620 542 Q615 520 628 502 Q628 525 622 542 Z"/>
      </g>
      {/* The great wave */}
      <path d="M-50 700 Q 100 580 260 540 Q 420 500 560 440 Q 700 380 820 340 Q 880 325 920 340 Q 980 360 960 420 Q 930 460 880 450 Q 820 440 800 480 Q 780 520 830 540 Q 900 560 980 540 Q 1060 520 1100 500 L 1100 1000 L -50 1000 Z" fill="url(#hk-wave)"/>
      <path d="M-50 700 Q 100 580 260 540 Q 420 500 560 440 Q 700 380 820 340 Q 880 325 920 340 Q 980 360 960 420 Q 930 460 880 450" stroke="#e8dcc0" strokeWidth="3" fill="none" opacity="0.8"/>
      <g fill="#f4ecdc">
        {[[740, 340],[770, 335],[800, 330],[830, 332],[860, 340],[890, 350],[920, 360]].map(([x,y], i) => (
          <path key={i} d={`M ${x} ${y} Q ${x-4} ${y-30-i*4} ${x+2} ${y-55-i*5} Q ${x+8} ${y-30-i*3} ${x+12} ${y} Z`} opacity="0.95"/>
        ))}
        {Array.from({length:30}, (_,i) => {
          const x = 600 + rnd() * 320;
          const y = 260 + rnd() * 100;
          const r = 2 + rnd() * 4;
          return <circle key={"d"+i} cx={x} cy={y} r={r} opacity={0.6 + rnd() * 0.4}/>;
        })}
        {[[120, 600],[160, 580],[200, 570],[240, 555],[280, 560]].map(([x,y], i) => (
          <ellipse key={"l"+i} cx={x} cy={y} rx={18 + i * 2} ry={8} opacity="0.7"/>
        ))}
      </g>
      <g>
        <path d="M0 880 Q200 820 400 880 T800 880 T1200 880 T1600 870 L1600 1000 L0 1000 Z" fill="#1a3a6a"/>
        <path d="M0 880 Q200 820 400 880 T800 880 T1200 880 T1600 870" stroke="#e8dcc0" strokeWidth="2" fill="none" opacity="0.5"/>
      </g>
      <g fill="#2a2010" opacity="0.9">
        <path d="M380 680 Q460 664 560 680 L540 696 L400 696 Z"/>
        <path d="M720 560 Q800 544 900 560 L880 574 L740 574 Z"/>
      </g>
    </svg>
  );
}

window.MonetPaintings = {
  monet: MonetPainting,
  vangogh: VanGoghPainting,
  dali: DaliPainting,
  shanshui: ShanShuiPainting,
  hokusai: HokusaiPainting,
};
