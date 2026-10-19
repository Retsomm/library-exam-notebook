import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url);
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
const byId=new Map(bank.questions.map(q=>[q.id,q]));
const files=readdirSync(new URL('../data/explanations/',import.meta.url));
const entries=Object.assign({},...files.filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(new URL('../data/explanations/'+f,import.meta.url)))));
test('all 405 Chinese questions have a summary and an explanation for every original option',()=>{
 const chinese=bank.questions.filter(q=>q.subjectIndex===0);
 assert.equal(chinese.length,405);
 for(const q of chinese)assert.ok(entries[q.id],q.id);
 for(const [id,entry] of Object.entries(entries)){
  const q=byId.get(id);assert.ok(q,`unknown ${id}`);
  assert.ok(entry.summary.trim().length>=12,`${id} summary`);
  assert.deepEqual(Object.keys(entry.options).sort(),q.options.map(o=>o.letter).sort(),`${id} options`);
  for(const [letter,explanation] of Object.entries(entry.options))assert.ok(explanation.trim().length>=8,`${id} ${letter}`);
  for(const source of entry.sources||[])assert.ok(new URL(source.url).protocol==='https:',id);
 }
});
const modules=new Map();
function component(name){
 if(modules.has(name))return modules.get(name);
 const source=readFileSync(new URL(`../components/${name}.tsx`,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('require','module','exports',js)(id=>id.startsWith('./')?component(id.slice(2)):require(id),module,module.exports);
 modules.set(name,module.exports);return module.exports;
}
test('explanations stay hidden until opened; both correct and wrong answers offer the view button',()=>{
 const Practice=component('question-practice').default,q=byId.get('115-0-1');
 const base={question:q,exam:bank.exams.find(e=>e.id===q.examId),study:{bookmarks:[],notes:{}},session:{title:'test',ids:[q.id],index:0,choices:{[q.id]:['A']},checked:{}}};
 const render=checked=>renderToStaticMarkup(createElement(Practice,{...base,session:{...base.session,checked}}));
 assert.doesNotMatch(render({}),/作答後題目解析/);
 assert.doesNotMatch(render({}),/查看解析/);
 for(const correct of [true,false]){const html=render({[q.id]:correct});assert.match(html,/查看解析/);assert.doesNotMatch(html,/<dialog|作答後題目解析/);}
});

test('second edition covers every question with individual teaching and explicit option judgments',()=>{
 const unique=new Set();let optionCount=0;
 for(const q of bank.questions.filter(q=>q.subjectIndex===0)){
  const entry=entries[q.id];assert.equal(entry.revision,2,q.id);
  assert.ok(entry.summary.includes("\n\n"),q.id);unique.add(entry.summary);
  assert.deepEqual(Object.keys(entry.optionVerdicts).sort(),q.options.map(o=>o.letter).sort(),q.id);
  optionCount+=q.options.length;
 }
 assert.equal(unique.size,405);assert.equal(optionCount,1710);
 const sample=entries['106-0-7'];
 for(const word of ['道鑒','函丈','講席','座右'])assert.ok(sample.options.A.includes(word));
 assert.ok(sample.options.D.includes('太宇賢棣如晤'));
 assert.match(entries['111-0-1'].optionVerdicts.C,/錯誤.*應選/);
 assert.match(entries['114-0-14'].optionVerdicts.A,/符合文意.*不選/);
});

test('all 450 classification and cataloging questions have substantive explanations for every option',()=>{
 const questions=bank.questions.filter(q=>q.subjectIndex===3);
 assert.equal(questions.length,450);
 const summaries=new Set();let options=0;
 for(const q of questions){
  const e=entries[q.id];assert.ok(e,q.id);summaries.add(e.summary);
  assert.ok(e.summary.length>=60,q.id+' teaching');
  assert.ok(e.summary.includes('\n\n'),q.id+' reading and reasoning');
  assert.deepEqual(Object.keys(e.options).sort(),q.options.map(o=>o.letter).sort(),q.id);
  assert.deepEqual(Object.keys(e.optionVerdicts).sort(),q.options.map(o=>o.letter).sort(),q.id+' verdicts');
  for(const reason of Object.values(e.options)){assert.ok(reason.length>=25,q.id+' reason');options++;}
  assert.ok(e.sources.length,q.id+' sources');
 }
 assert.equal(summaries.size,450);assert.equal(options,1800);
});

test('official credit and ambiguous or historical standards are explained without changing grading',()=>{
 assert.deepEqual(byId.get('108-3-36').accepted,['A','B','C','D']);
 for(const verdict of Object.values(entries['108-3-36'].optionVerdicts))assert.match(verdict,/一律給分/);
 assert.match(entries['115-3-22'].summary,/八層面.*九層面/);
 assert.match(entries['113-3-48'].options.B,/亦可建立/);
 assert.match(entries['114-3-44'].options.C,/新作品/);
 assert.match(entries['115-3-15'].options.D,/雙主題通常分受影響者/);
 assert.deepEqual(byId.get('107-3-37').accepted,['C']);
});

test('106 original-paper combination options retain the correct digits',()=>{
 for(const [id,options]of Object.entries({'106-3-15':['23','24','134','234'],'106-3-18':['4231','3421','2341','1432'],'106-3-35':['12','23','24','34']})){
  assert.deepEqual(byId.get(id).options.map(o=>o.text),options,id);
 }
});


test('all 450 librarianship questions have individual teaching, 1800 reasons and explicit judgments',()=>{
 const questions=bank.questions.filter(q=>q.subjectIndex===2),summaries=new Set();let reasons=0;
 assert.equal(questions.length,450);
 for(const q of questions){
  const e=entries[q.id];assert.ok(e,q.id);summaries.add(e.summary);
  assert.ok(e.summary.length>=60,q.id+' summary');assert.ok(e.summary.includes('\n\n'),q.id+' paragraphs');
  assert.deepEqual(Object.keys(e.options).sort(),q.options.map(o=>o.letter).sort(),q.id);
  assert.deepEqual(Object.keys(e.optionVerdicts).sort(),q.options.map(o=>o.letter).sort(),q.id+' verdicts');
  for(const reason of Object.values(e.options)){assert.ok(reason.length>=25,q.id+' reason');reasons++;}
  assert.ok(e.sources.length,q.id+' source');
  for(const ref of e.sources){assert.ok(ref.title.length>5,q.id);assert.equal(new URL(ref.url).protocol,'https:',q.id);}
 }
 assert.equal(summaries.size,450);assert.equal(reasons,1800);
});

test('librarianship preserves official grading and explains ambiguity and historical scope',()=>{
 for(const [id,answer] of Object.entries({'115-2-5':'A','114-2-48':'B','107-2-38':'D','106-2-43':'B','106-2-46':'D'}))assert.deepEqual(byId.get(id).accepted,[answer],id);
 assert.match(entries['114-2-48'].optionVerdicts.B,/疑|成立/);
 assert.match(entries['107-2-38'].optionVerdicts.A,/隱私/);
 assert.match(entries['106-2-43'].summary,/不是|不等於|不能只比/);
 assert.match(entries['106-2-46'].options.D,/映射|設定/);
 assert.match(entries['107-2-8'].summary,/更新|版本/);
 assert.match(entries['106-2-38'].options.B,/五十五/);
 assert.match(entries['106-2-6'].optionVerdicts.B,/錯誤.*應選/);
});

test('106 librarianship combination digits match the original paper in both banks',()=>{
 const raw=JSON.parse(readFileSync(new URL('../data/raw-bank.json',import.meta.url)));
 for(const [id,options] of Object.entries({'106-2-2':['123','124','134','234'],'106-2-4':['12346','12467','12456','12357'],'106-2-21':['123','124','134','234']})){
  const q=byId.get(id);assert.deepEqual(q.options.map(o=>o.text),options,id);
  for(const item of [q,raw.questions.find(x=>x.id===id)])for(const [i,option] of options.entries())assert.ok(item.text.includes('('+String.fromCharCode(65+i)+')'+option),id+' raw text');
 }
});
