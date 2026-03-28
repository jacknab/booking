
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'dist/public/assets/index-fBNrSEzl.js');
const content = fs.readFileSync(filePath, 'utf8');

let index = 0;
while ((index = content.indexOf('require', index)) !== -1) {
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + 50);
  console.log(`Match at ${index}:`);
  console.log(content.slice(start, end));
  console.log('---');
  index += 7;
}
