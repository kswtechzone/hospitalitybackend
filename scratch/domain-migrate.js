const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const ignoreDirs = ['node_modules', '.git', 'dist', '.next', 'build', 'scratch', 'artifacts', '.gemini'];
const targetExtensions = ['.tsx', '.ts', '.js', '.jsx', '.md', '.json'];

// Replace specific domain occurrences while preserving the prefix logic
function replaceContent(content) {
  let updated = content;
  updated = updated.replace(/\.kswtechzone\.com/g, '.kswtechzone.com.np');
  updated = updated.replace(/\.kswms\.com/g, '.kswtechzone.com.np');
  updated = updated.replace(/@kswms\.com/g, '@kswtechzone.com.np');
  // Avoid replacing the new one we just added and any existing .com.np.np
  updated = updated.replace(/\.com\.np\.np/g, '.com.np');
  
  return updated;
}

function traverseAndReplace(currentPath) {
  const stats = fs.statSync(currentPath);

  if (stats.isDirectory()) {
    const dirName = path.basename(currentPath);
    if (ignoreDirs.includes(dirName)) return;

    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      traverseAndReplace(path.join(currentPath, file));
    }
  } else if (stats.isFile()) {
    const ext = path.extname(currentPath);
    if (targetExtensions.includes(ext)) {
      const content = fs.readFileSync(currentPath, 'utf8');
      const newContent = replaceContent(content);

      if (content !== newContent) {
        fs.writeFileSync(currentPath, newContent, 'utf8');
        console.log(`Updated: ${currentPath}`);
      }
    }
  }
}

console.log('Starting UI Domain replacement script...');
traverseAndReplace(rootDir);
console.log('Domain replacement script completed successfully.');
