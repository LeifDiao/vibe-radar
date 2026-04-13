#!/usr/bin/env node
// parse-project.mjs — Position-aware signal extraction + behavioral MBTI signals
// Usage: node parse-project.mjs <project-path>
// Output (stdout): facts JSON

import fs from 'node:fs';
import path from 'node:path';

// ═════════════════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════════════════

const TECH_STACK = ["react","vue","angular","svelte","solid","next.js","nuxt","remix","astro","node","express","fastify","koa","nest","hono","bun","deno","typescript","javascript","python","go","rust","java","swift","kotlin","dart","tailwind","css","sass","styled-components","emotion","postgres","mysql","mongodb","redis","sqlite","supabase","firebase","prisma","docker","kubernetes","aws","gcp","azure","vercel","netlify","cloudflare","webpack","vite","rollup","esbuild","turbopack","swc","jest","vitest","mocha","pytest","cypress","playwright","graphql","rest","grpc","websocket","trpc","git","github","gitlab","bitbucket","electron","tauri","react native","flutter","expo","openai","anthropic","claude","gpt","llm","langchain","nextjs","nuxtjs","nestjs","expressjs","fastapi","django","flask","spring","spring boot","springboot","quarkus","micronaut","rails","ruby on rails","sinatra","laravel","symfony","php","asp.net","dotnet",".net","blazor","maui","preact","inferno","lit","stencil","qwik","alpine.js","htmx","jquery","backbone","ember","mithril","marko","gatsby","eleventy","hugo","jekyll","pelican","hexo","sveltekit","solidstart","fresh","analog","three.js","d3","chart.js","recharts","nivo","visx","echarts","pixi.js","phaser","babylon.js","aframe","r3f","socket.io","ws","sse","server-sent events","redux","zustand","jotai","recoil","mobx","valtio","xstate","pinia","vuex","react-query","tanstack query","swr","apollo","urql","relay","axios","fetch","ky","got","superagent","undici","zod","yup","joi","ajv","io-ts","typebox","valibot","formik","react-hook-form","final-form","material-ui","mui","chakra","mantine","ant design","antd","shadcn","radix","headless ui","daisyui","flowbite","bootstrap","bulma","foundation","semantic ui","tailwindcss","windicss","unocss","twind","postcss","less","stylus","css modules","css-in-js","vanilla-extract","linaria","framer motion","react spring","gsap","anime.js","lottie","storybook","chromatic","ladle","drizzle","kysely","knex","sequelize","typeorm","mikro-orm","objection.js","mongoose","mongosh","dynamodb","cassandra","couchdb","neo4j","arangodb","elasticsearch","opensearch","meilisearch","typesense","algolia","rabbitmq","kafka","nats","pulsar","zeromq","memcached","valkey","keydb","dragonfly","s3","r2","minio","cloudfront","cdn","akamai","lambda","cloud functions","edge functions","workers","durable objects","ec2","ecs","eks","fargate","app runner","terraform","pulumi","cdk","cloudformation","ansible","chef","puppet","nginx","apache","caddy","traefik","envoy","haproxy","prometheus","grafana","datadog","new relic","sentry","logstash","kibana","splunk","pagerduty","opsgenie","github actions","gitlab ci","jenkins","circleci","travis ci","argo cd","flux","spinnaker","tekton","helm","kustomize","k3s","k8s","minikube","kind","rancher","istio","linkerd","consul","vault","pnpm","yarn","npm","npx","corepack","turborepo","nx","lerna","moon","rush","eslint","prettier","biome","oxlint","stylelint","commitlint","husky","lint-staged","lefthook","babel","tsc","tsup","unbuild","microbundle","testing-library","msw","nock","supertest","pact","selenium","puppeteer","webdriverio","detox","appium","maestro","storyshot","percy","backstop","c","c++","c#","scala","elixir","erlang","haskell","ocaml","clojure","lua","perl","r","julia","zig","nim","crystal","v","solidity","vyper","move","cairo","wasm","webassembly","emscripten","wasi","wasmer","wasmtime","tensorflow","pytorch","keras","scikit-learn","sklearn","pandas","numpy","scipy","matplotlib","seaborn","plotly","jupyter","colab","kaggle","huggingface","transformers","mlflow","wandb","dvc","airflow","dagster","prefect","luigi","spark","flink","beam","dbt","snowflake","bigquery","redshift","databricks","celery","dramatiq","rq","bull","bullmq","bee-queue","agenda","passport","auth0","clerk","nextauth","lucia","supertokens","keycloak","stripe","paypal","braintree","square","plaid","paddle","lemon squeezy","twilio","sendgrid","postmark","mailgun","resend","ses","sanity","contentful","strapi","directus","payload","ghost","shopify","woocommerce","medusa","saleor","capacitor","cordova","ionic","nativescript","swift ui","swiftui","uikit","jetpack compose","compose","unity","unreal","godot","bevy","figma","sketch","adobe xd","zeplin","invision","chromadb","pinecone","weaviate","qdrant","faiss","milvus","llamaindex","autogen","crewai","semantic kernel","dspy","ollama","vllm","groq","replicate","together ai","anyscale","vercel ai","ai sdk","openrouter","upstash","neon","planetscale","turso","cockroachdb","tidb","vitess","convex","fauna","xata","edgedb","dagger","earthly","bazel","gradle","maven","cargo","pip","poetry","uv","rye","pdm","hatch","conda","mamba","pixi","proto","protobuf","thrift","avro","msgpack","oauth","jwt","saml","oidc","webauthn","passkey","i18next","formatjs","lingui","rosetta","rxjs","observable","signal","effect","webrtc","webgl","canvas","svg","web audio","web workers","service worker","pwa","manifest","workbox","react router","wouter","tanstack router","vue router","hono rpc","ts-rest"];

