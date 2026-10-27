'use client';
import {useMemo,useState} from 'react';
import type {Bank,Exam,StudyState} from '@/lib/types';
import {ProgressBar} from './study-ui';
import {formatScore,scoreQuestions} from '@/lib/scoring.mjs';
export default function ScoreDashboard({bank,study,onPractice}:{bank:Bank;study:StudyState;onPractice:(exam:Exam)=>void}){
 const [year,setYear]=useState(115);
 const papers=useMemo(()=>bank.exams.filter(exam=>exam.year===year).sort((a,b)=>a.subjectIndex-b.subjectIndex).map(exam=>{const questions=bank.questions.filter(q=>q.examId===exam.id);const answers=Object.fromEntries(questions.filter(q=>study.records[q.id]).map(q=>[q.id,study.records[q.id].answer.split('')]));return {exam,...scoreQuestions(questions,answers)};}),[bank,study.records,year]);
 return <section className="score-dashboard" aria-labelledby="score-dashboard-title"><div className="section-head"><div><p className="eyebrow">STUDY PROGRESS</p><h2 id="score-dashboard-title">我的練習進度</h2></div><label>年度 <select className="select" value={year} onChange={event=>setYear(Number(event.target.value))}>{[115,114,113,111,110,109,108,107,106].map(value=><option key={value} value={value}>{value} 年</option>)}</select></label></div><p className="score-caption">完整作答後會顯示各科累積得分。統計學大意每題 2.5 分，資料處理大意每題 2 分。</p><div className="score-papers">{papers.map(paper=><article key={paper.exam.id}><h3>{paper.exam.subject}</h3><p className="paper-score"><strong>{paper.answered===paper.total?formatScore(paper.score):'—'}</strong> / {formatScore(paper.max)} 分</p><ProgressBar value={paper.answered} total={paper.total} label={`${year} 年 ${paper.exam.subject} 作答進度`}/><p>已作答 {paper.answered} / {paper.total} 題</p><button className="btn" onClick={()=>onPractice(paper.exam)}>開始這科 →</button></article>)}</div></section>;
}
