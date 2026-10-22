import type {IdiomEntry} from '@/lib/idioms.mjs';

/** Canonical learning content shared by answer explanations and the idiom library. */
export default function IdiomLearning({entry,showTerm=false}:{entry:IdiomEntry;showTerm?:boolean}){
 return <section className="idiom-learning" aria-label={`${entry.term}詞義與由來`}>
  {showTerm&&<h4>{entry.term}</h4>}
  <dl>
   {entry.origin&&<div><dt>{entry.origin.kind==='構詞'?'構詞說明':'典故與語源'}{entry.origin.kind==='傳說'?'（傳說）':''}</dt><dd><p>{entry.origin.explanation}</p><p className="idiom-reference">參考：{entry.origin.reference} · <a href={entry.origin.url} target="_blank" rel="noopener noreferrer">教育部辭典查證 ↗</a></p></dd></div>}
   <div><dt>意思與用法</dt><dd>{entry.meaning}</dd></div>
   <div><dt>使用例句</dt><dd>{entry.example}</dd></div>
  </dl>
 </section>;
}
