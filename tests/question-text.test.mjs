import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {reflowQuestionText} from '../lib/question-text.mjs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
test('new professional question text remains available on small screens',()=>{for(const q of bank.questions.filter(q=>q.subjectIndex>1)){assert.ok(q.stem.trim(),q.id);for(const option of q.options)assert.ok(option.text.trim(),q.id+option.letter);}});
test('code in a question keeps its lines and indentation',()=>{const source='下列程式輸出為何？\nfor (int i = 0; i < 3; i++) {\n  printf("%d", i);\n}';const output=reflowQuestionText(source);assert.match(output,/for \(int i = 0; i < 3; i\+\+\) \{\n  printf/);assert.match(output,/printf\("%d", i\);\n\}/);});
import {questionLayout} from '../lib/question-layout.mjs';
test('statistics data rows render as an accessible table block',()=>{
 const layout=questionLayout('投票結果如下表：\n性別 支持 未定 反對 總數\n女 180 80 40 300\n男 150 20 30 200');
 const table=layout.find(block=>block.type==='table');
 assert.deepEqual(table?.rows,[['性別','支持','未定','反對','總數'],['女','180','80','40','300'],['男','150','20','30','200']]);
});
test('shell and SQL snippets stay in one code block',()=>{
 const layout=questionLayout('執行下列指令：\n$ mkdir exam\n$ cd exam\n$ ls | wc -l');
 assert.deepEqual(layout.filter(block=>block.type==='code').map(block=>block.lines.join('\n')),['$ mkdir exam\n$ cd exam\n$ ls | wc -l']);
});
