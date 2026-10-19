import type {ReactNode} from 'react';
import type {Exam,Question} from '@/lib/types';
type Props={exam:Exam;question:Question;kind:'question'|'answer'|'correction';children:ReactNode;className?:string};
export default function OfficialSourceLink({exam,question,kind,children,className}:Props){
 const href=kind==='question'?`${exam.source}#page=${question.page+1}`:kind==='answer'?(exam.answerSource||exam.listing):exam.correctionPdf;
 if(!href)return null;
 return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}
