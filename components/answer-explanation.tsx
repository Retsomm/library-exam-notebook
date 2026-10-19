'use client';
import {useEffect,useState} from 'react';
import type {Question} from '@/lib/types';
type Explanation={summary:string;options:Record<string,string>;optionVerdicts?:Record<string,string>;vocabulary?:{word:string;partOfSpeech:string;meaning:string;usage:string}[];sources?:{title:string;url:string}[]};
const AnswerExplanation=({question:q,onAvailabilityChange}:{question:Question;onAvailabilityChange?:(ready:boolean)=>void})=>{
 const [entry,setEntry]=useState<Explanation|null>(null),[status,setStatus]=useState<'loading'|'ready'|'missing'|'error'>('loading'),[retry,setRetry]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();setStatus('loading');onAvailabilityChange?.(false);
  void fetch(`/explanations/${q.examId}.json`,{signal:controller.signal}).then(async response=>{
   if(response.status===404){setStatus('missing');return;}
   if(!response.ok)throw Error('load');
   const entries=await response.json(),item=entries[q.id];
   if(!item){setStatus('missing');return;}
   setEntry(item);setStatus('ready');onAvailabilityChange?.(true);
  }).catch(error=>{if(error.name!=='AbortError')setStatus('error');});
  return()=>controller.abort();
 },[q.id,q.examId,retry,onAvailabilityChange]);
 return <section className="answer-explanation" aria-label="作答後題目解析"><h2>題目解析</h2><p className="explanation-edition">白話詳解版</p>
  {status==='loading'?<p role="status">正在載入解析…</p>:status==='missing'?<p>本題解析尚在編寫中，請先參考上方官方答案。</p>:status==='error'?<><p role="alert">解析暫時無法載入。</p><button className="btn" onClick={()=>setRetry(n=>n+1)}>重新載入解析</button></>:entry&&<>
   <p className="explanation-summary">{entry.summary}</p>
   <h3>逐選項詳解</h3><dl className="option-explanations">{q.options.map(option=><div key={option.letter}><dt>（{option.letter}）{option.text}</dt><dd>{entry.optionVerdicts?.[option.letter]&&<p className="explanation-verdict">{entry.optionVerdicts[option.letter]}</p>}{entry.options[option.letter]}</dd></div>)}</dl>
   {!!entry.vocabulary?.length&&<section aria-label="題組重點單字"><h3>題組重點單字</h3><dl className="vocabulary-explanations">{entry.vocabulary.map(item=><div key={item.word}><dt lang="en">{item.word} <small>{item.partOfSpeech}</small></dt><dd><strong>{item.meaning}</strong><p>{item.usage}</p></dd></div>)}</dl></section>}
   {!!entry.sources?.length&&<div className="explanation-sources"><h3>延伸查證</h3>{entry.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>)}</div>}
   <p className="explanation-note">解析為本站編寫的學習說明，標準答案以考選部公告為準。</p>
  </>}
 </section>;
};
export default AnswerExplanation;
