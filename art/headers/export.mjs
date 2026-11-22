import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

// Tiles in the editable sheet, left to right and top to bottom.
const rows = [
  ['quickstart', 'overview', 'replicas-capture'],
  ['changelog', 'context-suggestions', 'sessions-memories'],
  ['kubernetes', 'agent-handoffs', 'data-flow'],
  ['devin-cloud'],
];

const width = 222;
const height = 82;
const sheet = fileURLToPath(new URL('./master.png', import.meta.url));
const output = new URL('../../public/images/docs/pixel/headers/', import.meta.url);
const metadata = await sharp(sheet).metadata();
if (metadata.width !== width * rows[0].length || metadata.height !== height * rows.length) {
  throw new Error('The master sheet dimensions must match the tile rows above.');
}

for (const [row, tiles] of rows.entries()) {
  for (const [column, name] of tiles.entries()) {
    await sharp(sheet)
      .extract({ left: column * width, top: row * height, width, height })
      .resize(width * 4, height * 4, { kernel: 'nearest' })
      .png({ palette: true, colours: 4, dither: 0 })
      .toFile(fileURLToPath(new URL(name + '.png', output)));
  }
}
