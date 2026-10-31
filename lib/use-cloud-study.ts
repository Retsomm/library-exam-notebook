'use client';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import type {Bank,StudyState} from './types';
import {stateChanges,type Mutation} from './sync-model.mjs';
import type {CloudSync,SyncStatus} from './cloud-sync';
export const useCloudStudy=(uid:string|undefined,bank:Bank|null,loaded:boolean,study:StudyState,setStudy:Dispatch<SetStateAction<StudyState>>,storageKey?:string,onSaveError?:(failed:boolean)=>void)=>{
 const [syncError,setSyncError]=useState('');
 const [ready,setReady]=useState(false);
 const readyRef=useRef(false);
 const [status,setStatus]=useState<SyncStatus>('connecting');
 const controller=useRef<CloudSync|null>(null),latest=useRef(study),pending=useRef<Omit<Mutation,'id'>[]>([]);latest.current=study;
 useEffect(()=>{
  if(!uid||!bank||!loaded)return;
  let active=true;readyRef.current=false;setReady(false);setStatus('connecting');
  void import('./cloud-sync').then(({CloudSync})=>{
   if(!active)return;
   const sync=new CloudSync(uid,bank.questions,latest.current,s=>{if(!active)return;latest.current=s;setStudy(s);readyRef.current=true;setReady(true);},(s,detail)=>{if(active){setStatus(s);if(detail)setSyncError(detail);else if(s==='synced')setSyncError('');}});
   controller.current=sync;if(pending.current.length)sync.enqueue(pending.current.splice(0));void sync.start();
  });
  return()=>{active=false;controller.current?.stop();controller.current=null;};
 },[uid,bank,loaded,setStudy]);
 // Capture an action before rendering so a realtime snapshot cannot overwrite an unqueued edit.
 const replace=(fn:(s:StudyState)=>StudyState)=>{
  if(uid&&!readyRef.current)return;
  const previous=latest.current,next=fn(previous);latest.current=next;
  // Persist explicit user actions before returning, so an immediate reload cannot lose a bookmark removal.
  if(storageKey){try{localStorage.setItem(storageKey,JSON.stringify(next));onSaveError?.(false);}catch{onSaveError?.(true);}}
  if(uid){const changes=stateChanges(previous,next);if(controller.current)controller.current.enqueue(changes);else pending.current.push(...changes);}
  setStudy(next);
 };
 const mutate=(fn:(s:StudyState)=>void)=>replace(previous=>{const next=structuredClone(previous);fn(next);return next;});
 return {status,syncError,ready:!uid||ready,mutate,replace,retry:()=>{readyRef.current=false;setReady(false);controller.current?.retry();}};
};
