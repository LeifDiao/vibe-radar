# ClaudeRadar

> **A Claude Code plugin that reads every session in `~/.claude/projects/` and grades how well you collaborate with AI.** 9 dimensions across 3 categories — Communication, Engineering, Outcome. Returns a free-form AI diagnosis and at-least-5 pastable improvement prompts. 100% local. Dashboard view.

🌏 [中文版](./README_zh.md) · 📖 [Methodology](./docs/METHODOLOGY.md) · ⚖️ [License](#license)

---

## Key features

- **9 dimensions across 3 categories** — Communication / Engineering / Outcome. The Engineering category evaluates how you leverage the platform: Skills, MCP, Subagents, CLAUDE.md, Plan mode.
- **Project profile auto-detection** — every project is auto-classified (one-shot / feature-build / long-running / learning). A 3-message bugfix isn't unfairly compared to a 50-session feature. Dimensions can be `N/A` per profile.
- **Free-form AI diagnosis** — a 150-word collaboration profile, a core strength + bottleneck paragraph, and a cross-dimension reading.
- **Pastable prompt rewrites** — every suggestion ships with a concrete prompt you can copy directly into your next session.
- **CWD detection** — `/claude-radar` first asks "analyze this project?" based on your current directory. No more scrolling through 100 projects.
- **Dashboard layout** — left nav + right content, with scroll-tracked highlighting.

---

## What the report includes

Run `/claude-radar` and get a single-file HTML dashboard:

**Overall grade** — S through D, paired with your project profile so you know what scale you're being judged on.

**Three category scorecards** — each scoring 0-100 with its 3 dimensions:

```
  COMMUNICATION  78  [A]    ENGINEERING  62  [B]    OUTCOME  80  [A]
  Lock-On        82          Toolcraft    68         Efficiency   88
  Scene Setting  71          Architecture N/A        Proof Check  62
  Steering       81          Tempo        56         Completion   90
```

**Diagnosis** — core insight (strength + bottleneck), a free-form collaboration profile, and a cross-dimension pattern reading. This is the part most users find valuable.

**Improvement plan** — 5-7 suggestions (always at least 5, even for high-scoring users), each with cited evidence, a pastable prompt rewrite, and the expected score impact. High-scoring users get "level-up moves" instead of corrective ones.

**Drill-downs** — detailed reasoning for each of the 9 dimensions, plus a Toolcraft & Architecture detail panel showing skills used, MCP servers, Plan mode usage, CLAUDE.md status, and more.

---

## Install

**Step 1** — Add the marketplace:

```
/plugin marketplace add LeifDiao/claude-radar
```

**Step 2** — Install the plugin:

```
/plugin install claude-radar@claude-radar-marketplace
```

**Alternative (local):**

```bash
git clone https://github.com/LeifDiao/claude-radar.git ~/claude-radar
claude --plugin-dir ~/claude-radar
```

---

## Use

```
/claude-radar
```

1. ClaudeRadar detects your current working directory and asks "analyze this project?"
2. Say yes, or pick from the recent-10 list
3. Wait ~30 seconds for parsing + diagnosis
4. The dashboard opens in your browser

---

## Requirements

- **Claude Code** with plugin support
- **Node.js 18+** (already ships with Claude Code)
- No `npm install`, no build step, no server

---

## Privacy

Your session data stays on your machine:

- Everything runs locally — no network calls
- No API key, no telemetry, no cloud
- `~/.claude/projects/` is read-only
- Reports write to `~/.claude-radar/reports/`
- CLAUDE.md / memory / agents detection only reads filesystem metadata, never file contents (except CLAUDE.md size)

---

## How scoring works

**Two-layer model:**

1. **Scoring** — deterministic baseline formula + bounded Claude ±15 adjustment with cited evidence. Total variance ~±3 points.
2. **Diagnosis** — independent qualitative pass. Free-form 150-word collaboration profile, core diagnosis, cross-dimension reading. Replaces MBTI.

**Fairness mechanisms:**

- **Project profile** drives category weighting and N/A dimensions
- **Density-based confidence** — a 5-message project with high signal density no longer gets unfairly shrunk
- **Efficiency as a first-class signal** — "3 messages, 5 files edited" is recognized as high efficiency, not penalized as low volume

👉 [Read the full Methodology](./docs/METHODOLOGY.md)

---

## Transparent rubric

All scoring rules live in [`data/rubric.json`](./data/rubric.json):

- 9 dimension definitions, baseline formulas, applicability rules
- 3 category groupings with per-profile weight tables
- Grade thresholds (S/A/B/C/D)
- Diagnosis and suggestion specifications
- Density-based confidence scaling

If you want scoring to match your team's standards, edit this file. Claude re-reads it every run.

---

## Project structure

```
claude-radar/
├── .claude-plugin/plugin.json        # plugin manifest
├── skills/analyze/
│   ├── SKILL.md                      # cwd detection + 9-dim scoring + diagnosis
│   └── scripts/
│       ├── list-projects.mjs         # scan projects + cwd match
│       ├── parse-project.mjs         # facts extraction (tool/skill/MCP/CLAUDE.md detection)
│       └── render-report.mjs         # JSON → HTML
├── viewer/template.html              # dashboard report template
├── data/rubric.json                  # 9-dim formulas + profile weights + diagnosis spec
└── docs/
    ├── METHODOLOGY.md                # methodology (English)
    └── METHODOLOGY_zh.md             # methodology (Chinese)
```

About 250 KB. Zero runtime dependencies.

---

## License

CC-BY-NC-4.0 — free for non-commercial use.

---

*Built for people who care about the quality of AI collaboration.*
