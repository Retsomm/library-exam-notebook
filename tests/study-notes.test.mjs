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
test('civics has an ordered course covering all 315 civic questions exactly once',()=>{
 const course=notes.filter(n=>n.track==='civics');
 const expected=bank.questions.filter(q=>q.subjectIndex===1&&q.number<=35).map(q=>q.id).sort();
 assert.equal(expected.length,315);
 assert.deepEqual(course.flatMap(n=>n.questionIds).sort(),expected);
 assert.deepEqual(course.map(n=>n.order),Array.from({length:course.length},(_,i)=>i+1));
 assert.ok(new Set(course.map(n=>n.group)).size>=8);
 for(const n of course)assert.ok(n.mnemonic.length>10);
 const owner=new Map(course.flatMap(n=>n.questionIds.map(id=>[id,n.id])));
 const repeated=new Map();
 for(const id of expected){const key=questions.get(id).stem.replace(/[^\p{L}\p{N}]/gu,'');if(repeated.has(key))assert.equal(owner.get(id),repeated.get(key),id);else repeated.set(key,owner.get(id));}
});
test('English topics cover each English question and reuse valid canonical vocabulary IDs',async()=>{
 const {buildVocabularyIndex}=await import('../lib/vocabulary.mjs');
 const explanations=Object.fromEntries(bank.exams.filter(e=>e.id.endsWith('-1')).map(e=>[e.id,read('explanations/'+e.id)]));
 const vocabulary=buildVocabularyIndex(bank.questions,explanations);
 const course=notes.filter(n=>n.vocabularyIds?.length);
 const covered=new Set(course.flatMap(n=>n.questionIds));
 const expected=bank.questions.filter(q=>q.subjectIndex===1&&q.number>=36).map(q=>q.id);
 assert.equal(expected.length,135);
 for(const id of expected)assert.ok(covered.has(id),id);
 const wordIds=new Set();
 for(const n of course){
  assert.equal(n.track,'english');
  assert.equal(new Set(n.vocabularyIds).size,n.vocabularyIds.length);
  for(const id of n.vocabularyIds){assert.ok(vocabulary[id],`${n.id}: missing ${id}`);wordIds.add(id);assert.ok(n.questionIds.some(q=>q.startsWith(id.slice(0,5))),`${n.id}: unrelated exam`);}
 }
 assert.ok(wordIds.size>=330);
});
test('idiom expansion teaches contrasts with examples and keeps referenced Chinese questions',()=>{
 const idioms=notes.filter(n=>n.track==='idioms');
 assert.ok(idioms.length>=14);
 for(const n of idioms){assert.ok(n.mnemonic.length>10);assert.ok(n.points.length>=4);assert.ok(n.sources.some(s=>s.url.includes('dict.idioms.moe.edu.tw')));}
 const text=JSON.stringify(idioms);
 for(const term of ['危言危行','萬人空巷','目無全牛','琴瑟','爍石流金','眾口鑠金','屢試不爽','枵腹從公'])assert.ok(text.includes(term));
});
