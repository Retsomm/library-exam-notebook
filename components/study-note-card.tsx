'use client';
import type {ReactNode} from 'react';
import type {Exam,Question} from '@/lib/types';
import OfficialSourceLink from './official-source-link';
export type StudyNote={id:string;subjectIndex:number;group:string;title:string;lead:string;points:{term:string;detail:string}[];example:string;trap:string;recall:string;answer:string;questionIds:string[];sources:{title:string;url:string}[];mnemonic?:string;order?:number;track?:string;vocabularyIds?:string[]};
type Props={note:StudyNote;vocabularyContent?:ReactNode;questions:Map<string,Question>;exams:Map<string,Exam>;onPractice:(questions:Question[],title:string)=>void;onViewExplanation:(id:string)=>void};
export default function StudyNoteCard({note,vocabularyContent,questions,exams,onPractice,onViewExplanation}:Props){
 const related=note.questionIds.map(id=>questions.get(id)).filter((q):q is Question=>!!q);
 const body=<><dl className="note-points">{note.points.map(point=><div key={point.term}><dt>{point.term}</dt><dd>{point.detail}</dd></div>)}</dl><div className="note-example"><h4>用例子理解</h4><p>{note.example}</p></div><div className="note-trap"><h4>容易混淆的地方</h4><p>{note.trap}</p></div><div className="note-recall"><h4>遮住後回想</h4><p>{note.recall}</p><details><summary>查看重點答案</summary><p>{note.answer}</p></details></div>{vocabularyContent}</>;
 return <article className="note-card" aria-labelledby={`note-${note.id}`}>
  <p className="eyebrow">{note.group}{note.order?` · 重點 ${String(note.order).padStart(2,'0')}`:''}</p>
  <h3 id={`note-${note.id}`}>{note.title}</h3><p className="note-lead">{note.lead}</p>
  {note.mnemonic&&<div className="note-mnemonic"><h4>記憶訣竅</h4><p>{note.mnemonic}</p></div>}
  {(note.order||note.track)?<details className="note-lesson"><summary>閱讀完整重點 · {note.points.length} 個觀念</summary>{body}</details>:body}
  <button className="btn primary" disabled={!related.length} onClick={()=>onPractice(related,`重點練習 · ${note.title}`)}>練習關聯考題 · {related.length} 題 →</button>
  <details className="note-sources"><summary>逐題對照、解析與官方來源 · {related.length} 題</summary>
   <p className="text-muted">{note.order?'同考點只整理一份；以下列出歸入本主題的每一題。題目特有的選項、例外與完整說明，可點「查看原題解析」。':'以下為編輯選出的關聯題目，不表示該主題的全部出題次數。'}</p>
   {related.map(q=>{const exam=exams.get(q.examId);return <div className="note-source" key={q.id}>
    <p>{q.year} 年 · 第 {q.number} 題{q.allCredit?' · 官方一律給分':q.correction?' · 有答案更正':''}</p><p className="note-question-preview">{q.stem}</p>
    <div className="note-source-actions"><button className="btn" onClick={()=>onViewExplanation(q.id)} aria-label={`查看 ${q.year} 年第 ${q.number} 題原題解析`}>查看原題解析</button><button className="link" onClick={()=>onPractice([q],`${q.year} 年 · ${q.subject} · 第 ${q.number} 題`)}>練習這一題</button>{exam&&<><OfficialSourceLink question={q} exam={exam} kind="question">官方原卷 ↗</OfficialSourceLink><OfficialSourceLink question={q} exam={exam} kind="answer">標準答案 ↗</OfficialSourceLink><OfficialSourceLink question={q} exam={exam} kind="correction">更正公告 ↗</OfficialSourceLink></>}</div>
   </div>;})}
   {note.sources.length>0&&<details className="note-references"><summary>延伸查核資料 · {note.sources.length} 筆</summary><p className="text-muted">彙整關聯解析所附來源；歷史題請辨別法規、系統與規範版本。</p>{note.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>)}</details>}
  </details>
 </article>;
}
