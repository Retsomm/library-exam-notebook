// Match question text within individual fields, never across two answer options.
export const normalizeIdiomText=value=>String(value||'').replace(/[^\u4e00-\u9fff]/g,'');
export function questionContainsIdiom(question,entry){
 const fields=[question.stem,question.passage,...question.options.map(option=>option.text)].map(normalizeIdiomText);
 return [entry.term,...entry.aliases].some(form=>fields.some(text=>text.includes(normalizeIdiomText(form))));
}
export function filterIdioms(entries,{query='',year='all',questions}){
 const search=normalizeIdiomText(query.trim());
 const questionId=/^\d{3}-0-\d+$/.test(query.trim())?query.trim():null;
 return entries.filter(entry=>(year==='all'||entry.questionIds.some(id=>questions.get(id)?.year===Number(year)))&&(questionId?entry.questionIds.includes(questionId):!query.trim()||(search?normalizeIdiomText([entry.term,...entry.aliases,entry.meaning,entry.example].join(' ')).includes(search):[entry.term,entry.meaning,entry.example,...entry.questionIds].join(' ').toLowerCase().includes(query.trim().toLowerCase()))))
  .sort((a,b)=>b.questionIds.length-a.questionIds.length||a.term.localeCompare(b.term,'zh-Hant'));
}