const KEYWORDS = {
  vague: {
    zh: ['帮我', '改一下', '看看', '帮忙', '随便', '稍微', '调整下', '弄一下', '搞一下'],
    en: ['help me', 'can you', 'just fix', 'make it work', 'a bit', 'kinda', 'sorta', 'whatever']
  },
  expectedBehavior: {
    zh: ['希望', '期望', '应该', '需要', '想要', '目标是'],
    en: ['should', 'expect', 'want', 'need', 'would like', 'make sure', 'ensure', 'goal is']
  },
  constraint: {
    zh: ['必须', '不要', '避免', '不能', '只能', '除了', '一定', '千万', '禁止'],
    en: ["must", "don't", 'avoid', 'cannot', 'only', 'except', 'required', 'never', 'forbid']
  },
  reasoning: {
    zh: ['因为', '所以', '由于', '原因是', '为了', '这样'],
    en: ['because', 'since', 'so that', 'in order to', 'the reason', 'due to']
  },
  testRequest: {
    zh: ['测试', '跑一下', '验证', '检查一下', '试一下', '验收'],
    en: ['test', 'verify', 'run it', 'check if', 'make sure it works', 'validate']
  },
  thinkFirst: {
    zh: ['先说一下', '先解释', '先想想', '先讨论', '思路', '方案', '先给我讲'],
    en: ['explain first', 'think through', 'approach', 'walk me through', 'before coding', 'your plan']
  },
  proactiveReview: {
    zh: ['让我看看', '有没有问题', '检查一下', '确认一下', '可行吗', '有什么坑', '为什么不', '你确定', '缺点', '风险'],
    en: ['show me', 'any issues', 'double check', 'verify', 'why not', 'are you sure', 'pitfall', 'downside', 'risk', 'tradeoff']
  },
  progressive: {
    zh: ['一步一步', '逐步', '分步', '先做', '先弄', '分阶段'],
    en: ['step by step', 'one at a time', 'first do', 'then do', 'gradually', 'incrementally']
  },
  checkpoint: {
    zh: ['等确认', '然后再', '阶段', '确认后', '先停'],
    en: ['before proceeding', "once that's done", 'phase', 'checkpoint', 'wait for confirm']
  },
  summary: {
    zh: ['总结', '回顾', '梳理', '概括', '小结'],
    en: ['summary', 'recap', 'summarize', 'review so far', 'to sum up']
  },
  milestone: {
    zh: ['里程碑', '进度', '完成了', '下一步', '阶段性'],
    en: ['milestone', 'progress', 'done with', 'next step', 'wrap up']
  },
  blindAccept: {
    zh: ['好的', '可以', '不错', '继续', '行', '嗯', 'ok', '好'],
    en: ['ok', 'okay', 'good', 'thanks', 'great', 'proceed', 'continue', 'lgtm', 'sounds good', 'nice']
  },
  correction: {
    zh: ['不对', '不是', '错了', '改成', '换成', '应该是', '不要这样', '有问题', '但是这个'],
    en: ['wrong', 'incorrect', 'instead', 'rather', "that's not", 'actually', 'should be', 'not what', 'change to', 'no,']
  },

  // MBTI keyword lists (kept for supplementary signal)
  mbtiE: {
    zh: ['我在想', '也许可以', '或者', '不确定', '我觉得', '可能', '让我想想', '我们', '团队', '大家', '分享', '讨论一下', '聊聊'],
    en: ['i think', 'maybe', 'perhaps', 'not sure', 'i wonder', 'what if', 'let me think', 'we should', 'team', 'everyone', 'share', 'discuss', "let's talk"]
  },
  mbtiN: {
    zh: ['架构', '设计模式', '理念', '方向', '策略', '全局', '系统设计', '整体', '原则', '如果', '将来', '扩展', '为什么'],
    en: ['architecture', 'pattern', 'vision', 'strategy', 'design philosophy', 'paradigm', 'principle', 'what if', 'future', 'extensible', 'scalable', 'why not']
  },
  mbtiT: {
    zh: ['性能', '效率', '复杂度', '优化', '速度', '内存', '正确', '逻辑', '比较', '最优', '健壮', '边界情况', '并发'],
    en: ['performance', 'efficiency', 'complexity', 'optimize', 'speed', 'memory', 'correctness', 'logic', 'compare', 'optimal', 'robust', 'edge case', 'concurrency', 'benchmark']
  },
  mbtiF: {
    zh: ['体验', '可读性', '用户', '直觉', '简洁', '优雅', '美观', '易用', '感觉', '谢谢', '不好意思', '好看'],
    en: ['experience', 'readability', 'user', 'intuitive', 'clean', 'elegant', 'usability', 'thanks', 'sorry', 'looks good', 'feels like', 'beautiful']
  },
  mbtiJ: {
    zh: ['计划', '步骤', '规划', '路线', '方案', '目标是', '先做', '后做', '阶段', '需求', '规范', '最终', '确定', '完成'],
    en: ['plan', 'step', 'roadmap', 'approach', 'goal is', 'phase', 'milestone', 'schedule', 'requirements', 'spec', 'final', 'confirm', 'decided']
  },
  mbtiP: {
    zh: ['试试看', '探索', '实验', '玩一下', '好奇', '有趣', '或者', '也可以', '随便', '先这样'],
    en: ['try', 'explore', 'experiment', "let's see", 'play with', 'curious', 'interesting', 'or maybe', 'could also', 'whatever works', 'for now']
  }
};

// Pre-merge keyword arrays for performance (avoid repeated spread)
const MERGED_KEYWORDS = {};
for (const [key, val] of Object.entries(KEYWORDS)) {
  MERGED_KEYWORDS[key] = [...(val.zh || []), ...(val.en || [])].map(k => k.toLowerCase());
}

// ═════════════════════════════════════════════════════════════════════════════
// Regex patterns (module-level — no stateful g flag, safe to reuse)
// ═══════════════════════════════════════════════════════════════════════════���═

