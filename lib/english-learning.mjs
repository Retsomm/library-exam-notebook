import {vocabularyId} from './vocabulary.mjs';
const normalize=value=>String(value||'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const escapeRegex=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function vocabularyAppearsInQuestion(question,item){
 const fields=[question.stem,...question.options.map(o=>o.text)].map(normalize);
 return (item.forms||[item.word]).some(form=>{
  const pattern=new RegExp(`(?:^|[^a-z])${escapeRegex(normalize(form))}(?=$|[^a-z])`);
  return fields.some(field=>pattern.test(field));
 });
}
/** Compile editorial content once for both the explanation API and saved cards. */
export function enrichEnglishExplanation(question,entry,passages,lexicon){
 if(!entry||question.subjectIndex!==1||question.number<36)return entry;
 const reading=Object.values(passages).find(group=>group.questionIds.includes(question.id));
 const vocabulary=[...(entry.vocabulary||[])],questionVocabulary=[];
 for(const item of lexicon.filter(item=>vocabularyAppearsInQuestion(question,item))){
  // Reuse existing cards so saved IDs and their meanings are never replaced.
  const existing=vocabulary.findIndex(old=>normalize(old.word)===normalize(item.word));
  const {forms,...card}=item;
  questionVocabulary.push(existing>=0?vocabulary.splice(existing,1)[0]:card);
 }
 // Existing editorial cards may also explain vocabulary from the question itself.
 for(let i=vocabulary.length-1;i>=0;i--){
  if(vocabularyAppearsInQuestion(question,vocabulary[i]))questionVocabulary.unshift(vocabulary.splice(i,1)[0]);
 }
 const unique=items=>[...new Map(items.map(item=>[vocabularyId(question.examId,item),item])).values()];
 return {...entry,vocabulary,questionVocabulary:unique(questionVocabulary),
  ...(reading?{passageTranslation:{paragraphs:reading.paragraphs,note:reading.note}}:{}),
 };
}
