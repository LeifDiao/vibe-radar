# Changelog

All notable changes to ClaudeRadar are documented here.
This project follows [Semantic Versioning](https://semver.org/).

---

## [2.0.0] — 2026-05-27

First release under the new name **ClaudeRadar** (the project was previously called VibeRadar). This is a major rewrite — not back-compatible with v1.0.0 reports.

### Renamed

- Plugin → `claude-radar`
- Marketplace → `claude-radar-marketplace`
- Slash command → `/claude-radar`
- Data directory → `~/.claude-radar/`
- Repo → https://github.com/LeifDiao/claude-radar

### What's new

- **9 dimensions in 3 categories** — Communication (Lock-On / Scene Setting / Steering), Engineering (Toolcraft / Architecture / Tempo), Outcome (Efficiency / Proof Check / Completion). Replaces v1's flat 6-dimension model.
- **Project profile auto-detection** — every project is auto-classified as `one-shot` / `feature-build` / `long-running` / `learning`. Dimensions can be marked `N/A` per profile, and the overall score uses profile-aware category weights so a 3-message bugfix isn't unfairly compared to a 50-session feature build.
- **AI diagnosis layer** — replaces MBTI. Produces a free-form 150-word collaboration profile, a core diagnosis (strength + bottleneck) with paired evidence, and a cross-dimension reading. This is the part most users find valuable.
- **Pastable prompt rewrites** — every improvement suggestion ships with a concrete pastable prompt and an expected-impact note.
- **Min 5 improvement suggestions** — even for high-scoring users (level-up moves drawn from within-strong-dim push, cross-pollination, platform leverage, process habits, risk reduction).
- **CWD detection** — `/claude-radar` detects your current working directory and asks "analyze this project?" before showing a list. Parent-dir walk-up when you're in a subdirectory with no own Claude history.
- **Density-based confidence** — confidence is computed from signal density, not just message volume. A 5-message project with high signal density is no longer unfairly shrunk toward 50.
- **Engineering signals** — Skills, MCP, Subagents, Plan mode, custom slash commands, CLAUDE.md, memory directory, agents directory, settings.json are all detected and feed Toolcraft + Architecture scoring.
- **Toolcraft fairness** — baseline 60 (B grade for basic Edit/Bash/Read use). Not using advanced tools is no longer a penalty; using them poorly (retry loops after subagent calls, plan-then-abandon) is.
- **Language detection** — strips code blocks, inline code, and file paths before counting; dual-threshold (15% char ratio OR 30% per-message presence) so Chinese-dominant projects with English code/paths aren't mis-labeled as `en`.
- **Hero insight** — Claude writes a 60-110 char vivid one-liner (metaphor + contrast). Explicit style rules prevent stat-dumps.
- **Dashboard layout** — left nav + right content with scroll-tracked highlighting. 3 columns × 3 rows for the dimension grid.

### Removed

- **MBTI 16 archetypes** — replaced by free-form collaboration profile.
- **Radar chart** — replaced by 3-card scorecard layout.
- **v1 report format** — `schemaVersion 1.0` reports are no longer renderable. Re-run `/claude-radar` to generate a new report.

### Migration for VibeRadar users

```
/plugin marketplace remove vibe-radar-marketplace
/plugin marketplace add LeifDiao/claude-radar
/plugin install claude-radar@claude-radar-marketplace
rm -rf ~/.vibe-radar  # optional, removes old reports
```

---

## [1.0.0] — 2026-04-12

First public release (as VibeRadar).

### Architecture

- Claude Code plugin — analysis runs inside the user's own Claude Code session
- Single-file HTML report with data, styles, and JS all inlined
- Zero runtime dependencies (no `node_modules`)
- Total plugin size: ~200 KB

### Analysis Engine

- **Position-aware signals** — every user message is classified into one of 5 positions (opening / directing / correcting / confirming / continuing), and each dimension reads signals only from its designated position. This made the 6 dimensions genuinely orthogonal.
- **Formula + adjustment scoring** — deterministic baseline formula (0 run-to-run variance) + Claude's bounded ±15 qualitative adjustment (must cite evidence). Total variance ~±3 points.
- **Confidence scaling** — scores shrink toward 50 when data is sparse.
- **6 dimensions**: Lock-On 瞄准力 / Scene Setting 画面感 / Unpack 拆弹术 / Steering 导航力 / Proof Check 鉴定术 / Tempo 节奏感
- **5 grades** (S / A / B / C / D) with bilingual labels
- **16 MBTI collaboration archetypes** derived from behavioral signals

### Security & Privacy

- 100% local — no network calls
- No credentials, API keys, or telemetry
- Read-only `~/.claude/projects/`
- `disable-model-invocation: true` — explicit invocation only

---
