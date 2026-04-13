[中文版](./METHODOLOGY_zh.md)

# VibeRadar — Methodology

> VibeRadar is not focused on code output itself. It focuses on how you build high-quality collaboration with AI.
>
> This document is both the public scoring specification Claude follows and the rationale behind each score in your report. Use it to understand the scoring logic and adapt it to your team's workflow.

---

## 1. Why VibeRadar Exists

You've probably had hundreds of conversations with Claude Code: shipping features, chasing bugs, reshaping projects. Some sessions move with clarity and momentum. Others are worth revisiting to identify which parts of the collaboration can be improved.

VibeRadar focuses on the behaviors that shape collaboration quality most directly: context setting, instruction quality, course correction, and verification.

It turns those scattered habits into a structured report that helps you identify existing strengths, surface improvement opportunities, and steadily refine the way you work with AI.

Most developer tools measure **output** — lines of code, test coverage, PR throughput. VibeRadar measures **collaboration input**: how you ask, how you guide, how you verify, how you close the loop. Those behaviors shape whether AI collaboration produces faster progress or extra coordination and rework.

---

## 2. Design Principles

1. **Evidence first.** Every score should trace back to concrete, countable session signals.
2. **Privacy is non-negotiable.** Session data stays local. No cloud, no API key, no telemetry.
3. **Stay conservative when data is thin.** Sparse evidence gets confidence-scaled and clearly flagged to avoid over-reading.
4. **Recommendations should be actionable.** Every report ends with 3 to 7 *actionable* next steps.
5. **Light enough for repeated use.** The plugin stays under 200 KB, has zero runtime dependencies, and outputs a single HTML file.
6. **Position changes meaning.** The same signal should not count as the same behavior in every part of a conversation.
7. **Formulas ensure consistency, Claude adds context.** Start with a reproducible baseline, then allow bounded contextual judgment.

---

## 3. How It Works

```
~/.claude/projects/<slug>/*.jsonl
         │
         ▼
   [parse-project.mjs]           ← Deterministic. Position-aware signal extraction.
         │ facts.json
         ▼
    [Claude in the skill]        ← Reads rubric.json. Two-step scoring: formula + adjustment.
         │ report.json
         ▼
   [render-report.mjs]           ← Pure transform. JSON + template → HTML.
         │
         ▼
  ~/.vibe-radar/reports/<slug>-<ts>.html
```

Three clearly separated stages:

- **Parser** is deterministic. Same input → same facts. It outputs **position-classified signals** and **behavioral MBTI signals**.
- **Scorer** is Claude, running inside your Claude Code session. It computes a **formula baseline** from signals, applies **confidence scaling**, and then adds a **bounded qualitative adjustment** (±15 points max) based on message content.
- **Renderer** produces a single HTML report with data, styles, and JS all inlined.

No external API calls, no cloud processing, and no server dependency.

---

## 4. The Core Innovation: Position-Aware Signals

### The Problem with Global Counting

A naive approach counts signals globally — a `hasFilePath` is a `hasFilePath` regardless of where it appeared. But the same signal at different conversation positions means different things:

| Position | `hasFilePath` meaning |
|---|---|
| **Opening** (first 2 messages) | Context — setting the stage for AI |
| **Directing** (new task instruction) | Intent — precisely specifying what to change |
| **Correcting** (after AI error) | Feedback — pointing to where AI went wrong |
| **Confirming** (short ack after AI output) | Not meaningful |

Global counting caused **signal cross-contamination**: a user who frequently cited file paths got boosted on Intent, Context, AND Feedback from the same behavior. Three dimensions scored from one signal.

### The Solution: Route Signals to Positions

VibeRadar classifies every user message into one of 5 positions before counting signals:

| Position | Definition |
|---|---|
| `opening` | First 2 user messages per session |
| `directing` | New task or instruction (not reacting to AI output) |
| `correcting` | After AI produced output + user shows correction intent |
| `confirming` | After AI produced output + user gives short acknowledgment |
| `continuing` | Everything else |

Each dimension reads signals **only from its designated position**:

| Dimension | Primary Position | What it reads |
|---|---|---|
| **Lock-On** | `directing` | Goal clarity, constraints, specificity *in task instructions* |
| **Scene Setting** | `opening` | Tech stack, file paths, project structure *in session setup* |
| **Unpack** | `global` | Demand overload, progressive structure (inherently cross-positional) |
| **Steering** | `correcting` | Reasoning, specificity *in corrections after AI errors* |
| **Proof Check** | `confirming` + global | Blind accepts *in confirmations* + proactive testing requests |
| **Tempo** | `global` | Summaries, milestones, topic coherence (inherently cross-positional) |

This makes dimensions **truly orthogonal**: the same raw signal gets routed to different dimensions based on conversational context.

