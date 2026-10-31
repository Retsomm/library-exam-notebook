import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syncErrorMessage} from '../lib/sync-errors.mjs';
test('sync errors distinguish access rejection from an unavailable server without exposing raw errors',()=>{
 assert.match(syncErrorMessage({code:'permission-denied'}),/拒絕讀寫/);
 assert.match(syncErrorMessage({code:'firestore/unavailable'}),/無法連上/);
 assert.match(syncErrorMessage({code:'unauthenticated'}),/重新登入/);
 assert.match(syncErrorMessage({code:'resource-exhausted'}),/額度/);
 assert.doesNotMatch(syncErrorMessage({message:'private token'}),/private token/);
 assert.doesNotThrow(()=>syncErrorMessage(null));
});
test('opening, reconnecting and returning to the site request server reads, and hiding flushes queued work',()=>{
 const source=readFileSync(new URL('../lib/cloud-sync.ts',import.meta.url),'utf8');
 assert.match(source,/getDocsFromServer\(collection/);
 assert.match(source,/getDocFromServer\(doc/);
 assert.match(source,/else await this.readServer\(\)/);
 assert.match(source,/visibilityState==='visible'.*this.readServer\(\)/);
 assert.match(source,/private online=\(\)=>\{void this.readServer\(\)/);
 assert.match(source,/private pagehide=\(\)=>\{this.persist\(\);clearTimeout\(this.timer\);void this.drain\(\)/);
});
