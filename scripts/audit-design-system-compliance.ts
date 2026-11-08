import fs from 'fs';
import path from 'path';

interface Violation {
  file: string;
  line: number;
  rule: string;
  adr: string;
  severity: 'ERROR' | 'WARNING';
  snippet: string;
  description: string;
}

const rawArgs = process.argv.slice(2);
const positionalArgs = rawArgs.filter((arg) => !arg.startsWith('--'));
const isStrict = rawArgs.includes('--strict');
const isJsonOutput = rawArgs.includes('--json');
const TARGET_DIR = path.resolve(process.cwd(), positionalArgs[0] || 'src');

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist' && file !== 'build' && file !== '.git') {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      // Skip compiled CSS output bundles (for example, packages/ui/src/index.css when globals.css exists alongside)
      if (file === 'index.css' && fs.existsSync(path.join(dirPath, 'globals.css'))) {
        return;
      }
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function auditFile(filePath: string): Violation[] {
  const relativePath = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations: Violation[] = [];
  const isCssFile = filePath.endsWith('.css');

  const isModalOrDialog =
    content.includes('AlertDialog') ||
    content.includes('DialogContent') ||
    content.includes('DropdownMenu') ||
    content.includes('Popover');

  // Detect Frontline Work / Triage surface mode (ECO-0041)
  const isFrontlineWorkSurface =
    content.includes('@wiltermoodj/ui/frontline') ||
    content.includes('useFrontlineWorkflow') ||
    /taskIntent=["'](?:work-execution|triage-disposition)["']/.test(content) ||
    /executionSurfaceMode=["']frontline-work["']/.test(content) ||
    content.includes('useFrontlineStream') ||
    content.includes('foldFrontlineSession');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const nearbyContext = lines.slice(Math.max(0, idx - 3), Math.min(lines.length, idx + 4)).join('\n');

    // CSS files only run Rule 6 (linear easing) and Rule 14 (--surface-raised-border overrides)
    if (isCssFile) {
      if (/transition-[a-z-]*\s+linear/.test(lineText) || /ease-linear/.test(lineText)) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'Linear Easing Banned',
          adr: 'ADR 0022',
          severity: 'ERROR',
          snippet: lineText.trim(),
          description: 'Linear easing is strictly banned system-wide. Use cubic-bezier curves.'
        });
      }
      if (
        lineText.includes('--surface-raised-border: var(--border)') ||
        lineText.includes('--surface-raised-border: #') ||
        lineText.includes('--surface-raised-border: rgb')
      ) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'Conflicting Surface Border Token',
          adr: 'ADR 0041',
          severity: 'ERROR',
          snippet: lineText.trim(),
          description: '--surface-raised-border must be transparent to uphold borderless resting elevated surfaces. Consume @wiltermoodj/ui/globals.css.'
        });
      }
      if (/--surface-raised-border-opacity:\s*1\b/.test(lineText)) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'Conflicting Surface Border Opacity',
          adr: 'ADR 0041',
          severity: 'ERROR',
          snippet: lineText.trim(),
          description: '--surface-raised-border-opacity must be 0 for resting raised surfaces per ADR 0041.'
        });
      }
      return;
    }

    // Rule 1: Badge & Status Pill Deprecation (ADR 0035)
    const isBadgeDeclarationFile = relativePath.endsWith('badge.tsx') || relativePath.endsWith('badge.ts');
    if (!isBadgeDeclarationFile) {
      if (
        lineText.includes('@/components/ui/badge') ||
        lineText.includes('@/components/ui/Badge') ||
        /import\s+.*from\s+["'].*\/badge(?:\.js)?["']/.test(lineText) ||
        /import\s+.*Badge.*from\s+["']@(?:wiltermoodj|omnibutler)\/ui["']/.test(lineText) ||
        /<Badge[\s/>]/.test(lineText)
      ) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'Badge Deprecation',
          adr: 'ADR 0035',
          severity: 'ERROR',
          snippet: lineText.trim(),
          description: 'Usage of deprecated Badge component. Replace with Concept C sub-label stacking or Concept A margin wash.'
        });
      }

      // Status Pill pattern (ADR 0035)
      if (
        !relativePath.includes('avatar') &&
        !relativePath.includes('calendar') &&
        !relativePath.includes('switch') &&
        (/px-1\.5\s+py-0\.5\s+rounded-full/.test(lineText) ||
          /rounded-full\s+px-1\.5\s+py-0\.5/.test(lineText) ||
          /rounded-full\s+border\s+px-2\.5\s+py-0\.5/.test(lineText))
      ) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'Status Pill Deprecation',
          adr: 'ADR 0035',
          severity: 'ERROR',
          snippet: lineText.trim(),
          description: 'Status pill indicators are banned per ADR 0035. Use Concept C sub-label stacking or Concept A margin wash.'
        });
      }
    }

    // Colored dots pattern (ADR 0035)
    if (
      (/w-2\s+h-2\s+rounded-full\s+bg-/.test(lineText) || /rounded-full\s+w-2\s+h-2/.test(lineText)) &&
      !lineText.includes('animate-pulse') &&
      !lineText.includes('animate-ping')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Status Dot Deprecation',
        adr: 'ADR 0035',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Colored status dots are deprecated. Use Concept C sub-label stacking.'
      });
    }

    // Rule 2: Resting Destructive Action (ADR 0029, 0036)
    if (/<Button[^>]*variant=["']destructive["']/.test(lineText) && !isModalOrDialog) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Resting Destructive Button',
        adr: 'ADR 0029 / ADR 0036',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Persistent destructive variant button on resting surface. Gate behind overflow menu (...) or AlertDialog.'
      });
    }

    // Rule 3: Static Semantic Alert Colors (ADR 0020 & ECO-0041 state-kinetic leniency)
    const isTransientOrHardwareState =
      lineText.includes('toast') ||
      lineText.includes('error') ||
      lineText.includes('invalid') ||
      lineText.includes('reauth') ||
      lineText.includes('hover:') ||
      lineText.includes('animate-pulse') ||
      lineText.includes('animate-ping') ||
      lineText.includes('data-frontline-pulse') ||
      nearbyContext.includes('permissionError') ||
      nearbyContext.includes('errorMessage') ||
      nearbyContext.includes('isOffline') ||
      nearbyContext.includes('SCAN_SUCCESS') ||
      nearbyContext.includes('ERROR_HALT');

    if (
      /(?:text|bg)-(?:red|amber|emerald|green)-(?:500|600|700|100|200)/.test(lineText) &&
      !isTransientOrHardwareState
    ) {
      if (!relativePath.includes('chart') && !relativePath.includes('calendar') && !relativePath.includes('health')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'Static Alert Colors',
          adr: 'ADR 0020',
          severity: 'WARNING',
          snippet: lineText.trim(),
          description: 'Static alert color on resting UI element. Restrict colored alerts to transient states or active hover.'
        });
      }
    }

    // Rule 4: Arbitrary Spacing/Dimensions (ADR 0018)
    const arbitrarySpacingMatch = lineText.match(/(?:[pmp]|px|py|pl|pr|pt|pb|gap|space-x|space-y)-\[(\d+px)\]/);
    if (arbitrarySpacingMatch) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Arbitrary Spacing Value',
        adr: 'ADR 0018',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: `Arbitrary spacing value ${arbitrarySpacingMatch[1]} used. Use 7-token scale (space-1 to space-12).`
      });
    }

    // Rule 5: Font Size Cap > 24px (ADR 0019 & ECO-0039 / ECO-0041 leniency)
    const isFrontlineReadout =
      isFrontlineWorkSurface && (lineText.includes('tabular-nums') || lineText.includes('font-mono'));
    if (
      /text-(?:3xl|4xl|5xl|6xl|7xl|8xl|9xl)/.test(lineText) &&
      !relativePath.includes('hero') &&
      !relativePath.includes('landing') &&
      !isFrontlineReadout
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Font Size Exceeds Cap',
        adr: 'ADR 0019',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Font size exceeds strict application cap of 24px (text-2xl). Use text-display-* for marketing heroes or text-readout-* for hardware/frontline telemetry.'
      });
    }

    // Rule 6: Linear Easing / Invalid Duration (ADR 0022)
    if (/transition-[a-z-]*\s+linear/.test(lineText) || /ease-linear/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Linear Easing Banned',
        adr: 'ADR 0022',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Linear easing is strictly banned system-wide. Use cubic-bezier curves.'
      });
    }

    // Rule 6b: transition:all (ADR 0022 — forbidden pattern)
    if (/\btransition-all\b/.test(lineText) || /transition:\s*all/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'transition:all Banned',
        adr: 'ADR 0022',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: '`transition: all` is a forbidden pattern — animates unintended properties. Use specific transition properties.'
      });
    }

    // Rule 6c: Explicit Resting Container Border (ADR 0041)
    if (
      /<(?:Card|ContainerPanel)\b[^>]*className=["'][^"']*\b(?:border|border-border)\b/.test(lineText) &&
      !lineText.includes('border-dashed') &&
      !lineText.includes('border-primary') &&
      !lineText.includes('border-destructive') &&
      !lineText.includes('border-0')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Explicit Resting Container Border Banned',
        adr: 'ADR 0041',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Explicit resting border on Card or ContainerPanel is deprecated. Resting containers are borderless by default and elevated via shadow.'
      });
    }

    if (/duration-(?:700|800|900|1000|1500|2000)/.test(lineText) && !lineText.includes('animate-spin') && !lineText.includes('pulse')) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Transition Duration Budget Exceeded',
        adr: 'ADR 0022',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Transition duration exceeds strict cap of 500ms.'
      });
    }

    // Rule 7: Non-Lucide Icon Imports or Raw Unicode Emojis in JSX (ADR 0021)
    if (/import\s+.*from\s+['"](@heroicons|react-icons|@radix-ui\/react-icons)['"]/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Non-Lucide Icon Library',
        adr: 'ADR 0021',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Icon imported from non-Lucide library. Standardize on Lucide icons.'
      });
    }

    if (/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(lineText) && !lineText.includes('//') && !lineText.includes('/*')) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Raw Emoji in Functional UI',
        adr: 'ADR 0021',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Raw unicode emoji used in functional UI. Replace with Lucide icon.'
      });
    }

    // Rule 8: Icon Button Missing aria-label (ADR 0023, 0029)
    if (
      /<Button[^>]*size=["'](?:icon|icon-sm|icon-lg)["'][^>]*>/.test(lineText) &&
      !lineText.includes('aria-label') &&
      !content.slice(Math.max(0, content.indexOf(lineText) - 50), content.indexOf(lineText) + 200).includes('aria-label')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Icon Button Missing aria-label',
        adr: 'ADR 0023 / ADR 0029',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Icon-only button missing explicit aria-label attribute for accessibility.'
      });
    }

    // Rule 9: Non-Standard Fallback String (ADR 0030)
    if (/(?:\?\?|\|\|)\s*["'](?:N\/A|n\/a|None|null|-|Unknown)["']/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Non-Standard Unknown Fallback',
        adr: 'ADR 0030',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Fallback string should use standard em-dash ("—") for missing values.'
      });
    }

    // Rule 10: Zero Semantic Color at Rest (ADR 0036 §1 & ADR 0025 / ECO-0041 leniency)
    const isFormValidationOrStateKinetic =
      nearbyContext.includes('status?.type') ||
      nearbyContext.includes('saveStatus') ||
      nearbyContext.includes('errorMessage') ||
      nearbyContext.includes('isRequired') ||
      nearbyContext.includes('successFlash') ||
      nearbyContext.includes('variantClasses') ||
      nearbyContext.includes('data-frontline-pulse') ||
      nearbyContext.includes('ERROR_HALT') ||
      nearbyContext.includes('SCAN_SUCCESS') ||
      lineText.includes('focus-visible:') ||
      lineText.includes('focus:') ||
      lineText.includes('data-[highlighted]:');

    const hasSemanticColorAtRest =
      /\b(?:bg|text|border)-(?:destructive|success|warning)(?:-foreground)?\b/.test(lineText) &&
      !lineText.includes('hover:') &&
      !lineText.includes('group-hover:') &&
      !lineText.includes('data-[state') &&
      !lineText.includes('toast') &&
      !lineText.includes('Toast') &&
      !lineText.includes('AlertDialog') &&
      !lineText.includes('alert-dialog') &&
      !lineText.includes('invalid') &&
      !lineText.includes('error') &&
      !lineText.includes('validation') &&
      !isFormValidationOrStateKinetic;

    const isTransientOrAlertComponent =
      isModalOrDialog ||
      lineText.includes('animate-ping') ||
      lineText.includes('animate-pulse') ||
      relativePath.toLowerCase().includes('alert') ||
      relativePath.toLowerCase().includes('notification') ||
      relativePath.toLowerCase().includes('toast') ||
      relativePath.toLowerCase().includes('drawer') ||
      relativePath.toLowerCase().includes('modal') ||
      relativePath.toLowerCase().includes('popover') ||
      relativePath.toLowerCase().includes('utils');

    if (hasSemanticColorAtRest && !isTransientOrAlertComponent) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Semantic Color at Rest',
        adr: 'ADR 0036 §1',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Semantic alert color (destructive/success/warning) on a resting surface. Only allowed in toasts, open AlertDialogs, blur-triggered form validation, or hover inside open overflow menus.'
      });
    }

    // Rule 11: Shadow outside 5-tier scale (ADR 0041)
    if (/shadow-\[.*?\]/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Arbitrary Shadow Value',
        adr: 'ADR 0041',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Arbitrary shadow value used. Use 5-tier scale: shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl.'
      });
    }

    // Rule 12: Disabled Next Button in Multi-Step Wizard (ADR 0042 §3)
    if (/<Button[^>]*disabled=\{[^}]*invalid[^}]*\}[^>]*>.*Next/i.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Disabled Next Button in Wizard',
        adr: 'ADR 0042 §3',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Next button must NEVER be disabled based on form invalidity. Allow click-to-validate to focus the first invalid field.'
      });
    }

    // Rule 13: Generic aria-label Placeholder (ADR 0023, ADR 0031)
    if (/aria-label=["'](?:Button action|button|click here|icon)["']/i.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Generic aria-label Placeholder',
        adr: 'ADR 0023 / ADR 0031',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Generic aria-label placeholder used. Replace with explicit, verb-first description.'
      });
    }

    // Rule 15: ADR 0037 Desktop Header Violation (0px top nav on >=md, except multi-step wizards per ADR 0042)
    const isWizard = relativePath.toLowerCase().includes('wizard');
    if (!isWizard && /<header\b[^>]*className=["'][^"']*(?:sticky|fixed)\s+top-0[^"']*["']/.test(lineText)) {
      if (!/(?:md:hidden|lg:hidden)/.test(lineText)) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'Persistent Desktop Header Violation',
          adr: 'ADR 0037',
          severity: 'ERROR',
          snippet: lineText.trim(),
          description: 'Desktop (>=md) top header must be 0px (hidden) per ADR 0037. TopNav is only allowed on mobile with md:hidden.'
        });
      }
    }

    // Rule 16: Shadowed Local UI Imports
    const isOmniButlerRepo = relativePath.includes('packages/ui/src');
    if (!isOmniButlerRepo && /(?:from\s+['"]@\/components\/ui\/[a-zA-Z0-9_-]+['"]|from\s+['"]\.\.?\/ui\/[a-zA-Z0-9_-]+['"])/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Shadowed Local UI Import',
        adr: 'ADR 0015 / Stack Standards',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Component imported from local shadow ui directory instead of @wiltermoodj/ui. Run `npx @wiltermoodj/configs migrate-ui`.'
      });
    }

    // Rule 17: Blocking Modal in Frontline Work Surface (ECO-0041 / ADR 0032)
    if (
      isFrontlineWorkSurface &&
      (/<DialogContent\b/.test(lineText) || /<AlertDialogContent\b/.test(lineText)) &&
      !content.includes('surfaceModeOverride')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Blocking Modal in Frontline Surface',
        adr: 'ECO-0041 / ADR 0032',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Blocking modals (Dialog/AlertDialog) are banned in frontline-work surfaces. Use inline ActionCard expansion or inline DisambiguationOverlay.'
      });
    }

    // Rule 18: Native Browser Prompt/Alert in UI (ECO-0041)
    if (
      filePath.endsWith('.tsx') &&
      !lineText.trim().startsWith('//') &&
      !lineText.trim().startsWith('*') &&
      (/\bwindow\.(?:prompt|confirm|alert)\s*\(/.test(lineText) || /(?<![.\w])prompt\s*\(/.test(lineText))
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Native Browser Prompt/Alert Banned',
        adr: 'ECO-0041 / ADR 0032',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Native window.prompt/confirm/alert is banned in UI components. Use inline ActionCard inputs or AlertDialog in desk-ledger mode.'
      });
    }

    // Rule 19: DOM Focus Trap in Frontline Work Surface (ECO-0041)
    if (
      isFrontlineWorkSurface &&
      /\.focus\(\)/.test(lineText) &&
      nearbyContext.includes('setInterval')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'DOM Focus Trap in Frontline Surface',
        adr: 'ECO-0041',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Polling DOM .focus() trap detected in frontline-work surface. Use document-level useFrontlineStream listener instead.'
      });
    }
  });

  return violations;
}