---

## 5. The 6 Dimensions

### Dimension 1 — Lock-On

**What it measures:** How precisely you express what you want *when giving a new instruction*.

**Why it matters:** Goal clarity sets the ceiling for output quality. Vague asks usually produce vague results.

**Position:** `directing` — messages where you're giving AI a new task (not reacting to output).

**Signals (from directing position):**

| Signal | What it captures |
|---|---|
| `hasExpectedBehavior` | Goal-setting language |
| `hasConstraint` | Boundaries and restrictions |
| `isVague` | Hedging: "help me / fix this" |
| `hasIdentifier` | References to specific code elements |

**The "Silent Expert" Pattern:**

A common false negative: experienced users write `"change validateToken in src/auth/middleware.ts:45 to async, return Promise<TokenResult>"`. This is already highly precise, but may hit zero keyword matches for `hasExpectedBehavior` or `hasConstraint`. The formula baseline will score it moderately, while Claude's ±15 adjustment can recognize it as high intent and adjust upward.

**Scoring anchors:**

| Score | What it looks like |
|---|---|
| 0-20 | Vague one-liners, no goals |
| 21-40 | Some goals but often unclear |
| 41-60 | Moderately clear most of the time |
| 61-80 | Clear goals + constraints in most asks |
| 81-100 | Consistently clear goals, explicit constraints, and expected outcomes |

---

### Dimension 2 — Scene Setting

**What it measures:** How much background you give AI *at the start of a session*.

**Why it matters:** AI begins each new session without context. The more complete the setup, the faster collaboration becomes effective.

**Position:** `opening` — first 2 user messages per session.

**Signals (from opening position):**

| Signal | What it captures |
|---|---|
| `hasFilePath` | Concrete file references in session setup |
| `hasTechStack` | Tech stack mentions in session setup |
| `hasError` | Error context provided upfront |
| `firstMessage.avgLength` | Opening message length |
| `firstMessage.sessionsWithTechStack` | Sessions that name the tech stack in message #1 |

---

### Dimension 3 — Unpack

**What it measures:** Whether you break complex tasks into AI-sized pieces.

**Why it matters:** AI works best when scope is focused and bounded. Combining several changes in one message significantly increases the risk of misunderstanding and rework.

**Position:** `global` — task decomposition is measured across all positions.

**Signals:**

| Signal | What it captures |
|---|---|
| `patterns.demandOverloads` | 300+ char messages with 3+ action verbs |
| `patterns.longUnstructured` | 500+ char messages without structure |
| `labelRatios.progressive` | Stepwise language |
| `labelRatios.checkpoint` | Phase markers |
| `stats.avgHumanMsgChars` | Average length (>300 suggests batching) |

---

### Dimension 4 — Steering

**What it measures:** How well you correct AI *when it drifts off-course*.

**Why it matters:** AI collaboration benefits from clear correction loops. Strong feedback restores direction quickly and reduces avoidable back-and-forth.

**Position:** `correcting` — messages where you're reacting to incorrect AI output.

**Signals (from correcting position):**

| Signal | What it captures |
|---|---|
| `hasReasoning` | Corrections that explain *why* |
| `hasFilePath` | Corrections citing exact file locations |
| `hasIdentifier` | Corrections pointing to specific code elements |
| `patterns.retryLoops` | 3+ similar messages (feedback not sticking) |
| `patterns.noReplyToQuestion` | Ignoring AI's clarifying questions |

**Why position matters here:** Without position awareness, `hasReasoning` in an opening message ("I'm building this because...") would inflate Feedback score. Position-aware counting ensures only `hasReasoning` in correcting position counts toward Feedback.

---

### Dimension 5 — Proof Check

**What it measures:** Whether you verify AI output before trusting it.

**Why it matters:** AI output is not inherently reliable. Without verification, mistakes are more likely to move downstream.

**Position:** `confirming` (for blind accept detection) + `global` (for proactive testing).

**Signals:**

| Signal | What it captures |
|---|---|
| `patterns.blindAccepts` | Short ack after AI delivers substantial output (with improved false-positive filtering) |
| `labelRatios.requestTest` | Asking AI to run tests |
| `labelRatios.thinkFirst` | Asking AI to explain before coding |
| `labelRatios.proactiveReview` | Proactively reviewing AI approaches |

**Smart blind accept detection:** A short "ok" after AI output is not counted as blind accept if the user gave a clear, specific directive within the prior 3 turns. This reduces false positives in cases like: "replace all console.log with logger.info" → AI executes → user says "good, next". That is confirmation of execution, not a lack of verification.

---

### Dimension 6 — Tempo

**What it measures:** How well you control the *flow* of a long session.

**Why it matters:** Sessions that drift leave half-finished features and context debt.

