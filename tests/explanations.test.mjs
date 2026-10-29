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
   assert.match(entry.summary,/這題其實在問：/);
   assert.match(entry.summary,/學習重點：/);
   assert.match(entry.summary,/判斷方式：/);
   assert.doesNotMatch(entry.summary,/把題目給的條件逐一對回定義|看起來可能有關|少了題幹的關鍵條件|只要「看起來相關」/);
   assert.doesNotMatch(entry.summary,/本題考的是/);
   assert.equal(new Set(Object.values(entry.options)).size,4,`${question.id} option explanations must be distinct`);
  }
 }
});


test('professional explanations avoid vague option templates and teach a concrete distinction',()=>{
 const banned=/把題目給的條件逐一對回定義|看起來可能有關|少了題幹的關鍵條件|只要「看起來相關」/;
 for(const exam of bank.exams.filter(exam=>exam.subjectIndex>1)){
  const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));
  for(const entry of Object.values(entries)){
   assert.match(entry.summary,/學習重點：/);
   assert.match(entry.summary,/判斷方式：/);
   assert.doesNotMatch(entry.summary,banned);
   for(const detail of Object.values(entry.options)){
    assert.doesNotMatch(detail,banned);
    assert.ok(detail.length>45);
   }
  }
 }
 const storage=JSON.parse(readFileSync(new URL('../data/explanations/115-3d.json',import.meta.url)))['115-3d-2'];
 assert.match(storage.summary,/機械動作/);
 assert.match(storage.options.A,/光學儲存媒介/);
 assert.match(storage.options.B,/碟片.*磁頭/);
 assert.match(storage.options.D,/控制器|介面/);
 const wireless=JSON.parse(readFileSync(new URL('../data/explanations/115-3d.json',import.meta.url)))['115-3d-3'];
 assert.match(wireless.summary,/滑鼠、鍵盤、耳機/);
 assert.match(wireless.options.A,/物聯網|感測器/);
 assert.match(wireless.options.B,/幾公分|感應支付/);
 assert.match(wireless.options.C,/遠距離|傳輸速率很低/);
 assert.match(wireless.options.D,/個人區域網路|鍵盤、滑鼠/);
});
