import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {vocabularyId,buildVocabularyIndex} from '../lib/vocabulary.mjs';
import {emptyState,validateBackup,mergeStates} from '../lib/study.mjs';
import {stateChanges,applyStudyMutation,readStudyMetadata,cloudState,vocabularyMigration} from '../lib/sync-model.mjs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
const explanations=Object.fromEntries(readdirSync(new URL('../data/explanations/',import.meta.url)).filter(name=>name.endsWith('.json')).map(name=>[name.slice(0,-5),JSON.parse(readFileSync(new URL('../data/explanations/'+name,import.meta.url)))]));
const index=buildVocabularyIndex(bank.questions,explanations),words=Object.keys(index),known=new Set(bank.questions.map(q=>q.id));
const [a,b,c]=words;
const q=bank.questions.find(item=>item.examId==='115-2s');
const session={ids:[q.id],index:0,title:'學習進度',choices:{[q.id]:q.accepted[0].split('')},checked:{[q.id]:true}};
test('every English vocabulary entry has one stable card and an existing source question',()=>{
 assert.ok(words.length>100);
 for(const q of bank.questions)for(const item of explanations[q.examId]?.[q.id]?.vocabulary||[]){const id=vocabularyId(q.examId,item);assert.deepEqual(index[id].meaning,item.meaning);assert.ok(known.has(index[id].questionId));}
 const sample=index[a];assert.equal(vocabularyId(a.slice(0,5),{...sample,word:sample.word.toUpperCase()}),a);
 assert.notEqual(vocabularyId(a.slice(0,5),{...sample,meaning:'另一個意思'}),a);
 const reverse=buildVocabularyIndex([...bank.questions].reverse(),explanations);assert.deepEqual(Object.keys(reverse).sort(),words.sort());
});
test('vocabulary backup supports old files, rejects unknown IDs and merges without duplicate cards',()=>{
 const old=emptyState();delete old.vocabularyBookmarks;assert.deepEqual(validateBackup(old,known).vocabularyBookmarks,[]);
 const state={...emptyState(),vocabularyBookmarks:[a,a,'unknown','999-1-1234567890abcdef',b]};
 const safe=validateBackup(state,known);assert.deepEqual(safe.vocabularyBookmarks,[a,b]);assert.deepEqual(mergeStates(safe,safe).vocabularyBookmarks,[a,b]);
});
test('two devices save different words and remove a word without overwriting practice or other cards',()=>{
 let json=JSON.stringify(session);
 json=applyStudyMutation(json,{vocabularyBookmarks:{[a]:true}});
 json=applyStudyMutation(json,{vocabularyBookmarks:{[b]:true}});
 json=applyStudyMutation(json,{vocabularyBookmarks:{[a]:false}});
 assert.deepEqual(readStudyMetadata(json).session,session);
 let state=cloudState(new Map(),json,bank.questions);assert.deepEqual(state.vocabularyBookmarks,[b]);assert.deepEqual(state.session,session);
 json=applyStudyMutation(json,{sessionJSON:'null'});assert.equal(readStudyMetadata(json).session,null);assert.deepEqual(cloudState(new Map(),json,bank.questions).vocabularyBookmarks,[b]);
 json=applyStudyMutation(json,{sessionJSON:JSON.stringify(session)});assert.deepEqual(cloudState(new Map(),json,bank.questions).vocabularyBookmarks,[b]);
});
test('offline word diffs overlay cloud state and migration preserves removal tombstones',()=>{
 const before=emptyState(),after=emptyState();before.vocabularyBookmarks=[a];after.vocabularyBookmarks=[b];
 const changes=stateChanges(before,after);assert.equal(changes.length,1);assert.deepEqual(changes[0].patch.vocabularyBookmarks,{[a]:false,[b]:true});
 const json=applyStudyMutation(undefined,{vocabularyBookmarks:{[a]:true,[c]:true}});
 const pending=changes.map((change,i)=>({...change,id:`offline-${i}`}));
 assert.deepEqual(new Set(cloudState(new Map(),json,bank.questions,pending).vocabularyBookmarks),new Set([b,c]));
 const removed=applyStudyMutation(json,changes[0].patch);
 assert.deepEqual(vocabularyMigration(before,removed),[]);
 const stale=applyStudyMutation(removed,{vocabularyBookmarks:{[a]:true,[c]:true}},'migrate');
 assert.deepEqual(new Set(cloudState(new Map(),stale,bank.questions).vocabularyBookmarks),new Set([b,c]));
});
test('study metadata upgrades old JSON, migrates missing local cards, and has ample space for all word flags',()=>{
 assert.deepEqual(readStudyMetadata('not json'),{session:null,vocabularyBookmarks:{},attempts:[]});
 const local={...emptyState(),vocabularyBookmarks:[a,b]};
 const changes=vocabularyMigration(local,JSON.stringify(session));assert.equal(changes.length,1);
 const json=applyStudyMutation(JSON.stringify(session),changes[0].patch,'migrate');assert.deepEqual(readStudyMetadata(json).session,session);assert.deepEqual(cloudState(new Map(),json,bank.questions).vocabularyBookmarks,[a,b]);
 const largest=applyStudyMutation(JSON.stringify(session),{vocabularyBookmarks:Object.fromEntries(words.map(id=>[id,false]))});
 assert.ok(largest.length<100000,`${words.length} flags use ${largest.length} characters`);
});
