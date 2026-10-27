'use client';
import {useId,useState} from 'react';
import ModalDialog from './modal-dialog';
import OfficialSourceLink from './official-source-link';
import type {Question,Exam} from '@/lib/types';
import {makeReport,reportKinds,reportText,reportIssueUrl,type QuestionReport} from '@/lib/question-reports.mjs';
type Props={question:Question;exam:Exam;answer?:string[];signedIn:boolean;onSave:(report:QuestionReport)=>void;onClose:()=>void};
export default function ReportDialog({question,exam,answer,signedIn,onSave,onClose}:Props){
 const kindId=useId(),detailId=useId();
 const [kind,setKind]=useState('scan'),[detail,setDetail]=useState(''),[saved,setSaved]=useState<QuestionReport|null>(null),[message,setMessage]=useState('');
 const save=()=>{try{const report=makeReport(question,exam,kind,detail,answer);onSave(report);setSaved(report);setMessage('');}catch(e){setMessage(e instanceof Error?e.message:'儲存失敗，請先複製題號及問題說明。');}};
 return <ModalDialog className="report-dialog" title="回報題目問題" subtitle={<>{question.year} 年 · {question.subject} · 第 {question.number} 題（{question.id}）</>} closeLabel="關閉回報" onClose={onClose} footer={<><button className="btn" onClick={onClose}>{saved?'返回題目':'取消'}</button>{!saved&&<button className="btn primary" onClick={save} disabled={!detail.trim()}>儲存回報</button>}</>}>
 {!saved?<><p>發現文字、答案或解析有疑問？請指出哪個選項、哪一句有問題，方便逐一對照。</p><label className="report-field" htmlFor={kindId}>問題類型<select id={kindId} className="select" value={kind} onChange={e=>setKind(e.target.value)}>{Object.entries(reportKinds).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label className="report-field" htmlFor={detailId}>問題說明<textarea id={detailId} className="notes" value={detail} onChange={e=>setDetail(e.target.value)} maxLength={2000} placeholder="例如：B 選項的數字與原卷不同；或我查到的法規是……" required/></label><small>{detail.length} / 2,000 字；請勿填入密碼或個人敏感資料。</small></>:<><h3>回報已保存，等待查核</h3><p>{signedIn?'會同步至你的 Google 帳號；送達狀態可在「題目回報」查看。':'目前是訪客模式，回報只保存在這個瀏覽器；請複製或匯出保留。'}</p><label className="report-field">回報資訊<textarea className="notes report-copy" readOnly value={reportText(saved)} aria-label="可複製的題目回報"/></label><a className="btn primary" href={reportIssueUrl(saved)} target="_blank" rel="noopener noreferrer">送出給維護者 ↗</a><button className="btn" onClick={()=>{void navigator.clipboard.writeText(reportText(saved)).then(()=>setMessage('已複製，貼到這段 ChatGPT 對話即可請我查核。')).catch(()=>setMessage('無法自動複製，請在上方文字框全選後複製。'));}}>複製回報內容</button></>}
 <p className="notice">儲存回報會保留在你的裝置；登入後也會同步到你的帳戶。按「送出給維護者」會開啟預填好的 GitHub Issue，送出後就能集中追蹤與修正。Issue 為公開內容，請勿填寫個人資料。儲存回報本身不會更改答案。</p>
 <div className="report-source-links"><OfficialSourceLink className="btn" exam={exam} question={question} kind="question">官方原卷 · PDF 第 {question.page+1} 頁 ↗</OfficialSourceLink><OfficialSourceLink className="btn" exam={exam} question={question} kind="answer">官方標準答案 PDF ↗</OfficialSourceLink><OfficialSourceLink className="btn" exam={exam} question={question} kind="correction">官方更正答案 ↗</OfficialSourceLink></div>{message&&<p role="status" className="notice">{message}</p>}</ModalDialog>;
}