const REGEX = {
  filePath: /(?:\.{0,2}\/[\w.@-]+)+\.\w+|\/(?:[\w.@-]+\/)*[\w.@-]+\.\w+|[\w.@-]+\/[\w.@-]+(?:\/[\w.@-]+)*\.\w+|[A-Z]:\\[\w.@\\-]+\.\w+/,
  identifier: /\b[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*\b|\b[A-Z][a-zA-Z0-9]+\b|\b[a-z]+(?:_[a-z]+)+\b/,
  error: /\b(?:Error|Exception|TypeError|SyntaxError|ReferenceError|ENOENT|EACCES|EPERM|panic|fatal|stack trace|traceback|报错|错误|崩溃|失败)\b/i,
  codeBlock: /```[\s\S]*?```/,
  listStructure: /^\s*(?:\d+[.)]\s|-\s|\*\s)/m,
  paragraph: /\n\n/
};

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function matchesAny(text, keywordKey) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return MERGED_KEYWORDS[keywordKey].some(kw => lower.includes(kw));
}

function matchesWordBoundary(lower, kw) {
  let idx = 0;
  while ((idx = lower.indexOf(kw, idx)) !== -1) {
    const before = idx === 0 ? ' ' : lower[idx - 1];
    const after = idx + kw.length >= lower.length ? ' ' : lower[idx + kw.length];
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;
    idx += 1;
  }
  return false;
}

function matchesAnyTechStack(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return TECH_STACK.some(kw => matchesWordBoundary(lower, kw));
}

