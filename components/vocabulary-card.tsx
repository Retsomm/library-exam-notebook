'use client';
import {useId,useState} from 'react';
import type {Vocabulary} from '@/lib/types';
type Props={item:Vocabulary;saved:boolean;onToggle:()=>void;review?:boolean;source?:string;onSource?:()=>void};
export default function VocabularyCard({item,saved,onToggle,review=false,source,onSource}:Props){
 const [revealed,setRevealed]=useState(!review),definitionId=useId();
 return <div className="vocabulary-card">
  <dt><span lang="en">{item.word} <small>{item.partOfSpeech}</small></span><button className={`btn word-save ${saved?'saved':''}`} aria-label={`${saved?'取消收藏單字':'收藏單字'} ${item.word}`} aria-pressed={saved} onClick={onToggle}>{saved?'★ 已收藏':'☆ 收藏'}</button></dt>
  <dd>{review&&<button className="btn word-reveal" aria-expanded={revealed} aria-controls={definitionId} onClick={()=>setRevealed(value=>!value)}>{revealed?'隱藏中文與例句':'顯示中文與例句'}</button>}<div id={definitionId} hidden={!revealed}><strong>{item.meaning}</strong><p>{item.usage}</p></div>{source&&<button className="link word-source" onClick={onSource}>{source} ↗</button>}</dd>
 </div>;
}
