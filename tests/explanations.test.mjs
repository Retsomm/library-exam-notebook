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