function jaccard(a, b) {
  const tokenize = (t) => {
    const tokens = new Set();
    const lower = t.toLowerCase();
    lower.replace(/[^\w\u4e00-\u9fff]+/g, ' ').split(/\s+/).filter(w => w.length > 1).forEach(w => tokens.add(w));
    const chinese = lower.replace(/[^\u4e00-\u9fff]/g, '');
    for (let i = 0; i < chinese.length - 1; i++) tokens.add(chinese.slice(i, i + 2));
    return tokens;
  };
  const A = tokenize(a), B = tokenize(b);
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

function isInjectedUserMessage(text) {
  if (!text) return true;
  const t = text.trim();
  if (t.length === 0) return true;
  if (/^<(task-notification|ide_opened_file|local-command|system-reminder|system-|command-name|command-message|command-args|command-stdout|user-prompt-submit-hook|channel|tool_use_error|tool_result)/i.test(t)) return true;
  if (t === 'Continue from where you left off.') return true;
  if (/^\[Request interrupted by user/i.test(t)) return true;
  if (/^Caveat: The messages below/i.test(t)) return true;
  return false;
}

function isInjectedAssistantMessage(text) {
  if (!text) return true;
  const t = text.trim();
  if (t.length === 0) return true;
  if (t === 'No response requested.') return true;
  return false;
}

function extractText(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(b => b && b.type === 'text' && typeof b.text === 'string')
      .map(b => b.text)
      .join(' ');
  }
  return '';
}

function extractRole(entry) {
  if (entry.type === 'user') return 'user';
  if (entry.type === 'assistant') return 'assistant';
  if (entry.message?.role === 'user') return 'user';
  if (entry.message?.role === 'assistant') return 'assistant';
  return null;
}

function hasAssistantToolUse(content) {
  return Array.isArray(content) && content.some(b => b && b.type === 'tool_use');
}

function extractToolNames(content) {
  if (!Array.isArray(content)) return [];
  return content.filter(b => b && b.type === 'tool_use').map(b => b.name).filter(Boolean);
}

function countToolUses(content, stats) {
  if (!Array.isArray(content)) return;
  for (const block of content) {
    if (!block || block.type !== 'tool_use') continue;
    stats.toolUseCount++;
    const name = block.name;
    if (name === 'Edit' || name === 'Write' || name === 'NotebookEdit') stats.fileEditCount++;
    else if (name === 'Bash') stats.bashCommandCount++;
    else if (name === 'Read') stats.readToolCount++;
    else if (name === 'Grep' || name === 'Glob') stats.grepToolCount++;
    else if (name === 'WebFetch' || name === 'WebSearch') stats.webFetchCount++;
    else if (name === 'TodoWrite' || name === 'TaskCreate') stats.todoToolCount++;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Label computation (per-message content signals)
// ═════════════════════════════════════════════════════════════════════════════

const LABEL_KEYS = [
  'hasFilePath', 'hasIdentifier', 'hasError', 'hasCodeBlock', 'hasListStructure',
  'hasExpectedBehavior', 'hasConstraint', 'isVague', 'hasReasoning',
  'requestTest', 'thinkFirst', 'proactiveReview',
  'progressive', 'checkpoint', 'summary', 'milestone', 'hasTechStack'
];

function computeLabels(text) {
  const labels = {};
  if (REGEX.filePath.test(text)) labels.hasFilePath = true;
  if (REGEX.identifier.test(text)) labels.hasIdentifier = true;
  if (REGEX.error.test(text)) labels.hasError = true;
  if (REGEX.codeBlock.test(text)) labels.hasCodeBlock = true;
  if (REGEX.listStructure.test(text)) labels.hasListStructure = true;
  if (matchesAny(text, 'expectedBehavior')) labels.hasExpectedBehavior = true;
  if (matchesAny(text, 'constraint')) labels.hasConstraint = true;
  if (matchesAny(text, 'vague')) labels.isVague = true;
  if (matchesAny(text, 'reasoning')) labels.hasReasoning = true;
  if (matchesAny(text, 'testRequest')) labels.requestTest = true;
  if (matchesAny(text, 'thinkFirst')) labels.thinkFirst = true;
  if (matchesAny(text, 'proactiveReview')) labels.proactiveReview = true;
  if (matchesAny(text, 'progressive')) labels.progressive = true;
  if (matchesAny(text, 'checkpoint')) labels.checkpoint = true;
  if (matchesAny(text, 'summary')) labels.summary = true;
  if (matchesAny(text, 'milestone')) labels.milestone = true;
  if (matchesAnyTechStack(text)) labels.hasTechStack = true;
  return labels;
}

// ═════════════════════════════════════════════════════════════════════════════
// Position classification
//
// Each user message gets exactly one position label:
//   opening    — first 2 user messages per session
//   directing  — new task/instruction (not reacting to AI output)
//   correcting — after AI produced output + user shows correction intent
//   confirming — after AI produced output + user gives short acknowledgment
//   continuing — everything else
// ═════════════════════════════════════════════════════════════════════════════

const POSITIONS = ['opening', 'directing', 'correcting', 'confirming', 'continuing'];

function classifyPosition(messages, index, sessionUserIndex) {
  // Opening: first 2 user messages in the session
  if (sessionUserIndex < 2) return 'opening';

  // Find the most recent assistant message before this user message
  let prevAssistant = null;
  for (let i = index - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      prevAssistant = messages[i];
      break;
    }
  }

  // No previous assistant message → directing
  if (!prevAssistant) return 'directing';

  // Did the previous assistant turn produce code or tool output?
  const prevHadOutput = hasAssistantToolUse(prevAssistant.content) ||
                        /```/.test(prevAssistant.text || '');

  if (!prevHadOutput) return 'directing';

  // Previous assistant had substantive output — is the user reacting to it?
  const text = messages[index].text;

  // Correction signals — check BEFORE length, so short corrections aren't misclassified
  if (matchesAny(text, 'correction')) return 'correcting';

  // Short message after output with no correction keywords → confirming
  if (text.length < 80) return 'confirming';

  // Long message but no correction → new directing
  return 'directing';
}

// ═════════════════════════════════════════════════════════════════════════════
// Behavioral signal functions (for MBTI + dimension enrichment)
// ═════════════════════════════════════════════════════════════════════════════

// E/I: Does the message expose a reasoning chain (2+ causal connectors)?
const CAUSAL_CONNECTORS_ZH = ['因为', '所以', '但是', '不过', '然而', '虽然', '如果', '那么', '首先', '其次', '一方面', '另一方面'];
const CAUSAL_CONNECTORS_EN = ['because', 'therefore', 'however', 'although', 'but', 'if', 'then', 'since', 'while', 'whereas', 'on the other hand', 'first', 'second', 'furthermore'];

function countCausalConnectors(text) {
  const lower = text.toLowerCase();
  let count = 0;
  for (const c of CAUSAL_CONNECTORS_ZH) { if (lower.includes(c)) count++; }
  for (const c of CAUSAL_CONNECTORS_EN) { if (lower.includes(c)) count++; }
  return count;
}

function hasReasoningChain(text) {
  return text.length > 80 && countCausalConnectors(text) >= 2;
}

// E/I: Is the message a terse directive (short + contains filePath or identifier)?
function isDirectiveMessage(text) {
  return text.length < 120 && (REGEX.filePath.test(text) || REGEX.identifier.test(text));
}

// T/F: Extract T/F keyword matches specifically from correcting-position messages
function computeTFInContext(text) {
  const t = matchesAny(text, 'mbtiT');
  const f = matchesAny(text, 'mbtiF');
  return { t, f };
}

// J/P: Count demand action verbs (for demand overload detection)
function countDemandActions(text) {
  const actionsZh = ['实现', '添加', '创建', '修改', '更新', '删除', '移除', '写', '修复', '改成'];
  const actionsEn = ['implement', 'add', 'create', 'modify', 'change', 'update', 'delete', 'remove', 'write', 'build', 'fix', 'refactor'];
  const lower = text.toLowerCase();
  const actionCount = [...actionsZh, ...actionsEn].filter(w => matchesWordBoundary(lower, w.toLowerCase())).length;
  const listItems = (text.match(/^\s*(?:\d+[.)]\s|-\s|\*\s)/gm) || []).length;
  return Math.max(actionCount, listItems);
}

// ═════════════════════════════════════════════════════════════════════════════
// Main
// ═════════════════════════════════════════════════════════════════════════════

const projectPath = process.argv[2];
if (!projectPath) {
  console.error('Usage: parse-project.mjs <project-path>');
  process.exit(1);
}
if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
  console.error(`Project path not found or not a directory: ${projectPath}`);
  process.exit(1);
}

const sessionFiles = fs.readdirSync(projectPath).filter(f => f.endsWith('.jsonl')).sort();

// ─── Accumulators ────────────────────────────────────────────────────────────

const stats = {
  totalMessages: 0,
  humanMessages: 0,
  assistantMessages: 0,
  avgHumanMsgChars: 0,
  avgAssistantMsgChars: 0,
  toolUseCount: 0,
  fileEditCount: 0,
  bashCommandCount: 0,
  readToolCount: 0,
  grepToolCount: 0,
  webFetchCount: 0,
  todoToolCount: 0,
  sessionsTooShort: 0,
  validSessions: 0,
  codeBlockCount: 0,
  listStructureCount: 0,
  shortMessageCount: 0,
  longMessageCount: 0
};

let totalHumanChars = 0;
let totalAssistantChars = 0;
const dateSet = new Set();

const patterns = {
  blindAccepts: 0,
  retryLoops: 0,
  topicDrifts: 0,
  demandOverloads: 0,
  longUnstructured: 0,
  noReplyToQuestion: 0
};

// Global label counts (kept for overview / backward compat)
const labelCounts = {};
for (const k of LABEL_KEYS) labelCounts[k] = 0;

// Position-aware signal counts
function makePositionBucket() {
  const bucket = { messageCount: 0 };
  for (const k of LABEL_KEYS) bucket[k] = 0;
  return bucket;
}
const signalsByPosition = {};
for (const pos of POSITIONS) signalsByPosition[pos] = makePositionBucket();

// MBTI accumulators
const mbti = {
  // Keyword counts
  eCount: 0, nCount: 0, tCount: 0, fCount: 0, jCount: 0, pCount: 0,
  // Behavioral counts
  reasoningChainCount: 0,
  directiveCount: 0,
  longMsgCount: 0,       // > 200 chars
  shortMsgCount: 0,      // < 60 chars
  concreteRefCount: 0,   // messages with filePath + identifier
  abstractRefCount: 0,   // messages with N keywords but no filePath
  // T/F in correcting position
  correctingTCount: 0,
  correctingFCount: 0,
  // J/P session arc signals (computed per session, averaged later)
  sessionLinearities: [],
  directionChangeCount: 0
};

const firstMessageAgg = {
  lengths: [],
  sessionsWithTechStack: 0,
  sessionsWithFilePath: 0,
  sessionsWithGoal: 0,
  sessionsWithContext: 0,
  samples: []
};

const keyMessages = [];
const sampleExchanges = [];
const MAX_SAMPLES = 10;

const sessionRecords = [];

// ─── Process each session ────────────────────────────────────────────────────

for (const fileName of sessionFiles) {
  const fullPath = path.join(projectPath, fileName);

  // Skip files > 50MB
  try {
    const fileStat = fs.statSync(fullPath);
    if (fileStat.size > 50 * 1024 * 1024) continue;
  } catch { continue; }

  let raw;
  try { raw = fs.readFileSync(fullPath, 'utf-8'); } catch { continue; }

  const lines = raw.split('\n').filter(l => l.trim());
  const rawEntries = [];
  for (const line of lines) {
    try { rawEntries.push(JSON.parse(line)); } catch {}
  }

  // Normalize + filter injected messages
  const messages = [];
  for (const entry of rawEntries) {
    const role = extractRole(entry);
    if (!role) continue;
    const msgContent = entry.message?.content;
    const text = extractText(msgContent);

    if (role === 'user') {
      if (isInjectedUserMessage(text)) continue;
      messages.push({ role, text, content: msgContent, timestamp: entry.timestamp });
    } else {
      const hasToolUse = hasAssistantToolUse(msgContent);
      if (!text && !hasToolUse) continue;
      if (isInjectedAssistantMessage(text) && !hasToolUse) continue;
      messages.push({ role, text, content: msgContent, timestamp: entry.timestamp });
    }
  }

  if (messages.length < 3) {
    stats.sessionsTooShort++;
    continue;
  }
  stats.validSessions++;

  const sessionHumanMsgs = messages.filter(m => m.role === 'user').length;
  const sessionRec = {
    file: fileName.replace(/\.jsonl$/, ''),
    humanMsgs: sessionHumanMsgs,
    totalMsgs: messages.length,
    startTime: messages[0]?.timestamp || null,
    endTime: messages[messages.length - 1]?.timestamp || null,
    compact: []
  };

  // ─── First user message features ────────────────────────────────────────

  const firstUserIdx = messages.findIndex(m => m.role === 'user');
  if (firstUserIdx >= 0) {
    const first = messages[firstUserIdx];
    firstMessageAgg.lengths.push(first.text.length);
    const labels = computeLabels(first.text);
    if (labels.hasTechStack) firstMessageAgg.sessionsWithTechStack++;
    if (labels.hasFilePath) firstMessageAgg.sessionsWithFilePath++;
    if (labels.hasExpectedBehavior || first.text.length > 100) firstMessageAgg.sessionsWithGoal++;
    if (labels.hasReasoning || first.text.length > 150) firstMessageAgg.sessionsWithContext++;
    if (firstMessageAgg.samples.length < 5 && first.text.length > 30) {
      firstMessageAgg.samples.push(first.text.slice(0, 200));
    }
  }

  // ─── Walk messages ────────────────────────────────────���─────────────────

  let sessionUserIndex = 0;
  const sessionUserTexts = []; // for J/P arc linearity

  for (let mi = 0; mi < messages.length; mi++) {
    const m = messages[mi];
    stats.totalMessages++;

    if (m.timestamp && typeof m.timestamp === 'string') {
      dateSet.add(m.timestamp.slice(0, 10));
    }

    // Compact flow representation
    if (sessionRec.compact.length < 20) {
      const tools = m.role === 'assistant' ? extractToolNames(m.content) : [];
      sessionRec.compact.push({
        role: m.role,
        length: m.text.length,
        textShort: m.text.slice(0, 140),
        tools
      });
    }

    if (m.role === 'user') {
      stats.humanMessages++;
      totalHumanChars += m.text.length;

      if (m.text.length < 60) stats.shortMessageCount++;
      if (m.text.length > 200) stats.longMessageCount++;

      if (REGEX.codeBlock.test(m.text)) stats.codeBlockCount++;
      if (REGEX.listStructure.test(m.text)) stats.listStructureCount++;

      // ── Position classification ──────────────────────────────────────
      const position = classifyPosition(messages, mi, sessionUserIndex);
      sessionUserIndex++;

      // ── Labels ───────────────────────────────────────────────────────
      const labels = computeLabels(m.text);

      // Accumulate into global counts
      for (const lbl of Object.keys(labels)) {
        if (labelCounts[lbl] !== undefined) labelCounts[lbl]++;
      }

      // Accumulate into position bucket
      const bucket = signalsByPosition[position];
      bucket.messageCount++;
      for (const lbl of Object.keys(labels)) {
        if (bucket[lbl] !== undefined) bucket[lbl]++;
      }

      // ── MBTI keyword signals ─────────────────────────────────────────
      if (matchesAny(m.text, 'mbtiE')) mbti.eCount++;
      if (matchesAny(m.text, 'mbtiN')) mbti.nCount++;
      if (matchesAny(m.text, 'mbtiT')) mbti.tCount++;
      if (matchesAny(m.text, 'mbtiF')) mbti.fCount++;
      if (matchesAny(m.text, 'mbtiJ')) mbti.jCount++;
      if (matchesAny(m.text, 'mbtiP')) mbti.pCount++;

      // ── MBTI behavioral signals ────────────────────────────────────��─
      if (hasReasoningChain(m.text)) mbti.reasoningChainCount++;
      if (isDirectiveMessage(m.text)) mbti.directiveCount++;
      if (m.text.length > 200) mbti.longMsgCount++;
      if (m.text.length < 60) mbti.shortMsgCount++;

      // S/N behavioral: concrete (filePath + identifier) vs abstract (N keywords, no filePath)
      if (labels.hasFilePath && labels.hasIdentifier) mbti.concreteRefCount++;
      if (matchesAny(m.text, 'mbtiN') && !labels.hasFilePath) mbti.abstractRefCount++;

      // T/F in correcting position
      if (position === 'correcting') {
        const tf = computeTFInContext(m.text);
        if (tf.t) mbti.correctingTCount++;
        if (tf.f) mbti.correctingFCount++;
      }

      // J/P: track user texts for session arc linearity
      if (m.text.length > 20) sessionUserTexts.push(m.text);

      // ── Pattern detection ────────────────────────────────────────────

      // Demand overload
      if (m.text.length > 300 && countDemandActions(m.text) >= 3) {
        patterns.demandOverloads++;
      }

      // Long unstructured
      if (m.text.length > 500 &&
          !REGEX.paragraph.test(m.text) &&
          !REGEX.listStructure.test(m.text) &&
          !REGEX.codeBlock.test(m.text)) {
        patterns.longUnstructured++;
      }

    } else if (m.role === 'assistant') {
      countToolUses(m.content, stats);
      if (m.text && !isInjectedAssistantMessage(m.text)) {
        stats.assistantMessages++;
        totalAssistantChars += m.text.length;
      }
    }
  }

  // ─── Sequential pattern detection (per-session) ─────────────────────────

  const userMsgs = messages.filter(m => m.role === 'user');

  // Retry loops: 3 consecutive similar user messages
  for (let i = 2; i < userMsgs.length; i++) {
    const s1 = jaccard(userMsgs[i - 2].text, userMsgs[i - 1].text);
    const s2 = jaccard(userMsgs[i - 1].text, userMsgs[i].text);
    if (s1 > 0.5 && s2 > 0.5) patterns.retryLoops++;
  }

  // Topic drifts: 3 consecutive unrelated messages (Jaccard < 0.03)
  // Also skip if both messages share tech stack or filePath
  let consecutiveBreaks = 0;
  for (let i = 1; i < userMsgs.length; i++) {
    if (userMsgs[i].text.length < 30 || userMsgs[i - 1].text.length < 30) {
      consecutiveBreaks = 0;
      continue;
    }
    const s = jaccard(userMsgs[i - 1].text, userMsgs[i].text);
    // Check if both share a file path prefix (same area of code)
    const bothHavePath = REGEX.filePath.test(userMsgs[i - 1].text) && REGEX.filePath.test(userMsgs[i].text);
    if (s < 0.03 && !bothHavePath) {
      consecutiveBreaks++;
      if (consecutiveBreaks >= 2) {
        patterns.topicDrifts++;
        consecutiveBreaks = 0;
      }
    } else {
      consecutiveBreaks = 0;
    }
  }

  // Blind accepts: short ack after assistant turn with output
  // Improvement: don't count if the user gave a clear action directive within last 3 turns
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role !== 'user') continue;
    const u = messages[i];
    if (u.text.length >= 80) continue;
    if (!matchesAny(u.text, 'blindAccept')) continue;
    const prev = messages[i - 1];
    if (prev.role !== 'assistant') continue;
    const prevHasCode = prev.text && /```/.test(prev.text);
    const prevHasTool = hasAssistantToolUse(prev.content);
    if (!prevHasCode && !prevHasTool) continue;
    // Substance check: if the short message contains actual feedback, skip
    const hasSubstance = /因为|但是|不过|问题|修改|错|不对|because|but|however|change|issue|wrong|fix/i.test(u.text);
    if (hasSubstance) continue;
    // Context check: if a clear directive was given in the prior 3 user messages, skip
    let hadRecentDirective = false;
    let userCount = 0;
    for (let j = i - 1; j >= 0 && userCount < 3; j--) {
      if (messages[j].role !== 'user') continue;
      userCount++;
      if (messages[j].text.length > 50 && (REGEX.filePath.test(messages[j].text) || REGEX.identifier.test(messages[j].text))) {
        hadRecentDirective = true;
        break;
      }
    }
    if (hadRecentDirective) continue;
    patterns.blindAccepts++;
  }

  // No-reply-to-question
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role !== 'assistant') continue;
    const asst = messages[i].text || '';
    if (!asst.includes('?') && !asst.includes('？')) continue;
    const next = messages[i + 1];
    if (next.role !== 'user') continue;
    if (next.text.length < 30 && matchesAny(next.text, 'blindAccept')) {
      patterns.noReplyToQuestion++;
    }
  }

  // ─── J/P: Session arc linearity ─────────────────────────────────────────

  if (sessionUserTexts.length >= 3) {
    let jaccardSum = 0;
    let dirChanges = 0;
    for (let i = 1; i < sessionUserTexts.length; i++) {
      const s = jaccard(sessionUserTexts[i - 1], sessionUserTexts[i]);
      jaccardSum += s;
      if (s < 0.08) dirChanges++;
    }
    const avgJaccard = jaccardSum / (sessionUserTexts.length - 1);
    mbti.sessionLinearities.push(avgJaccard);
    mbti.directionChangeCount += dirChanges;
  }

  // ─── Sample exchanges ───────────────────────────────────────────────────

  if (sampleExchanges.length < MAX_SAMPLES) {
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role !== 'user' || messages[i + 1].role !== 'assistant') continue;
      const h = (messages[i].text || '').trim();
      const a = (messages[i + 1].text || '').trim();
      if (h && a) {
        sampleExchanges.push({
          session: fileName.replace(/\.jsonl$/, ''),
          human: h.slice(0, 250),
          assistant: a.slice(0, 250)
        });
        break;
      }
    }
  }

  // Key message: longest user message in this session
  if (keyMessages.length < MAX_SAMPLES && userMsgs.length > 0) {
    const longest = userMsgs.reduce((a, b) => (b.text.length > a.text.length ? b : a));
    if (longest && longest.text.length > 0) {
      keyMessages.push({
        session: fileName.replace(/\.jsonl$/, ''),
        text: longest.text.slice(0, 300),
        length: longest.text.length,
        labels: Object.keys(computeLabels(longest.text))
      });
    }
  }

  sessionRecords.push(sessionRec);
}

