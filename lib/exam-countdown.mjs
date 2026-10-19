// Date-only targets use Taipei midnight; this is not the exam's starting time.
export const upcomingExam=Object.freeze({
 name:'116 年公務人員初等考試',
 date:'2027-01-09',
 dateLabel:'2027 年 1 月 9 日（六）',
 registration:'2026/10/27 – 11/05',
 source:'https://wwwc.moex.gov.tw/Main/Exam/wFrmPropertyDetail.aspx?c=116010&m=8045',
 verifiedAt:'2026-10-19',
});
const day=86400000,offset=8*3600000;
export function examCountdown(now,target=upcomingExam.date){
 const stamp=typeof now==='number'?now:Date.parse(now);
 const end=Date.parse(target+'T00:00:00+08:00');
 if(!Number.isFinite(stamp)||!Number.isFinite(end))throw new Error('無效的考試倒數日期');
 const calendarDays=Math.round((end+offset)/day)-Math.floor((stamp+offset)/day);
 const remaining=Math.max(0,Math.floor((end-stamp)/60000));
 return {days:Math.max(0,calendarDays),hours:Math.floor(remaining/60)%24,minutes:remaining%60,status:calendarDays>0?'upcoming':calendarDays===0?'today':'past'};
}
