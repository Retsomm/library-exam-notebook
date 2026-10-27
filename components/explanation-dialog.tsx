'use client';
import {useState} from 'react';
import ModalDialog from './modal-dialog';
import {ReportQuestionButton} from './study-ui';
import type {Question,Vocabulary} from '@/lib/types';
import AnswerExplanation from './answer-explanation';
import QuestionText from './question-text';
type Props={question:Question;savedWords:string[];onToggleWord:(item:Vocabulary)=>void;bookmarked:boolean;onBookmark:()=>void;onClose:()=>void;onReport?:()=>void;onNext?:()=>void;nextLabel?:string};
const ExplanationDialog=({question,savedWords,onToggleWord,bookmarked,onBookmark,onClose,onReport,onNext,nextLabel='下一題 →'}:Props)=>{
 const [available,setAvailable]=useState(false);
 return <ModalDialog title={<>{question.year} 年 · {question.subject} · 第 {question.number} 題解析</>} subtitle="看懂原因，把觀念留給下次的自己。" closeLabel="關閉解析" onClose={onClose} closeOnBackdrop footer={<>{onReport&&<ReportQuestionButton onClick={onReport}/>}<button className={`btn ${bookmarked?'saved':''}`} disabled={!available&&!bookmarked} onClick={onBookmark} aria-pressed={bookmarked}>{bookmarked?'取消收藏解析':'收藏解析'}</button><button className="btn primary" disabled={!onNext} onClick={onNext}>{onNext?nextLabel:'已是最後一題'}</button></>}>
<section className="explanation-question" aria-label="解析對應題目"><h3>題目回顧</h3>{question.passage&&<details><summary>查看題組文章</summary><QuestionText text={question.passage}/></details>}<QuestionText text={question.stem}/><p className="explanation-answer">正確答案：{question.allCredit?'本題一律給分':question.accepted.map(a=>a.split('').join('、')).join(' 或 ')}</p></section><AnswerExplanation question={question} savedWords={savedWords} onToggleWord={onToggleWord} onAvailabilityChange={setAvailable}/>
 </ModalDialog>;
};
export default ExplanationDialog;
