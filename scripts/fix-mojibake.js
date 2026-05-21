const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src');

const replacements = {
  "Ã¡": "á", "Ã¢": "â", "Ã£": "ã", "Ã©": "é", "Ãª": "ê",
  "Ã­": "í", "Ã³": "ó", "Ã´": "ô", "Ãµ": "õ", "Ãº": "ú",
  "Ã§": "ç", "Ã\x81": "Á", "Ã\x82": "Â", "Ã\x83": "Ã",
  "Ã\x89": "É", "Ã\x8A": "Ê", "Ã\x8D": "Í", "Ã\x93": "Ó",
  "Ã\x94": "Ô", "Ã\x95": "Õ", "Ã\x9A": "Ú", "Ã\x87": "Ç",
  "â€”": "—", "â€“": "–", "â€¢": "•",
  "â€œ": "“", "â€": "”", "â€˜": "‘", "â€™": "’"
};

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const [wrong, right] of Object.entries(replacements)) {
        if (content.includes(wrong)) {
          content = content.split(wrong).join(right);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

processDirectory(dir);
console.log('Done!');
