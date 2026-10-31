"""Apply reviewed teaching notes and term examples without changing official answers."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
bank=json.loads((ROOT/'data/bank.json').read_text());questions={q['id']:q for q in bank['questions']}
notes=json.loads((ROOT/'scripts/editorial/chinese-teaching-notes.json').read_text())
examples=json.loads((ROOT/'scripts/editorial/chinese-term-examples.json').read_text())
classical_translations=json.loads((ROOT/'scripts/editorial/chinese-classical-translations.json').read_text())
classical_vocabulary=json.loads((ROOT/'scripts/editorial/chinese-classical-vocabulary.json').read_text())
plain={
 '最切合':'最能對應','切合':'符合','不符':'不符合','並非':'並不是','而非':'而不是','非此':'不是這裡的','未提':'沒有提到','未說':'沒有說','未寫':'沒有寫出','未討論':'沒有討論','未交代':'沒有交代','未以':'不是以','未如':'不如','文中未':'文中沒有','原文明說':'原文已經明白說出','原文明確':'原文很清楚地','原文未':'原文沒有','原文無':'原文沒有','宜用':'較適合用','宜稱':'較適合稱','屬貶義':'帶有批評的意思','屬褒義':'帶有稱讚的意思','語境':'句子的情境','指向':'讓我們想到','對應':'對得上','重點非':'重點不是','偏重':'較著重','非本題':'不是本題','非指':'不是指','非單':'不只是','非全':'並非全','不等於':'不表示就等於','須':'需要','皆':'都','均':'都','惟':'只有'}
usage=set()
for q in questions.values():
 if q['subjectIndex']!=0:continue
 tail=q['stem'].split('\n')[-1]
 if re.search('(?:成語|詞語|用語|稱謂|書信|文句|書函|應用文字|提稱|題辭)',q['stem']) and not re.search('(?:根據|依據|旨意|承上|何種|最適合填|最適當填)',q['stem']):usage.add(q['id'])
# Disagreement cases must not be forced into absolute true/false wording.
ambiguous={'114-0-22','115-0-44','115-0-28','107-0-25','108-0-15','109-0-4','111-0-28','114-0-45','115-0-39'}
negative_usage={'111-0-1','111-0-3','114-0-3','107-0-3','107-0-4','108-0-6','110-0-6','106-0-33','107-0-34','111-0-35','108-0-33','108-0-34'}
for year,teaching in notes.items():
 p=ROOT/f'data/explanations/{year}-0.json';base=json.loads((ROOT/f'scripts/editorial/base/{year}-0.json').read_text());out={}
 for id,entry in base.items():
  q=questions[id];item=dict(entry);summary=entry['summary'];number=q['number']
  if id=='110-0-8':summary='題幹寫的是粽子，對應端午；C通常列為夏至節令聯，與端午不同。日影的文學描寫不可直接當成正午竿影長度的天文結論。'
  if id=='113-0-39':summary='這題要分辨單純的景物描寫與含有期待、失落、未能如願等心理活動的語句。依官方答案，B、C、E同時帶有內在感受。'
  lesson=teaching[number-1]
  if id in classical_translations:
   lesson=classical_translations[id]+'\n\n常見字詞與語助詞：'+classical_vocabulary[id]+'\n\n'+lesson
  elif id in classical_vocabulary:
   lesson=lesson+'\n\n常見字詞與語助詞：'+classical_vocabulary[id]
  item['summary']=lesson+'\n\n答案依據：'+summary
  item['revision']=2
  item['options']={};item['optionVerdicts']={}
  for option in q['options']:
   letter=option['letter'];body=entry['options'][letter]
   for old,new in plain.items():body=body.replace(old,new)
   body=body.replace('比比喻','比喻').replace('並不是並不是','並不是')
   selected=any(letter in accepted for accepted in q['accepted'])
   if id in ambiguous:verdict='官方答案採此項；請連同下方的解讀提醒一起看。' if selected else '官方答案未採此項；理由與可能的解讀差異如下。'
   elif id in negative_usage:verdict='說法錯誤，所以本題應選。' if selected else '說法正確，所以本題不選。'
   elif id in usage:verdict='正確，符合本題要求。' if selected else '錯誤，不符合本題要求。'
   else:verdict='符合題意，本題應選。' if selected else '不符合題意，本題不選。'
   matched=[]
   # Only enrich terms explicitly present in the option, not terms appearing elsewhere in the question.
   for term,example in examples.items():
    if term in option['text']:matched.append(example)
   if matched:body+='\n\n補充理解：'+'\n'.join(matched[:2])
   item['optionVerdicts'][letter]=verdict
   item['options'][letter]=body
  out[id]=item
 p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Revised 405 Chinese explanations with question-specific teaching notes and option judgments')