**Position:** `global` — session flow is inherently cross-positional.

**Signals:**

| Signal | What it captures |
|---|---|
| `patterns.topicDrifts` | 3+ consecutive unrelated messages (improved: ignores messages that share file path prefixes) |
| `labelRatios.summary` | Explicit summaries / recaps |
| `labelRatios.milestone` | Milestone / progress language |
| `stats.validSessions` | Sustained usage |

**Where this dimension has limits:** Users who primarily handle short tasks (bug fixes, quick features) will naturally score lower here because they need fewer milestones and summaries. If Architecture is the clear outlier, the report should frame that context explicitly.

---

## 6. Scoring: Formula + Adjustment

### Why Not Pure Formula?

Keyword matching has blind spots. A formula alone often misses that a 70-character message with a file path and method name can be more precise than a 300-character message filled with "I hope" and "should." Claude can recover some of that context.

### Why Not Pure Claude Judgment?

LLM scoring carries roughly ±5 points of run-to-run variance. The same data can produce different numbers, which weakens consistency and trust.

### A Balanced Scoring Model

1. **Formula baseline** (deterministic): same data → same score, always.
2. **Confidence scaling**: scores shrink toward 50 when data is sparse.
3. **Claude adjustment** (bounded): ±15 points max, must cite evidence.

This keeps variance near ±3 while preserving contextual nuance.

### Baseline Formula Design

Each dimension has a formula in `rubric.json`. The pattern is:

```
baseline = 50 + Σ (signal_ratio - midpoint) × weight
```

Where:
- `50` is the neutral center
- `midpoint` is the expected ratio for an "average" user (calibrated from early testing)
- `weight` determines how much each signal moves the score
- Result is clamped to [0, 100]

The midpoints and weights are transparent and adjustable. You can edit `rubric.json` to better match your team's collaboration standard.

---

## 7. MBTI: From Vocabulary to Behavior

### The Problem with Keyword-Based MBTI

A purely vocabulary-based approach would be: say "architecture" → +1 N. Say "performance" → +1 T. But collaboration style is about *what you do*, not *what words you use*.

### Behavioral Signals

Each axis now uses **behavioral patterns** as the primary signal, with keywords as supplementary:

#### E/I — Thinking Exposure

| | E (Extrovert) | I (Introvert) |
|---|---|---|
| **Behavioral** | Messages contain reasoning chains (2+ causal connectors in >80 chars) | Messages are terse directives (<120 chars with filePath/identifier) |
| **Metric** | `reasoningChainRatio` | `directiveRatio` |
| **What it means** | Thinks out loud, exposes reasoning | Thinks internally, shares conclusions only |

#### S/N — Reference Granularity

| | S (Concrete) | N (Intuitive) |
|---|---|---|
| **Behavioral** | Messages frequently cite filePath + identifier together | Messages use architecture/design language without concrete file refs |
| **Metric** | `concreteRefDensity` | `abstractRefRatio` |
| **What it means** | Grounds everything in specific code | Thinks in patterns and systems |

#### T/F — Correction Priority

| | T (Logic) | F (Experience) |
|---|---|---|
| **Behavioral** | Corrections cite performance, edge cases, correctness | Corrections cite readability, UX, naming, aesthetics |
| **Metric** | `correctingTCount` | `correctingFCount` |
| **What it means** | Optimizes for being right | Optimizes for being readable |

Key innovation: **T/F is measured only in correcting position**. In opening messages, "performance" might describe a project requirement, not a personal preference. In corrections, it reveals what the user actually cares about when evaluating AI output.

#### J/P — Session Arc

| | J (Structured) | P (Exploratory) |
|---|---|---|
| **Behavioral** | Sessions show linear topic progression (high avg Jaccard between consecutive messages) | Sessions show frequent direction changes (Jaccard drops) |
| **Metric** | `sessionArcLinearity` | `directionChangeCount` |
| **What it means** | Plans and follows through | Explores and adapts |

### Balance Values

Instead of independent E/I/S/N/T/F/J/P counts, VibeRadar outputs a **balance value** per axis (-1 to +1):

- `balance.ei > 0.1` → E, `< -0.1` → I, between → marginal
- Magnitude informs `strength` (0-100 confidence)

### What MBTI Is Not

MBTI here is **descriptive**, not prescriptive. An INTJ isn't "better" than an ESTP. They represent different collaboration styles with different tradeoffs. The value lies in recognizing recurring preferences and typical blind spots.

---

## 8. Confidence Scaling

### Why Sessions Matter

| Sessions | `confidenceLevel` | Scaling |
|---|---|---|
| < 5 | `low` | Scores shrink 30% toward 50 |
| 5-14 | `medium` | Scores shrink 15% toward 50 |
| 15+ | `high` | No scaling |

