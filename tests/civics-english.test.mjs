import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
const entries=JSON.parse(readFileSync(new URL('../data/explanations/115-1.json',import.meta.url)));
const questions=bank.questions.filter(q=>q.examId==='115-1');
test('115 civics and English provide 50 individual explanations and 200 option reasons',()=>{
 assert.equal(questions.length,50);assert.equal(Object.keys(entries).length,50);
 const summaries=new Set();let optionCount=0;
 for(const q of questions){
  const e=entries[q.id];assert.ok(e,q.id);assert.equal(e.revision,2);assert.ok(e.summary.length>=90,q.id);
  assert.ok(e.summary.includes('\n\n'),q.id);summaries.add(e.summary);
  assert.deepEqual(Object.keys(e.options).sort(),q.options.map(o=>o.letter).sort(),q.id);
  assert.deepEqual(Object.keys(e.optionVerdicts).sort(),q.options.map(o=>o.letter).sort(),q.id);
  for(const reason of Object.values(e.options)){assert.ok(reason.length>=30,q.id);optionCount++;}
  assert.ok(e.sources.some(s=>s.url.includes('t=S')),q.id+' official answer');
 }
 assert.equal(summaries.size,50);assert.equal(optionCount,200);
});
test('every English question includes context vocabulary; each reading question retains the whole group glossary',()=>{
 for(const q of questions.filter(q=>q.number>=36)){
  const vocabulary=entries[q.id].vocabulary;assert.ok(vocabulary.length>=3,q.id);
  for(const item of vocabulary){assert.ok(item.word);assert.ok(item.partOfSpeech);assert.ok(item.meaning);assert.ok(item.usage.length>=15,q.id);}
 }
 for(let n=46;n<=50;n++){
  const e=entries[`115-1-${n}`];assert.equal(e.vocabulary.length,10);
  assert.ok(e.vocabulary.some(v=>v.word==='brain-computer interface'));
  assert.ok(e.vocabulary.some(v=>v.word==='initiate'));
  assert.deepEqual(e.vocabulary,entries['115-1-46'].vocabulary);
 }
 assert.match(entries['115-1-46'].options.C,/for sure.*possible/);
 assert.match(entries['115-1-48'].options.D,/範圍更廣/);
 assert.match(entries['115-1-49'].summary,/不是.*已經能保證/);
});
test('legal explanations preserve official grading and distinguish ambiguity and procedural exceptions',()=>{
 assert.match(entries['115-1-9'].summary,/不能理解成.*毫無價值/);
 assert.match(entries['115-1-16'].summary,/解任.*並非.*不信任/);
 assert.match(entries['115-1-27'].options.D,/不能.*全然錯誤/);
 assert.match(entries['115-1-34'].options.D,/第 6 條/);
 assert.match(entries['115-1-33'].summary,/18 歲.*20 歲/s);
 assert.match(entries['115-1-20'].summary,/4 個月.*70 歲/s);
 for(const [id,answer] of [['115-1-9','D'],['115-1-16','C'],['115-1-27','B'],['115-1-34','D']])assert.deepEqual(questions.find(q=>q.id===id).accepted,[answer]);
});
