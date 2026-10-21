import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
const bank=read('bank'),{notes}=read('study-notes'),questions=new Map(bank.questions.map(q=>[q.id,q]));
test('all four subjects have substantive notes with valid same-subject question links',()=>{
 assert.equal(new Set(notes.map(n=>n.id)).size,notes.length);
 for(let index=0;index<4;index++)assert.ok(notes.filter(n=>n.subjectIndex===index).length>=8);
 for(const note of notes){
  for(const key of ['title','lead','example','trap','recall','answer'])assert.ok(note[key]?.trim(),`${note.id}: ${key}`);
  assert.ok(note.points.length>=3);
  for(const point of note.points)assert.ok(point.term&&point.detail.length>10);
  assert.ok(note.questionIds.length>0);
  assert.equal(new Set(note.questionIds).size,note.questionIds.length);
  for(const id of note.questionIds)assert.equal(questions.get(id)?.subjectIndex,note.subjectIndex,`${note.id} links ${id}`);
  for(const source of note.sources)assert.match(source.url,/^https?:\/\//);
 }
});
test('professional courses cover every question once, in a stable learning order',()=>{
 for(const subjectIndex of [2,3]){
  const course=notes.filter(n=>n.subjectIndex===subjectIndex);
  const expected=bank.questions.filter(q=>q.subjectIndex===subjectIndex).map(q=>q.id).sort();
  const ids=course.flatMap(n=>n.questionIds);
  assert.deepEqual([...ids].sort(),expected);
  assert.equal(ids.length,new Set(ids).size);
  assert.deepEqual(course.map(n=>n.order),Array.from({length:course.length},(_,i)=>i+1));
  assert.equal(new Set(course.map(n=>n.title)).size,course.length);
  assert.ok(new Set(course.map(n=>n.group)).size>=5);
  for(const n of course)assert.ok(n.mnemonic?.length>8,`${n.id} needs a mnemonic`);
  for(const year of [...new Set(expected.map(id=>id.split('-')[0]))])assert.equal(ids.filter(id=>id.startsWith(year+'-')).length,50);
 }
});
test('repeated concepts share a note while different historical frameworks remain explicit',()=>{
 const owner=id=>notes.find(n=>n.subjectIndex>1&&n.questionIds.includes(id));
 for(const ids of [['115-2-15','108-2-10','106-2-20'],['111-3-7','108-3-12','107-3-13','106-3-13'],['110-3-49','109-3-50']])assert.equal(new Set(ids.map(id=>owner(id).id)).size,1);
 assert.match(JSON.stringify(owner('106-2-4')),/Crawford/);
 assert.match(JSON.stringify(owner('115-3-22')),/九/);
 assert.match(JSON.stringify(owner('107-3-37')),/更正/);
 const byStem=new Map();
 for(const q of bank.questions.filter(q=>q.subjectIndex>1)){
  const key=q.subjectIndex+q.stem.replace(/[^\p{L}\p{N}]/gu,'');
  if(byStem.has(key))assert.equal(owner(q.id).id,byStem.get(key));
  else byStem.set(key,owner(q.id).id);
 }
});