// ══════════════════════════════════════════════════════════════════════��══════
// Post-processing
// ═════════════════════════════════════════════════════════════════════════════

stats.avgHumanMsgChars = stats.humanMessages ? Math.round(totalHumanChars / stats.humanMessages) : 0;
stats.avgAssistantMsgChars = stats.assistantMessages ? Math.round(totalAssistantChars / stats.assistantMessages) : 0;

const dates = Array.from(dateSet).sort();
const dateRange = dates.length ? [dates[0], dates[dates.length - 1]] : [null, null];

// ─── Label ratios (global, per human message) ─────────────────────────────

const labelRatios = {};
for (const key of Object.keys(labelCounts)) {
  labelRatios[key] = stats.humanMessages ? +(labelCounts[key] / stats.humanMessages).toFixed(3) : 0;
}

// ─── Position-aware ratios ────────────────────────────────────────────────

const signalsByPositionWithRatios = {};
for (const pos of POSITIONS) {
  const bucket = signalsByPosition[pos];
  const ratios = {};
  for (const k of LABEL_KEYS) {
    ratios[k] = bucket.messageCount ? +(bucket[k] / bucket.messageCount).toFixed(3) : 0;
  }
  signalsByPositionWithRatios[pos] = {
    messageCount: bucket.messageCount,
    counts: {},
    ratios
  };
  for (const k of LABEL_KEYS) {
    signalsByPositionWithRatios[pos].counts[k] = bucket[k];
  }
}

