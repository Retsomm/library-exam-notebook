'use client';
import { useEffect, useRef, useState } from 'react';
import type { Exam } from '@/lib/types';
import Icon from './icons';
const PaperReader = ({exam,page:initialPage,onClose}:{exam:Exam;page:number;onClose:()=>void}) => {
  const ref=useRef<HTMLDialogElement>(null);
  const [page,setPage]=useState(initialPage);
  const [zoom,setZoom]=useState(false);
  useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
  return <dialog ref={ref} onCancel={onClose} className="original-dialog" aria-label="完整原卷">
    <header className="modal-top"><div><h3>{exam.year} 年 · {exam.subject}</h3><p>閱讀題組可能在前頁，可左右翻頁。</p></div><button className="icon-btn" onClick={onClose} aria-label="關閉原卷"><Icon name="close"/></button></header>
    <div className="page-nav">
      <button className="btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>← 前頁</button>
      <span>{page+1} / {exam.pages.length}</span>
      <button className="btn" disabled={page===exam.pages.length-1} onClick={()=>setPage(p=>p+1)}>後頁 →</button>
      <button className="btn" aria-pressed={zoom} onClick={()=>setZoom(v=>!v)}>{zoom?'縮小':'放大'}</button>
      <a className="btn" href={`/pdf/${exam.id}-questions.pdf`} target="_blank" rel="noopener noreferrer">PDF ↗</a>
    </div>
    <div className={`reader-img-wrap ${zoom?'zoom':''}`}><img className="paper-page" src={`/${exam.pages[page]}`} alt={`${exam.subject} 原卷第 ${page+1} 頁`}/></div>
  </dialog>;
};
export default PaperReader;
