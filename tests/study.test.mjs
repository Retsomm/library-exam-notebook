import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {grade,emptyState,recordAnswer,validateBackup,mergeStates} from '../lib/study.mjs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
const map=new Map(bank.questions.map(q=>[q.id,q]));
test('all 1755 official questions have usable mobile text, options and official source links',()=>{
 assert.equal(map.size,1755);assert.equal(bank.exams.length,36);
 for(const q of bank.questions){
  assert.ok(q.stem.trim().length||q.passage.length,q.id);
  assert.equal(q.options.map(o=>o.letter).join(''),q.multi?'ABCDE':'ABCD',q.id);
  assert.ok(q.options.every(o=>o.text.trim()),q.id);
  assert.deepEqual(q.images,[]);
  const exam=bank.exams.find(e=>e.id===q.examId);
  assert.equal(new URL(exam.source).hostname,'wwwq.moex.gov.tw');
  assert.equal(new URL(exam.listing).hostname,'wwwq.moex.gov.tw');
  assert.deepEqual(exam.pages,[]);
  for(const answer of q.accepted)assert.equal(grade(q,answer.split('')),true,q.id);
 }
});
test('shared English reading passages appear with every question in their group',()=>{
 for(let n=46;n<=50;n++)assert.ok(map.get(`115-1-${n}`).passage.includes('Elon Musk'));
 for(let n=41;n<=45;n++)assert.ok(map.get(`109-1-${n}`).passage.includes('Flowers'));
 assert.ok(!map.get('115-1-45').text.includes('Elon Musk'));
});
test('official corrections and multiple choice use the right acceptance rules',()=>{
 assert.equal(grade(map.get('114-1-34'),['A']),true);assert.equal(grade(map.get('114-1-34'),['B']),true);assert.equal(grade(map.get('114-1-34'),['C']),false);
 assert.deepEqual(map.get('111-2-6').accepted,['A']);assert.deepEqual(map.get('107-3-37').accepted,['C']);
 for(const a of 'ABCD'){assert.equal(grade(map.get('108-1-15'),[a]),true);assert.equal(grade(map.get('108-3-36'),[a]),true);}
 assert.equal(grade(map.get('115-0-36'),['D','E']),true);assert.equal(grade(map.get('115-0-36'),['D']),false);assert.equal(grade(map.get('115-0-36'),['D','E','A']),false);
});
test('wrong answer is saved, a correct retry masters it, and old backups merge',()=>{
 const s=emptyState(),q=map.get('115-2-1');recordAnswer(s,q,['A'],'2026-10-18T08:00:00Z');assert.equal(s.wrong[q.id].active,true);
 recordAnswer(s,q,['B'],'2026-10-18T08:01:00Z');assert.equal(s.wrong[q.id].active,false);assert.equal(s.records[q.id].attempts,2);
 s.bookmarks.push(q.id);s.notes[q.id]='測試筆記';const roundtrip=validateBackup(JSON.parse(JSON.stringify(s)),new Set(map.keys()));assert.deepEqual(mergeStates(s,roundtrip),s);
 assert.throws(()=>validateBackup({version:4},new Set(map.keys())));
});
