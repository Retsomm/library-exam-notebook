import json,re,sys
from pathlib import Path
root=Path(sys.argv[1]);bank=json.loads(Path('data/bank.json').read_text());years=[115,114,113,111,110,109,108,107,106]
subjects=[('統計學大意','stats',2),('資料處理大意','data',3)]
replacements=[];exam_replacements=[];all_explanations={}
def answers(year,key):
 text=(root/f'{year}-{key}-S-layout.txt').read_text()
 count_match=re.search(r'單選題數[：:]\s*(\d+)',text)
 count=int(count_match.group(1))
 letters=[]
 for line in text.splitlines():
  if line.strip().startswith('答案'):letters.extend(re.findall(r'\b[A-D]\b',line))
 if len(letters)!=count: raise ValueError((year,key,'answers',count,len(letters)))
 return count,letters
def questions(year,key,count,subject,index):
 text=(root/f'{year}-{key}-Q.txt').read_text();starts=[];pos=0
 for number in range(1,count+1):
  matches=list(re.finditer(r'(?m)(?:^|\f)[ \t]{0,5}'+str(number)+r'(?:[ \t]+|[.、])',text[pos:]))
  if not matches: raise ValueError((year,key,number,'not found'))
  start=pos+matches[0].start();end=pos+matches[0].end();starts.append((start,end));pos=start+1
 out=[]
 for number,(start,end) in enumerate(starts,1):
  next_start=starts[number][0] if number<count else len(text)
  chunk=text[end:next_start]
  chunk=re.sub(r'(?m)^.*(?:代號[：:]|頁次[：:]).*$', '',chunk)
  parts=re.split('[\ue18c-\ue18f]',chunk)
  stem=parts[0].strip()
  option_texts=[x.strip() for x in parts[1:5]]
  option_texts += ['']*(4-len(option_texts))
  has_visual=bool(re.search(r'下表|下圖|圖形|如圖|附表|表格|散布圖|ANOVA|輸出結果',chunk,re.I))
  if not stem: stem='請參考考選部官方原卷作答。';has_visual=True
  options=[]
  for i,value in enumerate(option_texts):
   if not value:
    value=f'本選項含有公式或圖表，請開啟官方原卷確認。';has_visual=True
   options.append({'letter':'ABCD'[i],'text':value})
  qid=f'{year}-{index}-{number}'
  out.append({'id':qid,'examId':f'{year}-{index}','year':year,'subject':subject,'subjectIndex':index,'number':number,'points':2.5 if key=='stats' else 2,'multi':False,'images':[],'text':stem+'\n'+'\n'.join(f"({x['letter']}){x['text']}" for x in options),'page':text[:end].count('\f'),'accepted':[], 'correction':None,'stem':stem,'options':options,'textFallback':False,'passage':'','hasVisual':has_visual})
 return out
for subject,key,index in subjects:
 for year in years:
  count,ans=answers(year,key)
  qs=questions(year,key,count,subject,index)
  if len(qs)!=count:raise ValueError('question count')
  urlq=(root/f'{year}-{key}-Q.url').read_text(); urls=(root/f'{year}-{key}-S.url').read_text()
  exam_replacements.append({'id':f'{year}-{index}','year':year,'subject':subject,'subjectIndex':index,'count':count,'pages':[],'source':urlq,'listing':f'https://wwwq.moex.gov.tw/exam/wFrmExamQandASearch.aspx?e={year}010&y={year+1911}','correctionPdf':None,'answerSource':urls})
  for q,a in zip(qs,ans):
   q['accepted']=[a];replacements.append(q)
   verdicts={}
   options={}
   for option in q['options']:
    good=option['letter']==a
    verdicts[option['letter']]=('正確。' if good else '不正確。')+('這是考選部公告的標準答案。' if good else f'官方標準答案為（{a}），本選項不符合題意或計算結果。')
    options[option['letter']]=('依題幹條件與統計定義判讀，應以官方標準答案為準。' if good else '請回到題幹逐一核對定義、公式條件與單位；本題以官方標準答案為準。')
   all_explanations[f'{year}-{index}.json']=all_explanations.get(f'{year}-{index}.json',{}) | {q['id']:{'summary':'先辨認題目問的是定義、計算或推論，再將題幹已知條件逐一代入。\n\n本題的正確選項以考選部公告的標準答案為準；如題目涉及公式、表格或圖形，請同時開啟官方原卷核對。','options':options,'optionVerdicts':verdicts,'sources':[{'title':f'{year} 年初等考試統計類科官方試題與答案','url':urlq}]}}
# Preserve common subjects. Replace all former professional material.
bank['subjects']=['國文','公民與英文','統計學大意','資料處理大意']
bank['exams']=[e for e in bank['exams'] if e['subjectIndex']<2]+exam_replacements
bank['questions']=[q for q in bank['questions'] if q['subjectIndex']<2]+replacements
bank['updatedAt']='2026-10-27T00:00:00Z'
Path('data/bank.json').write_text(json.dumps(bank,ensure_ascii=False,separators=(',',':'))+'\n')
raw=json.loads(Path('data/raw-bank.json').read_text());raw['subjects']=bank['subjects'];raw['exams']=bank['exams'];raw['questions']=bank['questions'];raw['updatedAt']=bank['updatedAt'];Path('data/raw-bank.json').write_text(json.dumps(raw,ensure_ascii=False,separators=(',',':'))+'\n')
exp=Path('data/explanations');
for f in exp.glob('*-2.json'):f.unlink()
for f in exp.glob('*-3.json'):f.unlink()
for name,entries in all_explanations.items(): (exp/name).write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n')
print('questions',len(bank['questions']),'exams',len(bank['exams']))
