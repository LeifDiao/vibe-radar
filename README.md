# ClaudeRadar

<img width="1756" height="844" alt="Screenshot 2026-05-27 at 11 07 10 AM" src="https://github.com/user-attachments/assets/2364e5b4-a46b-4209-94e6-b45f5b1916fd" />

> **A Claude Code plugin that reads every session in `~/.claude/projects/` and grades how well you collaborate with AI.** 9 dimensions across 3 categories — Communication, Engineering, Outcome. Returns a free-form AI diagnosis and at-least-5 pastable improvement prompts. 100% local. Dashboard view.

🌏 [中文版](./README_zh.md) · 📖 [Methodology](./docs/METHODOLOGY.md) · ⚖️ [License](./LICENSE)

> **中文简介：** 一款 Claude Code 插件，扫描你 `~/.claude/projects/` 里的真实会话历史，从「沟通力 / 工程力 / 成效」三个层面、9 个维度评估你和 AI 的协作质量。生成一份 AI 撰写的协作诊断和至少 5 条可直接粘贴的改写 prompt，所有计算 100% 本地完成。完整中文文档 → [README_zh.md](./README_zh.md)

---

## Key features

**🎯 Reads your actual sessions, not synthetic prompts.** Most "AI productivity" tools test you on contrived examples. ClaudeRadar analyzes the real conversations you've had with Claude — every directing, correcting, and confirming message, plus every tool call you made.

**💬 AI writes you a coaching note, not just a scoreboard.** Beyond the 9 scores, you get a 150-word collaboration profile that describes how *you specifically* work with AI, a one-paragraph core diagnosis pairing your strongest strength with your most critical bottleneck, and a cross-dimension reading that explains how your behaviors combine. Every claim cites evidence from your real session.

**📋 Every suggestion is a pastable prompt.** No "be more thoughtful" advice. Each of the 5–7 improvement suggestions comes with a concrete prompt you can copy-paste straight into your next session, plus the expected score impact and the trade-off.

**⚖️ Project-aware fairness.** A 3-message bugfix isn't compared to a 50-session feature build. ClaudeRadar auto-classifies each project (`one-shot` / `feature-build` / `long-running` / `learning`) and applies different category weights and N/A rules. Density-based confidence prevents short-but-substantive sessions from being unfairly shrunk.

**🛠 Scores how you use the platform, not just how you talk.** The Engineering category specifically measures Skills, MCP servers, Subagents, CLAUDE.md, Plan mode, and custom commands — the leverage most users underuse. Not using advanced tools is fine; using them poorly (retry loops, plan-then-abandon) is what hurts.

**🔒 100% local, zero telemetry.** Read-only access to `~/.claude/projects/`. No API key, no cloud, no network calls. Bilingual (English + 中文) reports built in. The whole run takes about 30 seconds.

> **中文要点：**
> - **🎯 评估你真实的 Claude Code 会话历史**，不靠人工题库
> - **💬 AI 给你写诊断信**：协作画像 + 强项/瓶颈段 + 维度交叉解读，每条结论都引用真实证据
> - **📋 每条建议都附可粘贴 prompt**，不讲空话；附预期分数影响和取舍说明
> - **⚖️ 按项目类型公平评分**：bugfix 不和大项目用同一把尺子，密度高的短会话不会被打压
> - **🛠 专门评估平台杠杆**：Skill / MCP / Subagent / CLAUDE.md / Plan 模式 —— 不用不扣分，用得差才扣分
> - **🔒 100% 本地，零数据上传**，约 30 秒出报告，原生中英双语
>
> 完整中文版 → [README_zh.md](./README_zh.md)

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

ClaudeRadar is released under **CC BY-NC 4.0**:

- ✅ **Free** for personal, educational, research, and any non-commercial use
- ✅ **Forking, modifying, sharing** is welcomed — please attribute the original repo and indicate any changes you made
- ❌ **Commercial use** (bundling into paid products, internal use beyond individual scope in for-profit companies, paid SaaS hosting, selling reports/analyses based on the scoring) requires a separate license

**For commercial licensing**, contact: **leifdiao@gmail.com**

See [LICENSE](./LICENSE) for the full terms, including the 中文版说明.

---

*Built for people who care about the quality of AI collaboration.*
