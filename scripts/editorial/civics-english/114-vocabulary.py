"""Individually authored vocabulary for the 114 paper; no generated filler."""
import json
from pathlib import Path
def words(rows):
 return [dict(zip(['word','partOfSpeech','meaning','usage'],r)) for r in rows]
v={
'36': words([
 ('lend','v.','借出','lend money to friends 是把自己的錢借給朋友；borrow money from friends 則是向朋友借入，方向相反。'),
 ('tear ... apart','片語動詞','撕裂；拆散','文中用於 friendship，表示金錢糾紛破壞友誼；tear 的過去式為 tore、過去分詞為 torn。'),
 ('friendship','n.','友誼','friendship 是被破壞的關係，作 tears 的受詞；字尾 -ship 常形成狀態或關係的名詞。'),
 ('since','conj.','因為；自從','此處 since 引出不借錢的原因，應讀成因為；不是說從某個時間點開始。')]),
'37': words([
 ('cost','v.','需花費；價格為','物品作主詞時可說 The car costs a lot；文中 costs twice as much as 表示價格是另一款的兩倍。'),
 ('consumer','n.','消費者','attract consumers 表示吸引消費者；consumer 是購買、使用商品或服務的人，可與 producer 生產者對照。'),
 ('attract','v.','吸引','跑車價格雖高，仍 attracts lots of consumers，表示仍能吸引許多消費者的注意或購買意願。'),
 ('while','conj.','雖然；當……時','本句 while 引出價格較高這個讓步條件，搭配後半句 still；不能一律翻成同一時間發生。')]),
'38': words([
 ('careless','adj.','粗心的；不留意的','反覆犯同樣錯誤凸顯 careless；與 careful 小心的形成對比，-less 常帶有缺少之意。'),
 ('diligent','adj.','勤勉的；用功的','形容持續認真努力的人，例如 a diligent student；不是再次疏忽犯錯時最自然的自責用詞。'),
 ('competent','adj.','勝任的；有能力的','be competent to do something 表示有能力做某事；本題需要的是對疏忽的負面評價。'),
 ('once again','adv. phr.','再一次','made the same mistake once again 表示同樣的錯誤又發生，提供判斷粗心這個語意的重要線索。')]),
'39': words([
 ('vendor','n.','攤販；供應商','市場裡 sell vegetables 的人是 vendors；在科技商務語境也可指產品或服務供應商，不一定是小攤販。'),
 ('consumer','n.','消費者','消費者主要購買或使用商品，和本句 who sell 指明的賣方角色不同，是選項的辨識關鍵。'),
 ('be filled with','片語','充滿','The markets are filled with vendors 描述市場內有很多攤販；with 後接充滿其中的人或物。'),
 ('defender','n.','防衛者；辯護者','defend 是保衛或辯護，defender 是做這件事的人；和在市場賣蔬果的職業描述不同。')]),
'40': words([
 ('witness','n.／v.','證人；目擊','此處 witnesses 為複數名詞，搭配 were questioned 表示證人被詢問；作動詞時可表示目擊事件。'),
 ('separate','adj.／v.','分開的；分開','separate rooms 是各自分隔的房間；此處形容詞讀音尾部通常為 /ət/，與動詞尾部的 /eɪt/ 不同。'),
 ('question','v.','詢問；盤問','question 在此不是名詞問題，而是動詞；were questioned 是被動語態，表示證人受到詢問。'),
 ('find out','片語動詞','查明；弄清楚','警方 wanted to find out what had happened，表示想查清先前發生的事，常接疑問詞引導的子句。'),
 ('sincere','adj.','真誠的','常用於 sincere apology 真誠的道歉或 sincere thanks 誠摯的感謝，不能用來表示房間分隔。')])}
