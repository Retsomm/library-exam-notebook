/** A submitted wrong answer also completes a question. Choices alone do not. */
export function sessionResumeIndex(session){
 if(!session?.ids.length)return null;
 const start=Number.isInteger(session.index)&&session.index>=0&&session.index<session.ids.length?session.index:0;
 for(let offset=0;offset<session.ids.length;offset++){
  const index=(start+offset)%session.ids.length;
  if(!Object.hasOwn(session.checked,session.ids[index]))return index;
 }
 return null;
}
