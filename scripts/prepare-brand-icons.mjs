// All raster icons are derived from the one editable SVG mark.
import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../public/brand/',import.meta.url);
const mark=await readFile(new URL('sunrise-mark.svg',root));
const sizes=[16,32,48,180,192,512];
const pngs=new Map();
for(const size of sizes){
 const inner=Math.round(size*.84),padding=Math.floor((size-inner)/2);
 const png=await sharp(mark).resize(inner,inner).extend({top:padding,left:padding,bottom:size-inner-padding,right:size-inner-padding,background:'#657F62'}).flatten({background:'#657F62'}).png().toBuffer();
 pngs.set(size,png);
 const name=size===180?'apple-touch-icon.png':size<64?`favicon-${size}.png`:`icon-${size}.png`;
 await writeFile(new URL(name,root),png);
}
// ICO directory with embedded PNG frames for browser fallback.
const frames=[16,32,48],header=Buffer.alloc(6+16*frames.length);
header.writeUInt16LE(1,2);header.writeUInt16LE(frames.length,4);
let offset=header.length;
frames.forEach((size,index)=>{
 const position=6+index*16,png=pngs.get(size);
 header[position]=size;header[position+1]=size;
 header.writeUInt16LE(1,position+4);header.writeUInt16LE(32,position+6);
 header.writeUInt32LE(png.length,position+8);header.writeUInt32LE(offset,position+12);
 offset+=png.length;
});
await writeFile(new URL('../favicon.ico',root),Buffer.concat([header,...frames.map(size=>pngs.get(size))]));
console.log('Generated favicon and home-screen icons from sunrise-mark.svg');
