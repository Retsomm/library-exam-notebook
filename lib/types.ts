export type Question = {id:string;examId:string;year:number;subject:string;subjectIndex:number;number:number;multi:boolean;images:string[];text:string;page:number;accepted:string[];correction:string|null;allCredit?:boolean;stem:string;options:{letter:string;text:string}[];passage:string;hasVisual:boolean;textFallback:boolean};
export type Exam = {id:string;year:number;subject:string;subjectIndex:number;count:number;explanationCount?:number;pages:string[];source:string;answerSource:string;listing:string;correctionPdf:string|null};
export type Bank = {exams:Exam[];questions:Question[];subjects:string[];updatedAt:string};
export type StudyRecord = {answer:string;correct:boolean;attempts:number;time:string};
export type Wrong = {active:boolean;time:string;answer:string};
export type History = {id:string;answer:string;correct:boolean;time:string};
export type StudySession = {ids:string[];index:number;title:string;choices:Record<string,string[]>;checked:Record<string,boolean>};
export type StudyState = {version:1;bookmarks:string[];explanationBookmarks:string[];vocabularyBookmarks:string[];notes:Record<string,string>;records:Record<string,StudyRecord>;wrong:Record<string,Wrong>;history:History[];session:StudySession|null};
export type Screen = 'overview'|'bank'|'wrong'|'favorites'|'history'|'settings'|'practice'|'reports';

export type CollectionTab = 'questions'|'explanations'|'words';
export type Vocabulary = {word:string;partOfSpeech:string;meaning:string;usage:string};
export type SavedVocabulary = Vocabulary & {questionId:string};
export type QuestionExplanation = {summary:string;options:Record<string,string>;optionVerdicts?:Record<string,string>;vocabulary?:Vocabulary[];sources?:{title:string;url:string}[]};
