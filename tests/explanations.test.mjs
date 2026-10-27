import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
test('statistics and data-processing questions have hidden-dialog explanation payloads',()=>{for(const exam of bank.exams.filter(exam=>exam.subjectIndex>1)){const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));const questions=bank.questions.filter(q=>q.examId===exam.id);assert.equal(Object.keys(entries).length,questions.length);for(const q of questions){const e=entries[q.id];assert.ok(e.summary.includes('\n\n'));assert.deepEqual(Object.keys(e.options).sort(),['A','B','C','D']);assert.deepEqual(Object.keys(e.optionVerdicts).sort(),['A','B','C','D']);assert.ok(e.sources.length);}}});
