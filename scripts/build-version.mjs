import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
export const buildVersion=(root=resolve('.'))=>{
 const files=[];
 const visit=path=>{
  for(const item of readdirSync(path,{withFileTypes:true})){
   const file=resolve(path,item.name);
   if(item.isDirectory())visit(file);
   else if(/\.(tsx?|mjs|mts|css|json)$/.test(item.name))files.push(file);
  }
 };
 for(const folder of ['app','components','lib','data'])visit(resolve(root,folder));
 for(const file of ['package.json','package-lock.json','next.config.ts','firebase.json','scripts/prepare-static.mjs','scripts/build-version.mjs'])files.push(resolve(root,file));
 const hash=createHash('sha256');
 for(const file of files.sort())hash.update(relative(root,file)).update('\0').update(readFileSync(file)).update('\0');
 return hash.digest('hex').slice(0,16);
};
