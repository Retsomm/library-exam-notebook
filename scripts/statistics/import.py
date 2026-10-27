"""Import official initial-exam statistics PDFs from a temporary directory.
Run: python scripts/statistics/import.py /tmp/statistics-nine
PDFs are never copied into the repository. The output retains original-page links.
"""
import json,re,sys,subprocess,hashlib
from pathlib import Path
root=Path(sys.argv[1]); manifest=json.loads(Path('data/statistics-sources.json').read_text());result=[];exams=[]
# Symbol font mappings from the original PDF character maps.
replace={'\uf03d':'=','\uf02d':'−','\uf02b':'+','\uf0b1':'±','\uf03c':'<','\uf03e':'>','\uf0a3':'≤','\uf0b3':'≥','\uf0b9':'≠','\uf0b4':'×','\uf0b8':'÷','\uf0c8':'∪','\uf0c7':'∩','\uf0e5':'Σ','\uf070':'π','\uf06d':'μ','\uf073':'σ','\uf061':'α','\uf062':'β','\uf063':'χ','\uf071':'θ','\uf06c':'λ','\uf0a5':'∞','\uf0ce':'∈','\uf0ae':'→','\uf0b0':'°'}
def clean(s):
 for a,b in replace.items():s=s.replace(a,b)
 s=re.sub(r'^.*(?:代號[：:]|頁次[：:]).*$', '',s,flags=re.M)
 return re.sub(r'\n{3,}','\n\n',s).strip()
for paper in manifest['papers']:
 y=paper['year'];raw=(root/f'{y}-raw.txt').read_text();starts=[];pos=0
 for n in range(1,41):
  m=re.search(r'(?m)^[ \t]{0,5}'+str(n)+r'(?:[ \t]+|[.、])',raw[pos:])
  if not m:raise ValueError((y,n,'missing number'))
  start,end=pos+m.start(),pos+m.end();starts.append((start,end))
  markers=list(re.finditer('[\ue18c-\ue18f]',raw[end:]))
  if len(markers)<4:raise ValueError((y,n,'missing options'))
  pos=end+markers[3].end()
 for n,(start,end) in enumerate(starts,1):
  segment=raw[end:starts[n][0] if n<40 else len(raw)]
  page=raw[:end].count('\f');parts=re.split('[\ue18c-\ue18f]',segment)
  if len(parts)!=5:raise ValueError((y,n,'options',len(parts)))
  if n==40:
   parts[-1]=re.split(r'\f|附表|附錄|標準常態分',parts[-1])[0]
  stem=clean(parts[0]);opts=[dict(letter=chr(65+i),text=clean(t)) for i,t in enumerate(parts[1:])]
  if y==110 and n==33:opts=[dict(letter=chr(65+i),text=t) for i,t in enumerate(['0.01','0.05','0.95','0.99'])]
  if not stem or any(not o['text'] for o in opts):raise ValueError((y,n,'empty'))
  qid=f'{y}-2s-{n}'
  result.append(dict(id=qid,examId=f'{y}-2s',year=y,subject='統計學大意',subjectIndex=2,number=n,points=paper['points'],multi=False,images=[],text=stem+'\n'+'\n'.join('('+o['letter']+')'+o['text'] for o in opts),page=page,accepted=[paper['originalAnswers'][n-1]],correction=None,stem=stem,options=opts,textFallback=False,passage='',hasVisual=bool(re.search('下表|下圖|附表|表格|圖形|如圖|圖中',segment))))
 exams.append(dict(id=f'{y}-2s',year=y,subject='統計學大意',subjectIndex=2,count=40,pages=[],source=paper['source'],answerSource=paper['answerSource'],listing=paper['listing'],correctionPdf=None))
Path('/tmp/statistics-bank.json').write_text(json.dumps(dict(exams=exams,questions=result),ensure_ascii=False,indent=2))
print('Imported',len(result),'questions')
