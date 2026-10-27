import {mkdirSync,writeFileSync} from 'node:fs';

const normalise=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
const topics=[
 {match:/平均數|中位數|眾數|四分位|盒狀圖|直方圖|標準差|變異數|變異係數|偏態|柴比雪夫|Chebyshev|調和平均|描述統計/,label:'描述統計',rule:'先確認題目是在比較集中趨勢、離散程度或分布形狀。平均數會受極端值影響；標準差與變異係數用來描述資料的離散程度。'},
 {match:/機率|條件機率|貝氏|Bayes|獨立|聯合|彩券|骰子|抽球|至少|不放回|組合|排列/,label:'機率',rule:'先寫出事件與已知條件，再判斷是否要使用加法法則、乘法法則、條件機率或補事件。抽樣是否放回會改變各次抽取是否獨立。'},
 {match:/常態|標準常態|指數分配|卜瓦松|Poisson|二項|Binomial|隨機變數|機率密度|期望值|變異數|分配|壽命|到達/,label:'機率分配',rule:'先辨認隨機變數的分配種類，再使用該分配的平均數、變異數、累積機率或標準化關係。常態分配常先換成 Z 值；二項分配則要同時利用期望值與變異數。'},
 {match:/抽樣|樣本|母體|信賴區間|估計|抽樣分配|樣本數|系統抽樣|集群抽樣|分層抽樣/,label:'抽樣與區間估計',rule:'先辨識抽樣設計與估計對象。信賴區間以樣本統計量加減誤差範圍表示；樣本數增大通常會讓標準誤下降、區間縮小。'},
 {match:/檢定|虛無|對立假設|p 值|顯著水準|型 I|型 II|拒絕域|檢定統計量|power|比例差異/,label:'假設檢定',rule:'先寫出 H₀ 與 H₁，確認是單尾或雙尾，再用顯著水準、p 值或臨界值做結論。不要把「未拒絕 H₀」誤解成已經證明 H₀ 為真。'},
 {match:/ANOVA|變異數分析|處理間|區集|因子|交互作用|F 分配|MSTR|MSE|平方和|自由度/,label:'變異數分析',rule:'ANOVA 用處理間變異與誤差變異的比值檢驗多組平均數是否相同。解題時依設計種類確認自由度、平方和、均方與 F 統計量。'},
 {match:/迴歸|相關|散布圖|最小平方|SSE|SSR|R²|解釋能力|預測|斜率/,label:'相關與迴歸',rule:'相關係數描述線性關係的方向與強度；迴歸式則用 X 預測 Y。SSR/(SSR+SSE) 是模型解釋變異比例，斜率代表 X 增加一單位時 Y 的預期改變。'},
 {match:/卡方|列聯表|獨立|期望次數|適合度|類別|性別/,label:'卡方檢定',rule:'列聯表問題先計算各格期望次數，公式是「列總和 × 欄總和 ÷ 總數」。再以觀察值與期望值的差異判斷是否支持獨立或分布一致。'},
 {match:/無母數|充分性|估計量|統計量/,label:'統計推論概念',rule:'先從定義判斷統計方法需要的分布假設與資料尺度。無母數方法通常較少依賴特定母體分布，但可能犧牲部分效率。'},
];
const fallback={label:'統計基本概念',rule:'先整理題目給的數值、統計量與限制條件，再從各選項核對定義、公式或推論方向。'};
const topicFor=question=>{const text=normalise([question.stem,...question.options.map(option=>option.text)].join(' '));return topics.find(topic=>topic.match.test(text))||fallback;};

function calculationNote(question,correct){
 const stem=normalise(question.stem);
 if(/P\(A∪B\)/.test(stem))return '獨立事件的聯集機率為 P(A)+P(B)-P(A)P(B)=0.4+0.5-0.2=0.7。';
 if(/Chebyshev/.test(stem)&&/4.5 與 9.3/.test(stem))return '區間距平均數 2.4 小時，等於 2 個標準差；柴比雪夫定理給出至少 1-1/2²=75%。';
 if(/4 個燈泡中至少 1 個/.test(stem))return '先算沒有瑕疵的補事件，再以 1 減去該機率，可避免直接逐項列舉。';
 if(/平均長度為 4 分鐘/.test(stem)&&/2 分鐘內沒有/.test(stem))return '指數分配的速率 λ=1/4；沒有顧客到達的機率為 e^{-λt}=e^{-0.5}，約為 0.607。';
 if(/P\(X=x\)=ax/.test(stem))return '先由 ΣP(X=x)=a(1+2+3)=1 求出 a=1/6，再代入 E(X)=ΣxP(X=x)。';
 if(/P1：到達 0/.test(stem))return '依可搶占式最短剩餘時間優先排程，需在每個新行程到達時重新比較剩餘執行時間。';
 if(/SSE = 200/.test(stem))return 'R²=SSR/(SSR+SSE)=600/(600+200)=0.75，表示模型可解釋 75% 的 Y 變異。';
 if(/中位數/.test(stem)&&/65, 90, 85/.test(stem))return '先由小到大排序 65、68、77、79、81、85、90、100；偶數筆資料的中位數是第 4 與第 5 筆的平均。';
 if(/期望的 新生人數/.test(stem))return '在結構不變的虛無假設下，期望次數為樣本總數乘以上學年的比例，即 300×0.30=90。';
 return `依題目條件判讀，正確選項是「${normalise(correct.text)}」。`;
}

function explanationFor(question,exam){
 const topic=topicFor(question),correct=question.options.find(option=>question.accepted.includes(option.letter));
 if(!correct)throw Error(`Missing answer for ${question.id}`);
 const calculation=calculationNote(question,correct),visualNote=question.hasVisual?'題目含有表格、圖形或公式時，請同時開啟官方原卷核對原始版面與數值。':'';
 const summary=`本題考的是「${topic.label}」。題幹要判斷「${normalise(question.stem)}」。\n\n${topic.rule}${calculation}因此應選（${correct.letter}）${normalise(correct.text)}。${visualNote}`;
 const options=Object.fromEntries(question.options.map(option=>[option.letter,question.accepted.includes(option.letter)
  ? `（${option.letter}）正確選項。${calculation}`
  : `（${option.letter}）「${normalise(option.text)}」不符合本題的條件或推論方向；應以（${correct.letter}）${normalise(correct.text)}為準。`,
 ]));
 const optionVerdicts=Object.fromEntries(question.options.map(option=>[option.letter,question.accepted.includes(option.letter)
  ? `正確。（${option.letter}）${normalise(option.text)}符合「${topic.label}」的判斷。`
  : `不正確。（${option.letter}）${normalise(option.text)}不是本題的正確結論；官方答案為（${correct.letter}）。`,
 ]));
 return {summary,options,optionVerdicts,sources:[{title:`${exam.year} 年初等考試統計學大意官方試題與答案`,url:exam.source}]};
}

export function writeStatisticsExplanations(bank,baseUrl=new URL('../../data/explanations/',import.meta.url)){
 mkdirSync(baseUrl,{recursive:true});
 for(const exam of bank.exams.filter(exam=>exam.subjectIndex===2)){
  const entries=Object.fromEntries(bank.questions.filter(question=>question.examId===exam.id).map(question=>[question.id,explanationFor(question,exam)]));
  writeFileSync(new URL(`${exam.id}.json`,baseUrl),JSON.stringify(entries,null,2)+'\n');
 }
}
