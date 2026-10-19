// All raster icons are derived from the one editable SVG mark.
import sharp from 'sharp';
import {brand} from '../lib/brand.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../public/brand/',import.meta.url);
const mark=await readFile(new URL('library-mark.svg',root));
const sizes=[16,32,48,180,192,512];
const pngs=new Map();
for(const size of sizes){
 const inner=Math.round(size*.84),padding=Math.floor((size-inner)/2);
 const png=await sharp(mark).resize(inner,inner).extend({top:padding,left:padding,bottom:size-inner-padding,right:size-inner-padding,background:'#11182a'}).flatten({background:'#11182a'}).png().toBuffer();
 pngs.set(size,png);
 const name=size===180?'library-apple-touch-icon.png':size<64?`library-favicon-${size}.png`:`library-icon-${size}.png`;
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
console.log('Generated favicon and home-screen icons from library-mark.svg');

await writeFile(new URL('../site.webmanifest',root),JSON.stringify({id:'/',name:brand.name+'｜初等圖書資訊管理練習',short_name:brand.name,lang:'zh-Hant',description:brand.description,start_url:'/practice/',scope:'/',display:'standalone',background_color:brand.themeColor,theme_color:brand.themeColor,icons:[192,512].map(size=>({src:brand.iconPrefix+'-icon-'+size+'.png',sizes:size+'x'+size,type:'image/png',purpose:'any'}))},null,2)+'\n');