// ─── Confidence level ─────────────────────────────────────────────────────

// Confidence based on both session count and total human messages
// A single deep session (50+ messages) can be more informative than 5 shallow ones
const msgCount = stats.humanMessages || 0;
let confidenceLevel = 'high';
if (stats.validSessions < 2 && msgCount < 20) confidenceLevel = 'low';
else if (stats.validSessions < 5 && msgCount < 40) confidenceLevel = 'low';
else if (stats.validSessions < 15 && msgCount < 100) confidenceLevel = 'medium';

// ─── MBTI signals with balance values ─────────────────────────────────────

const hm = stats.humanMessages || 1;
const safe = (n, d) => d ? +(n / d).toFixed(3) : 0;

// Behavioral ratios
const reasoningChainRatio = safe(mbti.reasoningChainCount, hm);
const directiveRatio = safe(mbti.directiveCount, hm);
const longMsgRatio = safe(mbti.longMsgCount, hm);
const shortMsgRatio = safe(mbti.shortMsgCount, hm);
const concreteRefDensity = safe(mbti.concreteRefCount, hm);
const abstractRefRatio = safe(mbti.abstractRefCount, hm);

// Session arc linearity (average across sessions)
const sessionArcLinearity = mbti.sessionLinearities.length
  ? +(mbti.sessionLinearities.reduce((a, b) => a + b, 0) / mbti.sessionLinearities.length).toFixed(3)
  : 0.5;

