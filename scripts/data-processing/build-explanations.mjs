import {mkdirSync,writeFileSync} from 'node:fs';

const normalise=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
const sourceFor=exam=>({title:`${exam.year} 年初等考試資料處理大意官方試題與答案`,url:exam.source});

const topics=[
 {match:/CPU|中央處理器|暫存器|快取|GPU|NPU|TPU|指令管線|Pipeline|ARM|匯流排|馮.?紐曼|浮點數|記憶體|二進位|16 進位|二補數|補數|位元|byte|指標|陣列|AND 運算|位址/,label:'電腦組織與資料表示',rule:'先確認硬體元件的角色、資料表示法與位址計算，再把題目的位元數、單位或索引位置逐步換算。'},
 {match:/行程|程序|執行緒|作業系統|CPU 排程|SRTF|SJF|PCB|Context Switch|虛擬記憶體|檔案系統|Linux|UNIX|chmod|終端機|shell|行程控制/,label:'作業系統',rule:'作業系統負責管理 CPU、記憶體、檔案與行程。解題時要分清楚行程狀態、排程規則與每個系統指令的用途。'},
 {match:/SQL|資料庫|關聯|表格|正規式|正規化|索引|交易|COMMIT|ROLLBACK|JOIN|SELECT|WHERE|GROUP BY|HAVING|NoSQL|MongoDB|外部鍵|主鍵|參考完整性|關聯代數/,label:'資料庫',rule:'先判讀資料模型或 SQL 子句的職責。關聯式資料庫以表格、鍵與關聯運作；SQL 要依查詢、分組、排序與交易的目的選擇語法。'},
 {match:/TCP|UDP|IP 位址|IPv6|OSI|網路層|路由|Router|交換器|Switch|Wi-Fi|無線|NFC|Bluetooth|Zigbee|LTE|ARP|DNS|DHCP|網路協定|封包|jitter|Gateway|Netmask|頻寬|TLS|雜湊|Wi-Fi|蜂巢/,label:'電腦網路與資訊安全',rule:'先辨識通訊層級與設備職責，再依協定的傳輸範圍、位址類型、可靠性或安全目標判斷。不要把區域網路交換、跨網段路由與應用服務混在一起。'},
 {match:/排序|搜尋|二元樹|Binary Search Tree|AVL|雜湊|Hash|佇列|Queue|Stack|DFS|BFS|遞迴|演算法|Huffman|霍夫曼|時間複雜度|迷宮|圖形（Graph）|Graph/,label:'資料結構與演算法',rule:'先確認資料結構的存取順序或演算法的核心策略，再依題目給的節點、頻率、輸入順序或複雜度逐步推導。'},
 {match:/C 語言|C\+\+|Python|JavaScript|程式語言|函數|函式|迴圈|while|for \(|printf|編譯|直譯|物件導向|多型|繼承|封裝|類別|Operator Overloading|程式碼|processArray|遞迴函數/,label:'程式設計',rule:'先依程式執行順序追蹤變數、迴圈或遞迴，再判斷語言特性。物件導向題要區分類別、物件、繼承、封裝與多型的責任。'},
 {match:/HTML|CSS|網頁|RWD|前端|<img>|瀏覽器/,label:'網頁技術',rule:'HTML 負責文件語意與內容結構，CSS 負責外觀與版面，JavaScript 負責互動邏輯；響應式設計則讓版面適應不同螢幕。'},
 {match:/Excel|Word|試算表|合併列印|ROUND|電子試算表|函數/,label:'辦公軟體與資料處理',rule:'先辨識軟體功能與題目要完成的工作，例如函數計算、表格資料整理或將資料來源批次帶入文件。'},
 {match:/資訊倫理|個人資料|個資|PAPA|隱私|著作|商業秘密|社交工程|安全維護|區塊鏈/,label:'資訊倫理與資安治理',rule:'先找出題目要保護的權益或安全性目標，再分辨隱私、正確性、財產、存取權與資料安全維護義務。'},
 {match:/電子商務|B2B|B2C|供應鏈|SCM|消費者|推薦|行銷/,label:'電子商務與資訊應用',rule:'先確認交易雙方與資訊系統在流程中的角色。企業系統的重點通常是資訊共享、流程協調、服務提供或依資料改善決策。'},
 {match:/AI|人工智慧|LLM|大型語言模型|Training|Inference|生成式|深度學習|Midjourney/,label:'人工智慧',rule:'先區分模型訓練與推理的工作：訓練會用資料調整參數，推理則使用既有權重產生預測或內容。'},
 {match:/音訊|MP3|FLAC|AAC|WMA|影像|壓縮/,label:'多媒體資料',rule:'先區分格式的用途與壓縮方式。無失真壓縮可完整還原原始資料；有失真壓縮則以較小檔案交換部分品質。'},
];

const fallback={label:'資料處理基本概念',rule:'先圈出題幹的關鍵名詞與限制條件，逐一比對各選項是否符合定義、流程或計算結果。'};
const topicFor=question=>{const text=normalise([question.stem,...question.options.map(option=>option.text)].join(' '));return topics.find(topic=>topic.match.test(text))||fallback;};

function calculationNote(question,correct){
 const stem=question.stem;
 if(/二進位數字「11010\.011」/.test(stem))return '整數部分 11010₂ = 16+8+2 = 26；小數部分 .011₂ = 1/4+1/8 = 0.375，因此結果為 26.375。';
 if(/0xd6fd.*0x3412.*AND/.test(stem))return '逐個十六進位位元做 AND：D∧3=1、6∧4=4、F∧1=1、D∧2=0，所以得到 0x1410。';
 if(/-38/.test(stem)&&/二補數/.test(stem))return '38 的 8 位元二進位是 00100110；逐位反相得到 11011001，再加 1，得到 11011010。';
 if(/匯流排頻寬為 1\.6 GB\/s/.test(stem))return '1.6 GB/s 轉為位元後是 12.8 Gb/s；每次傳 32 bits，因此每秒需 12.8×10⁹ ÷ 32 = 400×10⁶ 次，也就是 400 MHz。';
 if(/arr\[4\]\[7\]/.test(stem))return 'C 的二維陣列採列優先排列，偏移元素數是 4×15+7=67；每個 int 為 4 bytes，所以偏移量為 67×4=268 bytes。';
 if(/SRTF/.test(stem)&&/P2/.test(stem))return 'SRTF 每次選剩餘時間最短的行程。P2 在時間 1 到達、時間 2 被 P3 搶占，P3 完成後 P2 先執行完，因此等待時間為 2。';
 if(/Huffman|霍夫曼/.test(stem))return '霍夫曼編碼先合併頻率最低的 C 與 D，再和 B 合併；B 位在根節點右側的下一層，因此編碼為 10。';
 if(/fun\(1337, 2483\)/.test(stem))return '這是歐幾里得演算法：2483 mod 1337=1146，1337 mod 1146=191，1146 mod 191=0，所以最大公因數是 191。';
 if(/前序（Preorder）/.test(stem))return '前序走訪規則是「根、左、右」。由根 15 開始，再走左子樹 10、8、12，最後走右子樹 20、17、25。';
 if(/while \(i<50\)/.test(stem))return '每次迴圈先把目前 i 加到 x，再以 ++i+2 更新 i。依序 i 為 1、4、7…49，最後更新到 52；累加結果為 425。';
 if(/2’s 補數表示法為 10100000/.test(stem))return '最高位為 1，表示負數。反相加一：10100000 → 01100000，數值為 96，所以原數為 -96。';
 if(/f\(int x\)/.test(stem)&&/x=5/.test(stem))return 'f(5)=f(4)+f(6)=f(2)+f(3)=f(1)+f(2)=1+1=2。';
 if(/printf\( “\\n” \)/.test(stem))return '外層迴圈 i 從 1 執行到 4，共執行 4 次；每次外層迴圈結束才印一次換行，因此共印 4 次。';
 if(/最短工作優先法/.test(stem))return '最短工作優先先執行 D(3)、B(5)、C(7)、A(9)。完成時間依序為 D=3、B=8、C=15、A=24。';
 return `題幹的正確判準可由「${normalise(correct.text)}」對照關鍵定義或條件得出。`;
}

function wrongReason(option,correct,topic){
 const text=normalise(option.text);
 if(/以上皆|皆是|皆非/.test(text))return '這類選項必須在所有敘述都符合時才成立；本題已有更精確且符合條件的選項。';
 if(/不正確|錯誤|不屬於|不包括|最不符合|不是/.test(topic.label))return '題目要找的是例外或不符合的敘述，不能只因名詞相關就選擇。';
 return `「${text}」沒有符合本題的關鍵判準；應以（${correct.letter}）${normalise(correct.text)}為準。`;
}

function explanationFor(question,exam){
 const topic=topicFor(question);
 const correct=question.options.find(option=>question.accepted.includes(option.letter));
 if(!correct)throw Error(`Missing answer for ${question.id}`);
 const visualNote=question.hasVisual?'本題涉及圖表、公式或版面時，請同時開啟官方原卷核對原始呈現。':'';
 const calculation=calculationNote(question,correct);
 const summary=`本題考的是「${topic.label}」。題幹要判斷「${normalise(question.stem)}」。\n\n${topic.rule}${calculation}因此應選（${correct.letter}）${normalise(correct.text)}。${visualNote}`;
 const options=Object.fromEntries(question.options.map(option=>[
  option.letter,
  question.accepted.includes(option.letter)
   ? `（${option.letter}）正確選項。${calculation}`
   : `（${option.letter}）${wrongReason(option,correct,topic)}`,
 ]));
 const optionVerdicts=Object.fromEntries(question.options.map(option=>[
  option.letter,
  question.accepted.includes(option.letter)
   ? `正確。（${option.letter}）${normalise(option.text)}符合題目的「${topic.label}」判準。`
   : `不正確。（${option.letter}）${normalise(option.text)}不是本題所問的結果；正確答案是（${correct.letter}）。`,
 ]));
 return {summary,options,optionVerdicts,sources:[sourceFor(exam)]};
}

export function buildDataProcessingExplanations(bank){
 const output=new Map();
 for(const exam of bank.exams.filter(exam=>exam.subjectIndex===3)){
  const entries=Object.fromEntries(bank.questions.filter(question=>question.examId===exam.id).map(question=>[question.id,explanationFor(question,exam)]));
  output.set(exam.id,entries);
 }
 return output;
}

export function writeDataProcessingExplanations(bank,baseUrl=new URL('../../data/explanations/',import.meta.url)){
 mkdirSync(baseUrl,{recursive:true});
 for(const [examId,entries] of buildDataProcessingExplanations(bank))writeFileSync(new URL(`${examId}.json`,baseUrl),JSON.stringify(entries,null,2)+'\n');
}
