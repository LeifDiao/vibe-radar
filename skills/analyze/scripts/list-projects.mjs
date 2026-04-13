#!/usr/bin/env node
// list-projects.mjs — scan ~/.claude/projects/ and emit JSON of all projects
// Side effect: ensures ~/.vibe-radar/{temp,reports}/ exist (used by later pipeline steps)
// Output (stdout): {projectsDir, count, projects: [{slug, displayName, path, sessionCount, lastModified}]}

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Pre-create output directories so Claude can Write to ~/.vibe-radar/temp/ later
// without needing a separate mkdir step (and without needing broader Bash scope).
try {
  const vibeRadarHome = path.join(os.homedir(), '.vibe-radar');
  fs.mkdirSync(path.join(vibeRadarHome, 'temp'), { recursive: true });
  fs.mkdirSync(path.join(vibeRadarHome, 'reports'), { recursive: true });
} catch {}

const projectsDir = path.join(os.homedir(), '.claude', 'projects');

function emit(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

if (!fs.existsSync(projectsDir)) {
  emit({
    projectsDir,
    count: 0,
    projects: [],
    error: `projects directory not found: ${projectsDir}`
  });
  process.exit(0);
}

function deriveDisplayName(slug) {
  const parts = slug.split('-').filter(Boolean);
  if (parts.length === 0) return slug;
  return parts[parts.length - 1];
}

const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
const projects = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const projectPath = path.join(projectsDir, entry.name);
  let sessionCount = 0;
  let lastModified = 0;

  try {
    const files = fs.readdirSync(projectPath);
    for (const file of files) {
      if (!file.endsWith('.jsonl')) continue;
      sessionCount++;
      try {
        const stat = fs.statSync(path.join(projectPath, file));
        if (stat.mtimeMs > lastModified) lastModified = stat.mtimeMs;
      } catch {}
    }
  } catch {
    continue;
  }

  if (sessionCount === 0) continue;

  projects.push({
    slug: entry.name,
    displayName: deriveDisplayName(entry.name),
    path: projectPath,
    sessionCount,
    lastModified: new Date(lastModified).toISOString()
  });
}

projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

emit({
  projectsDir,
  count: projects.length,
  projects
});
