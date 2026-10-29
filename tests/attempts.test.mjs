import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {emptyState,recordAnswer,validateBackup,mergeStates} from '../lib/study.mjs';
import {completeAttempt,attemptYearScores,mergeAttempts} from '../lib/attempts.mjs';
import {stateChanges,applyStudyMutation,cloudState,vocabularyMigration} from '../lib/sync-model.mjs';
import {scoreQuestions} from '../lib/scoring.mjs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url))),map=new Map(bank.questions.map(q=>[q.id,q])),known=new Set(map.keys());
const start=(examId='115-2s')=>{const s=emptyState(),qs=bank.questions.filter(q=>q.examId===examId);s.session={examId,attemptId:randomUUID(),startedAt:'2026-10-24T01:00:00.000Z',ids:qs.map(q=>q.id),index:0,title:'測驗',choices:{},checked:{}};return s;};
const finish=s=>{for(const id of s.session.ids){const q=map.get(id);s.session.choices[id]=['A'];s.session.checked[id]=recordAnswer(s,q,['A']);}completeAttempt(s,map,bank.exams,'2026-10-24T02:00:00.000Z');return s;};
test('full-paper snapshot includes wrong submissions and cannot be changed by reviews or repeated completion',()=>{
 const s=start();completeAttempt(s,map,bank.exams);assert.equal(s.attempts.length,0);finish(s);const original=structuredClone(s.attempts);assert.equal(original.length,1);
 for(const id of s.session.ids)recordAnswer(s,map.get(id),map.get(id).accepted[0].split(''));
 completeAttempt(s,map,bank.exams);assert.deepEqual(s.attempts,original);
 const next=finish(start());assert.equal(mergeAttempts(s.attempts,next.attempts).length,2);
});
test('review of even an entire paper and legacy sessions never create exam history',()=>{
 const s=start();delete s.session.attemptId;finish(s);assert.deepEqual(s.attempts,[]);
 const partial=start();partial.session.ids.pop();finish(partial);assert.deepEqual(partial.attempts,[]);
});
test('Chinese snapshot retains official partial credit rather than percentage of correct items',()=>{
 const s=finish(start('115-0'));const expected=scoreQuestions(s.session.ids.map(id=>map.get(id)),s.session.choices);
 assert.equal(s.attempts[0].score,expected.score);assert.equal(s.attempts[0].max,100);
});
test('backup roundtrip, old backup, and merge preserve independent attempts and resume identity',()=>{
 const s=finish(start());const restored=validateBackup(JSON.parse(JSON.stringify(s)),known);assert.deepEqual(restored.attempts,s.attempts);assert.equal(restored.session.attemptId,s.session.attemptId);
 const old={...emptyState()};delete old.attempts;assert.deepEqual(validateBackup(old,known).attempts,[]);
 const other=finish(start());assert.equal(mergeStates(s,other).attempts.length,2);
 assert.equal(validateBackup({...s,attempts:[{...s.attempts[0],score:101}]},known).attempts.length,0);
});
test('two devices, retry, stale session and offline overlay retain completed scores',()=>{
 const a=finish(start()),b=finish(start('115-0'));const pa=stateChanges(emptyState(),a).find(m=>m.docId==='_session'),pb=stateChanges(emptyState(),b).find(m=>m.docId==='_session');
 let json=applyStudyMutation(undefined,pa.patch);json=applyStudyMutation(json,pb.patch);json=applyStudyMutation(json,pa.patch);
 json=applyStudyMutation(json,{sessionJSON:'null'});assert.equal(cloudState(new Map(),json,bank.questions).attempts.length,2);
 const overlay=cloudState(new Map(),undefined,bank.questions,[{...pa,id:'pending'}]);assert.deepEqual(overlay.attempts,a.attempts);
 const migration=vocabularyMigration(a,undefined);assert.deepEqual(cloudState(new Map(),applyStudyMutation(undefined,migration[0].patch),bank.questions).attempts,a.attempts);
 assert.equal(vocabularyMigration(a,json).length,0);
});
test('comparison uses latest completed score for each same-year subject only',()=>{
 const states=['115-0','115-1','115-2s','115-3d'].map(id=>finish(start(id)));let attempts=states.flatMap(s=>s.attempts);
 const before=attemptYearScores(bank,attempts,115);assert.equal(before.complete,true);assert.equal(before.average,Math.round(attempts.reduce((n,a)=>n+a.score,0)/4*10000)/10000);
 assert.equal(attemptYearScores(bank,attempts,114).average,null);
 const repeat={...states[0].attempts[0],id:randomUUID(),score:100,completedAt:'2026-10-25T02:00:00.000Z'};attempts=mergeAttempts(attempts,[repeat]);assert.equal(attemptYearScores(bank,attempts,115).papers[0].score,100);
});
test('data-processing completed attempts retain their snapshot and are discoverable by year',()=>{
 const finished=finish(start('109-3d'));
 const saved=finished.attempts[0];
 assert.equal(saved.examId,'109-3d');
 assert.equal(saved.max,100);
 assert.equal(attemptYearScores(bank,finished.attempts,109).papers.find(item=>item.exam.id==='109-3d').score,saved.score);
});
test('a completed data-processing session can be recovered after an interrupted score write',()=>{
 const interrupted=finish(start('115-3d'));
 const expected=interrupted.attempts[0];
 interrupted.attempts=[];
 completeAttempt(interrupted,map,bank.exams,'2026-10-24T02:00:00.000Z');
 assert.deepEqual(interrupted.attempts,[expected]);
});
