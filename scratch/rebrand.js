const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');

const replacements = [
  { search: /KSWMS/g, replace: 'KSWMS' },
  { search: /kswms/g, replace: 'kswms' },
  { search: /KSWMS/g, replace: 'KSWMS' },
  { search: /kswms/g, replace: 'kswms' },
  { search: /KSWMS/g, replace: 'KSWMS' },
  { search: /KSWMS/g, replace: 'KSWMS' },
  { search: /kswms/g, replace: 'kswms' },
  { search: /kswms/g, replace: 'kswms' }
];

const ignoredDirs = ['node_modules', '.next', 'dist', '.git', '.gemini'];

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoredDirs.includes(file)) {
        walkAndReplace(fullPath);
      }
    } else {
      // Only process text files (skip binaries)
      if (
        fullPath.endsWith('.ts') ||
        fullPath.endsWith('.tsx') ||
        fullPath.endsWith('.js') ||
        fullPath.endsWith('.jsx') ||
        fullPath.endsWith('.json') ||
        fullPath.endsWith('.md') ||
        fullPath.endsWith('.css') ||
        fullPath.endsWith('.prisma')
      ) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;

        for (const replacement of replacements) {
          content = content.replace(replacement.search, replacement.replace);
        }

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

console.log('Starting rebranding text replacement...');
walkAndReplace(rootDir);
console.log('Rebranding complete!');
