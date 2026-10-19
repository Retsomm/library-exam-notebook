import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {newerVersion,saveBeforeReload} from '../lib/app-version.mjs';
import {emptyState} from '../lib/study.mjs';
const require=createRequire(import.meta.url);
test('version checks reject invalid manifests and detect a changed release including rollbacks',()=>{
 const current='1234567890abcdef',next='abcdef1234567890';
 for(const manifest of [null,{}, {version:current},{version:'latest'},{version:'<script>'},{version:3}])assert.equal(newerVersion(manifest,current),null);
 assert.equal(newerVersion({version:next},current),next);
 assert.equal(newerVersion({version:current},next),current);
 assert.equal(newerVersion({version:next},undefined),null);
});
test('updating persists the latest notes, choices, submitted answers and bookmarks before reload',()=>{
 const state=emptyState(),calls=[];
 state.session={ids:['115-0-1'],index:0,title:'test',choices:{'115-0-1':['B']},checked:{'115-0-1':true}};
 state.notes['115-0-1']='更新前最後輸入的筆記';state.explanationBookmarks.push('115-0-1');
 saveBeforeReload({setItem:(key,value)=>{calls.push('save');assert.equal(key,'study');assert.deepEqual(JSON.parse(value),state);}},'study',state,()=>calls.push('reload'));
 assert.deepEqual(calls,['save','reload']);let reloaded=false;
 assert.throws(()=>saveBeforeReload({setItem:()=>{throw Error('Storage full');}},'study',state,()=>{reloaded=true;}));
 assert.equal(reloaded,false);
});
test('update notice checks without caching, never reloads automatically, and rechecks on focus',async()=>{
 const originals=new Map(),set=(key,value)=>{originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});};
 const previous=process.env.NEXT_PUBLIC_APP_VERSION;process.env.NEXT_PUBLIC_APP_VERSION='1234567890abcdef';
 const windowEvents=new EventTarget(),documentEvents=new EventTarget();documentEvents.visibilityState='visible';
 let reloads=0,requests=0,cleanup;
 const slots=[];let cursor=0;const effects=[];
 set('window',Object.assign(windowEvents,{location:{reload:()=>reloads++}}));set('document',documentEvents);
 set('fetch',async(url,options)=>{assert.equal(url,'/version.json');assert.equal(options.cache,'no-store');requests++;return {ok:true,json:async()=>({version:'abcdef1234567890'})};});
 set('setInterval',()=>123);set('clearInterval',()=>{});set('localStorage',{setItem:()=>{}});
 const source=readFileSync(new URL('../components/app-update-notice.tsx',import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('require','module','exports',js)(name=>name==='react'?{useState:initial=>{const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=value;}];},useEffect:effect=>effects.push(effect)}:name==='@/lib/app-version.mjs'?{newerVersion,saveBeforeReload}:require(name),module,module.exports);
 const render=()=>{cursor=0;return module.exports.default({storageKey:'study',study:emptyState(),ready:true});};
 try{
  assert.equal(render(),null);cleanup=effects[0]();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(requests,1);assert.equal(reloads,0);assert.ok(render());
  windowEvents.dispatchEvent(new Event('focus'));await new Promise(resolve=>setImmediate(resolve));assert.equal(requests,2);
  cleanup();cleanup=null;windowEvents.dispatchEvent(new Event('focus'));await new Promise(resolve=>setImmediate(resolve));assert.equal(requests,2);
 }finally{
  cleanup?.();for(const [key,value] of originals)if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];
  if(previous===undefined)delete process.env.NEXT_PUBLIC_APP_VERSION;else process.env.NEXT_PUBLIC_APP_VERSION=previous;
 }
});
