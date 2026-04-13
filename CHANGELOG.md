# Changelog

All notable changes to VibeRadar are documented here.
This project follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-04-12

First public release.

### Architecture

- Claude Code plugin — analysis runs inside the user's own Claude Code session
- Single-file HTML report with data, styles, and JS all inlined
- Zero runtime dependencies (no `node_modules`)
- Total plugin size: ~200 KB

### Analysis Engine

- **Position-aware signals** — every user message is classified into one of 5 positions (opening / directing / correcting / confirming / continuing), and each dimension reads signals only from its designated position. This makes the 6 dimensions genuinely orthogonal.
- **Formula + adjustment scoring** — deterministic baseline formula (0 run-to-run variance) + Claude's bounded ±15 qualitative adjustment (must cite evidence). Total variance ~±3 points.
- **Confidence scaling** — scores shrink toward 50 when data is sparse (<5 sessions: 30% shrink, 5-14: 15%, 15+: none).
- **6 dimensions**: Lock-On 瞄准力 / Scene Setting 画面感 / Unpack 拆弹术 / Steering 导航力 / Proof Check 鉴定术 / Tempo 节奏感
- **5 grades** (S / A / B / C / D) with bilingual labels
- **16 MBTI collaboration archetypes** derived from behavioral signals (reasoning chains, directive density, session arc linearity, correction priorities) — not just keyword matching.
- **3-7 actionable suggestions**, count driven by real issues

### Parser

- 17 content labels per message, counted globally and per position
- 6 behavior patterns with improved detection (blind accepts now filter out confirmed-execution false positives; topic drifts require 3 consecutive unrelated messages and skip messages sharing file paths)
- MBTI balance values (-1 to +1) combining behavioral + keyword signals per axis
- Behavioral MBTI signals: reasoningChainRatio, directiveRatio, concreteRefDensity, sessionArcLinearity, directionChangeCount, correcting-position T/F density
- 524 tech stack keywords with word-boundary matching
- Session flow summaries, key messages, sample exchanges for Claude's qualitative judgment
- Automatic filtering of system-injected messages
- File size limit (50MB) to prevent memory issues

### UI

- Credential card design with holographic animated borders
- Radar credential: overall grade in center, pulse animation, score bars, brand watermark
- MBTI credential: per-letter gradient coloring, embedded mini-radar, axis bars with per-axis colors
- Dark + light mode with OS preference detection
- Bilingual (EN / 中文) with live switching
- Hexagonal radar chart (pure SVG)
- Responsive, print-friendly

### Security & Privacy

- 100% local — no network calls
- No credentials, API keys, or telemetry
- Read-only `~/.claude/projects/`; writes only `~/.vibe-radar/{temp,reports}/`
- `disable-model-invocation: true` — explicit invocation only
- `allowed-tools` scoped to `Bash(node *) Read Write`

---

*VibeRadar 1.0.0 is the first public release as a Claude Code plugin.*
