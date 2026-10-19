// Operator-only: requires an existing authorized Firebase CLI login. Never put credentials in this repository.
const fs=require('node:fs'),path=require('node:path');
let base=process.env.FIREBASE_TOOLS_LIB;
if(!base){try{base=path.dirname(require.resolve('firebase-tools/package.json'))+'/lib';}catch{console.error('Set FIREBASE_TOOLS_LIB to the lib directory of your installed official firebase-tools CLI.');process.exit(1);}}
const {Client,setRefreshToken}=require(path.join(base,'apiv2'));
const {configstore}=require(path.join(base,'configstore'));
const tokens=configstore.get('tokens');
if(!tokens?.refresh_token){console.error('Sign in with the official Firebase CLI first.');process.exit(1);}
setRefreshToken(tokens.refresh_token);
const client=new Client({urlPrefix:'https://firestore.googleapis.com',apiVersion:'v1'});
(async()=>{
 const result=await client.post('/projects/library-exam-notebook/databases/(default)/documents:runQuery',{structuredQuery:{from:[{collectionId:'questionReports',allDescendants:true}],limit:500}},{skipLog:{body:true,resBody:true}});
 const docs=result.body.filter(x=>x.document).map(x=>x.document);
 const rows=docs.map(d=>{const f=d.fields,s=k=>f[k]?.stringValue||'';return {id:d.name.split('/').pop(),documentPath:d.name,questionId:s('questionId'),kind:s('kind'),detail:s('detail'),createdAt:s('createdAt'),status:s('status')||'pending',resolution:s('resolution'),...(process.argv.includes('--details')?{snapshot:JSON.parse(s('snapshotJSON'))}:{})};}).filter(r=>r.status!=='resolved').sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
 console.log(JSON.stringify({pending:rows.length,limitedTo:500,reports:rows},null,2));
})().catch(e=>{console.error('Unable to read question reports:',e.message);process.exitCode=1;});