function runAudit() {
  const files = getAllFiles(TARGET_DIR);
  const relTargetDir = path.relative(process.cwd(), TARGET_DIR);
  if (!isJsonOutput) {
    console.log(`Auditing ${files.length} files in ${relTargetDir}...\n`);
  }

  const scratchDir = path.resolve(process.cwd(), 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const allViolations: Violation[] = [];
  const filesWithViolations = new Set<string>();

  files.forEach((file) => {
    const fileViolations = auditFile(file);
    if (fileViolations.length > 0) {
      filesWithViolations.add(file);
      allViolations.push(...fileViolations);
    }
  });

  // Group by directory path relative to src/
  const byDir: Record<string, Violation[]> = {};
  allViolations.forEach((v) => {
    const parts = v.file.split('/');
    const dir = parts.length > 2 ? parts.slice(1, 3).join('/') : parts[0] || 'root';
    if (!byDir[dir]) byDir[dir] = [];
    byDir[dir].push(v);
  });

  // Group by rule
  const byRule: Record<string, number> = {};
  allViolations.forEach((v) => {
    byRule[v.rule] = (byRule[v.rule] || 0) + 1;
  });

  const report = {
    targetDir: relTargetDir,
    totalFiles: files.length,
    filesWithViolationsCount: filesWithViolations.size,
    cleanFilesCount: files.length - filesWithViolations.size,
    totalViolations: allViolations.length,
    byRule,
    byDir: Object.keys(byDir).map((dir) => ({
      domain: dir,
      violationCount: (byDir[dir] ?? []).length,
      violations: byDir[dir] ?? []
    })),
    violations: allViolations
  };

  fs.writeFileSync('scratch/design-audit-results.json', JSON.stringify(report, null, 2));

  // Generate Markdown summary
  let md = `# Design System Compliance Audit Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Target Directory:** \`${relTargetDir}\`\n`;
  md += `**Total Files Audited:** ${files.length}\n`;
  md += `**Clean Files:** ${files.length - filesWithViolations.size} (${files.length > 0 ? ((files.length - filesWithViolations.size) / files.length * 100).toFixed(1) : 100}%)\n`;
  md += `**Files with Violations:** ${filesWithViolations.size}\n`;
  md += `**Total Violations Detected:** ${allViolations.length}\n\n`;

  md += `## Violation Breakdown by Rule\n\n`;
  md += `| Rule | ADR | Count |\n|---|---|---|\n`;
  Object.entries(byRule).forEach(([rule, count]) => {
    const adr = allViolations.find((v) => v.rule === rule)?.adr || '';
    md += `| ${rule} | ${adr} | ${count} |\n`;
  });

  md += `\n## Violation Breakdown by Directory\n\n`;
  md += `| Directory | Violations | Status |\n|---|---|---|\n`;
  Object.keys(byDir)
    .sort((a, b) => (byDir[b]?.length ?? 0) - (byDir[a]?.length ?? 0))
    .forEach((dir) => {
      const count = byDir[dir]?.length ?? 0;
      md += `| \`${dir}\` | ${count} | ${count > 0 ? '⚠️ Needs Review' : '✅ Compliant'} |\n`;
    });

  md += `\n## Detailed Violation Log\n\n`;
  allViolations.slice(0, 100).forEach((v) => {
    md += `- **[${v.severity}]** \`${v.file}:${v.line}\` — **${v.rule}** (${v.adr}): ${v.description}\n  \`\`\`tsx\n  ${v.snippet}\n  \`\`\`\n`;
  });

  if (allViolations.length > 100) {
    md += `\n*... and ${allViolations.length - 100} more violations logged in scratch/design-audit-results.json*\n`;
  }

  fs.writeFileSync('scratch/design-audit-report.md', md);

  if (isJsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Audit complete! ${allViolations.length} violation(s) across ${filesWithViolations.size} file(s). Summary written to scratch/design-audit-report.md`);
  }

  if (isStrict && allViolations.length > 0) {
    process.exit(1);
  }
}

runAudit();
