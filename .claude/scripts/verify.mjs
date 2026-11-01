// 배포 전 검증: node .claude/scripts/verify.mjs <YYYY-MM-DD>
// 하나라도 실패하면 exit 1 → 커밋·push 하지 말 것
import fs from 'node:fs';

const day = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) { console.error('사용법: node .claude/scripts/verify.mjs YYYY-MM-DD'); process.exit(1); }
const [, mm, dd] = day.split('-');
const secId = `sec-${Number(mm)}${dd}`;          // 예: 2026-11-02 → sec-1102
const dotted = `${day.replace(/-/g, '.')}`;      // 2026.11.02
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const read = f => fs.readFileSync(f, 'utf8');

// 1) 일일학습: 스크립트 문법, 강의 배열, 날짜별 지정
const daily = read('부동산_일일학습_2026.html');
for (const m of daily.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  try { new Function(m[1]); } catch (e) { fails.push('일일학습 스크립트 문법 오류: ' + e.message); }
}
const a = daily.indexOf('const LESSONS');
const b = daily.indexOf('\n];', a);
let L = [];
try { L = eval(daily.slice(a + 'const LESSONS ='.length, b + 2).replace(/^\s*=/, '')); }
catch (e) { fails.push('LESSONS 배열 파싱 실패: ' + e.message); }
const today = L.filter(l => l.date === day);
ok(today.length === 2, `오늘(${day}) 강의가 2개가 아님: ${today.length}개`);
for (const l of today) {
  for (const k of ['num', 'cat', 'catLabel', 'title', 'sub', 'concept', 'text', 'formula', 'example', 'tip', 'checklist'])
    ok(l[k] !== undefined && l[k] !== '', `${l.num}강 ${k} 비어 있음`);
  ok(l.quiz && l.quiz.opts && l.quiz.opts.length === 4 && l.quiz.ans >= 0 && l.quiz.ans < 4 && l.quiz.explain, `${l.num}강 퀴즈 형식 오류`);
}
const nums = L.filter(l => l.num).map(l => l.num);
ok(new Set(nums).size === nums.length, '강의 번호 중복');
const ov = daily.slice(daily.indexOf('const DATE_LESSON_OVERRIDES'), daily.indexOf('};', daily.indexOf('const DATE_LESSON_OVERRIDES')));
for (const m of ov.matchAll(/'([\d-]+)': LESSONS.length - (\d+),\s*\/\/ (\d+)강/g)) {
  const x = L[L.length - Number(m[2])];
  if (!x) fails.push(`날짜 지정 ${m[1]}: 범위를 벗어남`);
  else if (x.num && x.num !== Number(m[3])) fails.push(`날짜 지정 ${m[1]}: ${m[3]}강이어야 하는데 ${x.num}강을 가리킴`);
}
ok(new RegExp(`'${day}': LESSONS.length - 2,`).test(ov), `오늘(${day}) 날짜 지정 없음`);
const maxNum = Math.max(...nums);

// 2) 팝업 뉴스
const pop = read('news-popup.js');
ok(pop.includes(`date: '${day}'`), 'news-popup.js 날짜가 오늘이 아님');
const items = (pop.match(/^\s*tag: '/gm) || []).length;
ok(items === 7, `팝업 뉴스가 7개가 아님: ${items}개`);
try { new Function(pop); } catch (e) { fails.push('news-popup.js 문법 오류: ' + e.message); }

// 3) 최신동향
const trends = read('부동산_최신동향_2026.html');
ok(trends.includes(`<span class="date-badge">${dotted} 기준</span>`), '최신동향 date-badge가 오늘이 아님');
ok(trends.includes(`id="${secId}"`), `최신동향 오늘 섹션(${secId}) 없음`);
ok(trends.includes(`href="#${secId}"`), `최신동향 바로가기에 ${secId} 없음`);
ok(trends.includes(`<span class="alert-chip">${dotted} 업데이트</span>`), '최신동향 alert-chip이 오늘이 아님');
ok((trends.match(new RegExp(`id="${secId}"`, 'g')) || []).length <= 1, `${secId} 섹션 중복`);
for (const m of trends.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  try { new Function(m[1]); } catch (e) { fails.push('최신동향 스크립트 문법 오류: ' + e.message); }
}

// 4) 홈·OG 이미지
const home = read('index.html');
ok(home.includes(`<span class="hd-date">${dotted} 기준</span>`), '홈 hd-date가 오늘이 아님');
ok(home.includes(`일일학습 ${maxNum}강</span>`), `홈 cert-tag가 ${maxNum}강이 아님`);
ok(read('og-image.svg').includes(`일일학습 ${maxNum}강`), `og-image가 ${maxNum}강이 아님`);

// 5) 흔한 사실 오류 방지
ok(!/파월 의장/.test(pop + trends.slice(0, 20000)), '연준 의장은 케빈 워시 — "파월 의장" 표기 금지');

if (fails.length) { console.error('검증 실패:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log(`검증 통과: ${day} · 최신 ${maxNum}강 · 팝업 ${items}개 · ${secId}`);
