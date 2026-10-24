import type {StudyState,Question,Exam,Bank,ExamAttempt} from './types';
export function mergeAttempts(a?:ExamAttempt[],b?:ExamAttempt[]):ExamAttempt[];
export function validAttempt(a:unknown):boolean;
export function completeAttempt(state:StudyState,questions:Map<string,Question>,exams:Exam[],now?:string):void;
export function attemptYearScores(bank:Bank,attempts:ExamAttempt[],year:number):{papers:{exam:Exam;attempt:ExamAttempt|undefined;score:number;max:number;complete:boolean}[];complete:boolean;average:number|null};