// Balance values: positive = left pole (E, N, T, J), negative = right pole (I, S, F, P)
// Range roughly -1 to +1, but not clamped — raw signal difference

// E/I: reasoning chains (E) vs terse directives (I)
const eSignal = reasoningChainRatio * 0.5 + safe(mbti.eCount, hm) * 0.3 + longMsgRatio * 0.2;
const iSignal = directiveRatio * 0.5 + (1 - safe(mbti.eCount, hm)) * 0.1 + shortMsgRatio * 0.2 + (stats.avgHumanMsgChars < 120 ? 0.2 : 0);
const eiBalance = +((eSignal - iSignal) / Math.max(eSignal + iSignal, 0.01)).toFixed(3);

// S/N: concrete references (S) vs abstract references (N)
const sSignal = concreteRefDensity * 0.5 + safe(labelCounts.hasFilePath, hm) * 0.3 + safe(labelCounts.hasIdentifier, hm) * 0.2;
const nSignal = abstractRefRatio * 0.5 + safe(mbti.nCount, hm) * 0.3 + (1 - concreteRefDensity) * 0.2;
const snBalance = +((nSignal - sSignal) / Math.max(nSignal + sSignal, 0.01)).toFixed(3);

// T/F: primary from correcting-position keywords, secondary from global
const correctingTotal = mbti.correctingTCount + mbti.correctingFCount;
const tFromCorrecting = correctingTotal > 0 ? mbti.correctingTCount / correctingTotal : 0.5;
const fFromCorrecting = correctingTotal > 0 ? mbti.correctingFCount / correctingTotal : 0.5;
const tSignal = tFromCorrecting * 0.5 + safe(mbti.tCount, hm) * 0.3 + (1 - safe(mbti.fCount, hm)) * 0.2;
const fSignal = fFromCorrecting * 0.5 + safe(mbti.fCount, hm) * 0.3 + (1 - safe(mbti.tCount, hm)) * 0.2;
const tfBalance = +((tSignal - fSignal) / Math.max(tSignal + fSignal, 0.01)).toFixed(3);

