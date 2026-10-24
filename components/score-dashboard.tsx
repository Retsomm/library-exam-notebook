'use client';
import {useMemo,useState} from 'react';
import admission from '@/data/admission-cutoffs.json';
import {formatScore,scoringSources} from '@/lib/scoring.mjs';
import {attemptYearScores} from '@/lib/attempts.mjs';
import AttemptHistory from './attempt-history';
import type {Bank,Exam,StudyState} from '@/lib/types';
import {ProgressBar} from './study-ui';
export default function ScoreDashboard({bank,study,onPractice}:{bank:Bank;study:StudyState;onPractice:(exam:Exam)=>void}){
 const [year,setYear]=useState(admission.years[0].year),[target,setTarget]=useState(90);
 const current=admission.years.find(item=>item.year===year)!;
 const result=useMemo(()=>attemptYearScores(bank,study.attempts,year),[bank,study.attempts,year]);
 const highest=Math.max(...admission.years.map(item=>item.cutoff));
 const gap=result.average===null?null:Math.round((result.average-current.cutoff)*100)/100;
 return <section className="score-dashboard" aria-labelledby="score-dashboard-title">
  <div className="section-head"><div><p className="eyebrow">TOWARD YOUR PERFECT SCORE</p><h2 id="score-dashboard-title">錄取分數與我的練習看板</h2></div><label>對照年度 <select className="select" aria-label="看板年度" value={year} onChange={event=>setYear(Number(event.target.value))}>{admission.years.map(item=><option key={item.year} value={item.year}>{item.year} 年</option>)}</select></label></div>
  <div className="score-metrics">
   <div><p>{year} 年錄取標準</p><strong>{current.cutoff.toFixed(2)}<small>分</small></strong><a href={current.source} target="_blank" rel="noopener noreferrer">考選部原始統計 ↗</a></div>
   <div><p>已收錄年度最高標準</p><strong>{highest.toFixed(2)}<small>分</small></strong><span>106–115 年，112 年未開缺</span></div>
   <div><p>最近完整測驗四科平均</p><strong>{result.average===null?'—':formatScore(result.average)}<small>{result.average===null?'':'分'}</small></strong><span>{result.average===null?`已完整練習 ${result.papers.filter(paper=>paper.complete).length} / 4 科`:gap!==null&&gap>=0?`高於當年標準 ${formatScore(gap)} 分`:`距當年標準 ${formatScore(Math.abs(gap!))} 分`}</span></div>
  </div>
  <div className="score-target"><label>我的練習目標 <select className="select" aria-label="練習目標分數" value={target} onChange={event=>setTarget(Number(event.target.value))}>{[85,90,95,100].map(value=><option key={value} value={value}>{value} 分{value===100?' · 滿分':''}</option>)}</select></label><p>{result.average===null?'完成同年度四科後，顯示與目標的差距。':result.average>=target?`已達 ${target} 分目標，繼續挑戰滿分。`:`平均再提升 ${formatScore(target-result.average)} 分，就達到 ${target} 分目標。`}</p></div>
  <p className="score-caption">採用同年度各科最近一次「完整測驗」的固定成績，四科都有紀錄才顯示平均。四科可能在不同日期完成，並非同一場模擬考；錯題複習不會改動分數。</p>
  <div className="score-papers">{result.papers.map(paper=><article key={paper.exam.id}><h3>{paper.exam.subject}</h3><p className="paper-score"><strong>{paper.complete?formatScore(paper.score):'—'}</strong> / {paper.max} 分</p><p>{paper.attempt?`完成於 ${new Date(paper.attempt.completedAt).toLocaleDateString('zh-TW',{timeZone:'Asia/Taipei'})}`:'尚無完整測驗紀錄'}</p><ProgressBar value={paper.score} total={paper.max} label={`${year} 年 ${paper.exam.subject} 得分`}/><p>{paper.complete?`距滿分 ${formatScore(paper.max-paper.score)} 分`:'完成整份試卷後保存成績'}</p><button className="btn" onClick={()=>onPractice(paper.exam)}>{paper.complete?'重練這科':'開始這科'} →</button></article>)}</div>
  <AttemptHistory bank={bank} attempts={study.attempts}/>
  <details className="score-history"><summary>歷年錄取標準與資料來源（106–115 年）</summary><div className="table-wrap"><table><caption>初等考試 · 圖書資訊管理 · 總成績錄取標準</caption><thead><tr><th scope="col">年度</th><th scope="col">錄取標準</th><th scope="col">到考／錄取</th><th scope="col">官方來源</th></tr></thead><tbody>{admission.years.map(item=><tr key={item.year}><th scope="row">{item.year}</th><td>{item.cutoff.toFixed(2)} 分</td><td>{item.attended}／{item.admitted} 人</td><td><a href={item.source} target="_blank" rel="noopener noreferrer">考選部統計 ↗</a> <a href={item.dataset} target="_blank" rel="noopener noreferrer">資料集 ↗</a></td></tr>)}</tbody></table></div></details>
  <p className="score-caption">錄取標準比較的是四科平均，不是單科分數。歷年難度、名額不同；達到往年分數不代表未來一定錄取。116 年錄取標準尚未公布。資料查核：{admission.verifiedAt}。</p>
  <details className="score-rules"><summary>實際計分方式</summary><p>各科滿分 100 分。國文單選 35 題，每題 2 分；複選 10 題，每題 3 分。其他三科各 50 題，每題 2 分。複選每個選項獨立判斷：全對 3 分、錯一個 1.8 分、錯兩個 0.6 分；全未選或錯超過兩個為 0 分，不倒扣其他題。官方更正或一律給分另行套用。</p><p>錯題本仍以完全選對才算掌握，部分得分的題目會繼續保留供複習。</p><a href={scoringSources.multiple} target="_blank" rel="noopener noreferrer">閱卷規則第 19-2 條 ↗</a> · <a href={scoringSources.allocation} target="_blank" rel="noopener noreferrer">官方題數與配分 ↗</a> · <a href={scoringSources.average} target="_blank" rel="noopener noreferrer">總成績計算規則 ↗</a></details>
 </section>;
}
