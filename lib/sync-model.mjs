import {emptyState, validateBackup, grade} from './study.mjs';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const eventKey=h=>`${h.id}:${h.time}:${h.answer}`;
export const mergeHistory=(a=[],b=[])=>[...new Map([...a,...b].map(h=>[eventKey(h),h])).values()].sort((a,b)=>b.time.localeCompare(a.time)).slice(0,500);
export const questionPatch=(before,after,id)=>{
 const patch={};
 const oldExplanation=(before.explanationBookmarks||[]).includes(id),newExplanation=(after.explanationBookmarks||[]).includes(id);if(oldExplanation!==newExplanation)patch.explanationBookmark=newExplanation;
 const a=before.bookmarks.includes(id),b=after.bookmarks.includes(id);if(a!==b)patch.bookmark=b;
 if((before.notes[id]||'')!==(after.notes[id]||''))patch.note=after.notes[id]||'';
 if(!equal(before.records[id],after.records[id])&&after.records[id])patch.record=after.records[id];
 if(!equal(before.wrong[id],after.wrong[id])&&after.wrong[id])patch.wrong=after.wrong[id];
 const old=new Set(before.history.filter(h=>h.id===id).map(eventKey));
 const added=after.history.filter(h=>h.id===id&&!old.has(eventKey(h)));if(added.length)patch.history=added;
 return patch;
};
export const stateChanges=(before,after)=>{
 const ids=new Set([...(before.explanationBookmarks||[]),...(after.explanationBookmarks||[]),...before.bookmarks,...after.bookmarks,...Object.keys(before.notes),...Object.keys(after.notes),...Object.keys(before.records),...Object.keys(after.records),...Object.keys(before.wrong),...Object.keys(after.wrong),...after.history.map(h=>h.id)]);
 const changes=[];
 for(const id of ids){const patch=questionPatch(before,after,id);if(Object.keys(patch).length)changes.push({docId:id,patch,mode:'update'});}
 if(!equal(before.session,after.session))changes.push({docId:'_session',patch:{sessionJSON:JSON.stringify(after.session)},mode:'update'});
 return changes;
};
export const applyQuestionMutation=(current={},mutation)=>{
 if(current.applied?.includes(mutation.id))return current;
 const p=mutation.patch,out={...current};
 for(const k of ['bookmark','explanationBookmark','note','wrong'])if(Object.hasOwn(p,k))out[k]=p[k];
 const oldKeys=new Set((current.history||[]).map(eventKey));
 const added=(p.history||[]).filter(h=>!oldKeys.has(eventKey(h))).length;
 if(p.record){out.record={...p.record,attempts:mutation.mode==='migrate'?Math.max(current.record?.attempts||0,p.record.attempts):Math.max(current.record?.attempts||0,(p.record.attempts||1)-added)+added};}
 if(p.history)out.history=mergeHistory(current.history,p.history);
 out.applied=[...(current.applied||[]).slice(-127),mutation.id];
 return out;
};
export const migrationChanges=(local,remote,sessionExists)=>{
 const changes=[];
 const ids=new Set([...(local.explanationBookmarks||[]),...local.bookmarks,...Object.keys(local.notes),...Object.keys(local.records),...Object.keys(local.wrong),...local.history.map(h=>h.id)]);
 for(const id of ids){const r=remote.get(id)||{},patch={};
  if((local.explanationBookmarks||[]).includes(id)&&!Object.hasOwn(r,'explanationBookmark'))patch.explanationBookmark=true;
  if(local.bookmarks.includes(id)&&!Object.hasOwn(r,'bookmark'))patch.bookmark=true;
  if(Object.hasOwn(local.notes,id)&&!Object.hasOwn(r,'note'))patch.note=local.notes[id];
  for(const k of ['record','wrong']){const value=local[k==='record'?'records':'wrong'][id];if(value&&(!r[k]||value.time>r[k].time))patch[k]=value;}
  const history=local.history.filter(h=>h.id===id);if(history.length)patch.history=history;
  if(Object.keys(patch).length)changes.push({docId:id,patch,mode:'migrate'});
 }
 if(!sessionExists&&local.session)changes.push({docId:'_session',patch:{sessionJSON:JSON.stringify(local.session)},mode:'migrate'});
 return changes;
};
export const cloudState=(remote,sessionJSON,questions,queue=[])=>{
 const docs=new Map([...remote].map(([id,d])=>[id,{...d}]));let session=sessionJSON;
 for(const m of queue){if(m.docId==='_session')session=m.patch.sessionJSON;else docs.set(m.docId,applyQuestionMutation(docs.get(m.docId),m));}
 const raw=emptyState();
 for(const [id,d]of docs){if(d.bookmark)raw.bookmarks.push(id);if(d.explanationBookmark===true)raw.explanationBookmarks.push(id);if(typeof d.note==='string')raw.notes[id]=d.note;if(d.record)raw.records[id]=d.record;if(d.wrong)raw.wrong[id]=d.wrong;raw.history.push(...(Array.isArray(d.history)?d.history.filter(h=>h&&h.id===id&&typeof h.time==='string'&&typeof h.answer==='string'&&typeof h.correct==='boolean'):[]));}
 raw.history.sort((a,b)=>b.time.localeCompare(a.time));raw.history=raw.history.slice(0,10000);
 try{raw.session=JSON.parse(session||'null');}catch{raw.session=null;}
 const known=new Map(questions.map(q=>[q.id,q])),safe=validateBackup(raw,new Set(known.keys()));
 if(safe.session&&raw.session){for(const id of safe.session.ids){const choice=raw.session.choices?.[id];if(Array.isArray(choice)&&choice.length&&choice.every(x=>typeof x==='string'&&/^[A-E]$/.test(x))){safe.session.choices[id]=[...new Set(choice)];if(Object.hasOwn(raw.session.checked||{},id))safe.session.checked[id]=grade(known.get(id),choice);}}}
 return safe;
};
