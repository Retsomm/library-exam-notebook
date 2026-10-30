import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
test('statistics and data-processing questions have hidden-dialog explanation payloads',()=>{for(const exam of bank.exams.filter(exam=>exam.subjectIndex>1)){const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));const questions=bank.questions.filter(q=>q.examId===exam.id);assert.equal(Object.keys(entries).length,questions.length);for(const q of questions){const e=entries[q.id];assert.ok(e.summary.includes('\n\n'));assert.deepEqual(Object.keys(e.options).sort(),['A','B','C','D']);assert.deepEqual(Object.keys(e.optionVerdicts).sort(),['A','B','C','D']);assert.ok(e.sources.length);}}});


test('every professional-subject explanation is written for its own question and answer',()=>{
 for(const exam of bank.exams.filter(exam=>exam.subjectIndex>1)){
  const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));
  const questions=bank.questions.filter(question=>question.examId===exam.id);
  assert.equal(new Set(questions.map(question=>entries[question.id].summary)).size,questions.length,`${exam.id} summaries must not reuse a template`);
  for(const question of questions){
   const entry=entries[question.id],correct=question.options.find(option=>question.accepted.includes(option.letter));
   assert.ok(entry.summary.includes(correct.text.normalize('NFKC').replace(/\s+/g,' ').trim()),`${question.id} must explain its announced answer`);
   assert.doesNotMatch(entry.summary,/先辨認題目問的是定義、計算或推論/);
   if(exam.subjectIndex===3)assert.doesNotMatch(entry.summary,/這題其實在問：|學習重點：|判斷方式：/);
   else{assert.match(entry.summary,/這題其實在問：/);assert.match(entry.summary,/學習重點：/);assert.match(entry.summary,/判斷方式：/);}
   assert.doesNotMatch(entry.summary,/把題目給的條件逐一對回定義|看起來可能有關|少了題幹的關鍵條件|只要「看起來相關」/);
   assert.doesNotMatch(entry.summary,/本題考的是/);
   const distinctChoices=exam.subjectIndex===3?new Set(question.options.map(option=>option.text.normalize('NFKC').replace(/\s+/g,' ').trim())).size:4;
   assert.equal(new Set(Object.values(entry.options)).size,distinctChoices,`${question.id} option explanations must follow the distinct choices`);
  }
 }
});


test('professional explanations avoid vague option templates and teach a concrete distinction',()=>{
 const banned=/把題目給的條件逐一對回定義|看起來可能有關|少了題幹的關鍵條件|只要「看起來相關」/;
 for(const exam of bank.exams.filter(exam=>exam.subjectIndex>1)){
  const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));
  for(const entry of Object.values(entries)){
   if(exam.subjectIndex===3)assert.doesNotMatch(entry.summary,/這題其實在問：|學習重點：|判斷方式：/);
   else{assert.match(entry.summary,/學習重點：/);assert.match(entry.summary,/判斷方式：/);}
   assert.doesNotMatch(entry.summary,banned);
   for(const detail of Object.values(entry.options)){
    assert.doesNotMatch(detail,banned);
    assert.ok(detail.length>(exam.subjectIndex===3?15:25));
   }
  }
 }
 const storage=JSON.parse(readFileSync(new URL('../data/explanations/115-3d.json',import.meta.url)))['115-3d-2'];
 assert.match(storage.summary,/機械動作/);
 assert.match(storage.options.A,/光學儲存媒介/);
 assert.match(storage.options.B,/碟片.*磁頭/);
 assert.match(storage.options.D,/控制器|介面/);
 const wireless=JSON.parse(readFileSync(new URL('../data/explanations/115-3d.json',import.meta.url)))['115-3d-3'];
 assert.match(wireless.summary,/滑鼠、鍵盤、耳機/);
 assert.match(wireless.options.A,/物聯網|感測器/);
 assert.match(wireless.options.B,/幾公分|感應支付/);
 assert.match(wireless.options.C,/遠距離|傳輸速率很低/);
 assert.match(wireless.options.D,/個人區域網路|鍵盤、滑鼠/);
 const unix=JSON.parse(readFileSync(new URL('../data/explanations/115-3d.json',import.meta.url)))['115-3d-4'];
 assert.match(unix.summary,/建立目錄，ls 只列出目錄項目/);
 assert.match(unix.options.A,/Windows|建立目錄/);
 assert.match(unix.options.B,/輸出到終端機/);
 assert.match(unix.options.C,/列出目錄/);
 assert.match(unix.options.D,/內建命令|別名|外部程式/);
 const frontend=JSON.parse(readFileSync(new URL('../data/explanations/115-3d.json',import.meta.url)))['115-3d-11'];
 assert.match(frontend.summary,/瀏覽器原生支援|使用者的瀏覽器/);
 assert.match(frontend.options.A,/資料分析|人工智慧|自動化/);
 assert.match(frontend.options.B,/伺服器端|資料庫/);
 assert.match(frontend.options.C,/文字處理|系統管理/);
 assert.match(frontend.options.D,/瀏覽器.*互動|事件/);


});


