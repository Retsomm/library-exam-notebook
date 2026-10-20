// Stable across question order and shared passages; different meanings remain distinct cards.
export function vocabularyId(examId, item) {
 const text=JSON.stringify([item.word.trim().toLowerCase(),item.partOfSpeech.trim(),item.meaning.trim()]);
 let hash=14695981039346656037n;
 for(const char of text){hash^=BigInt(char.codePointAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}
 return `${examId}-${hash.toString(16).padStart(16,'0')}`;
}
export function buildVocabularyIndex(questions, explanations) {
 const index={};
 for(const q of questions){
  for(const item of explanations[q.examId]?.[q.id]?.vocabulary||[]){
   const id=vocabularyId(q.examId,item);
   if(!Object.hasOwn(index,id))index[id]={...item,questionId:q.id};
  }
 }
 return index;
}
