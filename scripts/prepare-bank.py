import json,re
from pathlib import Path
p=Path('data/bank.json');bank=json.loads(Path('data/raw-bank.json').read_text());groups=[]
heading=re.compile(r'請依下文回答第\s*(\d+)\s*題\s*(?:至|到|[~～\-])\s*第?\s*(\d+)\s*題\s*[:：]?|第\s*(\d+)\s*題\s*至\s*第?\s*(\d+)\s*題[^\n]*請依文意[^\n]*')
for q in bank['questions']:
 m=heading.search(q['text'])
 if m:
  passage=q['text'][m.end():].strip()
  passage=re.sub(r'^\s*(?:頁次|代號)[:：].*$', '', passage,flags=re.M)
  groups.append((q['examId'],int(m[1] or m[3]),int(m[2] or m[4]),passage))
  q['text']=q['text'][:m.start()].strip()
for q in bank['questions']:
 text=re.sub(r'^\s*(?:頁次|代號)[:：].*$', '',q['text'],flags=re.M)
 text=re.split(r'\n二、複選題',text)[0]
 text=re.sub(r'^\s*'+str(q['number'])+r'\s*','',text).strip()
 parts=re.split(r'\(([A-E])\)',text)
 options=[{'letter':parts[i],'text':parts[i+1].strip()} for i in range(1,len(parts)-1,2)]
 letters='ABCDE' if q['multi'] else 'ABCD'
 valid=''.join(o['letter'] for o in options)==letters
 q['stem']=parts[0].strip()
 q['options']=options if valid else []
 q['textFallback']=not valid
 q['passage']='\n\n'.join(x[3] for x in groups if x[0]==q['examId'] and x[1]<=q['number']<=x[2])
 if not q['stem'] and q['passage']:q['stem']=f"請選出文中第 {q['number']} 空格最合適的答案。"
 q['hasVisual']=bool(re.search('下表|下圖|圖示|表格|圖中|圖形|附圖|如圖|figure|diagram',text,re.I))
emap={e['id']:e for e in bank['exams']}
for q in bank['questions']:
 if not q['hasVisual']:q['images']=[emap[q['examId']]['pages'][q['page']]]
p.write_text(json.dumps(bank,ensure_ascii=False,separators=(',',':')))
print('questions',len(bank['questions']),'passage groups',len(groups),'fallback',sum(q['textFallback'] for q in bank['questions']))
