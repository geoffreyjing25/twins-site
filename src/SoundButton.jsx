// ============================================================
//  SoundButton — hidden YouTube iframe player.
//
//  Exposes window.toggleSound() and window.nextSound() so any
//  element on the page (e.g. the inline "flows" word in the bio)
//  can trigger / cycle playback. Also renders a very subtle
//  floating mini-chip in the bottom-left: just a tiny dot by
//  default that grows into a compact player on hover.
//
//  YouTube IDs (verified manually where noted):
//    - Soft Reading Chair (Lofi Chill):   3HWHsa_lxnc  (provided by user)
//    - Thank You (slowed) — Dido:         wwia7N1kTv4  (verified)
//    - Codeine Dreaming — Kodak Black:    g7_uKDsv7HM  (verified)
//    - 300 Violin Orchestra:              w_19wBuflgo  (verified)
//
//  If a video fails to load (region-blocked, removed, etc.) the
//  onError handler auto-skips to the next track.
// ============================================================

const DEFAULT_TRACKS = [
  { title: "soft reading chair",   artist: "Lofi Chill",      id: "3HWHsa_lxnc" },
  // { title: "codeine dreaming",     artist: "Kodak Black",     id: "g7_uKDsv7HM" },
  { title: "300 violin orchestra", artist: "Jorge Quintero",  id: "w_19wBuflgo" },
  { title: "NEVADA (super slowed)", artist: "Vicetone", id: "YRW9b-Qf2x0" },
  // { title: "thank you (slowed)", artist: "Dido", id: "wwia7N1kTv4" },
];

function SoundButton({ tracks: tracksProp } = {}) {
  const tracks = React.useMemo(() => {
    const src = Array.isArray(tracksProp) ? tracksProp : DEFAULT_TRACKS;
    return src.filter((t) => t && typeof t.id === "string" && t.id.trim().length > 0);
  }, [tracksProp]);
  const [on, setOn] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const playerRef = React.useRef(null);
  const containerId = "yt-player-host";

  const loadApi = React.useCallback(() => new Promise((res) => {
    if (window.YT && window.YT.Player) return res(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev && prev(); res(window.YT); };
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  }), []);

  const cycle = React.useCallback(() => {
    if (!tracks.length) return;
    setIdx((i) => {
      const next = (i + 1) % tracks.length;
      try { playerRef.current && playerRef.current.loadVideoById(tracks[next].id); } catch {}
      return next;
    });
    setOn(true);
  }, [tracks]);

  const start = React.useCallback(async () => {
    if (!tracks.length) return;
    const YT = await loadApi();
    if (!playerRef.current) {
      playerRef.current = new YT.Player(containerId, {
        height: "120", width: "200",
        videoId: tracks[0].id,
        playerVars: { autoplay: 1, playsinline: 1, controls: 0, modestbranding: 1 },
        events: {
          onReady: (e) => { setReady(true); try { e.target.setVolume(70); e.target.playVideo(); } catch {} },
          onStateChange: (e) => { if (e.data === 0) cycle(); },
          onError: () => cycle(),
        },
      });
    } else {
      try { playerRef.current.playVideo(); } catch {}
    }
    setOn(true);
  }, [cycle, loadApi, tracks]);

  const stop = React.useCallback(() => {
    try { playerRef.current && playerRef.current.pauseVideo(); } catch {}
    setOn(false);
  }, []);

  const toggle = React.useCallback(() => {
    if (on) stop();
    else if (ready) { try { playerRef.current.playVideo(); } catch {} setOn(true); }
    else start();
  }, [on, ready, start, stop]);

  React.useEffect(() => {
    window.toggleSound = toggle;
    window.nextSound = cycle;
    window.soundState = { on, idx, track: tracks[idx], tracks };
  }, [toggle, cycle, on, idx, tracks]);

  const t = tracks[idx] || { title: "—", artist: "", id: "" };

  return (
    <>
      {/* iframe host — kept tiny & offscreen but not 0x0; some browsers
          mute zero-sized players, so it sits 1px off-canvas instead. */}
      <div id={containerId} style={{
        position: "fixed", left: -500, top: -500, width: 200, height: 120,
        opacity: 0, pointerEvents: "none",
      }} />

      {/* subtle mini-chip bottom-left — tiny dot by default, expands on hover */}
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          position: "fixed", bottom: 20, left: 20, zIndex: 9999,
          display: "flex", alignItems: "center", gap: expanded ? 8 : 0,
          padding: expanded ? 6 : 5,
          background: expanded ? "rgba(18,18,18,0.72)" : "rgba(18,18,18,0.35)",
          backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 999,
          transition: "all .25s cubic-bezier(.2,.8,.2,1)",
          fontFamily: "'Inter Tight', sans-serif", color: "#fff",
          overflow: "hidden",
        }}>
        <button onClick={toggle} title={on ? "Pause" : "Play music"} style={{
          width: 22, height: 22, borderRadius: "50%", border: 0, cursor: "pointer",
          background: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
          color: on ? "#111" : "rgba(255,255,255,0.85)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, flexShrink: 0,
        }}>{on ? "❚❚" : "♪"}</button>
        {expanded && (
          <>
            <div style={{ fontSize: 10.5, lineHeight: 1.25, whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
              <div style={{ opacity: 0.55, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {on ? "now playing" : "sound"}
              </div>
              <div style={{ fontWeight: 500 }}>{t.title}</div>
            </div>
            <button onClick={cycle} title="Next" style={{
              width: 20, height: 20, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent", color: "#fff", cursor: "pointer", fontSize: 9, flexShrink: 0,
            }}>↻</button>
          </>
        )}
      </div>
    </>
  );
}

// ============================================================
//  FlowsTrigger — inline "flows" word that blends into the
//  surrounding text. At rest: identical to body text (no
//  underline, no color, no cursor change). On hover: a thin
//  dotted underline + tiny ♪ glyph fade in to reveal that it's
//  an Easter-egg. Click toggles sound playback.
// ============================================================
function FlowsTrigger({ color = "currentColor", word = "flows" }) {
  const [hover, setHover] = React.useState(false);
  return (
    <span
      onClick={() => window.toggleSound && window.toggleSound()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: "pointer",
        color: hover ? color : "inherit",
        background: "transparent",
        borderBottom: hover ? `1px dotted ${color}` : "none",
        paddingBottom: hover ? 1 : 0,
        transition: "color .25s, border-color .25s, opacity .25s",
        opacity: hover ? 1 : 1,
      }}
      title={hover ? "click to play" : undefined}
    >
      {word}
      <span aria-hidden style={{
        display: "inline-block", marginLeft: 3, color,
        opacity: hover ? 0.7 : 0,
        transform: hover ? "translateY(-1px) scale(1)" : "translateY(0) scale(0.7)",
        transition: "opacity .25s, transform .25s",
        fontSize: "0.85em", verticalAlign: "baseline",
      }}>♪</span>
    </span>
  );
}

window.SoundButton = SoundButton;
window.FlowsTrigger = FlowsTrigger;
