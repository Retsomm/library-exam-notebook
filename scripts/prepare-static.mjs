import { copyFileSync,readFileSync,writeFileSync } from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url),'utf8'));

import {mkdirSync,readdirSync} from 'node:fs';
const source=new URL('../data/explanations/',import.meta.url);
mkdirSync(source,{recursive:true});
const target=new URL('../public/explanations/',import.meta.url);mkdirSync(target,{recursive:true});
for(const exam of bank.exams){
 const name=`${exam.id}.json`;
 const entries=readdirSync(source).includes(name)?JSON.parse(readFileSync(new URL(name,source),'utf8')):{};
 const ids=bank.questions.filter(question=>question.examId===exam.id).map(question=>question.id);
 exam.explanationCount=ids.filter(id=>entries[id]?.summary&&entries[id]?.options).length;
}
for(const name of readdirSync(source))if(name.endsWith('.json'))copyFileSync(new URL(name,source),new URL(name,target));
writeFileSync(new URL('../public/bank.json',import.meta.url),JSON.stringify(bank));
