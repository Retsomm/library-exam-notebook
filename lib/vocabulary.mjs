const normalize=value=>String(value||'').normalize('NFKC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().toLocaleLowerCase('en');
const hashVocabulary=parts=>{
 const text=JSON.stringify(parts);
 let hash=14695981039346656037n;
 for(const char of text){hash^=BigInt(char.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}
 return hash.toString(16).padStart(16,'0');
};
// A card is shared by every occurrence of the same word, phrase, part of speech and meaning.
// Usage examples may differ by question, so the first editorial example remains canonical and
// every source question plus its pre-merge card ID is retained for navigation and migration.
export function vocabularyId(_examId, item) {
 return `vocabulary-${hashVocabulary([normalize(item.word),normalize(item.partOfSpeech),normalize(item.meaning)])}`;
}
const legacyVocabularyId=(examId,item)=>`${examId}-${hashVocabulary([examId,normalize(item.word),normalize(item.partOfSpeech),normalize(item.meaning)])}`;
export function buildVocabularyIndex(questions, explanations) {
 const index={};
 for(const q of questions){
  const entry=explanations[q.examId]?.[q.id];
  for(const item of [...(entry?.vocabulary||[]),...(entry?.questionVocabulary||[])]){
   const id=vocabularyId(q.examId,item),legacyId=legacyVocabularyId(q.examId,item),existing=index[id];
   if(existing){
    if(!existing.questionIds.includes(q.id))existing.questionIds=[...existing.questionIds,q.id];
    if(!existing.legacyIds.includes(legacyId))existing.legacyIds=[...existing.legacyIds,legacyId];
   }else index[id]={...item,questionId:q.id,questionIds:[q.id],legacyIds:[legacyId]};
  }
 }
 return index;
}
