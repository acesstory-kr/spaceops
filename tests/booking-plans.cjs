const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
function load(path,mocks={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:n=>mocks[n]||require(n),Date,Intl,URL,console});return exports;}
const external=load('app/space-calendar.ts'),names=load('app/space-labels.ts'),plans=load('app/reservation-work.ts',{'./space-calendar':external,'./space-labels':names});
const manual=load('app/party-automation.ts',{'./reservation-work':plans});
const ics='BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:party-1\nSUMMARY:합정 파티룸 이용\nDTSTART;TZID=Asia/Seoul:20261101T010000\nDTEND;TZID=Asia/Seoul:20261101T030000\nEND:VEVENT\nEND:VCALENDAR'.replace(/\\n/g,'\n');
const parsed=external.parseSpaceICS(ics);const rows=plans.reservationWork({name:'합정',category:1},parsed.reservations[0]);assert.equal(rows.length,3);assert.equal(rows[0].date,'2026-10-31');assert.equal(rows[0].start,'23:00');assert.equal(rows[2].end,'05:00');assert.equal(rows[0].category,2);
const stay=plans.reservationWork({name:'혜화',category:4},{uid:'a',checkin:'2026-11-01',checkout:'2026-11-02',cancelled:false});assert.equal(stay[1].start,'15:00');assert.equal(stay[1].title,'혜화 입실 체크');
assert.equal(manual.partyPlans({id:'a',date:'2026-11-01',start:'18:00',end:'22:00',category:1,title:'합정 파티룸 이용'}).length,2);assert.equal(manual.partyPlans({title:'파티룸 청소',category:2}).length,0);
assert.throws(()=>external.parseSpaceICS(ics.replace('Asia/Seoul','Europe/London')));
console.log('PASS: party before/after 2h, midnight/Korea timezone, Hyehwa 15h check-in, manual party plans, no recursive cleaning, unknown timezone rejection.');
