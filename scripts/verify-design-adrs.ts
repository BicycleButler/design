import fs from 'fs';
import path from 'path';

const WORKSPACE_ROOT = process.cwd();
const isSync = process.argv.includes('--sync');

// Resolve whether the script executes from the workspace root or inside the skill directory
const hasNestedSkillDir = fs.existsSync(path.join(WORKSPACE_ROOT, '.agents', 'skills', 'design', 'SKILL.md'));
const isInsideSkillDir =
  !hasNestedSkillDir &&
  fs.existsSync(path.join(WORKSPACE_ROOT, 'SKILL.md')) &&
  fs.existsSync(path.join(WORKSPACE_ROOT, 'knowledge', 'design'));

const SKILL_DIR = isInsideSkillDir
  ? WORKSPACE_ROOT
  : path.join(WORKSPACE_ROOT, '.agents', 'skills', 'design');

const CANONICAL_DESIGN_DIR = isInsideSkillDir
  ? path.join(WORKSPACE_ROOT, 'knowledge', 'design')
  : path.join(WORKSPACE_ROOT, 'knowledge', 'design');

const SKILL_DESIGN_DIR = path.join(SKILL_DIR, 'knowledge', 'design');
const CONFIGS_SKILL_DIR = path.join(WORKSPACE_ROOT, 'packages', 'configs', 'agents', 'skills', 'design');
const WORKSPACE_RULES_MD = path.join(WORKSPACE_ROOT, '.agents', 'rules', 'RULES.md');
const CONFIGS_RULES_MD = path.join(WORKSPACE_ROOT, 'packages', 'configs', 'agents', 'rules', 'RULES.md');

const SKILL_MD = path.join(SKILL_DIR, 'SKILL.md');
const REFERENCE_MD = path.join(SKILL_DIR, 'REFERENCE.md');
const MIGRATION_MD = path.join(SKILL_DIR, 'MIGRATION.md');
const INDEX_MD = path.join(CANONICAL_DESIGN_DIR, 'index.md');

let errors = 0;

function logError(msg: string) {
  console.error(`❌ [ERROR] ${msg}`);
  errors++;
}

function logSuccess(msg: string) {
  console.log(`✅ ${msg}`);
}

function copyDirRecursive(srcDir: string, destDir: string) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Validating Design ADR Corpus and Skill Integration...\n');

// 0. Optional --sync: Propagate canonical ADRs and skill mirrors
if (isSync && !isInsideSkillDir) {
  if (fs.existsSync(CANONICAL_DESIGN_DIR) && fs.existsSync(SKILL_DESIGN_DIR)) {
    for (const file of fs.readdirSync(CANONICAL_DESIGN_DIR).filter((f) => f.endsWith('.md'))) {
      fs.copyFileSync(path.join(CANONICAL_DESIGN_DIR, file), path.join(SKILL_DESIGN_DIR, file));
    }
    logSuccess('Synced canonical knowledge/design/*.md -> .agents/skills/design/knowledge/design/');
  }

  if (fs.existsSync(path.join(WORKSPACE_ROOT, 'packages', 'configs', 'agents'))) {
    fs.mkdirSync(CONFIGS_SKILL_DIR, { recursive: true });
    for (const doc of ['SKILL.md', 'REFERENCE.md', 'MIGRATION.md']) {
      const srcDoc = path.join(SKILL_DIR, doc);
      if (fs.existsSync(srcDoc)) {
        fs.copyFileSync(srcDoc, path.join(CONFIGS_SKILL_DIR, doc));
      }
    }
    copyDirRecursive(path.join(SKILL_DIR, 'knowledge'), path.join(CONFIGS_SKILL_DIR, 'knowledge'));
    copyDirRecursive(path.join(SKILL_DIR, 'scripts'), path.join(CONFIGS_SKILL_DIR, 'scripts'));
    logSuccess('Synced .agents/skills/design/ -> packages/configs/agents/skills/design/');

    if (fs.existsSync(WORKSPACE_RULES_MD)) {
      fs.mkdirSync(path.dirname(CONFIGS_RULES_MD), { recursive: true });
      fs.copyFileSync(WORKSPACE_RULES_MD, CONFIGS_RULES_MD);
      logSuccess('Synced .agents/rules/RULES.md -> packages/configs/agents/rules/RULES.md');
    }
  }
}

// 1. Check all ADR files in canonical knowledge/design
if (!fs.existsSync(CANONICAL_DESIGN_DIR)) {
  logError(`Directory not found: ${CANONICAL_DESIGN_DIR}`);
  process.exit(1);
}

const adrFiles = fs.readdirSync(CANONICAL_DESIGN_DIR).filter((f) => f.endsWith('.md') && f !== 'index.md');
logSuccess(`Found ${adrFiles.length} design ADR files.`);

