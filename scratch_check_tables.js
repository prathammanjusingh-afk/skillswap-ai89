const fs = require('fs');
const path = require('path');

function getAllFiles(dir, all = []) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, all);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      all.push(full);
    }
  });
  return all;
}

const files = getAllFiles('src');
const fromCalls = new Map();

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /\.from\((?:'|")([^'"]+)(?:'|")\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const table = match[1];
    if (!fromCalls.has(table)) {
      fromCalls.set(table, []);
    }
    fromCalls.get(table).push(f);
  }
});

console.log('Unique Supabase tables queried across src:');
for (const [table, occurrences] of fromCalls.entries()) {
  console.log(`- ${table} (${occurrences.length} references)`);
}
