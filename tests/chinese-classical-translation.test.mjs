import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const readJson=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const translationSource=readJson('../scripts/editorial/chinese-classical-translations.json');
const vocabularySource=readJson('../scripts/editorial/chinese-classical-vocabulary.json');
const explanation=(questionId)=>{
 const examId=questionId.slice(0,questionId.lastIndexOf('-'));
 return readJson(`../data/explanations/${examId}.json`)[questionId];
};
const classicalQuestionIds=`
115-0-39
114-0-18 114-0-19 114-0-20 114-0-22 114-0-27 114-0-43
110-0-10 110-0-12 110-0-13 110-0-14 110-0-16 110-0-17 110-0-24 110-0-26 110-0-40 110-0-41
109-0-3 109-0-9 109-0-11 109-0-13 109-0-14 109-0-15 109-0-16 109-0-21 109-0-40 109-0-42
108-0-7 108-0-9 108-0-11 108-0-14 108-0-15 108-0-16 108-0-17 108-0-21 108-0-24 108-0-25 108-0-29 108-0-40 108-0-42
107-0-11 107-0-12 107-0-13 107-0-15 107-0-18 107-0-21 107-0-27 107-0-40
106-0-1 106-0-8 106-0-13 106-0-16 106-0-17 106-0-20 106-0-22 106-0-23 106-0-24 106-0-25 106-0-30 106-0-40 106-0-42 106-0-43
`.trim().split(/\s+/);

test('all 62 classical Chinese passage questions include complete plain-language translations',()=>{
 assert.equal(classicalQuestionIds.length,62);
 for(const questionId of classicalQuestionIds){
  const summary=explanation(questionId).summary;
  assert.match(summary,/逐句白話翻譯：/,`${questionId} needs a sentence-by-sentence translation`);
  assert.match(summary,/完整白話翻譯：/,`${questionId} needs a complete translation`);
  assert.match(summary,/常見字詞與語助詞：/,`${questionId} needs classical vocabulary and particles`);
  assert.match(summary,/答案依據：/,`${questionId} still needs its answer reasoning`);
  if(questionId!=='109-0-3')assert.ok(summary.startsWith(translationSource[questionId]),`${questionId} must stay synchronized with its editorial translation`);
 }
 assert.deepEqual(Object.keys(translationSource).sort(),classicalQuestionIds.filter(id=>id!=='109-0-3').sort());
 assert.deepEqual(Object.keys(vocabularySource).sort(),classicalQuestionIds.sort());
});

test('109 question 3 explains every sentence and important classical word',()=>{
 const summary=explanation('109-0-3').summary;
 assert.match(summary,/京兆杜乂、陳郡殷浩並才名冠世.*才華與名聲都居當世之冠/s);
 assert.match(summary,/而翼弗之重也.*庾翼並不重視他們/s);
 assert.match(summary,/每語人曰.*常常對別人說/s);
 assert.match(summary,/此輩宜束之高閣.*暫時擱置.*不要任用/s);
 assert.match(summary,/俟天下太平，然後議其任耳.*等到天下安定以後.*任用他們/s);
 assert.match(summary,/「俟」是等待.*「耳」是罷了/s);
 assert.match(summary,/答案依據：.*束之高閣.*暫時擱置/s);
});
test('109 question 9 translates all three parallel clauses before choosing impartial government',()=>{
 const summary=explanation('109-0-9').summary;
 assert.match(summary,/陰陽之和，不長一類.*不會只養育某一類事物/s);
 assert.match(summary,/甘露時雨，不私一物.*不會只偏愛.*某一種生物/s);
 assert.match(summary,/萬民之主，不阿一人.*不應偏袒或迎合某一個人/s);
 assert.match(summary,/「長」.*養育.*「私」.*偏愛.*「阿」.*偏袒/s);
 assert.match(summary,/完整白話翻譯：.*君主施政應公正無偏/s);
});

test('109 question 11 translates the whole passage and explains its common particles',()=>{
 const summary=explanation('109-0-11').summary;
 assert.match(summary,/有亡國，有亡天下.*國家政權.*天下文明秩序/s);
 assert.match(summary,/保衛一國政權.*君臣與掌權者.*平民也有責任/s);
 assert.match(summary,/完整白話翻譯：.*每一個平民都有責任/s);
 assert.match(summary,/常見字詞與語助詞：.*奚辨.*謂之.*是故.*肉食者.*匹夫.*耳矣/s);
});
