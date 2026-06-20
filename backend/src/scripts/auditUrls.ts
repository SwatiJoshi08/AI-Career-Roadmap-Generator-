import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { checkLinkHealth } from '../integrations/linkHealth/linkHealthService';
import pLimit from 'p-limit';

const ROOT_DIR = path.resolve(__dirname, '../../');
const REPORT_PATH = path.join(ROOT_DIR, 'url_audit_report.md');
const INVENTORY_PATH = path.join(ROOT_DIR, 'url_inventory.json');

interface UrlEntry {
  file: string;
  line: number;
  originalUrl: string;
  oldStatus?: string; // "alive" | "broken"
  newUrl?: string;
  newStatus?: string;
}

// Simple platform detection for evergreen replacement
function generateEvergreen(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace('www.', '');
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const topic = pathParts[pathParts.length - 1] || '';
    // Coursera
    if (/coursera\.org/.test(host)) {
      return `https://www.coursera.org/search?query=${encodeURIComponent(topic)}`;
    }
    // Udemy
    if (/udemy\.com/.test(host)) {
      return `https://www.udemy.com/courses/search/?q=${encodeURIComponent(topic)}`;
    }
    // edX
    if (/edx\.org/.test(host)) {
      return `https://www.edx.org/search?q=${encodeURIComponent(topic)}`;
    }
    // MDN documentation – use base domain + /en-US/docs/Web/${topic}
    if (/developer\.mozilla\.org/.test(host)) {
      // if topic looks like a file name, fallback to generic search
      const clean = topic.replace(/\.html?$/i, '');
      return `https://developer.mozilla.org/en-US/docs/Web/${encodeURIComponent(clean)}`;
    }
    // Freecodecamp – generic learn page
    if (/freecodecamp\.org/.test(host)) {
      return 'https://www.freecodecamp.org/learn';
    }
    // The Odin Project – main learn page
    if (/theodinproject\.com/.test(host)) {
      return 'https://www.theodinproject.com/paths';
    }
    // JavaScript.info – main docs
    if (/javascript\.info/.test(host)) {
      return 'https://javascript.info/';
    }
    // React – official docs root
    if (/react\.dev/.test(host)) {
      return 'https://react.dev/';
    }
    // Node.js docs – root
    if (/nodejs\.org/.test(host)) {
      return 'https://nodejs.org/en/docs/';
    }
    // GitHub – repository search (fallback to generic)
    if (/github\.com/.test(host)) {
      return `https://github.com/search?q=${encodeURIComponent(topic)}`;
    }
    // Generic fallback – Google search
    return `https://www.google.com/search?q=${encodeURIComponent(topic)}+${encodeURIComponent(host)}`;
  } catch {
    return url; // if parsing fails, keep original
  }
}

async function discoverUrls(): Promise<UrlEntry[]> {
  const entries: UrlEntry[] = [];
  // const exts = ['.ts', '.js', '.json', '.md']; // not needed
  const files = await promisify(require('glob'))('**/*.{ts,js,json,md}', { cwd: ROOT_DIR, ignore: ['node_modules/**', 'dist/**', 'backend/dist/**'] });
  const urlRegex = /https?:\/\/[^\s'"`]+/g;

  for (const relPath of files) {
    const absPath = path.join(ROOT_DIR, relPath);
    const content = await fs.promises.readFile(absPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const matches = line.matchAll(urlRegex);
      for (const m of matches) {
        const url = m[0];
        entries.push({ file: absPath, line: idx + 1, originalUrl: url });
      }
    });
  }
  return entries;
}

async function runAudit() {
  const limit = pLimit(5);
  const entries = await discoverUrls();
  // Save raw inventory for reference
  await fs.promises.writeFile(INVENTORY_PATH, JSON.stringify(entries, null, 2), 'utf8');

  // Check health of original URLs
  await Promise.all(
    entries.map((e) =>
      limit(async () => {
        try {
          const res = await checkLinkHealth(e.originalUrl);
          e.oldStatus = res.isAlive ? 'alive' : 'broken';
        } catch {
          e.oldStatus = 'broken';
        }
      })
    )
  );

  // Generate evergreen replacements
  entries.forEach((e) => {
    e.newUrl = generateEvergreen(e.originalUrl);
  });

  // Update source files (group by file to minimize writes)
  const filesMap = new Map<string, UrlEntry[]>();
  entries.forEach((e) => {
    if (!filesMap.has(e.file)) filesMap.set(e.file, []);
    filesMap.get(e.file)!.push(e);
  });

  for (const [file, ents] of filesMap) {
    let content = await fs.promises.readFile(file, 'utf8');
    // Replace each URL (take care of duplicates)
    ents.forEach((e) => {
      const escaped = e.originalUrl.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      content = content.replace(regex, e.newUrl!);
    });
    await fs.promises.writeFile(file, content, 'utf8');
  }

  // Re‑run health check on new URLs
  await Promise.all(
    entries.map((e) =>
      limit(async () => {
        try {
          const res = await checkLinkHealth(e.newUrl!);
          e.newStatus = res.isAlive ? 'alive' : 'broken';
        } catch {
          e.newStatus = 'broken';
        }
      })
    )
  );

  // Build markdown report
  const lines: string[] = [];
  lines.push('# URL Audit & Evergreen Replacement Report');
  lines.push('');
  lines.push('| File | Line | Original URL | Old Status | Replacement URL | New Status |');
  lines.push('|---|---|---|---|---|---|');
  entries.forEach((e) => {
    const fileLink = `[${path.relative(ROOT_DIR, e.file)}](file://${e.file}#L${e.line})`;
    lines.push(`| ${fileLink} | ${e.line} | ${e.originalUrl} | ${e.oldStatus} | ${e.newUrl} | ${e.newStatus} |`);
  });
  await fs.promises.writeFile(REPORT_PATH, lines.join('\n'), 'utf8');
  console.log('Audit complete. Report written to', REPORT_PATH);
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
