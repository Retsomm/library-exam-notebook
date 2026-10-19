import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeReport,reportText,mergeReports} from '../lib/question-reports.mjs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
const q=bank.questions.find(q=>q.id==='114-2-18'),exam=bank.exams.find(e=>e.id===q.examId);
test('report snapshots preserve the disputed question, website grading, and all official sources',()=>{
 const report=makeReport(q,exam,'answer','  B 的門檻需要核對。  ',['A'],'2026-10-19T02:00:00Z','11111111-1111-4111-8111-111111111111');
 const snapshot=JSON.parse(report.snapshotJSON);q.options[0].text+='temporary';
 assert.equal(report.detail,'B 的門檻需要核對。');assert.equal(snapshot.options.length,4);assert.deepEqual(snapshot.accepted,['B']);assert.deepEqual(snapshot.answer,['A']);assert.equal(snapshot.page,2);
 assert.match(reportText(report),/網站計分答案：B/);assert.match(reportText(report),/t=S/);assert.ok(!snapshot.options[0].text.endsWith('temporary'));q.options[0].text=q.options[0].text.replace(/temporary$/,'');
 assert.throws(()=>makeReport(q,exam,'answer',' '));assert.throws(()=>makeReport(q,exam,'fake','說明'));assert.throws(()=>makeReport(q,exam,'answer','a'.repeat(2001)));
});
test('report acknowledgements merge by ID and retain new offline submissions',()=>{
 const a=makeReport(q,exam,'scan','選項數字錯誤',[],'2026-10-19T02:00:00Z','a'),b=makeReport(q,exam,'source','來源無法開啟',[],'2026-10-19T03:00:00Z','b');
 const merged=mergeReports([a,b],[{...a,status:'resolved',resolution:'已核對官方原卷'}]);assert.equal(merged.length,2);assert.equal(merged[0].id,'b');assert.ok(!merged[0].synced);assert.equal(merged[1].synced,true);assert.equal(merged[1].status,'resolved');
});
test('all 36 papers provide distinct official original-paper and standard-answer PDF URLs',()=>{
 for(const e of bank.exams){const q=new URL(e.source),a=new URL(e.answerSource);assert.equal(a.hostname,'wwwq.moex.gov.tw');assert.equal(a.searchParams.get('t'),'S');q.searchParams.set('t','S');assert.equal(a.href,q.href);}
});
