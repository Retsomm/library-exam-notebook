import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const explanation=(examId,questionId)=>JSON.parse(readFileSync(new URL(`../data/explanations/${examId}.json`,import.meta.url)))[questionId];

test('109 question 2 parses every phrase before comparing the quoted character',()=>{
 const entry=explanation('109-0','109-0-2');
 assert.match(entry.summary,/單字與詞組.*白話.*詞性和意思/s);
 for(const letter of ['A','B','C','D']){
  assert.match(entry.options[letter],/逐字解析：/);
  assert.match(entry.options[letter],/整句比較：/);
  assert.match(entry.options[letter],/字義：/);
 }
 assert.match(entry.options.A,/短褐穿結.*粗布短衣.*「褐」字義.*粗布衣.*褐色/s);
 assert.match(entry.options.B,/不恥相師.*互相學習.*出師不利.*軍隊出征.*動詞.*名詞/s);
 assert.match(entry.options.C,/高手雲集.*寒雪日內集.*都作動詞.*聚集/s);
 assert.match(entry.options.D,/從數騎出.*客從遠方來/s);
 assert.match(entry.options.D,/使人跟隨.*介系詞.*自、由/s);
 assert.equal(entry.optionVerdicts.C,'符合題意，本題應選。');
});

test('other Chinese word-meaning comparison questions explain every option word by word',()=>{
 const paired=explanation('109-0','109-0-38');
 for(const letter of ['A','B','C','D','E']){
  assert.match(paired.options[letter],/逐字解析：/);
  assert.match(paired.options[letter],/詞義：/);
 }
 assert.match(paired.options.B,/戴大員.*天空.*大方.*大地/s);
 assert.match(paired.options.C,/大人.*家中尊長.*前後意義相同/s);
 assert.match(paired.options.D,/小人.*品德低劣.*前後意義相同/s);

 const soldier=explanation('106-0','106-0-18');
 for(const letter of ['A','B','C','D']){
  assert.match(soldier.options[letter],/逐字解析：/);
  assert.match(soldier.options[letter],/「兵」字義：/);
 }
 assert.match(soldier.options.A,/短兵相接.*兵器.*題幹.*相同/s);
 assert.match(soldier.options.B,/調兵遣將.*士兵或軍隊.*題幹不同/s);
 assert.match(soldier.options.C,/紙上談兵.*用兵作戰之事.*題幹不同/s);
 assert.match(soldier.options.D,/驍勇騎兵.*作戰人員.*題幹不同/s);
});
