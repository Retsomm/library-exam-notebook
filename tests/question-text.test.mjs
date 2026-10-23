import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reflowQuestionText,prepareQuestionText} from '../lib/question-text.mjs';
import {restoreEnglishBlanks} from '../lib/english-blanks.mjs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url),'utf8'));
const get=id=>bank.questions.find(q=>q.id===id);
test('PDF wraps join Chinese words and English sentences, including double-spaced extraction',()=>{
 assert.equal(reflowQuestionText('圖書館專業講習\n  培訓結業者'), '圖書館專業講習培訓結業者');
 assert.equal(reflowQuestionText('館\n\n  藏量'), '館藏量');
 assert.equal(reflowQuestionText('A long sentence\n  continues here.'),'A long sentence continues here.');
 assert.equal(reflowQuestionText('a brain-\ncomputer interface'),'a brain-computer interface'); // Retain the printed hyphen without inserting a space.
 assert.ok(!prepareQuestionText(get('115-0-25')).options.some(o=>o.text.includes('\n')));
 assert.ok(!prepareQuestionText(get('115-2-6')).options.some(o=>o.text.includes('\n')));
});
test('paragraphs, question prompts, list items, tables and explicit poetry separators remain distinct',()=>{
 assert.equal(reflowQuestionText('第一段。\n\n第二段。'),'第一段。\n\n第二段。');
 assert.equal(reflowQuestionText('A sentence ends.\n    Next paragraph.',{passage:true}),'A sentence ends.\n\nNext paragraph.');
 assert.match(prepareQuestionText(get('115-0-11')).stem,/\n乙:/);
 assert.match(prepareQuestionText(get('115-0-5')).stem,/\n根據上文/);
 assert.match(prepareQuestionText(get('107-3-50')).stem,/\n1一個作品/);
 assert.match(prepareQuestionText(get('115-1-3')).stem,/\n衣服 +8/);
 assert.equal(prepareQuestionText(get('111-1-46')).passage,get('111-1-46').passage);
 const poem=get('110-0-25');assert.equal((prepareQuestionText(poem).stem.match(/\//g)||[]).length,(poem.stem.match(/\//g)||[]).length);
});
test('entire bank retains wording, scoring, raw source text and restored English blanks',()=>{
 const compact=s=>s.replace(/\s/g,'');
 for(const q of bank.questions){
  const before=restoreEnglishBlanks(q),after=prepareQuestionText(q);
  assert.equal(compact(after.stem),compact(before.stem),q.id);
  assert.equal(compact(after.passage),compact(before.passage),q.id);
  after.options.forEach((o,i)=>assert.equal(compact(o.text),compact(q.options[i].text),q.id));
  assert.equal(after.text,q.text);assert.strictEqual(after.accepted,q.accepted);
 }
 const stem=prepareQuestionText(get('109-1-37')).stem;
 assert.match(stem,/design and attention to _____/);assert.ok(!stem.includes('\n'));
});
