'use client';
import type {ReactNode} from 'react';
import type {Bank,Question,StudySession} from '@/lib/types';
import {formatScore,sessionScore} from '@/lib/scoring.mjs';
export default function PracticeResult({session,questions,bank,onRepeat,onDashboard,children}:{session:StudySession;questions:Map<string,Question>;bank:Bank;onRepeat:()=>void;onDashboard:()=>void;children:ReactNode}){
 const result=sessionScore(session,questions,bank.exams);
 return <section className="result-card"><p className="eyebrow">ANOTHER CHAPTER COMPLETED</p><h2>今天的練習，都算數。</h2><p>{session.title}</p><p className="score-kind">{result.fullPaper?'完整試卷 · 單科得分':'節選練習 · 本回合得分'}{result.unanswered?'（含未答題）':''}</p><p className="big">{formatScore(result.score)}<small> / {result.max} 分</small></p><p>已作答 {result.answered} 題 · 全額得分 {result.fullCredit} 題 · 部分得分 {result.partialCredit} 題 · 未作答 {result.unanswered} 題</p><p>{result.fullPaper?'單科滿分 100 分；四科平均才可對照歷年錄取標準。':'保留題目原始配分，不將節選成績換算為整科 100 分。'}國文複選已套用部分給分。</p><div className="result-actions"><button className="btn primary" onClick={onRepeat}>再練同一份{result.fullPaper?'試卷':'清單'}</button><button className="btn" onClick={onDashboard}>查看錄取與得分看板</button>{children}</div></section>;
}
