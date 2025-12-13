// Script para gerar ícones PNG a partir dos SVGs
// Requer: npm install -g sharp-cli ou usar uma ferramenta online

const fs = require('fs');
const path = require('path');

console.log(`
Para gerar os ícones PNG do PWA, você pode:

1. Usar uma ferramenta online:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   
2. Usar o Sharp CLI:
   npm install -g sharp-cli
   sharp -i public/icon-192.svg -o public/icon-192.png
   sharp -i public/icon-512.svg -o public/icon-512.png

3. Usar ImageMagick:
   convert public/icon-192.svg public/icon-192.png
   convert public/icon-512.svg public/icon-512.png

Os arquivos SVG já estão criados em public/
`);


