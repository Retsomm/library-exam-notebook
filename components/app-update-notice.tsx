'use client';
import {useEffect,useState} from 'react';
import type {StudyState} from '@/lib/types';
import {newerVersion,saveBeforeReload} from '@/lib/app-version.mjs';
type Props={storageKey:string;study:StudyState;ready:boolean;canReload?:boolean};
const AppUpdateNotice=({storageKey,study,ready,canReload=true}:Props)=>{
 const [available,setAvailable]=useState<string|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  const current=process.env.NEXT_PUBLIC_APP_VERSION;
  if(!current)return;
  const controller=new AbortController();let checking=false;
  const check=async()=>{
   if(checking||document.visibilityState==='hidden')return;
   checking=true;
   try{
    const response=await fetch('/version.json',{cache:'no-store',signal:controller.signal});
    if(!response.ok)return;
    const version=newerVersion(await response.json(),current);
    if(!controller.signal.aborted)setAvailable(version);
   }catch{/* Keep the current page usable while offline. */}
   finally{checking=false;}
  };
  void check();
  const timer=setInterval(()=>void check(),60000);
  window.addEventListener('focus',check);document.addEventListener('visibilitychange',check);
  return()=>{controller.abort();clearInterval(timer);window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check);};
 },[]);
 if(!available)return null;
 return <section className="app-update-notice" role="status" aria-label="網站版本更新"><div><strong>網站已有更新</strong><p>更新後使用最新介面與題庫；目前作答進度與筆記會先保存。</p>{!canReload&&<p>正在連接雲端，請稍候再更新。</p>}{error&&<p role="alert">{error}</p>}</div><button className="btn primary" disabled={!ready||!canReload} onClick={()=>{
  try{saveBeforeReload(localStorage,storageKey,study,()=>window.location.reload());}
  catch{setError('進度暫時無法保存，請先匯出備份後再重新整理。');}
 }}>保留進度並更新</button></section>;
};
export default AppUpdateNotice;