meetup=words([
 ('meetup','n.','同好聚會；相聚活動','文章以共同興趣作為聚會核心，參與者可一起聊天、建立聯繫或參加活動，不限定某一種正式會議。'),
 ('get-together','n.','聚會','a planned get-together 是預先安排的聚會；後接 where 子句，說明人們在這個場合可以認識新朋友。'),
 ('socialize','v.','社交；與人交往','文中 socialize 和 network、participate 並列，介紹人們相聚可能進行的活動，重點是建立人際互動。'),
 ('take many forms','片語','呈現多種形式','用來概括咖啡聚會與團體出遊等不同活動樣態，form 在這裡是形式，不是表格或表單。'),
 ('reads','n.（複數）','讀物；閱讀材料','their favorite reads 是喜歡的讀物；their 後的 favorite 修飾名詞 reads，並非讀這個動詞。'),
 ('recommendation','n.','推薦；建議','書友 share recommendations，彼此推薦值得讀的書；recommend 是動詞，recommendation 是其名詞形式。'),
 ('involve','v.','包含；涉及','健行聚會 could involve 一群戶外愛好者相聚；could 後接原形，後面可接人、事物或動名詞結構。'),
 ('enthusiast','n.','熱衷者；愛好者','outdoor enthusiasts 指喜愛戶外活動的人；enthusiasm 是熱忱的名詞，enthusiastic 則是熱情的形容詞。'),
 ('bond over','片語','因共同事物建立情誼','參與者 bond over their love for hiking，因共同熱愛健行而拉近關係，不是字面上的綁在一起。'),
 ('almost every','副詞＋限定詞','幾乎每一個','almost every interest 表示涵蓋接近所有興趣，但保留例外；every 後用單數名詞 interest。'),
 ('like-minded','adj.','志趣相投的','like-minded peers 是想法或興趣相近的同儕，呼應文章藉共同興趣讓人建立支持性社群的主題。'),
 ('enrich','v.','充實；使更豐富','enrich their lives 指透過有意義的互動充實生活；此處不是把每個人變成金錢上的富人。')])
for n in range(41,46):v[str(n)]=meetup
v['reading-46-50']=words([
 ('strategy','n.','策略','strategy games 著重規劃與選擇，例子包括 Chess、Risk；策略不等於每種遊戲都只靠運氣決定。'),
 ('wits','n.（複數）','機智；智力','use their wits 指運用機智思考如何取勝；閱讀題把它改寫成 train our wits 時，仍和動腦能力有關。'),
 ('outsmart','v.','智取；比……更機靈','outsmart their opponents 表示靠更好的思考或策略勝過對手，out- 在這裡帶有勝過的意思。'),
 ('opponent','n.','對手','策略遊戲中的 opponents 是互相競爭的人，與合作遊戲中共同完成任務的 team members 角色不同。'),
 ('teamwork','n.','團隊合作','Pandemic 與 Forbidden Island 被放在 teamwork 類別；同義線索包括 work together、cooperation。'),
 ('common goal','n. phr.','共同目標','合作遊戲的玩家為共同目標努力；common 在這裡是共同擁有，而不是普通、不特別的意思。'),
 ('rely on','片語動詞','依靠；仰賴','運氣類遊戲 rely on dice rolls or card draws，依靠擲骰或抽牌決定行動與結果，on 是搭配的一部分。'),
 ('anticipation','n.','期待；預期','the thrill of anticipation 指等待結果時的興奮期待；本文不是焦慮地預期壞事，而是在描寫遊戲刺激感。'),
 ('appeal','n.／v.','吸引力；吸引','標題選項中的 appeal 是名詞，概括桌遊的社交、學習與娛樂價值；這裡不是法律上的上訴意思。'),
 ('take a break from','片語','暫時離開……休息','take a break from phones or computers 指暫離手機或電腦，支持第 48 題不看螢幕而放鬆的改寫。'),
 ('break the ice','慣用語','破冰；化解初識尷尬','第 49 題選項 D 提到陌生人破冰，但原文只明說親友相聚；能理解片語不等於文章已提到此情境。'),
 ('supportive','adj.','支持的；給予肯定的','第 50 題以 supportive 概括作者的正面態度，線索包括 fun、educational、enjoyable 等讚許詞。')])
Path(__file__).with_name('114-vocabulary.json').write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