With 3 sessions, one outlier session can swing a ratio by 0.3. Confidence scaling prevents a "first week" analysis from looking definitive.

The scaling formula: `adjusted = 50 + (baseline - 50) × factor`

This means:
- A baseline of 80 with low confidence becomes 50 + 30 × 0.7 = **71**
- A baseline of 30 with low confidence becomes 50 - 20 × 0.7 = **36**

Extreme scores get pulled toward center. Moderate scores barely change. The report explicitly warns when confidence is not high.

---

## 9. Suggestion Generation

Every report produces **3 to 7 improvement suggestions**. The count is driven by real data rather than a fixed template.

### Priority Assignment

| Dimension Score | Priority | Required? |
|---|---|---|
| 0-54 (D/C) | `high` | Yes |
| 55-69 (B) | `medium` | Usually |
| 70-84 (A) | `low` | Only if specific gap |
| 85-100 (S) | none | Skip |

### Quality Bar

Every suggestion must be:

1. **Specific, not generic.** "Run `npm test` after accepting code", not "test more".
2. **Tied to concrete evidence.** "You had 14 blind accepts" not "you accept too easily".
3. **Actionable in one session.** "End each session with a recap", not "become better at architecture".

---

## 10. Signal Gaps and Visibility Limits

VibeRadar states its blind spots explicitly:

1. **Invisible verification.** Users who review AI diffs in their IDE before typing "ok" look identical to users who blindly accept. We can't see outside the conversation.

2. **Silent expertise.** A message like `"make validateToken async in middleware.ts:45"` is highly precise but may trigger zero keyword matches for "expected behavior" or "constraint." The adjustment mechanism partially compensates, but some precision will always remain invisible to keyword matching.

3. **Context from CLAUDE.md.** Users who maintain good CLAUDE.md files give AI persistent context without repeating it in messages. Their Context score may underestimate their actual context-setting behavior.

4. **Pair programming mode.** Users who work side-by-side with AI in rapid short exchanges will look different from users who write detailed briefs. Neither is objectively better, but the scoring model will reflect those different patterns.

5. **Language limitations.** Keyword signals work for English and Chinese. Other languages will under-score on verbal dimensions.

---

## 11. What We Don't Measure

- **Code quality.** That's what linters, tests, and reviewers are for.
- **Language / framework competence.** Not our lane.
- **Absolute productivity.** We can't tell you if you shipped more this week.
- **Bug fix success rate.** We see the conversation, not the outcome.
- **Security posture.** A separate discipline entirely.

We measure **collaboration behavior in the conversation**, not the final outcome.

---

## 12. Known Limitations

1. **Small samples mean wide error bars.** Confidence scaling mitigates but doesn't eliminate. Fewer than 5 sessions will produce explicitly flagged low-confidence reports.

2. **Scoring has run-to-run variance.** ±3 points typical (kept low via formula anchoring). MBTI type is more stable than individual scores.

3. **Current scope is Claude Code sessions.** The rubric is calibrated around long-form collaboration in that environment.

4. **The rubric is opinionated.** We define strong AI collaboration as goal-directed, verification-heavy, and conversation-aware. Teams with different preferences can tune `rubric.json` accordingly.

5. **Position classification is heuristic.** A message classified as "directing" might actually be a correction without explicit correction keywords. Most classifications are directionally right, but edge cases remain.

---

## 13. Epistemic Status

**What we do not claim:**

- That this is scientifically validated
- That INTJ collaborators are "better" than ESTP ones
- That a low grade means you're a bad developer
- That our scoring is the only valid framework

**What we do claim:**

- The 6 dimensions cover the complete ask → verify → close loop
- Position-aware signals make dimensions genuinely orthogonal
- Formula + adjustment scoring is reproducible and auditable
- The report offers **structured feedback** rather than a value judgment
- Reading the report carefully and applying the top 3 suggestions will usually improve subsequent AI collaboration

VibeRadar exists to help teams refine collaboration habits, not reduce developers to a ranking.

---

## 14. How to Change the Scoring

Everything is encoded in `data/rubric.json`:

- **Change baseline formulas** — edit `dimensions.<dim>.baselineFormula`
- **Change signal routing** — edit `dimensions.<dim>.primaryPosition` and `dimensions.<dim>.signals`
- **Change adjustment guidance** — edit `dimensions.<dim>.adjustmentGuide`
- **Change grade thresholds** — edit `grades[*].range`
- **Change MBTI profiles** — edit `mbti.profiles`
- **Change confidence scaling** — edit `scoring.confidenceScaling`

No code changes needed. Claude reads `rubric.json` every run.

---

*VibeRadar is open source. The methodology remains transparent so teams can understand the scoring logic and adjust it when needed.*
