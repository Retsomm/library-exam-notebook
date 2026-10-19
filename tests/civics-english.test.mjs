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
const entries114=JSON.parse(readFileSync(new URL('../data/explanations/114-1.json',import.meta.url)));
const questions114=bank.questions.filter(q=>q.examId==='114-1');
test('114 paper has complete individual teaching, original option coverage and contextual vocabulary',()=>{
 assert.equal(questions114.length,50);assert.equal(Object.keys(entries114).length,50);
 const summaries=new Set();
 for(const q of questions114){
  const e=entries114[q.id];assert.ok(e,q.id);assert.equal(e.revision,2);
  assert.ok(e.summary.length>=90);assert.ok(e.summary.includes('\n\n'));summaries.add(e.summary);
  for(const key of ['options','optionVerdicts'])assert.deepEqual(Object.keys(e[key]).sort(),q.options.map(o=>o.letter).sort(),q.id);
  for(const reason of Object.values(e.options))assert.ok(reason.length>=30,q.id);
  assert.ok(e.sources.some(s=>s.url.includes('t=S')),q.id);
  if(q.number>=36){assert.ok(e.vocabulary.length>=3,q.id);for(const v of e.vocabulary){assert.ok(v.word);assert.ok(v.meaning);assert.ok(v.partOfSpeech);assert.ok(v.usage.length>=15);}}
 }
 assert.equal(summaries.size,50);
 for(const [start,end] of [[41,45],[46,50]])for(let n=start;n<=end;n++)assert.deepEqual(entries114[`114-1-${n}`].vocabulary,entries114[`114-1-${start}`].vocabulary);
 assert.ok(entries114['114-1-41'].vocabulary.some(v=>v.word==='take many forms'));
 assert.ok(entries114['114-1-50'].vocabulary.some(v=>v.word==='break the ice'));
});
test('114 official correction preserves single-choice credit and explains presumed negligence without inventing an official rationale',()=>{
 const q=questions114.find(q=>q.number===34),e=entries114[q.id];
 assert.equal(q.multi,false);assert.deepEqual(q.accepted,['A','B']);
 for(const letter of q.accepted)assert.match(e.optionVerdicts[letter],/A 或 B 任一項皆給分/);
 assert.match(e.summary,/不是要求把 A、B 一起勾/);
 assert.match(e.summary,/不冒充官方說明/);
 assert.match(e.options.A,/191.*2.*推定過失/);
 assert.match(e.options.A,/駕駛須證明已盡相當注意/);
 assert.match(e.options.B,/第 9 條.*委託機關/);
 assert.ok(e.sources.some(s=>s.url.includes('code=114010&t=A')));
 const verified=JSON.parse(readFileSync(new URL('../scripts/editorial/civics-english/114-verification.json',import.meta.url)));
 for(const question of questions114)assert.deepEqual(question.accepted,verified.officialAnswers[question.id]);
});
test('114 teaching distinguishes model assumptions, optional agreements and unmentioned reading claims',()=>{
 assert.match(entries114['114-1-5'].summary,/沒有外部性.*基本競爭市場/s);
 assert.match(entries114['114-1-9'].options.B,/得協議.*不是/);
 assert.match(entries114['114-1-9'].options.D,/有無就業及求職/);
 assert.match(entries114['114-1-31'].options.B,/舉證.*衡平責任/);
 assert.match(entries114['114-1-49'].optionVerdicts.D,/本文未提及.*不表示現實不可能/);
 assert.match(entries114['114-1-47'].options.B,/and.*混合/);
 assert.match(entries114['114-1-48'].options.A,/most.*沒有/);
 for(const n of [41,43,45])assert.equal(questions114.find(q=>q.number===n).stem,`請選出文中第 ${n} 空格最合適的答案。`);
 for(const n of [38,39,46,47,48,49,50])assert.match(questions114.find(q=>q.number===n).stem,/^(How|The|Which|According)/);
});
