// Writes each hand in src/cast/hands.tsx as a standalone SVG (cast/hands/<name>.svg) for Animate:
// File > Import to Library, one per frame of an Ebo_Hands graphic symbol. The wrist is at (0, 0).
import fs from 'fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {HANDS} from '../../src/cast/hands';

for (const [name, H] of Object.entries(HANDS)) {
  const body = renderToStaticMarkup(<H />);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-90 -20 180 150" width="180" height="150">${body}</svg>\n`;
  fs.writeFileSync(`cast/hands/${name}.svg`, svg);
}
console.log('hands:', Object.keys(HANDS).join(', '));
