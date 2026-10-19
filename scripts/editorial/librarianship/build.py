"""將逐題人工編寫的圖書館學解析轉為 JSON，拒絕缺漏或未登錄來源。"""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[3]
folder = Path(__file__).resolve().parent
questions = {q['id']: q for q in json.loads((root/'data/bank.json').read_text())['questions']}
sources = {}
for line in (folder/'sources.tsv').read_text().splitlines():
    if not line.strip(): continue
    key, title, url = line.split('\t')
    sources[key] = {'title': title, 'url': url}
overrides = {
 '115-2-5': {'A': '本題官方答案；「必為」的絕對用語仍有疑義，請看概念辨析。'},
 '115-2-44': {'C': '舊式教材表述，RDF 不限 XML；URI 的正確全名也須注意。'},
 '114-2-48': {'B': '本題官方計分答案；此句本身有可成立之處，不宜硬判為普遍錯誤。'},
 '113-2-44': {'C': '正規化原則可成立；本題取 B 作為較具體的表格調整方式。'},
 '110-2-8': {'B': '本題官方組合答案；其中第⑤項措辭須配合原題脈絡理解。'},
 '107-2-38': {'A': '隱私及個資自主權確實相關，本題概念存在重疊。', 'D': '本題官方答案；不可因此忽略個資權利的隱私內涵。'},
 '106-2-19': {'A': '本題官方答案；完整權變模式還須知道職位權力。'},
 '106-2-43': {'B': '本題最接近的答案；像素主要關乎解析度，不等於全部影像品質。'},
 '106-2-46': {'D': '本題相對答案；權限通常要重新映射，並非可以省略存取控制。'},
 '106-2-49': {'D': '本題相對答案；數位容量仍有成本及技術限制。'},
}
count = 0
for path in sorted(folder.glob('*.txt')):
    year = path.stem
    entries = {}
    for line in path.read_text().splitlines():
        if not line.strip() or line.startswith('#'): continue
        fields = line.split('|')
        assert len(fields) == 7, (path, len(fields))
        number, summary, *tail = fields
        negative = number.endswith('!')
        qid = f'{year}-2-{number.rstrip("!")}'
        assert qid not in entries, qid
        q = questions[qid]
        selected = set(''.join(q['accepted']))
        verdicts = {letter: (('敘述錯誤，因此本題應選。' if letter in selected else '敘述正確，因此本題不選。') if negative else ('本題正確答案，應選。' if letter in selected else '不是本題答案，不選。')) for letter in 'ABCD'}
        if q.get('allCredit') or (not q['multi'] and set(q['accepted']) == set('ABCD')):
            verdicts = {letter: '官方更正：本題一律給分；下方仍說明各選項實際意義。' for letter in 'ABCD'}
        verdicts.update(overrides.get(qid, {}))
        refs = list(dict.fromkeys(tail[4].split(',')))
        assert refs and all(k in sources for k in refs), (qid, refs)
        entries[qid] = {'summary': summary.replace('~', '\n\n'), 'options': {letter: reason.replace('~', '\n\n') for letter, reason in zip('ABCD', tail[:4])}, 'optionVerdicts': verdicts, 'revision': 1, 'sources': [sources[k] for k in refs]}
    assert len(entries) == 50, (year, len(entries))
    (root/f'data/explanations/{year}-2.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2)+'\n')
    count += len(entries)
    print(year, len(entries))
assert count == 450, count
