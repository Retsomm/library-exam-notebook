import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['scripts/serve-static.mjs'],{env:{...process.env,PORT:'3011'},stdio:['ignore','pipe','pipe']});
let log='';server.stdout.on('data',c=>{log+=c.toString()});server.stderr.on('data',c=>{log+=c.toString()});
try{
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Server did not start: '+log)),20000);server.stdout.on('data',()=>{if(log.includes('Static server ready')){clearTimeout(timeout);resolve();}});server.on('exit',code=>{clearTimeout(timeout);reject(Error('Server exited '+code+': '+log));});});
 const base='http://127.0.0.1:3011',results=[];
 for(const [path,expected]of [['/',200],['/demo/',200],['/sign-in/',200],['/practice/',200],['/api/bank',404],['/api/auth/session',404]]){const r=await fetch(base+path,{redirect:'manual'});assert.equal(r.status,expected,path);results.push({path,status:r.status});}
 const r=await fetch(base+'/bank.json'),bank=await r.json();assert.equal(bank.questions.length,1755);assert.equal(bank.exams.length,36);assert.ok(bank.questions.find(q=>q.id==='115-1-46').passage.includes('Elon Musk'));
 for(const exam of bank.exams){assert.deepEqual(exam.pages,[]);assert.equal(new URL(exam.source).hostname,'wwwq.moex.gov.tw');}
 for(const q of bank.questions)assert.deepEqual(q.images,[]);
 assert.equal((await fetch(base+'/official-papers.zip')).status,404);
 assert.equal((await fetch(base+'/pdf/115-0-questions.pdf')).status,404);
 const html=await(await fetch(base+'/sign-in/')).text();assert.ok(html.includes('以 Google 帳戶登入')||html.includes('正在確認登入設定'));assert.ok(!html.includes('/api/auth/'));
 console.log('STATIC HTTP CHECK PASS',JSON.stringify({routes:results,questions:bank.questions.length,officialSourceLinks:bank.exams.length}));
}finally{server.kill('SIGTERM');}
