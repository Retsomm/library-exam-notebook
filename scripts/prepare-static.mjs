import {enrichEnglishExplanation} from '../lib/english-learning.mjs';
import {buildVocabularyIndex} from '../lib/vocabulary.mjs';
import {buildVersion} from './build-version.mjs';
import { readFileSync,writeFileSync } from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url),'utf8'));

import {mkdirSync,readdirSync} from 'node:fs';
const source=new URL('../data/explanations/',import.meta.url);
mkdirSync(source,{recursive:true});
const target=new URL('../public/explanations/',import.meta.url);mkdirSync(target,{recursive:true});
const passages=JSON.parse(readFileSync(new URL('../data/english-passages.json',import.meta.url),'utf8'));
const questionLexicon=JSON.parse(readFileSync(new URL('../data/english-question-vocabulary.json',import.meta.url),'utf8'));
const explanations={};
for(const exam of bank.exams){
 const name=`${exam.id}.json`;
 const entries=readdirSync(source).includes(name)?JSON.parse(readFileSync(new URL(name,source),'utf8')):{};
 for(const question of bank.questions.filter(q=>q.examId===exam.id)){
  if(entries[question.id])entries[question.id]=enrichEnglishExplanation(question,entries[question.id],passages,questionLexicon);
 }
 explanations[exam.id]=entries;
 writeFileSync(new URL(name,target),JSON.stringify(entries,null,2)+'\n');
 const ids=bank.questions.filter(question=>question.examId===exam.id).map(question=>question.id);
 exam.explanationCount=ids.filter(id=>entries[id]?.summary&&entries[id]?.options).length;
}
writeFileSync(new URL('../public/vocabulary.json',import.meta.url),JSON.stringify(buildVocabularyIndex(bank.questions,explanations)));
writeFileSync(new URL('../public/bank.json',import.meta.url),JSON.stringify(bank));

writeFileSync(new URL('../public/version.json',import.meta.url),JSON.stringify({version:buildVersion()})+'\n');
