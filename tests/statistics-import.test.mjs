import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questionPoints,questionScore,scoreQuestions} from '../lib/scoring.mjs';
const sources=JSON.parse(readFileSync(new URL('../data/statistics-sources.json',import.meta.url)));
test('nine statistics papers have official source provenance and 100-point allocation',()=>{
 assert.deepEqual(sources.papers.map(p=>p.year),[115,114,113,111,110,109,108,107,106]);
 for(const p of sources.papers){
  assert.equal(p.count*p.points,100);assert.equal(p.originalAnswers.length,p.count);
  for(const url of [p.source,p.answerSource,p.listing])assert.equal(new URL(url).hostname,'wwwq.moex.gov.tw');
  assert.match(p.questionSha256,/^[a-f0-9]{64}$/);assert.match(p.answerSha256,/^[a-f0-9]{64}$/);
 }
});
test('statistics allocation scores a full 40-question paper and partial sessions correctly',()=>{
 const questions=Array.from({length:40},(_,i)=>({id:`stats-${i}`,points:2.5,multi:false,accepted:['B'],options:'ABCD'.split('').map(letter=>({letter}))}));
 const answers=Object.fromEntries(questions.map(q=>[q.id,['B']]));
 assert.equal(scoreQuestions(questions,answers).score,100);
 assert.equal(scoreQuestions(questions.slice(0,3),answers).max,7.5);
 assert.equal(questionScore(questions[0],['A']),0);
 assert.equal(questionScore({...questions[0],allCredit:true},[]),2.5);
 assert.equal(questionPoints({multi:false}),2);assert.equal(questionPoints({multi:true}),3);
});
