"""將逐題編寫的解析轉成前端 JSON；不依答案自動編造理由。"""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[3]
bank=json.loads((root/'data/bank.json').read_text())
questions={q['id']:q for q in bank['questions']}
sources={
 'ccr':('國家圖書館：《中國編目規則》第三版','https://catweb.ncl.edu.tw/standard/page/25559'),
 'ccl':('國家圖書館：《中文圖書分類法》2007年版','https://catweb.ncl.edu.tw/standard/page/25549'),
 'marc':('美國國會圖書館：MARC 21 書目格式','https://www.loc.gov/marc/bibliographic/'),
 'auth':('美國國會圖書館：MARC 21 權威格式','https://www.loc.gov/marc/authority/'),
 'rdf':('W3C：RDF 1.1 概念與資料模型','https://www.w3.org/TR/rdf11-concepts/'),
 'skos':('W3C：SKOS 參考規範','https://www.w3.org/TR/skos-reference/'),
 'dc':('DCMI：Dublin Core 詮釋資料用語','https://www.dublincore.org/specifications/dublin-core/dcmi-terms/'),
 'fast':('OCLC：FAST 計畫與層面說明','https://www.oclc.org/research/areas/data-science/fast.html'),
 'pcc':('美國國會圖書館：合作編目計畫 PCC','https://www.loc.gov/aba/pcc/'),
 'cst':('國家圖書館：中文主題詞表新增詞彙與關係規則','https://catweb.ncl.edu.tw/QandA/page/23513'),
 'aat':('Getty：藝術與建築索引典 AAT','https://www.getty.edu/research/tools/vocabularies/aat/'),
 'ld':('W3C：鏈結資料設計原則','https://www.w3.org/DesignIssues/LinkedData.html'),
 'bf':('美國國會圖書館：BIBFRAME','https://www.loc.gov/bibframe/'),
 'nb':('國家圖書館：全國圖書書目資訊網','https://nbinet.ncl.edu.tw/'),
 'mesh':('美國國立醫學圖書館：MeSH','https://www.nlm.nih.gov/mesh/meshhome.html'),
 'tei':('TEI：文件標記指引','https://tei-c.org/guidelines/'),
 'owl':('W3C：OWL 2 概述','https://www.w3.org/TR/owl2-overview/'),
 'multi':('國家圖書館：多主題分類原則說明','https://catweb.ncl.edu.tw/QandA/page/24397'),
 'models':('IFLA：FRBR、FRAD、FRSAD 與 LRM 概念模式','https://www.ifla.org/g/bcm-rg/ifla-s-bibliographic-conceptual-models/'),
 'cmarc':('國家圖書館：中國機讀編目格式第三版','https://catweb.ncl.edu.tw/standard/page/25566'),
 'mads':('美國國會圖書館：MADS 權威資料綱要','https://www.loc.gov/standards/mads/'),
 'ead':('美國國會圖書館：EAD 檔案描述標準與版本','https://www.loc.gov/ead/'),
}
for path in sorted(Path(__file__).parent.glob('*.txt')):
 year=path.stem;entries={}
 for line in path.read_text().splitlines():
  if not line.strip() or line.startswith('#'):continue
  parts=line.split('|');assert len(parts)==7,(path,line[:50],len(parts))
  number,summary,*tail=parts;reasons=tail[:4];refs=tail[4].split(',')
  negative=number.endswith('!');number=number.rstrip('!');qid=f'{year}-3-{number}';q=questions[qid]
  selected=set(''.join(q['accepted']))
  verdicts={o['letter']:(('敘述錯誤，因此本題應選。' if o['letter'] in selected else '敘述正確，因此本題不選。') if negative else ('本題正確答案，應選。' if o['letter'] in selected else '不是本題答案，不選。')) for o in q['options']}
  if q.get('allCredit') or (not q['multi'] and set(q['accepted'])==set('ABCD')):
   verdicts={o['letter']:'官方更正：本題一律給分。下方仍區分各規範的實際範圍。' for o in q['options']}
  overrides={
   '115-3-22':{'B':'當年題目採八層面說法；現行 OCLC 已列九層面，請看年代說明。'},
   '114-3-44':{'C':'此選項措辭有疑義：獨立評論通常是新作品，不能當成表現形式通則。'},
   '113-3-48':{'B':'本題官方計分答案；SKOS 實際也能建立新概念綱要，請看辨析。'},
   '113-3-50':{'D':'本題官方計分答案；不可誤推為 URL 與 URI 完全互斥。'},
   '111-3-40':{'A':'本題官方計分答案；條碼用語有歧義，須區分單件條碼與出版識別碼。'},
   '106-3-30':{'D':'本題預期答案；檢全率與檢準率的實際變化不是必然定律。'},
  }
  verdicts.update(overrides.get(qid,{}))
  if any(term in q['stem'] for term in ['FRBR','FRAD','FRSAD','LRM']):refs.append('models')
  if '中國機讀' in q['stem']:refs.append('cmarc')
  if 'MADS' in q['stem']:refs.append('mads')
  if 'EAD' in q['stem']:refs.append('ead')
  refs=list(dict.fromkeys(refs))
  entries[qid]={'summary':summary.replace('~','\n\n'),'options':{letter:reason.replace('~','\n\n') for letter,reason in zip('ABCD',reasons)},'optionVerdicts':verdicts,'revision':1,'sources':[{'title':sources[k][0],'url':sources[k][1]} for k in refs if k]}
 assert len(entries)==50,(year,len(entries))
 (root/f'data/explanations/{year}-3.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n')
 print(year,len(entries))
