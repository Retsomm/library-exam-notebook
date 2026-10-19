'use client';
import {useEffect,useId,useRef,useState} from 'react';
import type {Question} from '@/lib/types';
import AnswerExplanation from './answer-explanation';
type Props={question:Question;bookmarked:boolean;onBookmark:()=>void;onClose:()=>void;onReport?:()=>void;onNext?:()=>void;nextLabel?:string};
const ExplanationDialog=({question,bookmarked,onBookmark,onClose,onReport,onNext,nextLabel='下一題 →'}:Props)=>{
 const ref=useRef<HTMLDialogElement>(null),title=useId();
 const [available,setAvailable]=useState(false);
 useEffect(()=>{
  const dialog=ref.current,overflow=document.body.style.overflow;
  dialog?.showModal();document.body.style.overflow='hidden';
  return()=>{dialog?.close();document.body.style.overflow=overflow;};
 },[]);
 return <dialog ref={ref} className="explanation-dialog" aria-labelledby={title} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <header className="explanation-dialog-header"><div><h2 id={title}>{question.year} 年 · {question.subject} · 第 {question.number} 題解析</h2><p>看懂原因，把觀念留給下次的自己。</p></div><button className="btn" onClick={onClose} autoFocus aria-label="關閉解析">關閉 ×</button></header>
  <div className="explanation-dialog-content"><section className="explanation-question" aria-label="解析對應題目"><h3>題目回顧</h3>{question.passage&&<details><summary>查看題組文章</summary><p>{question.passage}</p></details>}<p>{question.stem}</p><p className="explanation-answer">正確答案：{question.allCredit?'本題一律給分':question.accepted.map(a=>a.split('').join('、')).join(' 或 ')}</p></section><AnswerExplanation question={question} onAvailabilityChange={setAvailable}/></div>
  <footer className="explanation-dialog-footer">{onReport&&<button className="btn" onClick={onReport}>回報題目問題</button>}<button className={`btn ${bookmarked?'saved':''}`} disabled={!available&&!bookmarked} onClick={onBookmark} aria-pressed={bookmarked}>{bookmarked?'取消收藏解析':'收藏解析'}</button><button className="btn primary" disabled={!onNext} onClick={onNext}>{onNext?nextLabel:'已是最後一題'}</button></footer>
 </dialog>;
};
export default ExplanationDialog;
