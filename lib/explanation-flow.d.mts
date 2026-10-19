import type {Question,StudySession,Screen} from './types';
export type ExplanationSelection={questionId:string;context:'practice'|'saved'};
export type ExplanationTarget={question:Question;context:'practice';isLast:boolean}|{question:Question;context:'saved';nextId?:string};
export function resolveExplanation(selection:ExplanationSelection|null,state:{questions:Map<string,Question>;session:StudySession|null;screen:Screen;result:boolean;savedIds:string[]}):ExplanationTarget|null;
