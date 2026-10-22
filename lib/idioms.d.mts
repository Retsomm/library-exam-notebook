export type IdiomEntry={term:string;aliases:string[];category:string;meaning:string;example:string;questionIds:string[];origin?:{kind:string;reference:string;explanation:string;url:string}};
export function normalizeIdiomText(value:unknown):string;
export function questionContainsIdiom(question:{stem:string;passage?:string;options:{text:string}[]},entry:IdiomEntry):boolean;
export function filterIdioms(entries:IdiomEntry[],options:{query?:string;year?:string;questions:Map<string,{year:number}>}):IdiomEntry[];

export function idiomsInText(entries:IdiomEntry[],text:unknown):IdiomEntry[];
