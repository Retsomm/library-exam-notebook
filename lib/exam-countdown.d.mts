export const upcomingExam:Readonly<{name:string;date:string;dateLabel:string;registration:string;source:string;verifiedAt:string}>;
export function examCountdown(now:string|number,target?:string):{days:number;hours:number;minutes:number;status:'upcoming'|'today'|'past'};
