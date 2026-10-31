import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const explanations=JSON.parse(readFileSync(new URL('../data/explanations/109-0.json',import.meta.url)));

test('109 question 3 includes a complete sentence-by-sentence classical Chinese translation',()=>{
 const summary=explanations['109-0-3'].summary;
 assert.match(summary,/逐句白話翻譯：/);
 assert.match(summary,/京兆杜乂、陳郡殷浩並才名冠世.*才華與名聲都居當世之冠/s);
 assert.match(summary,/而翼弗之重也.*庾翼並不重視他們/s);
 assert.match(summary,/每語人曰.*常常對別人說/s);
 assert.match(summary,/此輩宜束之高閣.*暫時擱置.*不要任用/s);
 assert.match(summary,/俟天下太平，然後議其任耳.*等到天下安定以後.*任用他們/s);
 assert.match(summary,/完整白話翻譯：.*解題關鍵：/s);
 assert.match(summary,/「俟」是等待.*「耳」是罷了/s);
 assert.match(summary,/答案依據：.*束之高閣.*暫時擱置/s);
});
