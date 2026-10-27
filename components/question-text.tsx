import {Fragment} from 'react';

const codeLine=/^\s*(?:#include\b|(?:public|private|protected|static|final|class|interface|void|int|float|double|char|boolean|String|return|if|else|for|while|switch|case|break|continue|try|catch|throw|def|function|const|let|var|print|printf|scanf|cout|cin|SELECT|INSERT|UPDATE|DELETE|CREATE|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b|[{}]|.*(?:[{};]|=>|\+\+|--|:=).*)/i;

function blocks(text:string){
 const lines=text.replace(/\r\n?/g,'\n').split('\n');
 const result:{code:boolean;lines:string[]}[]=[];
 for(const line of lines){
  const code=codeLine.test(line);
  const previous=result.at(-1);
  if(previous&&previous.code===code)previous.lines.push(line);
  else result.push({code,lines:[line]});
 }
 return result.filter(block=>block.lines.some(line=>line.trim()));
}

export default function QuestionText({text,className}:{text:string;className?:string}){
 return <div className={className}>{blocks(text).map((block,index)=>block.code
  ? <pre className="question-code" key={index}><code>{block.lines.join('\n')}</code></pre>
  : <Fragment key={index}>{block.lines.join('\n').split(/\n{2,}/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</Fragment>
 )}</div>;
}
