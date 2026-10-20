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
