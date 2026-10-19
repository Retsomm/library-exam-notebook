'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {collection,doc,getFirestore,onSnapshot,runTransaction,serverTimestamp} from 'firebase/firestore';
import {firebaseAuth} from './firebase-client';
import {mergeReports,type QuestionReport} from './question-reports.mjs';
export function useQuestionReports(accountKey:string,uid?:string){
 const key=`yueri:reports:v1:${accountKey}`;
 const [reports,setReports]=useState<QuestionReport[]>([]),[message,setMessage]=useState(''),[ready,setReady]=useState(false),[retry,setRetry]=useState(0);
 const latest=useRef<QuestionReport[]>([]);
 const persist=useCallback((next:QuestionReport[])=>{localStorage.setItem(key,JSON.stringify(next));latest.current=next;setReports(next);},[key]);
 useEffect(()=>{try{const data=JSON.parse(localStorage.getItem(key)||'[]');latest.current=Array.isArray(data)?data.filter(r=>r&&typeof r.id==='string'&&typeof r.snapshotJSON==='string'&&typeof r.createdAt==='string'):[];setReports(latest.current);}catch{setMessage('回報紀錄讀取失敗，請先複製回報內容。');}setReady(true);},[key]);
 useEffect(()=>{if(!ready||!uid)return;let stopped=false,busy=false;let unsubscribe:(()=>void)|undefined;
 const connect=async()=>{try{
  const auth=await firebaseAuth();if(stopped||auth.currentUser?.uid!==uid)return;
  const db=getFirestore(auth.app);
  unsubscribe=onSnapshot(collection(db,'users',uid,'questionReports'),snapshot=>{
   if(stopped)return;
   const remote=snapshot.docs.filter(d=>!d.metadata.hasPendingWrites).map(d=>({id:d.id,...d.data(),synced:true}) as QuestionReport);
   try{persist(mergeReports(latest.current,remote));}catch{setMessage('無法保存本機回報，請複製或匯出。');}
  },()=>{if(!stopped)setMessage('回報雲端連線暫停；本機紀錄仍保留，可重試同步或複製回報。');});
  const flush=async()=>{if(stopped||busy||!navigator.onLine)return;busy=true;
   try{while(true){const report=latest.current.find(r=>!r.synced);if(!report)break;
    if(stopped)return;
    const ref=doc(db,'users',uid,'questionReports',report.id);
    // A previous write may have succeeded just before the browser closed. Never overwrite an immutable report.
    await runTransaction(db,async transaction=>{if(!(await transaction.get(ref)).exists())transaction.set(ref,{questionId:report.questionId,kind:report.kind,detail:report.detail,createdAt:report.createdAt,snapshotJSON:report.snapshotJSON,submittedAt:serverTimestamp()});});
    if(stopped)return;persist(latest.current.map(r=>r.id===report.id?{...r,synced:true}:r));
   }if(!stopped)setMessage('');}catch{if(!stopped)setMessage('回報尚未送達雲端，已保留本機；請連線後重試。');}finally{busy=false;}
  };
  window.addEventListener('online',flush);window.addEventListener('yueri-report-added',flush);void flush();
  cleanup=()=>{window.removeEventListener('online',flush);window.removeEventListener('yueri-report-added',flush);};
 }catch{if(!stopped)setMessage('回報暫時無法連接雲端，已保留本機。');}};
 let cleanup=()=>{};void connect();return()=>{stopped=true;unsubscribe?.();cleanup();};
 },[uid,ready,persist,retry]);
 const add=(report:QuestionReport)=>{persist(mergeReports([...latest.current,report],[]));window.dispatchEvent(new Event('yueri-report-added'));};
 return {reports,add,message,retry:()=>setRetry(n=>n+1)};
}
