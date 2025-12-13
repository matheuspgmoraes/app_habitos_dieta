import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

async function generateIcons() {
  try {
    // Gerar icon-192.png
    await sharp(join(publicDir, 'icon-192.svg'))
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'icon-192.png'));

    console.log('✅ icon-192.png gerado com sucesso');

    // Gerar icon-512.png
    await sharp(join(publicDir, 'icon-512.svg'))
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'icon-512.png'));

    console.log('✅ icon-512.png gerado com sucesso');
    console.log('\n🎉 Todos os ícones foram gerados!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    console.log('\n💡 Dica: Os SVGs podem ser convertidos manualmente usando ferramentas online:');
    console.log('   - https://realfavicongenerator.net/');
    console.log('   - https://www.pwabuilder.com/imageGenerator');
  }
}

generateIcons();

