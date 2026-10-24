import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionResumeIndex} from '../lib/session-progress.mjs';
const session=()=>({ids:['a','b','c'],index:2,title:'歷屆題庫',choices:{a:['A'],b:['B'],c:['C']},checked:{a:true,b:false,c:true}});
test('fully submitted sessions cannot resume, even when wrong answers exist',()=>{
 const s=session();const before=structuredClone(s);
 assert.equal(sessionResumeIndex(s),null);assert.deepEqual(s,before);
 assert.equal(sessionResumeIndex(JSON.parse(JSON.stringify(s))),null);
 assert.equal(sessionResumeIndex(null),null);
 assert.equal(sessionResumeIndex({...s,ids:[]}),null);
});
test('resume finds unanswered questions after the current question or wraps to skipped ones',()=>{
 const s=session();delete s.checked.a;
 assert.equal(sessionResumeIndex(s),0); // Last question answered; earlier question skipped.
 delete s.checked.c;assert.equal(sessionResumeIndex(s),2); // Unsubmitted choice is still unfinished.
 s.index=1;assert.equal(sessionResumeIndex(s),2);
 s.index=0;assert.equal(sessionResumeIndex(s),0);
});
test('only checks for this session count toward completion',()=>{
 const s=session();delete s.checked.b;s.checked.other=true;
 assert.equal(Object.keys(s.checked).length,s.ids.length);
 assert.equal(sessionResumeIndex(s),1);
});
