// Script to sync catalog.json image URLs into data.js
const fs = require('fs');

const catalog = JSON.parse(fs.readFileSync('./server/db/catalog.json', 'utf8'));
let dataJs = fs.readFileSync('./data.js', 'utf8');

let changeCount = 0;

catalog.forEach(prod => {
  // Build a regex to find this product's image field in data.js
  // Pattern: find the product block by id, then find its image field
  const lines = dataJs.split('\n');
  let inProduct = false;
  let productStartLine = -1;
  let imageLineIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"id": "' + prod.id + '"') || lines[i].includes('"id":"' + prod.id + '"')) {
      inProduct = true;
      productStartLine = i;
    }
    if (inProduct && i > productStartLine && (lines[i].includes('"id":') || lines[i].includes('"id" :')) && i !== productStartLine) {
      inProduct = false;
    }
    if (inProduct && lines[i].includes('"image":') && lines[i].includes('http')) {
      imageLineIdx = i;
      break;
    }
  }
  
  if (imageLineIdx >= 0) {
    const oldLine = lines[imageLineIdx];
    const newLine = oldLine.replace(/"image":\s*"[^"]*"/, '"image": "' + prod.image + '"');
    if (oldLine !== newLine) {
      lines[imageLineIdx] = newLine;
      dataJs = lines.join('\n');
      console.log('Updated', prod.id, '->', prod.image.substring(0, 60));
      changeCount++;
    } else {
      console.log('No change', prod.id);
    }
  } else {
    console.log('NOT FOUND:', prod.id);
  }
});

fs.writeFileSync('./data.js', dataJs, 'utf8');
console.log('\nTotal changes:', changeCount);
