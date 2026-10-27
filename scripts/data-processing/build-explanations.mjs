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
const topicFor=question=>{
 const text=normalise([question.stem,...question.options.map(option=>option.text)].join(' '));
 const priority=['資料結構與演算法','程式設計','電腦網路與資訊安全','資料庫','作業系統','人工智慧','多媒體資料','網頁技術','辦公軟體與資料處理','資訊倫理與資安治理','電子商務與資訊應用','電腦組織與資料表示'];
 return priority.map(label=>topics.find(topic=>topic.label===label)).find(topic=>topic?.match.test(text))||fallback;
};

function plainGuide(topic){
 const guides={
  '描述統計':'先看題目是在問資料的中心、分散程度，還是整體形狀；不要把平均數、標準差和相關係數當成同一件事。',
  '機率':'把每一個事件拆開看：哪些情況可以相加、哪些情況要相乘。題目有寫「至少」或「沒有」時，常常從反面去算會更快。',
  '機率分配':'先認出這是哪一種分配，再把題目給的平均數、機率或標準差放到對應的規則裡。',
  '抽樣與區間估計':'先分清楚題目在談母體還是樣本；樣本只是拿來估計母體，不是母體本身。',
  '假設檢定':'把它當成判斷證據夠不夠強：先訂出原本的假設，再看資料有沒有強到足以推翻它。',
  '變異數分析':'它是在比較好幾組平均數。重點不是哪組數字最大，而是組與組之間的差異有沒有大到不像隨機波動。',
  '相關與迴歸':'相關是在看兩件事有沒有一起變動；迴歸則是在用一個變數去預測另一個變數，兩者不要混在一起。',
  '卡方檢定':'先用列總和和欄總和算出「如果沒有關係，理論上應有多少人」，再和實際數字比較。',
  '統計推論概念':'先把名詞換成日常語言：這個方法需要什麼假設、能回答什麼問題，再回頭看選項。',
  '電腦組織與資料表示':'先把題目中的單位、位元或記憶體位置拆開算；不要一次把十進位、二進位和位址混在一起。',
  '作業系統':'把作業系統想成資源管家：誰先用 CPU、資料放在哪裡、程式目前在等什麼，都要分開看。',
  '資料庫':'先看題目在談資料怎麼存、怎麼查，還是資料之間怎麼連結；主鍵、外鍵和 SQL 子句各有不同工作。',
  '電腦網路與資訊安全':'先分清楚資料是在同一個網路內傳，還是要跨網路；再判斷題目問的是設備、協定還是安全目的。',
  '資料結構與演算法':'先把資料怎麼進、怎麼出、怎麼走的順序畫清楚；只要順序抓對，選項通常就能排除。',
  '程式設計':'把程式當成逐行執行的指令：先追變數怎麼改，再判斷迴圈、函式或物件導向概念。',
  '網頁技術':'先記住分工：HTML 放內容結構、CSS 管外觀、JavaScript 做互動；題目問哪一件事，就回到對應工具。',
  '辦公軟體與資料處理':'先想清楚你真正要完成的工作，再找對應的軟體功能或函數，不要只憑名稱猜答案。',
  '資訊倫理與資安治理':'先看題目要保護的是誰的資料、權益或系統安全，再判斷行為有沒有踩到界線。',
  '電子商務與資訊應用':'先分清楚交易雙方和系統在流程中的角色，再看哪個選項真的能完成題目要的服務或流程。',
  '人工智慧':'先分清楚模型是在學習資料，還是在使用已學到的結果回答問題，兩個階段的工作不同。',
  '多媒體資料':'先看題目重視的是音質、檔案大小或能不能還原原始資料；這三件事常常需要取捨。',
  '統計基本概念':'先把題目給的數字和限制條件圈出來，再用最基本的定義逐一排除不符合的選項。',
  '資料處理基本概念':'先把題目真正要問的關鍵字抓出來，再把每個選項放回定義裡比對。',
 };
 return guides[topic.label]||'先把題目的關鍵條件抓出來，換成自己的話理解後，再回頭比對選項。';
}
function questionInPlainWords(question){
 const stem=normalise(question.stem);
 return stem.length>170?`${stem.slice(0,167)}……`:stem;
}

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
 const shownAnswer=normalise(correct.text),shownQuestion=questionInPlainWords(question);
 const summary=`這題其實在問：${shownQuestion}\n\n先抓住一個重點：${plainGuide(topic)}\n\n${calculation}換句話說，題目要的不是只要「看起來相關」的選項，而是能完整接住題幹條件的答案。所以選（${correct.letter}）${shownAnswer}。${visualNote}`;
 const options=Object.fromEntries(question.options.map(option=>[option.letter,question.accepted.includes(option.letter)
  ? `（${option.letter}）可以選。它直接對上題幹的關鍵條件。${calculation}`
  : `（${option.letter}）「${normalise(option.text)}」看起來可能有關，但沒有完整符合題目設定；本題要找的是（${correct.letter}）${shownAnswer}。`,
 ]));
 const optionVerdicts=Object.fromEntries(question.options.map(option=>[option.letter,question.accepted.includes(option.letter)
  ? `可以選。（${option.letter}）${normalise(option.text)}剛好回答題目要問的事。`
  : `先不要選。（${option.letter}）${normalise(option.text)}少了題幹的關鍵條件，答案應是（${correct.letter}）。`,
 ])); return {summary,options,optionVerdicts,sources:[sourceFor(exam)]};
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
