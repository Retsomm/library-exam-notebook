import type {Question,Vocabulary,SavedVocabulary} from './types';
export function vocabularyId(examId:string,item:Vocabulary):string;
export function buildVocabularyIndex(questions:Question[],explanations:Record<string,Record<string,{vocabulary?:Vocabulary[]}>>):Record<string,SavedVocabulary>;
