'use client';
import type {Exam,Question} from '@/lib/types';
import type {IdiomEntry} from '@/lib/idioms.mjs';
import StudyQuestionSource from './study-question-source';
type Props={entry:IdiomEntry;year:string;questions:Map<string,Question>;exams:Map<string,Exam>;onPractice:(questions:Question[],title:string)=>void;onViewExplanation:(id:string)=>void};
export default function IdiomCard({entry,year,questions,exams,onPractice,onViewExplanation}:Props){
 const related=entry.questionIds.map(id=>questions.get(id)).filter((q):q is Question=>!!q&&(year==='all'||q.year===Number(year)));
 return <article className="note-card idiom-card" aria-label={entry.term}>
  <p className="eyebrow">{entry.category} · {entry.questionIds.length} 題出現</p>
  <h3>{entry.term}</h3>
  {!!entry.aliases.length&&<p className="text-muted">異寫／對照詞形：{entry.aliases.join('、')}</p>}
  <dl className="note-points"><div><dt>意思與用法</dt><dd>{entry.meaning}</dd></div></dl>
  <div className="note-example"><h4>使用例句</h4><p>{entry.example}</p></div>
  <details className="note-sources"><summary>查看歷屆出處 · {related.length} 題{year!=='all'?`（${year} 年）`:''}</summary>
   <p className="text-muted">出現在題幹、選項或閱讀文章中；選項可能刻意誤用，請配合原題解析判斷。</p>
   {related.map(q=><StudyQuestionSource key={q.id} question={q} exam={exams.get(q.examId)} onPractice={onPractice} onViewExplanation={onViewExplanation}/>)}
  </details>
 </article>;
}