// J/P: session linearity (J) vs direction changes (P)
const dirChangeRatio = safe(mbti.directionChangeCount, hm);
const jSignal = sessionArcLinearity * 0.4 + safe(mbti.jCount, hm) * 0.3 + (1 - dirChangeRatio) * 0.3;
const pSignal = dirChangeRatio * 0.4 + safe(mbti.pCount, hm) * 0.3 + (1 - sessionArcLinearity) * 0.3;
const jpBalance = +((jSignal - pSignal) / Math.max(jSignal + pSignal, 0.01)).toFixed(3);

const mbtiSignals = {
  basedOnMessages: stats.humanMessages,
  confidenceLevel,

  // Keyword counts (supplementary)
  keywords: {
    eCount: mbti.eCount, nCount: mbti.nCount, tCount: mbti.tCount,
    fCount: mbti.fCount, jCount: mbti.jCount, pCount: mbti.pCount
  },

  // Behavioral counts
  behavioral: {
    reasoningChainCount: mbti.reasoningChainCount,
    reasoningChainRatio,
    directiveCount: mbti.directiveCount,
    directiveRatio,
    longMsgRatio,
    shortMsgRatio,
    avgHumanMsgChars: stats.avgHumanMsgChars,
    concreteRefCount: mbti.concreteRefCount,
    concreteRefDensity,
    abstractRefCount: mbti.abstractRefCount,
    abstractRefRatio,
    correctingTCount: mbti.correctingTCount,
    correctingFCount: mbti.correctingFCount,
    sessionArcLinearity,
    directionChangeCount: mbti.directionChangeCount
  },

  // Balance values: the primary input for Claude's MBTI judgment
  // Positive = left pole (E, N, T, J), Negative = right pole (I, S, F, P)
  balance: {
    ei: eiBalance,
    sn: snBalance,
    tf: tfBalance,
    jp: jpBalance
  },

  hints: {
    ei: 'balance.ei > 0.1 → E (reasoning chains, thinking out loud); < -0.1 → I (terse directives, conclusions only). Key behavioral: reasoningChainRatio (E) vs directiveRatio (I).',
    sn: 'balance.sn > 0.1 → N (abstract/architecture focus); < -0.1 → S (concrete refs, filePaths, identifiers). Key behavioral: abstractRefRatio (N) vs concreteRefDensity (S).',
    tf: 'balance.tf > 0.1 → T (logic/performance/correctness); < -0.1 → F (UX/readability/experience). Key behavioral: correcting-position T vs F keyword density.',
    jp: 'balance.jp > 0.1 → J (linear sessions, planned arcs); < -0.1 → P (direction changes, exploratory). Key behavioral: sessionArcLinearity (J) vs directionChangeCount (P).'
  }
};

// ─── Conversation flows (top 5 richest sessions) ─────────────────────────

const flowSessions = [...sessionRecords]
  .sort((a, b) => b.humanMsgs - a.humanMsgs)
  .slice(0, 5);

function buildFlow(rec) {
  let out = `Session ${rec.file.slice(0, 10)} (${rec.humanMsgs} human msgs, ${rec.totalMsgs} total):\n`;
  for (const m of rec.compact) {
    const icon = m.role === 'user' ? '👤' : '🤖';
    const tools = m.tools && m.tools.length ? m.tools.join(',') : '';
    const textClean = m.textShort.replace(/\s+/g, ' ').trim();
    if (!textClean && tools) {
      out += `  ${icon} [tool: ${tools}]\n`;
    } else if (tools) {
      out += `  ${icon} [${m.length}c + ${tools}]: ${textClean}\n`;
    } else {
      out += `  ${icon} [${m.length}c]: ${textClean}\n`;
    }
  }
  if (rec.totalMsgs > rec.compact.length) {
    out += `  ...(+${rec.totalMsgs - rec.compact.length} more)\n`;
  }
  return out;
}

const sessionFlows = flowSessions.map(buildFlow);

// ─── First message aggregation ────────────────────────────────────────────

const firstMessage = {
  totalSessions: firstMessageAgg.lengths.length,
  avgLength: firstMessageAgg.lengths.length
    ? Math.round(firstMessageAgg.lengths.reduce((a, b) => a + b, 0) / firstMessageAgg.lengths.length)
    : 0,
  sessionsWithTechStack: firstMessageAgg.sessionsWithTechStack,
  sessionsWithFilePath: firstMessageAgg.sessionsWithFilePath,
  sessionsWithGoal: firstMessageAgg.sessionsWithGoal,
  sessionsWithContext: firstMessageAgg.sessionsWithContext,
  samples: firstMessageAgg.samples
};

// ─── Display name ─────────────────────────────────────────────────────────

const slugParts = path.basename(projectPath).split('-').filter(Boolean);
const displayName = slugParts[slugParts.length - 1] || path.basename(projectPath);

// ─── Language detection ───────────────────────────────────────────────────

let zhChars = 0, enChars = 0;
for (const km of keyMessages) {
  zhChars += (km.text.match(/[\u4e00-\u9fff]/g) || []).length;
  enChars += (km.text.match(/[a-zA-Z]/g) || []).length;
}
for (const se of sampleExchanges) {
  zhChars += (se.human.match(/[\u4e00-\u9fff]/g) || []).length;
  enChars += (se.human.match(/[a-zA-Z]/g) || []).length;
}
const dominantLanguage = zhChars / Math.max(zhChars + enChars, 1) > 0.25 ? 'zh' : 'en';

// ═════════════════════════════════════════════════════════════════════════════
// Output
// ═════════════════════════════════════════════════════════════════════════════

const result = {
  schemaVersion: '1.0',
  project: displayName,
  projectPath,
  sessionCount: stats.validSessions,
  confidenceLevel,
  dominantLanguage,
  dateRange,
  stats,
  patterns,
  labelCounts,
  labelRatios,
  signalsByPosition: signalsByPositionWithRatios,
  mbtiSignals,
  firstMessage,
  sessionFlows,
  keyMessages,
  sampleExchanges
};

process.stdout.write(JSON.stringify(result, null, 2) + '\n');
