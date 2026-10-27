import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
test('statistics and data-processing questions have hidden-dialog explanation payloads',()=>{for(const exam of bank.exams.filter(exam=>exam.subjectIndex>1)){const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));const questions=bank.questions.filter(q=>q.examId===exam.id);assert.equal(Object.keys(entries).length,questions.length);for(const q of questions){const e=entries[q.id];assert.ok(e.summary.includes('\n\n'));assert.deepEqual(Object.keys(e.options).sort(),['A','B','C','D']);assert.deepEqual(Object.keys(e.optionVerdicts).sort(),['A','B','C','D']);assert.ok(e.sources.length);}}});


test('every professional-subject explanation is written for its own question and answer',()=>{
 for(const exam of bank.exams.filter(exam=>exam.subjectIndex>1)){
  const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));
  const questions=bank.questions.filter(question=>question.examId===exam.id);
  assert.equal(new Set(questions.map(question=>entries[question.id].summary)).size,questions.length,`${exam.id} summaries must not reuse a template`);
  for(const question of questions){
   const entry=entries[question.id],correct=question.options.find(option=>question.accepted.includes(option.letter));
   assert.ok(entry.summary.includes(correct.text.normalize('NFKC').replace(/\s+/g,' ').trim()),`${question.id} must explain its announced answer`);
   assert.doesNotMatch(entry.summary,/先辨認題目問的是定義、計算或推論/);
   assert.equal(new Set(Object.values(entry.options)).size,4,`${question.id} option explanations must be distinct`);
  }
 }
});
