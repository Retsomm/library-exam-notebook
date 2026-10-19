import { copyFileSync } from 'node:fs';
copyFileSync(new URL('../data/bank.json', import.meta.url), new URL('../public/bank.json', import.meta.url));

import {mkdirSync,readdirSync} from 'node:fs';
const source=new URL('../data/explanations/',import.meta.url);
mkdirSync(source,{recursive:true});
const target=new URL('../public/explanations/',import.meta.url);mkdirSync(target,{recursive:true});
for(const name of readdirSync(source))if(name.endsWith('.json'))copyFileSync(new URL(name,source),new URL(name,target));
