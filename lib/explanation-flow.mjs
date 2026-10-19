/** Resolve an explicit open request against current canonical state, never copied question data. */
export const resolveExplanation=(selection,{questions,session,screen,result,savedIds})=>{
 if(!selection)return null;
 const question=questions.get(selection.questionId);
 if(!question)return null;
 if(selection.context==='practice'){
  if(screen!=='practice'||result||!session||session.ids[session.index]!==question.id||!Object.hasOwn(session.checked,question.id))return null;
  return {question,context:'practice',isLast:session.index===session.ids.length-1};
 }
 if(selection.context==='saved'){
  const index=savedIds.indexOf(question.id);
  if(screen!=='explanations'||index<0)return null;
  return {question,context:'saved',nextId:savedIds[index+1]};
 }
 return null;
};
