'use client';
import {useState} from 'react';
import ModalDialog from './modal-dialog';
import {ReportQuestionButton} from './study-ui';
import type {Question} from '@/lib/types';
import AnswerExplanation from './answer-explanation';
type Props={question:Question;bookmarked:boolean;onBookmark:()=>void;onClose:()=>void;onReport?:()=>void;onNext?:()=>void;nextLabel?:string};
const ExplanationDialog=({question,bookmarked,onBookmark,onClose,onReport,onNext,nextLabel='下一題 →'}:Props)=>{
 const [available,setAvailable]=useState(false);
 return <ModalDialog title={<>{question.year} 年 · {question.subject} · 第 {question.number} 題解析</>} subtitle="看懂原因，把觀念留給下次的自己。" closeLabel="關閉解析" onClose={onClose} closeOnBackdrop footer={<>{onReport&&<ReportQuestionButton onClick={onReport}/>}<button className={`btn ${bookmarked?'saved':''}`} disabled={!available&&!bookmarked} onClick={onBookmark} aria-pressed={bookmarked}>{bookmarked?'取消收藏解析':'收藏解析'}</button><button className="btn primary" disabled={!onNext} onClick={onNext}>{onNext?nextLabel:'已是最後一題'}</button></>}>
<section className="explanation-question" aria-label="解析對應題目"><h3>題目回顧</h3>{question.passage&&<details><summary>查看題組文章</summary><p>{question.passage}</p></details>}<p>{question.stem}</p><p className="explanation-answer">正確答案：{question.allCredit?'本題一律給分':question.accepted.map(a=>a.split('').join('、')).join(' 或 ')}</p></section><AnswerExplanation question={question} onAvailabilityChange={setAvailable}/>
 </ModalDialog>;
};
export default ExplanationDialog;
