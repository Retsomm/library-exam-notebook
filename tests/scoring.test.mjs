import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questionScore,questionPoints,scoreQuestions,sessionScore,yearScores} from '../lib/scoring.mjs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url))),qmap=new Map(bank.questions.map(q=>[q.id,q]));
const multi={...bank.questions.find(q=>q.multi),accepted:['BD'],allCredit:false};
const single=bank.questions.find(q=>!q.multi&&!q.allCredit&&q.accepted.length===1);
test('official five-option scoring gives 3, 1.8, 0.6, or 0 and blank answers give 0',()=>{
 for(const [answer,score] of [['BD',3],['B',1.8],['ABD',1.8],['AB',.6],['ABCDE',0],['ACE',0],['',0]])assert.equal(questionScore(multi,answer.split('')),score,answer);
 assert.equal(questionScore(multi,['B','D','D']),3);assert.equal(questionScore(multi,['B','D','Z']),0);
 assert.equal(questionScore(single,single.accepted[0].split('')),2);assert.equal(questionScore(single,['A','B']),0);assert.equal(questionScore(single,[]),0);
});
test('all 32 possible multi-select choices follow the official independent-option rule',()=>{
 const letters=['A','B','C','D','E'];
 for(let mask=0;mask<32;mask++){
  const chosen=letters.filter((_,i)=>mask&(1<<i));
  const errors=letters.filter(letter=>chosen.includes(letter)!==multi.accepted[0].includes(letter)).length;
  const expected=mask===0||errors>2?0:errors===0?3:errors===1?1.8:.6;
  assert.equal(questionScore(multi,chosen),expected,chosen.join(''));
 }
});
test('every original full paper sums to 100 and all accepted answers earn full credit',()=>{
 for(const exam of bank.exams){
  const qs=bank.questions.filter(q=>q.examId===exam.id),answers=Object.fromEntries(qs.map(q=>[q.id,q.accepted[0].split('')]));
  const result=scoreQuestions(qs,answers);assert.equal(result.max,100,exam.id);assert.equal(result.score,100,exam.id);assert.equal(result.answered,exam.count);
  for(const q of qs)for(const accepted of q.accepted)assert.equal(questionScore(q,accepted.split('')),questionPoints(q),q.id);
 }
});
test('official all-credit items receive points even when blank; alternative answers are accepted individually',()=>{
 const q=qmap.get('108-1-15');assert.equal(questionScore(q,[]),2);
 const alternative=qmap.get('114-1-34');assert.equal(questionScore(alternative,['A']),2);assert.equal(questionScore(alternative,['B']),2);assert.equal(questionScore(alternative,['A','B']),0);
});
test('partial credit sums without floating drift; subsets keep original points instead of scaling to 100',()=>{
 const qs=Array.from({length:10},(_,i)=>({...multi,id:`test-${i}`}));
 assert.equal(scoreQuestions(qs,Object.fromEntries(qs.map(q=>[q.id,['A','B']]))).score,6);
 const session={ids:[multi.id,single.id],index:0,title:'random',choices:{[multi.id]:['B'],[single.id]:single.accepted[0].split('')},checked:{[multi.id]:false,[single.id]:true}};
 const sessionMap=new Map(qmap).set(multi.id,multi);
 const score=sessionScore(session,sessionMap,bank.exams);assert.equal(score.max,5);assert.equal(score.fullPaper,false);assert.equal(score.score,3.8);
 // Selected but unsubmitted choices are still blank on the result sheet.
 delete session.checked[single.id];assert.equal(sessionScore(session,sessionMap,bank.exams).score,1.8);
});
test('only an exact original paper gets the full-paper label',()=>{
 const exam=bank.exams[0],qs=bank.questions.filter(q=>q.examId===exam.id),session={ids:qs.map(q=>q.id),choices:{},checked:{},index:0,title:exam.subject};
 assert.equal(sessionScore(session,qmap,bank.exams).fullPaper,true);
 session.ids[1]=session.ids[0];assert.equal(sessionScore(session,qmap,bank.exams).fullPaper,false);
});
test('dashboard average requires all four complete papers from the selected year',()=>{
 let records={};
 assert.equal(yearScores(bank,records,115).average,null);
 for(const q of bank.questions.filter(q=>q.year===115))records[q.id]={answer:q.accepted[0],correct:true,attempts:1,time:'2026-10-20'};
 const all=yearScores(bank,records,115);assert.equal(all.complete,true);assert.equal(all.average,100);
 assert.equal(yearScores(bank,records,114).average,null);
 delete records['115-0-45'];assert.equal(yearScores(bank,records,115).average,null);
});
test('dashboard recomputes partial scores from stored answers rather than old correctness flags',()=>{
 const original=qmap.get(multi.id);
 const result=yearScores(bank,{[multi.id]:{answer:original.accepted[0].slice(1),correct:false,attempts:1,time:'2026-10-20'}},multi.year);
 assert.equal(result.papers.find(paper=>paper.exam.id===multi.examId).score,1.8);
});
test('admission data covers the bank years and links each value to a primary government source',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/admission-cutoffs.json',import.meta.url)));
 assert.equal(data.category,'圖書資訊管理');assert.equal(data.years.length,9);
 assert.deepEqual(data.years.map(row=>row.year),[115,114,113,111,110,109,108,107,106]);
 assert.deepEqual(data.years.map(row=>row.cutoff),[70.8,70.4,76.3,82.3,80.3,80.3,84.5,83.45,81.6]);
 for(const row of data.years){assert.match(row.source,/^https:\/\/wwwc\.moex\.gov\.tw\//);assert.match(row.dataset,/^https:\/\/data\.gov\.tw\/dataset\/\d+$/);assert.match(row.sourceSha256,/^[a-f0-9]{64}$/);assert.ok(row.admitted<=row.attended&&row.cutoff>0&&row.cutoff<=100);}
});