test('data-processing explanations stay on the exact question and avoid generic topic filler',()=>{
 const banned=/雖然和.*有關|用途或結果分開記憶|不是本題要求的答案|這個敘述主張|不是題幹所問的功能或概念|這個選項是「|先確認硬體元件的角色|作業系統負責管理 CPU|先判讀資料模型或 SQL 子句的職責|先辨識通訊層級與設備職責|先確認資料結構的存取順序|先依程式執行順序追蹤變數|HTML 負責文件語意與內容結構|先辨識軟體功能與題目要完成的工作|先找出題目要保護的權益|先確認交易雙方與資訊系統|先區分模型訓練與推理的工作|先區分格式的用途與壓縮方式|先圈出題幹的關鍵名詞與限制條件|把程式當成逐行執行的指令|物件導向題要區分類別/;
 for(const exam of bank.exams.filter(exam=>exam.subjectIndex===3)){
  const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));
  for(const question of bank.questions.filter(question=>question.examId===exam.id)){
   const entry=entries[question.id];
   assert.doesNotMatch(entry.summary,banned,`${question.id} summary`);
   assert.doesNotMatch(entry.summary,/這題其實在問：|學習重點：|判斷方式：/);
   for(const option of question.options){
    const detail=entry.options[option.letter];
    assert.doesNotMatch(detail,banned,`${question.id} ${option.letter}`);
    assert.ok(detail.length>15,`${question.id} ${option.letter} must give a useful reason`);
    assert.equal(entry.optionVerdicts[option.letter],question.accepted.includes(option.letter)?'可以選。':'不選。');
   }
  }
 }
});

test('the system-software question explains only the software-to-hardware relationship',()=>{
 const entry=JSON.parse(readFileSync(new URL('../data/explanations/115-3d.json',import.meta.url)))['115-3d-32'];
 assert.match(entry.summary,/作業系統.*驅動程式.*硬體資源/);
 assert.doesNotMatch(JSON.stringify(entry),/逐行執行|變數|迴圈|遞迴|物件導向|繼承|封裝|多型/);
 assert.match(entry.options.A,/作業系統.*系統呼叫.*驅動程式/);
 assert.match(entry.options.B,/不需要由應用軟體編譯/);
 assert.match(entry.options.C,/作業系統.*驅動程式.*硬體資源/);
 assert.match(entry.options.D,/職責不同.*不能互相取代/);
});

test('code and calculation questions show their actual execution steps',()=>{
 const generic=/題目所問的正確項目|題目要找出不符合條件|依題目給定的數值與運算規則/;
 const code=/printf|cout|for\s*\(|while\s*\(|fibonacci\(|FR\(|ds\(|processArray|struct iptr|SELECT COUNT/;
 for(const exam of bank.exams.filter(exam=>exam.subjectIndex===3)){
  const entries=JSON.parse(readFileSync(new URL(`../data/explanations/${exam.id}.json`,import.meta.url)));
  for(const question of bank.questions.filter(question=>question.examId===exam.id&&code.test(question.stem))){
   assert.doesNotMatch(entries[question.id].summary,generic,`${question.id} must trace the code or calculation`);
  }
 }
 const entry=JSON.parse(readFileSync(new URL('../data/explanations/115-3d.json',import.meta.url)))['115-3d-34'];
 assert.match(entry.summary,/arr \+ 2.*arr\[2\].*arr\[3\].*arr\[4\]/s);
 assert.match(entry.summary,/\{1, 2, 6, 8, 10\}/);
 assert.match(entry.options.A,/arr\[3\].*4.*8/);
 assert.match(entry.options.C,/arr\[1\].*仍是 2/);
});
