import type {StudyState} from './types';
export function newerVersion(manifest:unknown,current:string|undefined):string|null;
export function saveBeforeReload(storage:Pick<Storage,'setItem'>,key:string,study:StudyState,reload:()=>void):void;