// 2. Validate Frontmatter Status
adrFiles.forEach((file) => {
  const filePath = path.join(CANONICAL_DESIGN_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('status: "active"') && !content.includes("status: 'active'") && !content.includes('status: active')) {
    logError(`${file}: Frontmatter status is not active.`);
  }
});

// 3. Verify SKILL.md, REFERENCE.md, and MIGRATION.md ADR references resolve to actual files
const draftFolder = path.join(SKILL_DIR, 'knowledge', 'in-progress');
const draftFiles = fs.existsSync(draftFolder)
  ? fs.readdirSync(draftFolder).filter((f) => f.endsWith('.md'))
  : [];

for (const [docLabel, docPath] of [
  ['SKILL.md', SKILL_MD],
  ['REFERENCE.md', REFERENCE_MD],
  ['MIGRATION.md', MIGRATION_MD],
] as const) {
  if (fs.existsSync(docPath)) {
    const docContent = fs.readFileSync(docPath, 'utf8');
    const adrMatches = docContent.matchAll(/ADR\s+(00\d{2})/g);
    const citedAdrs = new Set([...adrMatches].map((m) => m[1] ?? ''));

    citedAdrs.forEach((adrNum) => {
      if (!adrNum || adrNum === '0015') return; // ADR 0015 lives in knowledge/architecture/adr/
      const foundActive = adrFiles.some((f) => f.startsWith(adrNum));
      const foundDraft = draftFiles.some((f) => f.startsWith(adrNum));
      if (!foundActive && !foundDraft) {
        logError(`${docLabel} cites ADR ${adrNum}, but no matching file exists in knowledge/design/ or knowledge/in-progress/.`);
      }
    });
    logSuccess(`${docLabel} ADR citations verified against disk.`);
  } else if (docLabel !== 'MIGRATION.md') {
    logError(`${docLabel} not found at ${docPath}`);
  }
}

// 4. Verify index.md ADR references resolve to actual files
if (fs.existsSync(INDEX_MD)) {
  const indexContent = fs.readFileSync(INDEX_MD, 'utf8');
  const indexMatches = indexContent.matchAll(/\[(00\d{2})[ -]/g);
  const indexAdrs = new Set([...indexMatches].map((m) => m[1] ?? ''));

  indexAdrs.forEach((adrNum) => {
    if (!adrNum || adrNum === '0015') return;
    const found = adrFiles.some((f) => f.startsWith(adrNum));
    if (!found) {
      logError(`index.md references ADR ${adrNum}, but no matching file exists in knowledge/design/.`);
    }
  });
  logSuccess(`index.md ADR references verified against disk.`);
} else {
  logError(`index.md not found at ${INDEX_MD}`);
}

// 5. Verify mirror parity between knowledge/design/ and .agents/skills/design/knowledge/design/
if (!isInsideSkillDir && fs.existsSync(SKILL_DESIGN_DIR)) {
  let driftCount = 0;
  for (const file of fs.readdirSync(CANONICAL_DESIGN_DIR).filter((f) => f.endsWith('.md'))) {
    const canonicalContent = fs.readFileSync(path.join(CANONICAL_DESIGN_DIR, file), 'utf8');
    const skillPath = path.join(SKILL_DESIGN_DIR, file);
    if (!fs.existsSync(skillPath)) {
      logError(`Missing mirror file in .agents/skills/design/knowledge/design/${file}. Run with --sync.`);
      driftCount++;
    } else if (fs.readFileSync(skillPath, 'utf8') !== canonicalContent) {
      logError(`Content drift detected between knowledge/design/${file} and .agents/skills/design/knowledge/design/${file}. Run with --sync.`);
      driftCount++;
    }
  }
  if (driftCount === 0) {
    logSuccess('Canonical knowledge/design/ and .agents/skills/design/knowledge/design/ are 100% in sync.');
  }
}

// 6. Verify mirror parity with packages/configs/agents/skills/design/ when in monorepo root
if (!isInsideSkillDir && fs.existsSync(CONFIGS_SKILL_DIR)) {
  let configsDriftCount = 0;
  for (const doc of ['SKILL.md', 'REFERENCE.md', 'MIGRATION.md']) {
    const srcDoc = path.join(SKILL_DIR, doc);
    const destDoc = path.join(CONFIGS_SKILL_DIR, doc);
    if (fs.existsSync(srcDoc)) {
      if (!fs.existsSync(destDoc) || fs.readFileSync(srcDoc, 'utf8') !== fs.readFileSync(destDoc, 'utf8')) {
        logError(`Content drift detected between .agents/skills/design/${doc} and packages/configs/agents/skills/design/${doc}. Run with --sync.`);
        configsDriftCount++;
      }
    }
  }
  if (configsDriftCount === 0) {
    logSuccess('.agents/skills/design/ and packages/configs/agents/skills/design/ top-level docs are 100% in sync.');
  }
}

console.log('\n----------------------------------------');
if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('All Design ADR freshness, mirror parity & link checks passed cleanly!');
}
