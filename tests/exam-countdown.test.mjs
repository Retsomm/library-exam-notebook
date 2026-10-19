import test from 'node:test';
import assert from 'node:assert/strict';
import {examCountdown,upcomingExam} from '../lib/exam-countdown.mjs';

test('exam countdown uses Taipei calendar days rather than browser timezone or a guessed starting hour',()=>{
 assert.equal(upcomingExam.date,'2027-01-09');
 assert.equal(examCountdown('2026-10-19T18:30:00+08:00').days,82);
 assert.equal(examCountdown('2027-01-08T23:59:00+08:00').days,1);
 assert.equal(examCountdown('2027-01-08T15:59:00Z').days,1);
 assert.equal(examCountdown('2027-01-08T16:00:00Z').status,'today');
 assert.equal(examCountdown('2027-01-09T23:59:59+08:00').status,'today');
});
test('exam day and passed dates never display a negative countdown or silently roll to an unannounced exam',()=>{
 for(const date of ['2027-01-09T00:00:00+08:00','2027-01-10T00:00:00+08:00','2030-01-01T00:00:00Z']){
  const result=examCountdown(date);assert.equal(result.days,0);assert.ok(result.hours>=0);assert.ok(result.minutes>=0);
 }
 assert.equal(examCountdown('2027-01-10T00:00:00+08:00').status,'past');
 assert.throws(()=>examCountdown('bad date'));
 assert.equal(new URL(upcomingExam.source).hostname,'wwwc.moex.gov.tw');
});
