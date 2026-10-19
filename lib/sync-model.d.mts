import type {StudyState,Question,History} from './types';
export type CloudQuestion={revision?:number;bookmark?:boolean;explanationBookmark?:boolean;note?:string;record?:StudyState['records'][string];wrong?:StudyState['wrong'][string];history?:History[];applied?:string[]};
export type Mutation={id:string;docId:string;patch:CloudQuestion&{sessionJSON?:string};mode:'update'|'migrate'};
export function mergeHistory(a?:History[],b?:History[]):History[];
export function stateChanges(before:StudyState,after:StudyState):Omit<Mutation,'id'>[];
export function migrationChanges(local:StudyState,remote:Map<string,CloudQuestion>,sessionExists:boolean):Omit<Mutation,'id'>[];
export function applyQuestionMutation(current:CloudQuestion|undefined,mutation:Mutation):CloudQuestion;
export function cloudState(remote:Map<string,CloudQuestion>,sessionJSON:string|undefined,questions:Question[],queue?:Mutation[]):StudyState;
