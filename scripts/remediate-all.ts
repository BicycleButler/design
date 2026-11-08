import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rawArgs = process.argv.slice(2);
const positionalArgs = rawArgs.filter((arg) => !arg.startsWith('--'));
const isDryRun = rawArgs.includes('--dry-run');
const TARGET_DIR = positionalArgs[0] || 'src';
const SCRIPTS_DIR = path.resolve(__dirname);

console.log(`🚀 Starting Full Design System Remediation across "${TARGET_DIR}"${isDryRun ? ' (DRY RUN)' : ''}...\n`);

const remediationScripts = [
  'remediate-badge-deprecation.ts',
  'remediate-static-colors.ts',
  'remediate-deterministic-fallbacks-and-a11y.ts',
  'fix-duplicate-aria-labels.ts'
];

remediationScripts.forEach((scriptName) => {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  if (fs.existsSync(scriptPath)) {
    console.log(`▶ Running ${scriptName}...`);
    try {
      const dryRunFlag = isDryRun ? ' --dry-run' : '';
      execSync(`npx tsx "${scriptPath}" "${TARGET_DIR}"${dryRunFlag}`, { stdio: 'inherit' });
    } catch {
      console.error(`⚠️ Warning: Error executing ${scriptName}`);
    }
    console.log('');
  }
});

console.log('✅ Full Design System Remediation complete! Run audit to verify:');
console.log(`   npx tsx ${path.join(SCRIPTS_DIR, 'audit-design-system-compliance.ts')} ${TARGET_DIR}\n`);
